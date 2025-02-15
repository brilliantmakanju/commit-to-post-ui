"use server";
import { apiClient } from "@/lib/utils/api-client";

export const retriveWebhookSettings = async () => {
	try {
		const response = await apiClient.get("/api/v1/webhook/settings/");

		return response;
	} catch (error: unknown) {
		if (error instanceof Error) {
			throw new TypeError(
				`Failed to retrieve Webhook Settings: ${error.message}`,
			);
		}
		throw new Error("Failed to retrieve Webhook Settings: Unknown error");
	}
};
