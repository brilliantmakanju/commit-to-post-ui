"use server";

import { apiClient } from "@/lib/utils/api-client";

export const getSocialStatus = async (): Promise<{
	[x: string]: any;
	success: boolean;
	message?: string;
	data: {
		organization: string;
		has_twitter: boolean;
		has_linkedin: boolean;
	};
}> => {
	try {
		// Make the API call to get organizations
		const response = await apiClient.get("/api/v1/organizations/status/");
		console.log(response, "Responsed");

		// Check if the request was successful
		if (response.error) {
			throw new Error(
				response?.error.message || "Failed to fetch social status.",
			);
		}

		// Return success with the organizations data
		return {
			success: true,
			data: response.data,
		};
	} catch (error: any) {
		// Catch any errors and return them
		return {
			success: false,
			message: error.message || "An unexpected error occurred.",
			data: {
				organization: "",
				has_twitter: false,
				has_linkedin: false,
			},
		};
	}
};
