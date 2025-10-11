/* eslint-disable unicorn/no-null */
import NextAuth, {
	type NextAuthConfig,
	type Session,
	type User,
} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { createEncryptedCookie } from "@/lib/cookies/create-cookies";

import {
	confirmMagicLink,
	loginWithCredentials,
} from "./server-actions/auth/auth-actions";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface UserData {
	bio: string;
	email: string;
	access: string;
	refresh: string;
	profile?: string;
	last_name: string;
	first_name: string;
	preferences: Record<string, unknown>;

	new_user: boolean;
	is_active: boolean;
	github_connected: boolean;
	google_connected: boolean;

	type: string;
	plan: string;
	billing_interval?: string;
	subscription_status: string;
	subscription_end_date?: string;
	stripe_subscription_id?: string;
	paddle_subscription_id?: string;
	subscription_start_date?: string;

	paddle_customer_id?: string;
	pending_plan_change?: string;
	pending_plan_change_type?: string;
	payment_grace_period_end?: string;
	pending_plan_effective_date?: string;

	billing_type?: string;
	credits_balance: number;
	payment_provider?: string;
	has_active_subscription: boolean;
	lifetime_credits_purchased: number;

	is_in_grace_period: boolean;
	spin_bonus_claimed: boolean;
	spin_bonus_skipped: boolean;
	can_use_spin_bonus: boolean;
	signup_bonus_claimed: boolean;
}

interface AuthCredentials {
	email?: string;
	token?: string;
	password?: string;
	magicLink?: boolean;
}

interface AuthResponse {
	data: {
		access: string;
		refresh: string;
		user: Partial<UserData>;
	};
	success: boolean;
	status: number;
}

interface AuthorizeResponse {
	data: UserData;
	status: number;
	success: boolean;
}

// ============================================================================
// SECURITY & VALIDATION
// ============================================================================
const isValidAuthResponse = (data: unknown): data is AuthResponse => {
	if (!data || typeof data !== "object") return false;

	const auth = data as Record<string, unknown>;
	const authData = auth.data as Record<string, unknown> | undefined;

	if (!authData || typeof authData !== "object") return false;

	const hasRequiredTokens =
		typeof authData.access === "string" && typeof authData.refresh === "string";
	const hasUser = authData.user && typeof authData.user === "object";
	const hasSuccess = auth.success === true;
	const hasStatus = typeof auth.status === "number";

	return (hasRequiredTokens && hasUser && hasSuccess && hasStatus) as boolean;
};

const sanitizeString = (value: unknown, maxLength: number): string => {
	if (value === null || value === undefined) return "";
	return String(value).slice(0, maxLength).trim();
};

const sanitizeEmail = (email: unknown): string => {
	return sanitizeString(email, 255).toLowerCase();
};

const validateEmail = (email: string): boolean => {
	return email.includes("@") && email.includes(".");
};

const parseDate = (
	dateString: string | undefined | null,
): string | undefined => {
	if (!dateString || typeof dateString !== "string") return undefined;

	try {
		const date = new Date(dateString);
		if (Number.isNaN(date.getTime())) return undefined;

		const now = new Date();
		const maxYearsAhead = 10;
		const maxYearsAgo = 100;

		if (date.getFullYear() - now.getFullYear() > maxYearsAhead) {
			return undefined;
		}

		if (now.getFullYear() - date.getFullYear() > maxYearsAgo) {
			return undefined;
		}

		return date.toISOString();
	} catch {
		return undefined;
	}
};

const validateNumericField = (
	value: unknown,
	min = 0,
	max = 999999,
): number => {
	if (value === null || value === undefined) return 0;
	const number_ = Number(value);
	if (Number.isNaN(number_)) return 0;
	return Math.max(min, Math.min(max, number_));
};

const validateBooleanField = (value: unknown): boolean => {
	// Handle explicit boolean values
	if (typeof value === "boolean") return value;
	// Handle string representations
	if (typeof value === "string") {
		return value.toLowerCase() === "true";
	}
	// Default to false for null, undefined, or other types
	return false;
};

