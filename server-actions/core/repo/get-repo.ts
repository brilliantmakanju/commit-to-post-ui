"use server";

import { z } from "zod";

// eslint-disable-next-line import/no-unresolved
import { apiClient } from "@/lib/utils/api-client";

const fetchRepoDetailsSchema = z.object({
	repoId: z.string().uuid(),
});

export const fetchRepoDetails = async ({ repoId }: { repoId: string }) => {
	try {
		const validated = fetchRepoDetailsSchema.parse({ repoId });

		const response = await apiClient.get(
			`/api/v1/repositories/${validated.repoId}/detail/`,
		);

		if (response.status !== 200) {
			throw new Error("Failed to retrieve repository details.");
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
			throw new TypeError(`Failed to fetch repo details: ${error.message}`);
		}

		throw new Error(
			"An unexpected error occurred while fetching repo details.",
		);
	}
};

export const fetchRepoWebhook = async ({ repoId }: { repoId: string }) => {
	try {
		const { repoId: validatedRepoId } = fetchRepoDetailsSchema.parse({
			repoId,
		});

		const response = await apiClient.get(
			`/api/v1/repositories/${validatedRepoId}/webhook-logs/`,
		);

		if (response.status !== 200 || !response.data) {
			throw new Error("Invalid webhook logs response from server.");
		}

		return response.data; // normalized
	} catch (error) {
		if (error instanceof z.ZodError) {
			const details = error.errors
				.map(event_ => `${event_.path.join(".")}: ${event_.message}`)
				.join(", ");
			throw new Error(`Invalid input: ${details}`);
		}

		if (error instanceof Error) {
			throw new TypeError(`Webhook fetch failed: ${error.message}`);
		}

		throw new Error("Unexpected error fetching webhook logs.");
	}
};

export const fetchRepoSuperDetails = async ({ repoId }: { repoId: string }) => {
	try {
		const validated = fetchRepoDetailsSchema.parse({ repoId });

		const response = await apiClient.get(
			`/api/v1/repositories/${validated.repoId}/detail/super/`,
		);

		if (response.status !== 200) {
			throw new Error("Failed to retrieve repository details.");
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
			throw new TypeError(`Failed to fetch repo details: ${error.message}`);
		}

		throw new Error(
			"An unexpected error occurred while fetching repo details.",
		);
	}
};
