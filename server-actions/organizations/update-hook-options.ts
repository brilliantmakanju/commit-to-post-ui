"use server";

import { z } from "zod";

import { apiClient } from "@/lib/utils/api-client";

const updateBranchSchema = z.object({
	name: z
		.string()
		.min(1, "Branch name cannot be empty")
		.max(100, "Branch name is too long"),
});

export const updateBranch = async (branchName: string) => {
	try {
		const validatedData = updateBranchSchema.parse({ name: branchName });

		const response = await apiClient.put("/api/v1/webhook/settings/", {
			branch: validatedData.name,
		});

		if (response.status !== 200) {
			throw new Error(
				`Failed to update branch. Server responded with status ${response.status}`,
			);
		}

		return { success: true, data: response.data };
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errorMessages = error.errors.map(error_ => ({
				field: error_.path.join("."),
				message: error_.message,
			}));
			console.error("Validation failed:", errorMessages);
			return {
				success: false,
				error: "Validation failed",
				details: errorMessages,
			};
		}

		if (error instanceof Error) {
			console.error("Failed to update branch:", error.message);
			return { success: false, error: "Failed to update branch" };
		}

		console.error("An unexpected error occurred while updating the branch");
		return { success: false, error: "An unexpected error occurred" };
	}
};
