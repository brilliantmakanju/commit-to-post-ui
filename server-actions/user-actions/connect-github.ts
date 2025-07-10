/* eslint-disable import/no-unresolved */
"use server";

import { apiClient } from "@/lib/utils/api-client";
import { connectAccountSchema } from "@/resolvers/organizations/organization-schema";

export const connectGithub = async ({
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
			"/api/v1/managements/github/login/",
			{
				code: parsedData.code,
			},
			{},
		);
		// Check if the request was successful
		if (response.error) {
			return {
				success: false,
				message: response?.error.detail || "An unexpected error occurred.",
			};
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
			message: error.detail || "An unexpected error occurred.",
		};
	}
};
