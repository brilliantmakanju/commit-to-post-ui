"use server";

import { signOut as naSignOut } from "@/auth";
import { apiClient } from "@/lib/utils/api-client";
import { getAuthTokens } from "@/lib/utils/gettokens";

export const logout = async () => {
	const { refresh_token } = await getAuthTokens();
	try {
		// Make the API call using the apiClient
		const response = await apiClient.post(
			"/api/v1/managements/logout/",
			{ refresh: refresh_token }, // Body
			{ "X-Refresh-Token": refresh_token || "" }, // Headers
		);

		if (response.success === false) {
			return {
				success: false,
				message: "Logout Failed. Try again.",
			};
		}
		return response;
	} catch (error: any) {
		// Catch any errors from the API call and return them
		return {
			success: false,
			message: error.message || "An unexpected error occurred.",
			errorDetails: error, // Optional: Include error details for debugging
		};
	}
};
export async function signOut() {
	await naSignOut({ redirect: false });
}
