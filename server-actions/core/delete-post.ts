"use server";

import { z } from "zod";

import { apiClient } from "@/lib/utils/api-client";

const deletePostSchema = z.object({
	repo_id: z.string().uuid({ message: "Invalid repo ID." }),
	id: z.string().uuid({ message: "Invalid post ID." }),
});

export const deletePost = async (
	repo_id: string,
	postId: string,
): Promise<{
	success: boolean;
	message?: string;
}> => {
	const validation = deletePostSchema.safeParse({ repo_id, id: postId });

	if (!validation.success) {
		return {
			success: false,
			message: validation.error.errors[0]?.message ?? "Validation failed.",
		};
	}

	try {
		const url = `/api/v1/posts/?repo_id=${repo_id}&id=${postId}`;
		const response = await apiClient.delete(url);

		if (response.status !== 200) {
			return {
				success: false,
				message: `Failed to delete post. Server responded with ${response.status}`,
			};
		}

		return {
			success: true,
			message: "Post deleted successfully.",
		};
	} catch (error: any) {
		return {
			success: false,
			message: error?.message ?? "Unexpected error while deleting post.",
		};
	}
};
