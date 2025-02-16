"use server";

import { apiClient } from "@/lib/utils/api-client";

export const getUnreadCount = async (): Promise<{
	success: boolean;
	data?: {
		has_unread: boolean;
	};
	message?: string;
}> => {
	try {
		// Make the API call to get organizations
		const response = await apiClient.get("/api/v1/notifications/unread/");

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
