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
		const response = await apiClient.post(
			`/api/v1/notifications/?notification_id=${id}&action=read`,
			{},
		);

		if (response.error) {
			throw new Error(
				response?.error.message || "Failed to read notification.",
			);
		}

		return {
			success: true,
		};
	} catch (error: any) {
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
		const response = await apiClient.post(
			"/api/v1/notifications/?all=true&action=read",
			{},
		);

		if (response.error) {
			throw new Error(
				response?.error.message || "Failed to read notifications.",
			);
		}

		return {
			success: true,
		};
	} catch (error: any) {
		return {
			success: false,
			message: error.message || "An unexpected error occurred.",
		};
	}
};

export const deleteNotification = async ({
	id,
}: {
	id: UUID;
}): Promise<{
	success: boolean;
	message?: string;
}> => {
	try {
		const response = await apiClient.post(
			`/api/v1/notifications/?notification_id=${id}&action=delete`,
			{},
		);

		if (response.error) {
			throw new Error(
				response?.error.message || "Failed to delete notification.",
			);
		}

		return {
			success: true,
		};
	} catch (error: any) {
		return {
			success: false,
			message: error.message || "An unexpected error occurred.",
		};
	}
};

export const deleteAllNotifications = async (): Promise<{
	success: boolean;
	message?: string;
}> => {
	try {
		const response = await apiClient.post(
			"/api/v1/notifications/?all=true&action=delete",
			{},
		);

		if (response.error) {
			throw new Error(
				response?.error.message || "Failed to delete notifications.",
			);
		}

		return {
			success: true,
		};
	} catch (error: any) {
		return {
			success: false,
			message: error.message || "An unexpected error occurred.",
		};
	}
};
