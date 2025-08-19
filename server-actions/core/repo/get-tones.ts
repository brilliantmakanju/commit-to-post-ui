"use server";
import { z } from "zod";

// eslint-disable-next-line import/no-unresolved
import { apiClient } from "@/lib/utils/api-client";

// eslint-disable-next-line import/no-unresolved
import { TonesResponseSchema } from "./type";

export const fetchTones = async () => {
	try {
		const response = await apiClient.get("/api/v1/tones/");

		if (response.status !== 200) {
			throw new Error("The request to retrieve tones was unsuccessful.");
		}

		// Validate response
		const parsed = TonesResponseSchema.parse(response.data);

		return {
			data: parsed.data,
			success: parsed.success,
			message: parsed.message,
		};
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errorMessages = error.errors.map(event_ => ({
				field: event_.path.join("."),
				message: event_.message,
			}));
			throw new Error(
				`Tone validation failed: ${JSON.stringify(errorMessages)}`,
			);
		}
		if (error instanceof Error) {
			throw new TypeError(`Failed to fetch tones: ${error.message}`);
		}
		throw new Error(
			"An unexpected error occurred while fetching tones. Please try again later.",
		);
	}
};
