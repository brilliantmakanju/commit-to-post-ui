"use server";

import { apiClient } from "../../lib/utils/api-client";

export const getWebhookErrors = async () => {
	const response = await apiClient.get("/api/v1/dashboard/webhook-errors/");
	if (response.status !== 200) {
		throw new Error("Failed to fetch webhook errors.");
	}
	return { success: true, data: response.data };
};
