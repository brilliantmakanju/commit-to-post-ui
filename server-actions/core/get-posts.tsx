"use server";

import { z } from "zod";

import { apiClient } from "@/lib/utils/api-client";

// Define a schema for the pagination query parameters.
const fetchPostsSchema = z.object({
	page_size: z.number().int().positive({
		message: "Page size must be a positive integer.",
	}),
});

export const fetchPosts = async (page_size?: unknown) => {
	try {
		console.log(page_size);
		// Validate the incoming data against the schema.
		// const validatedData = fetchPostsSchema.parse(page_size_no);
		// const { page_size } = validatedData;

		// Build query parameters (default page to 1 if not provided).
		const response = await apiClient.get("/api/v1/posts/");

		// Check for a successful status code.
		if (response.status !== 200) {
			throw new Error("The request to retrieve posts was unsuccessful.");
		}

		console.log(response, "Response");

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
