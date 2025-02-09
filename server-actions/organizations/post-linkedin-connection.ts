"use server";

import { apiClient } from "@/lib/utils/api-client";
import { connectAccountSchema } from "@/resolvers/organizations/organization-schema";

export const postLinkedInConnection = async ({
	code,
}: {
	code: string;
}): Promise<{
	[x: string]: any;
	success: boolean;
	message?: string;
	url?: string;
}> => {
	const data = {
		code: code,
	};
	const parsedData = connectAccountSchema.parse(data);

	http: try {
		// Make the API call to get organizations
		const response = await apiClient.post(
			`/api/v1/managements/linkedin/callback/?code=${parsedData.code}`,
			{},
		);

		// Check if the request was successful
		if (response.error) {
			throw new Error(response?.error.message || "Linkedin connection failed.");
		}

		// Return success with the organizations data
		return {
			success: true,
			url: response.data.authorization_url,
		};
	} catch (error: any) {
		// Catch any errors and return them
		return {
			success: false,
			message: error.message || "An unexpected error occurred.",
		};
	}
};
