"use server";

import { z } from "zod";

// eslint-disable-next-line import/no-unresolved
import { apiClient } from "@/lib/utils/api-client";

const updateRepoSettingsSchema = z.object({
	repo_id: z.string().uuid(),
	settings: z.record(z.any()),
});

export const updateRepoSettings = async (
	repo_id: string,
	settings: Record<string, any>,
) => {
	try {
		const validated = updateRepoSettingsSchema.parse({ repo_id, settings });

		const response = await apiClient.put(
			`/api/v1/repositories/${validated.repo_id}/detail/super/`,
			validated.settings,
		);

		if (response.status !== 200) {
			throw new Error(`Failed with status ${response.status}`);
		}

		return { success: true, data: response.data };
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errors = error.errors.map(event_ => ({
				field: event_.path.join("."),
				message: event_.message,
			}));
			return {
				success: false,
				error: "Validation error",
				details: errors,
			};
		}
		return {
			success: false,
			error: "Unexpected error updating settings",
		};
	}
};
