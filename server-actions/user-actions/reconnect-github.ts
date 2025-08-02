/* eslint-disable import/no-unresolved */
"use server";

import { apiClient } from "@/lib/utils/api-client";

export const reconnectGithub = async (): Promise<{
	[x: string]: any;
	success: boolean;
	message?: string;
}> => {
	http: try {
		// Make the API call to get organizations
		const response = await apiClient.post(
			"/api/v1/managements/github/reconnect/",
			{},
			{},
			10000,
		);
		// Check if the request was successful
		if (response.error) {
			return {
				success: false,
				message: response?.error.detail || "An unexpected error occurred.",
			};
		}

		// Return success with the organizations data
		return {
			success: response.data.success,
			message: response.data.message,
		};
	} catch (error: any) {
		// Catch any errors and return them
		return {
			success: false,
			message: error.detail || "An unexpected error occurred.",
		};
	}
};
