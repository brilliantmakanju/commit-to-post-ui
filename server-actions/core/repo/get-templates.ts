"use server";

import { z } from "zod";

// eslint-disable-next-line import/no-unresolved
import { apiClient } from "@/lib/utils/api-client";

// eslint-disable-next-line import/no-unresolved
import { TemplatesResponseSchema } from "./type";

export const fetchTemplates = async () => {
	try {
		const response = await apiClient.get("/api/v1/templates/");

		if (response.status !== 200) {
			throw new Error("Failed to retrieve templates.");
		}

		// Validate and normalize in one step
		const parsed = TemplatesResponseSchema.parse(response.data);

		return parsed.data;
	} catch (error) {
		if (error instanceof z.ZodError) {
			throw new TypeError(
				`Template response validation failed: ${error.errors
					.map(event_ => `${event_.path.join(".")}: ${event_.message}`)
					.join(", ")}`,
			);
		}

		if (error instanceof Error) {
			throw new TypeError(`Failed to fetch templates: ${error.message}`);
		}

		throw new Error("An unexpected error occurred while fetching templates.");
	}
};
