"use server";

import { z } from "zod";

import { apiClient } from "@/lib/utils/api-client";

// Define a schema for the pagination query parameters.
const fetchPostsSchema = z.object({
	page_size: z.number().int().positive({
		message: "Page size must be a positive integer.",
	}),
});

export const fetchPosts = async ({ page_size }: { page_size: number }) => {
	try {
		// Validate the incoming data against the schema.
		const validatedData = fetchPostsSchema.parse({
			page_size: page_size,
		});
		// const { page_size } = validatedData;
		// console.log(page_size, "Page_size");

		// Build query parameters (default page to 1 if not provided).
		const response = await apiClient.get(
			validatedData.page_size === 1
				? "/api/v1/posts/"
				: `/api/v1/posts/?page=${validatedData.page_size}`,
		);
		// Check for a successful status code.
		if (response.status !== 200) {
			throw new Error("The request to retrieve posts was unsuccessful.");
		}

		// Return the retrieved post data.
		return response;
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errorMessages = error.errors.map(error_ => ({
				field: error_.path.join("."),
				message: error_.message,
			}));
			throw new Error(`Validation failed: ${JSON.stringify(errorMessages)}`);
		}

		if (error instanceof Error) {
			throw new TypeError(`Failed to fetch posts: ${error.message}`);
		}

		throw new Error(
			"An unexpected error occurred while fetching posts. Please try again later.",
		);
	}
};
