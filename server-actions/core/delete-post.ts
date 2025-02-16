"use server";

import { z } from "zod";

import { apiClient } from "@/lib/utils/api-client";

const deletePostSchema = z.object({
	id: z.string().uuid({
		message: "Invalid post ID. Must be a valid UUID.",
	}),
});

export const deletePost = async (
	postId: string,
): Promise<{
	success: boolean;
}> => {
	try {
		const validatedData = deletePostSchema.parse({
			id: postId,
		});

		const url = `/api/v1/posts/?id=${validatedData.id}`;

		const response = await apiClient.delete(url);

		if (response.status !== 200) {
			throw new Error(
				`Failed to delete post. Server responded with status ${response.status}`,
			);
		}

		return {
			success: true,
		};
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errorMessages = error.errors.map(error_ => ({
				field: error_.path.join("."),
				message: error_.message,
			}));
			throw new Error(`Validation failed: ${JSON.stringify(errorMessages)}`);
		}

		if (error instanceof Error) {
			throw new TypeError(`Failed to delete post: ${error.message}`);
		}

		throw new Error(
			"An unexpected error occurred while deleting the post. Please try again later.",
		);
	}
};
