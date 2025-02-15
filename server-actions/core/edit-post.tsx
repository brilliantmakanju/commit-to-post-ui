"use server";

import { z } from "zod";

import { apiClient } from "@/lib/utils/api-client";

// Define a schema for the update post parameters
const updatePostSchema = z.object({
	id: z.string().uuid({
		message: "Invalid post ID. Must be a valid UUID.",
	}),
	content: z
		.string()
		.min(1, {
			message: "Content must not be empty.",
		})
		.max(280, {
			message: "Content must not exceed 280 characters.",
		}),
});

export const updatePost = async (
	postId: string,
	content: string,
): Promise<{
	success: boolean;
}> => {
	try {
		// Validate the incoming data against the schema
		const validatedData = updatePostSchema.parse({
			id: postId,
			content: content,
		});

		// Build the URL with the post ID as a query parameter
		const url = `/api/v1/posts/?id=${validatedData.id}`;

		// Make the PUT request
		const response = await apiClient.put(url, {
			content: validatedData.content,
		});

		// Check for a successful status code
		if (response.status !== 200) {
			throw new Error(
				`Failed to update post. Server responded with status ${response.status}`,
			);
		}

		// Return the updated post data
		return response.data;
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errorMessages = error.errors.map(error_ => ({
				field: error_.path.join("."),
				message: error_.message,
			}));
			throw new Error(`Validation failed: ${JSON.stringify(errorMessages)}`);
		}

		if (error instanceof Error) {
			throw new TypeError(`Failed to update post: ${error.message}`);
		}

		throw new Error(
			"An unexpected error occurred while updating the post. Please try again later.",
		);
	}
};
