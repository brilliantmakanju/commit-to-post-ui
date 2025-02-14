/* eslint-disable unicorn/no-null */
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { createEncryptedCookie } from "@/lib/cookies/create-cookies";

import { getAuthTokens } from "./lib/utils/gettokens";
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
							first_name: response.data.user?.first_name ?? null,
							last_name: response.data.user?.last_name ?? null,
							bio: response.data.user?.bio ?? null,
							email: response.data.user?.email ?? null,
							preferences: response.data.user?.preferences ?? null,
							github_connected: response.data.user?.github_connected ?? false,
							google_connected: response.data.user?.google_connected ?? false,
							new_user: response.data.user?.new_user ?? true,
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
							first_name: userData.first_name,
							last_name: userData.last_name,
							bio: userData.bio,
							email: userData.email,
							preferences: userData.preferences,
							github_connected: userData.github_connected,
							google_connected: userData.google_connected,
							access: userData.access,
							refresh: userData.refresh,
							new_user: userData.new_user,
							type: userData.type,
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
		signIn: "/auth?view=login",
	},
	trustHost: true,
});
