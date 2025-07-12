"use server";

import { UUID } from "node:crypto";

import { apiClient } from "@/lib/utils/api-client";

export const readNotifications = async ({
	id,
}: {
	id: UUID;
}): Promise<{
	success: boolean;
	message?: string;
}> => {
	try {
		// Make the API call to get all Notifications
		const response = await apiClient.post(
			`/api/v1/notifications/?notification_id=${id}`,
			{},
		);

		// Check if the request was successful
		if (response.error) {
			throw new Error(
				response?.error.message || "Failed to read notification.",
			);
		}

		// Return success with the organizations tone data
		return {
			success: true,
		};
	} catch (error: any) {
		// Catch any errors and return them
		return {
			success: false,
			message: error.message || "An unexpected error occurred.",
		};
	}
};

export const readAllNotifications = async (): Promise<{
	success: boolean;
	message?: string;
}> => {
	try {
		// Make the API call to get all Notifications
		const response = await apiClient.post(
			"/api/v1/notifications/?all=true",
			{},
		);

		// Check if the request was successful
		if (response.error) {
			throw new Error(
				response?.error.message || "Failed to read notification.",
			);
		}

		// Return success with the organizations tone data
		return {
			success: true,
		};
	} catch (error: any) {
		// Catch any errors and return them
		return {
			success: false,
			message: error.message || "An unexpected error occurred.",
		};
	}
};
