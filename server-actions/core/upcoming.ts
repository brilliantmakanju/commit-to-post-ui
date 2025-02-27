"use server";

import { z } from "zod";

import { apiClient } from "../../lib/utils/api-client";

/**
 * Fetch upcoming posts (metrics) from the upcoming endpoint.
 *
 * Expected response format:
 * {
 *    "scheduled_posts_count": number,  // Number of scheduled posts
 *    "generated_posts_count": number,  // Number of generated posts
 * }
 */
export const fetchUpcomingPosts = async () => {
	try {
		const response = await apiClient.get("/api/v1/upcoming/");
		if (response.status !== 200) {
			throw new Error(
				"The request to retrieve upcoming posts was unsuccessful.",
			);
		}
		// Return the data from the response.
		return { success: true, data: response.data };
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errorMessages = error.errors.map(error_ => ({
				field: error_.path.join("."),
				message: error_.message,
			}));
			throw new Error(`Validation failed: ${JSON.stringify(errorMessages)}`);
		}
		if (error instanceof Error) {
			throw new TypeError(`Failed to fetch upcoming posts: ${error.message}`);
		}
		throw new Error(
			"An unexpected error occurred while fetching upcoming posts. Please try again later.",
		);
	}
};
