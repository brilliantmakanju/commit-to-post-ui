"use server";
import { apiClient } from "@/lib/utils/api-client";

export const createRegenerateWebhook = async () => {
	try {
		const response = await apiClient.post(
			"/api/v1/webhook/create_or_regenerate/",
			{},
		);

		return response; // Return the created webhook data
	} catch (error: unknown) {
		if (error instanceof Error) {
			throw new TypeError(`Failed to create Webhook: ${error.message}`);
		}
		throw new Error("Failed to create Webhook: Unknown error");
	}
};