const mapResponseToUserData = (response: AuthResponse): UserData => {
	const user = response.data.user;

	return {
		access: response.data.access,
		refresh: response.data.refresh,

		// Core user fields
		email: sanitizeEmail(user.email),
		bio: sanitizeString(user.bio, 5000),
		new_user: validateBooleanField(user.new_user),
		last_name: sanitizeString(user.last_name, 255),
		first_name: sanitizeString(user.first_name, 255),
		is_active: user.is_active !== false, // Default to true unless explicitly false
		profile: user.profile ? sanitizeString(user.profile, 255) : undefined,
		preferences:
			typeof user.preferences === "object" && user.preferences !== null
				? (user.preferences as Record<string, unknown>)
				: {},

		// Authentication & connections
		type: sanitizeString(user.type || "magic", 50),
		github_connected: validateBooleanField(user.github_connected),
		google_connected: validateBooleanField(user.google_connected),

		// Subscription & billing
		plan: sanitizeString(user.plan || "basic", 50),
		subscription_status: sanitizeString(
			user.subscription_status || "inactive",
			255,
		),
		subscription_end_date: parseDate(user.subscription_end_date),
		subscription_start_date: parseDate(user.subscription_start_date),
		billing_interval: user.billing_interval
			? sanitizeString(user.billing_interval, 255)
			: undefined,

		// Payment providers
		paddle_subscription_id: user.paddle_subscription_id
			? sanitizeString(user.paddle_subscription_id, 255)
			: undefined,
		stripe_subscription_id: user.stripe_subscription_id
			? sanitizeString(user.stripe_subscription_id, 255)
			: undefined,
		paddle_customer_id: user.paddle_customer_id
			? sanitizeString(user.paddle_customer_id, 255)
			: undefined,

		// Pending plan changes
		pending_plan_change: user.pending_plan_change
			? sanitizeString(user.pending_plan_change, 255)
			: undefined,
		pending_plan_effective_date: parseDate(user.pending_plan_effective_date),
		pending_plan_change_type: user.pending_plan_change_type
			? sanitizeString(user.pending_plan_change_type, 255)
			: undefined,

		// Payment & grace period
		payment_grace_period_end: parseDate(user.payment_grace_period_end),

		// Billing information
		billing_type: user.billing_type,
		payment_provider: user.payment_provider,
		credits_balance: validateNumericField(user.credits_balance, 0, 999999),
		lifetime_credits_purchased: validateNumericField(
			user.lifetime_credits_purchased,
			0,
			999999,
		),

		// Helper flags
		is_in_grace_period: validateBooleanField(user.is_in_grace_period),
		has_active_subscription: validateBooleanField(user.has_active_subscription),

		// Bonus flags
		spin_bonus_claimed: validateBooleanField(user.spin_bonus_claimed),
		spin_bonus_skipped: validateBooleanField(user.spin_bonus_skipped),
		can_use_spin_bonus: validateBooleanField(user.can_use_spin_bonus),
		signup_bonus_claimed: validateBooleanField(user.signup_bonus_claimed),
	};
};

// ============================================================================
// NEXTAUTH CONFIGURATION
// ============================================================================

