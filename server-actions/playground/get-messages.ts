"use server";
import { transformChatData } from "@/lib/arrange-message";
import { apiClient } from "@/lib/utils/api-client";

export const getChatHistory = async (): Promise<{
	success: boolean;
	message?: string;
	data?: any;
}> => {
	try {
		// Make the API call to fetch chat logs
		const response = await apiClient.get(
			"/api/v1/playground/chat-logs/",
			{},
			30000,
			1,
		);

		if (response.error) {
			return {
				success: false,
				message: response?.error?.detail || "Failed to fetch chat history.",
			};
		}

		// Transform backend data to frontend format
		const transformedData = transformChatData(response.data?.data || []);

		return {
			success: true,
			data: transformedData,
		};
	} catch (error: any) {
		return {
			success: false,
			message:
				error?.detail ||
				"An unexpected error occurred while fetching chat history.",
		};
	}
};
