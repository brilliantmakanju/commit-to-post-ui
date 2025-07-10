"use server";

import { z } from "zod";

// eslint-disable-next-line import/no-unresolved
import { apiClient } from "@/lib/utils/api-client";

// Define a schema for the query params if needed
const fetchConnectedReposSchema = z.object({
	page: z.number().int().positive().optional(),
});

export const fetchConnectedRepos = async ({
	page = 1,
}: { page?: number } = {}) => {
	try {
		const validated = fetchConnectedReposSchema.parse({ page });

		const response = await apiClient.get(
			`/api/v1/github/connected-repos/?page=${validated.page}`,
		);

		if (response.status !== 200) {
			throw new Error("Failed to retrieve connected repositories.");
		}

		return response;
	} catch (error) {
		if (error instanceof z.ZodError) {
			const validationErrors = error.errors.map(event_ => ({
				field: event_.path.join("."),
				message: event_.message,
			}));
			throw new Error(`Validation failed: ${JSON.stringify(validationErrors)}`);
		}

		if (error instanceof Error) {
			throw new TypeError(`Failed to fetch connected repos: ${error.message}`);
		}

		throw new Error(
			"An unexpected error occurred while fetching connected repositories.",
		);
	}
};
