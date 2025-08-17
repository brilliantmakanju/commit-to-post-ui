/* eslint-disable import/no-unresolved */
"use server";

import { z } from "zod";

import { apiClient } from "@/lib/utils/api-client";

// Array of individual repo configs

const socialSchema = z.object({
	name: z.string(),
	handle: z.string(),
	id: z.string().uuid(),
	profile_image_url: z.string(),
	platform: z.enum(["linkedin", "x-twitter", "slack", "discord"]),
});

const repoSchema = z.object({
	tone: z.string(),
	branch: z.string(),
	repo_id: z.string(),
	aiEnabled: z.boolean(),
	socials: z.array(socialSchema),
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
			{},
			10000,
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
