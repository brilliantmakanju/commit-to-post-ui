"use server";

import { apiClient } from "@/lib/utils/api-client";

export const getOrganizationsTone = async (): Promise<{
	success: boolean;
	data?: {
		selected_tone: string;
		shuffle_tones: boolean;
		available_tones?: [{ value: string; display: string }];
	};
	message?: string;
}> => {
	try {
		// Make the API call to get organizations
		const response = await apiClient.get(
			"/api/v1/organizations/tone-settings/",
		);

		// Check if the request was successful
		if (response.error) {
			throw new Error(
				response?.error.message || "Failed to fetch organizations tone.",
			);
		}

		// Return success with the organizations tone data
		return {
			success: true,
			data: response.data,
		};
	} catch (error: any) {
		// Catch any errors and return them
		return {
			success: false,
			message: error.message || "An unexpected error occurred.",
		};
	}
};
