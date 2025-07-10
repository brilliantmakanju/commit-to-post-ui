"use server";

import { signOut as naSignOut } from "@/auth";
import { apiClient } from "@/lib/utils/api-client";
import { getAuthTokens } from "@/lib/utils/gettokens";

export const logout = async () => {
	try {
		const { refresh_token } = await getAuthTokens();

		// If no refresh token, consider it already logged out
		if (!refresh_token) {
			return {
				success: true,
				message: "No session to logout",
			};
		}

		// Make the API call using the apiClient
		const response = await apiClient.post(
			"/api/v1/managements/logout/",
			{ refresh: refresh_token }, // Body
			{ "X-Refresh-Token": refresh_token }, // Headers
		);

		// Return the response
		return response;
	} catch (error: any) {
		// Log the error on server side for debugging
		// console.error("Server logout error:", error);

		// Return error info to client
		return {
			success: false,
			message: error.message || "An unexpected error occurred.",
			errorDetails: error,
		};
	}
};

// eslint-disable-next-line unicorn/no-object-as-default-parameter
export async function signOut(options = { redirect: false }) {
	try {
		await naSignOut(options);
		return { success: true };
	} catch (error) {
		// console.error("NextAuth signOut error:", error);
		return { success: false, error };
	}
}
