/* eslint-disable import/no-unresolved */
"use server";

import { apiClient } from "@/lib/utils/api-client";

export const getGitHubRepos = async (): Promise<{
	success: boolean;
	message?: string;
	data?: any;
}> => {
	try {
		// Make the API call to fetch GitHub repos
		const response = await apiClient.get(
			"/api/v1/managements/github/repos/",
			{},
			30000,
			1,
		);

		if (response.error) {
			return {
				success: false,
				message:
					response?.error?.detail || "Failed to fetch GitHub repositories.",
			};
		}

		// Return repo list
		return {
			success: true,
			data: response.data, // includes repos, page, has_next
		};
	} catch (error: any) {
		return {
			success: false,
			message:
				error?.detail ||
				"An unexpected error occurred while fetching GitHub repos.",
		};
	}
};
