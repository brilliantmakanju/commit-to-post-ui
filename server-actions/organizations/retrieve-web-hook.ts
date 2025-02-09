"use server";
import { apiClient } from "@/lib/utils/api-client";

export const retriveWebhook = async () => {
	try {
		const response = await apiClient.get("/api/v1/webhook/retrieve/");

		return response; // Return the retrieved webhook data
	} catch (error: unknown) {
		if (error instanceof Error) {
			throw new TypeError(`Failed to retrieve Webhook: ${error.message}`);
		}
		throw new Error("Failed to retrieve Webhook: Unknown error");
	}
};
