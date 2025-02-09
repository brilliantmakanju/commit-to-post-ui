"use server";

import { apiClient } from "@/lib/utils/api-client";

export const getOrganizations = async (): Promise<{
	success: boolean;
	organizations?: any[];
	message?: string;
}> => {
	try {
		// Make the API call to get organizations
		const response = await apiClient.get("/api/v1/organizations/");

		// Check if the request was successful
		if (response.error) {
			throw new Error(
				response?.error.message || "Failed to fetch organizations.",
			);
		}

		// Return success with the organizations data
		return {
			success: true,
			organizations: response.data.organizations,
		};
	} catch (error: any) {
		// Catch any errors and return them
		return {
			success: false,
			message: error.message || "An unexpected error occurred.",
		};
	}
};
