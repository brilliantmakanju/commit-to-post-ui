"use server";

import { z } from "zod";

import { apiClient } from "@/lib/utils/api-client";

// Schema with repo_id added
const updatePostSchema = z.object({
	id: z.string().uuid({ message: "Invalid post ID." }),
	repo_id: z.string().uuid({ message: "Invalid repo ID." }),
	content: z
		.string()
		.min(1, { message: "Post content cannot be empty." })
		.max(1500, { message: "Post content must not exceed 1500 characters." }),
});

export const updatePost = async (
	repo_id: string,
	postId: string,
	content: string,
): Promise<{
	success: boolean;
	message?: string;
	data?: any;
}> => {
	// Validate input
	const validation = updatePostSchema.safeParse({
		id: postId,
		repo_id,
		content,
	});

	if (!validation.success) {
		return {
			success: false,
			message: validation.error.errors[0]?.message ?? "Invalid input.",
		};
	}

	try {
		const url = `/api/v1/posts/?id=${postId}&repo_id=${repo_id}`;

		const response = await apiClient.put(url, {
			content: content,
		});

		if (response.status !== 200) {
			return {
				success: false,
				message: `Failed to update post. Server responded with ${response.status}`,
			};
		}

		return {
			success: true,
			data: response.data,
			message: "Post updated successfully.",
		};
	} catch (error: any) {
		return {
			success: false,
			message: error?.message ?? "Unexpected error while updating post.",
		};
	}
};
