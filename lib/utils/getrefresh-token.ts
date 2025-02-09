import { refreshToken } from "@/server-actions/auth/auth-actions";

import { updateCookie } from "../cookies/create-cookies";
import { getAuthTokens } from "./gettokens";

// @ts-ignore
export async function refreshAccessToken(token) {
	try {
		const { refresh_token } = await getAuthTokens();

		// Ensure that we have a valid refresh token
		if (!refresh_token) {
			throw new Error("Missing refresh token");
		}

		// Make the API call to refresh the access token using the current refresh token
		const response = await refreshToken(refresh_token);

		const data = response.data;

		await updateCookie("cookie_state", {
			access_token: data.access_token,
			refresh_token: data.refresh_token,
		}); // Update the cookie

		// Check if the response was successful
		if (!response.success) {
			const errorDetails = response; // Capture error details from the response
			throw new Error(
				`Failed to refresh token: ${errorDetails.error || "Unknown error"}`,
			);
		}

		// Parse the response body to get the new tokens
		// If the new access token is missing, throw an error
		if (!data.access_token) {
			throw new Error("Access token is missing from the response");
		}

		// Return the updated token data, including the new access token and refresh token
		return {
			...token,
			accessToken: data.access_token, // Update access token
			refreshToken: data.refresh_token, // Use the new refresh token, or fallback to old refresh token
			user: {
				...token.user,
				access: data.access_token, // update user access token here if needed
				refresh: data.refresh_token, // Update user refresh token
			},
		};
	} catch (error) {
		// @ts-ignore
		return {
			...token,
			// @ts-ignore
			error: error?.message || "RefreshAccessTokenError", // Return the error message from the catch block
		};
	}
}
