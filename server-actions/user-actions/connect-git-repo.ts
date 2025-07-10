/* eslint-disable import/no-unresolved */
"use server";

import { z } from "zod";

import { apiClient } from "@/lib/utils/api-client";

// Array of individual repo configs
const repoSchema = z.object({
	repo_id: z.string(),
	branch: z.string(),
	tone: z.string(),
	aiEnabled: z.boolean(),
});

const githubRepoConnectBatchSchema = z.array(repoSchema);

export const connectGithubRepoBatch = async (
	payload: z.infer<typeof githubRepoConnectBatchSchema>,
): Promise<{
	success: boolean;
	message?: string;
}> => {
	try {
		const parsed = githubRepoConnectBatchSchema.parse(payload);

		const response = await apiClient.post(
			"/api/v1/managements/github/repo/connect/",
			parsed,
		);

		if (response.error) {
			return {
				success: false,
				message: response.error.detail || "An unexpected error occurred.",
			};
		}

		return { success: true };
	} catch (error: any) {
		return {
			success: false,
			message:
				error?.message ??
				error?.detail ??
				"An error occurred during batch repo connection.",
		};
	}
};
