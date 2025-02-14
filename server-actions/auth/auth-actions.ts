"use server";

import { apiClient } from "@/lib/utils/api-client";

/**
 * Confirms a magic link token
 */
export async function confirmMagicLink(token: string) {
	try {
		const response = await apiClient.get(
			`/api/v1/managements/magic-link/confirm/?token=${token}`,
		);

		return response;
	} catch {
		return;
	}
}

/**
 * Handles user login with email and password
 */
export async function loginWithCredentials(email: string, password: string) {
	try {
		const response = await apiClient.post("/api/v1/managements/login/", {
			email,
			password,
		});
		return response;
	} catch {
		return;
	}
}

/**
 * Refreshes the access token using a refresh token
 */
export async function refreshToken(refreshToken: string) {
	try {
		// Make the API request using fetch
		const endpoint =
			process.env.NEXT_PUBLIC_API_URL + "/api/v1/managements/refresh/";

		const response = await fetch(endpoint, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Refresh-Token": refreshToken,
			},
			credentials: "include", // Include cookies in the request if needed
		});
		const responseBody = await response.json();

		return {
			success: true,
			data: responseBody,
		};
	} catch (error) {
		console.error("Error refreshing token:", error);
		return {
			success: false,
			error: error,
		};
	}
}
