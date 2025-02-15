"use server";

import { z } from "zod";

import { apiClient } from "@/lib/utils/api-client";

const updateTonesSchema = z.object({
	tones: z.array(z.string()),
	shuffle_tones: z.boolean(),
});

export const updateTones = async (tones: string[], shuffle_tones: boolean) => {
	try {
		const validatedData = updateTonesSchema.parse({ tones, shuffle_tones });

		const response = await apiClient.put(
			"/api/v1/organizations/tone-settings/",
			{
				selected_tone: validatedData.tones,
				shuffle_tones: validatedData.shuffle_tones,
			},
		);

		if (response.status !== 200) {
			throw new Error(
				`Failed to update tones. Server responded with status ${response.status}`,
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
			console.error("Failed to update tones:", error.message);
			return { success: false, error: "Failed to update tones" };
		}

		console.error("An unexpected error occurred while updating the tones");
		return { success: false, error: "An unexpected error occurred" };
	}
};