const config: NextAuthConfig = {
	providers: [
		CredentialsProvider({
			id: "credentials",
			name: "Email and Password",
			credentials: {
				token: { label: "Token", type: "text" },
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
				magicLink: { label: "Magic Link", type: "checkbox" },
			},
			authorize: async (credentials): Promise<User | null> => {
				if (!credentials) return null;

				const creds = credentials as AuthCredentials;

				try {
					if (creds.magicLink && creds.token) {
						const token = sanitizeString(creds.token, 1000);
						const response = await confirmMagicLink(token);

						if (!isValidAuthResponse(response)) return null;
						if (response.success === false || response.status === 401)
							return null;

						const userData = mapResponseToUserData(response);

						const authResponse: AuthorizeResponse = {
							data: userData,
							status: 200,
							success: true,
						};

						return authResponse as unknown as User;
					} else if (creds.email && creds.password) {
						const email = sanitizeEmail(creds.email);
						const password = sanitizeString(creds.password, 512);

						if (!validateEmail(email)) return null;

						const response = await loginWithCredentials(email, password);

						if (!isValidAuthResponse(response)) return null;
						if (response.success === false || response.status === 401)
							return null;

						const userData = mapResponseToUserData(response);

						const authResponse: AuthorizeResponse = {
							data: userData,
							status: 200,
							success: true,
						};

						return authResponse as unknown as User;
					}

					return null;
				} catch {
					return null;
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
			if (account && user) {
				const authUser = user as unknown as AuthorizeResponse;

				if (authUser.data) {
					const userData = authUser.data;

					await createEncryptedCookie("cookie_state", {
						access_token: userData.access,
						refresh_token: userData.refresh,
						created_at: new Date().toISOString(),
					});

					await createEncryptedCookie("user_state", {
						new_user: userData.new_user,
						auth_type: userData.type,
						email: userData.email,
					});

					return {
						...token,
						// @ts-ignore
						accessToken: userData.access,
						// @ts-ignore
						refreshToken: userData.refresh,
						tokenExpiry: Date.now() + 24 * 60 * 60 * 1000,
						user: {
							// Core user fields
							bio: userData.bio,
							email: userData.email,
							profile: userData.profile,
							last_name: userData.last_name,
							first_name: userData.first_name,
							preferences: userData.preferences,

							new_user: userData.new_user,
							is_active: userData.is_active,

							// Authentication & connections
							type: userData.type,
							github_connected: userData.github_connected,
							google_connected: userData.google_connected,

							// Subscription & billing
							plan: userData.plan,
							billing_interval: userData.billing_interval,
							subscription_status: userData.subscription_status,
							subscription_end_date: userData.subscription_end_date,
							subscription_start_date: userData.subscription_start_date,

							// Payment providers
							paddle_customer_id: userData.paddle_customer_id,
							paddle_subscription_id: userData.paddle_subscription_id,
							stripe_subscription_id: userData.stripe_subscription_id,

							// Pending plan changes
							pending_plan_change: userData.pending_plan_change,
							pending_plan_change_type: userData.pending_plan_change_type,
							pending_plan_effective_date: userData.pending_plan_effective_date,

							// Payment & grace period
							payment_grace_period_end: userData.payment_grace_period_end,

							// Billing information
							billing_type: userData.billing_type,
							credits_balance: userData.credits_balance,
							payment_provider: userData.payment_provider,
							lifetime_credits_purchased: userData.lifetime_credits_purchased,

							// Helper flags
							is_in_grace_period: userData.is_in_grace_period,
							has_active_subscription: userData.has_active_subscription,

							// Bonus flags
							spin_bonus_claimed: userData.spin_bonus_claimed,
							spin_bonus_skipped: userData.spin_bonus_skipped,
							can_use_spin_bonus: userData.can_use_spin_bonus,
							signup_bonus_claimed: userData.signup_bonus_claimed,

							// Auth tokens
							access: userData.access,
							refresh: userData.refresh,
						},
					};
				}

				return null;
			}

			return token;
		},

		session: async ({ session, token }): Promise<Session> => {
			if (token?.tokenExpiry && token.tokenExpiry < Date.now()) {
				return {
					...session,
					user: null as unknown as typeof session.user,
				};
			}

			if (token?.user) {
				return {
					...session,
					accessToken: token.accessToken as string,
					refreshToken: token.refreshToken as string,
					user: {
						...session.user,
						...(token.user as Partial<typeof session.user>),
					},
				};
			}

			return session;
		},
	},
	pages: {
		signIn: "/",
	},
	trustHost: true,
};

export const { handlers, signOut, signIn, auth, unstable_update } =
	NextAuth(config);
