/* eslint-disable unicorn/no-null */
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { createEncryptedCookie } from "@/lib/cookies/create-cookies";

import {
	confirmMagicLink,
	loginWithCredentials,
} from "./server-actions/auth/auth-actions";

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

							// Existing fields
							plan: response.data.user?.plan,
							bio: response.data.user?.bio ?? null,
							email: response.data.user?.email ?? null,
							new_user: response.data.user?.new_user ?? true,
							last_name: response.data.user?.last_name ?? null,
							first_name: response.data.user?.first_name ?? null,
							preferences: response.data.user?.preferences ?? null,
							subscription_status: response.data.user?.subscription_status,
							github_connected: response.data.user?.github_connected ?? false,
							google_connected: response.data.user?.google_connected ?? false,
							subscription_end_date:
								response.data.user?.subscription_end_date ?? undefined,

							// NEW FIELDS FOR ENHANCED SUBSCRIPTION MANAGEMENT
							subscription_start_date:
								response.data.user?.subscription_start_date ?? undefined,
							paddle_subscription_id:
								response.data.user?.paddle_subscription_id ?? null,
							billing_interval: response.data.user?.billing_interval ?? null,
							current_price_id: response.data.user?.current_price_id ?? null,
							pending_plan_change:
								response.data.user?.pending_plan_change ?? null,
							pending_plan_effective_date:
								response.data.user?.pending_plan_effective_date ?? undefined,
							payment_grace_period_end:
								response.data.user?.payment_grace_period_end ?? undefined,
							last_successful_payment:
								response.data.user?.last_successful_payment ?? undefined,
							payment_retry_count: response.data.user?.payment_retry_count ?? 0,

							// HELPER FLAGS
							has_active_subscription:
								response.data.user?.has_active_subscription ?? false,
							is_in_grace_period:
								response.data.user?.is_in_grace_period ?? false,
							current_billing_type:
								response.data.user?.current_billing_type ?? null,

							type: "magic",
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
							// Existing fields
							bio: userData.bio,
							type: userData.type,
							plan: userData.plan,
							email: userData.email,
							access: userData.access,
							refresh: userData.refresh,
							new_user: userData.new_user,
							last_name: userData.last_name,
							first_name: userData.first_name,
							preferences: userData.preferences,
							github_connected: userData.github_connected,
							google_connected: userData.google_connected,
							subscription_status: userData?.subscription_status,
							subscription_end_date:
								userData?.subscription_end_date ?? undefined,

							// NEW FIELDS
							subscription_start_date:
								userData?.subscription_start_date ?? undefined,
							paddle_subscription_id: userData?.paddle_subscription_id ?? null,
							billing_interval: userData?.billing_interval ?? null,
							current_price_id: userData?.current_price_id ?? null,
							pending_plan_change: userData?.pending_plan_change ?? null,
							pending_plan_effective_date:
								userData?.pending_plan_effective_date ?? undefined,
							payment_grace_period_end:
								userData?.payment_grace_period_end ?? undefined,
							last_successful_payment:
								userData?.last_successful_payment ?? undefined,
							payment_retry_count: userData?.payment_retry_count ?? 0,
							has_active_subscription:
								userData?.has_active_subscription ?? false,
							is_in_grace_period: userData?.is_in_grace_period ?? false,
							current_billing_type: userData?.current_billing_type ?? null,
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
