"use server";

import { z } from "zod";

import { apiClient } from "../../lib/utils/api-client";

/**
 * Toggle email notifications for the authenticated user
 */
export const toggleEmailNotifications = async (
	action?: "subscribe" | "unsubscribe",
) => {
	try {
		const response = await apiClient.post(
			"/api/v1/emails/toggle-notifications/",
			action ? { action } : {},
			{},
			20000,
		);

		if (response.status !== 200) {
			throw new Error(
				"The request to update email notifications was unsuccessful.",
			);
		}

		return {
			success: true,
			message: response.data.message,
			subscribed: response.data.subscribed,
		};
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errorMessages = error.errors.map(event => ({
				field: event.path.join("."),
				message: event.message,
			}));
			throw new Error(`Validation failed: ${JSON.stringify(errorMessages)}`);
		}

		if (error instanceof Error) {
			throw new TypeError(
				`Failed to update email notifications: ${error.message}`,
			);
		}

		throw new Error(
			"An unexpected error occurred while updating your email notification preferences. Please try again later.",
		);
	}
};

/**
 * Get current email notification status
 */
export const getNotificationStatus = async () => {
	try {
		const response = await apiClient.get(
			"/api/v1/emails/notification-status/",
			{},
			20000,
		);

		if (response.status !== 200) {
			throw new Error("Failed to fetch notification status.");
		}

		return {
			success: true,
			subscribed: response.data.subscribed,
		};
	} catch (error) {
		if (error instanceof Error) {
			throw new TypeError(
				`Failed to get notification status: ${error.message}`,
			);
		}

		throw new Error(
			"An unexpected error occurred while fetching your notification preferences.",
		);
	}
};
