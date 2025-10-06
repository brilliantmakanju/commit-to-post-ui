/* eslint-disable unicorn/no-null */
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { createEncryptedCookie } from "@/lib/cookies/create-cookies";

import {
	confirmMagicLink,
	loginWithCredentials,
} from "./server-actions/auth/auth-actions";

// Helper function to parse dates safely
const parseDate = (dateString: string | undefined | null) => {
	if (!dateString) return;
	try {
		return new Date(dateString).toISOString();
	} catch {
		return;
	}
};

export const { handlers, signOut, signIn, auth, unstable_update } = NextAuth({
	providers: [
		CredentialsProvider({
			id: "credentials",
			name: "Email and Password",
			credentials: {
				email: {},
				password: {},
				magicLink: {},
				token: {},
			},
			authorize: async credentials => {
				if (credentials === null) return;

				try {
					if (credentials.magicLink && credentials.token) {
						const token = credentials.token as string;
						const response = await confirmMagicLink(token);

						if (response.success === false || response.status === 401) {
							return;
						}

						const users = {
							access: response.data.access,
							refresh: response.data.refresh,

							// ===== CORE USER FIELDS =====
							first_name: response.data.user?.first_name ?? "",
							last_name: response.data.user?.last_name ?? "",
							email: response.data.user?.email ?? "",
							profile: response.data.user?.profile ?? undefined,
							bio: response.data.user?.bio ?? "",
							preferences: response.data.user?.preferences ?? {},
							new_user: response.data.user?.new_user ?? true,

							// ===== AUTHENTICATION & CONNECTIONS =====
							github_connected: response.data.user?.github_connected ?? false,
							google_connected: response.data.user?.google_connected ?? false,

							// ===== SUBSCRIPTION & BILLING FIELDS =====
							plan: response.data.user?.plan ?? "basic",
							paddle_subscription_id:
								response.data.user?.paddle_subscription_id ?? undefined,
							stripe_subscription_id:
								response.data.user?.stripe_subscription_id ?? undefined,

							// Subscription status and dates
							subscription_status:
								response.data.user?.subscription_status ?? "inactive",
							subscription_start_date: parseDate(
								response.data.user?.subscription_start_date,
							),
							subscription_end_date: parseDate(
								response.data.user?.subscription_end_date,
							),

							// Billing details
							billing_interval:
								response.data.user?.billing_interval ?? undefined,
							current_price_id:
								response.data.user?.current_price_id ?? undefined,

							// Plan changes
							pending_plan_change:
								response.data.user?.pending_plan_change ?? undefined,
							pending_plan_effective_date: parseDate(
								response.data.user?.pending_plan_effective_date,
							),

							// Payment information
							payment_grace_period_end: parseDate(
								response.data.user?.payment_grace_period_end,
							),
							last_successful_payment: parseDate(
								response.data.user?.last_successful_payment,
							),
							payment_retry_count: response.data.user?.payment_retry_count ?? 0,

							// ===== SUBSCRIPTION HELPER FLAGS =====
							has_active_subscription:
								response.data.user?.has_active_subscription ?? false,
							is_in_grace_period:
								response.data.user?.is_in_grace_period ?? false,
							current_billing_type:
								response.data.user?.current_billing_type ?? undefined,

							// ===== CREDIT MANAGEMENT =====
							credits: response.data.user?.credits ?? 0,

							// ===== BONUS FLAGS =====
							signup_bonus_claimed:
								response.data.user?.signup_bonus_claimed ?? false,
							spin_bonus_claimed:
								response.data.user?.spin_bonus_claimed ?? false,
							spin_bonus_skipped:
								response.data.user?.spin_bonus_skipped ?? false,

							// ===== AUTH TYPE =====
							type: response.data.user?.type ?? "magic",
						};

						const userInfo = {
							data: users,
							status: 200,
							success: true,
						};
						return userInfo;
					} else if (credentials.email && credentials.password) {
						const email = credentials.email as string;
						const password = credentials.password as string;
						const response = await loginWithCredentials(email, password);

						if (response.success === false || response.status === 401) {
							return;
						}
						return response;
					} else {
						throw new Error(
							"Invalid credentials: Either email/password or magic link/token must be provided.",
						);
					}
				} catch {
					return;
				}
			},
		}),
	],
	session: {
		strategy: "jwt",
		updateAge: 24 * 60 * 60,
		maxAge: 30 * 24 * 60 * 60,
	},
	callbacks: {
		jwt: async ({ token, account, user }) => {
			// user is only available the first time a user signs in authorized
			if (account && user) {
				// @ts-ignore
				if (user && user.data) {
					// @ts-ignore
					const userData = user.data;

					await createEncryptedCookie("cookie_state", {
						access_token: userData.access,
						refresh_token: userData.refresh,
					});

					await createEncryptedCookie("user_state", {
						new_user: userData.new_user,
						auth_type: userData.type,
					});

					return {
						...token,
						// @ts-ignore
						accessToken: userData.access,
						// @ts-ignore
						refreshToken: userData.refresh,
						user: {
							// ===== CORE USER FIELDS =====
							bio: userData.bio,
							email: userData.email,
							profile: userData.profile,
							new_user: userData.new_user,
							last_name: userData.last_name,
							first_name: userData.first_name,
							preferences: userData.preferences,

							// ===== AUTHENTICATION & CONNECTIONS =====
							github_connected: userData.github_connected,
							google_connected: userData.google_connected,

							// ===== SUBSCRIPTION & BILLING FIELDS =====
							plan: userData.plan,
							paddle_subscription_id: userData.paddle_subscription_id,
							stripe_subscription_id: userData.stripe_subscription_id,

							// Subscription status and dates
							subscription_status: userData.subscription_status,
							subscription_end_date: userData.subscription_end_date,
							subscription_start_date: userData.subscription_start_date,

							// Billing details
							billing_interval: userData.billing_interval,
							current_price_id: userData.current_price_id,

							// Plan changes
							pending_plan_change: userData.pending_plan_change,
							pending_plan_effective_date: userData.pending_plan_effective_date,

							// Payment information
							payment_retry_count: userData.payment_retry_count,
							last_successful_payment: userData.last_successful_payment,
							payment_grace_period_end: userData.payment_grace_period_end,

							// ===== SUBSCRIPTION HELPER FLAGS =====
							is_in_grace_period: userData.is_in_grace_period,
							current_billing_type: userData.current_billing_type,
							has_active_subscription: userData.has_active_subscription,

							// ===== CREDIT MANAGEMENT =====
							credits: userData.credits,

							// ===== BONUS FLAGS =====
							spin_bonus_claimed: userData.spin_bonus_claimed,
							spin_bonus_skipped: userData.spin_bonus_skipped,
							signup_bonus_claimed: userData.signup_bonus_claimed,

							// ===== AUTH FIELDS =====
							type: userData.type,
							access: userData.access,
							refresh: userData.refresh,
						},
					};
				} else {
					return null;
				}
			}

			return token;
		},
		session: async ({ session, token }) => {
			if (token) {
				// @ts-ignore
				session.accessToken = token.accessToken;
				// @ts-ignore
				session.user = token.user;
			}
			return session;
		},
	},
	pages: {
		signIn: "/",
		// signIn: "/auth?view=login",
	},
	trustHost: true,
});
