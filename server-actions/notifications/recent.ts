"use server";

// eslint-disable-next-line import/no-unresolved
import { apiClient } from "@/lib/utils/api-client";

export const fetchRecentNotifications = async (): Promise<{
	success: boolean;
	data?: {
		notifications: any[];
	};
	message?: string;
}> => {
	try {
		// Make the API call to get recent notifications
		const response = await apiClient.get("/api/v1/notifications/recent");

		// Check if the request was successful
		if (response.error) {
			throw new Error(
				response?.error.message || "Failed to fetch recent notifications.",
			);
		}

		// Return success with the notifications data
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
