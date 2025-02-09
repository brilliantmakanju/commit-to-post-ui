"use server";

import { apiClient } from "@/lib/utils/api-client";

export const getLinkedInConnection = async (): Promise<{
	[x: string]: any;
	success: boolean;
	message?: string;
	url?: string;
}> => {
	try {
		// Make the API call to get organizations
		const response = await apiClient.get(
			"/api/v1/managements/linkedin/callback/",
		);

		// Check if the request was successful
		if (response.error) {
			throw new Error(
				response?.error.message || "Failed to fetch linkedin connection.",
			);
		}

		// Return success with the organizations data
		return {
			success: true,
			url: response.data.authorization_url,
		};
	} catch (error: any) {
		// Catch any errors and return them
		return {
			success: false,
			message: error.message || "An unexpected error occurred.",
		};
	}
};
