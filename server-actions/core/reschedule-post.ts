"use server";

import { z } from "zod";

import { apiClient } from "@/lib/utils/api-client";

const reschedulePostSchema = z.object({
	id: z.string().uuid({ message: "Invalid post ID." }),
	repo_id: z.string().uuid({ message: "Invalid repo ID." }),
	scheduled_publish_time: z.string().datetime({
		message: "Invalid date format. Must be ISO 8601.",
	}),
});

export const reschedulePost = async (
	repo_id: string,
	postId: string,
	scheduledAt: string,
): Promise<{
	success: boolean;
	data?: any;
	message?: string;
}> => {
	const validation = reschedulePostSchema.safeParse({
		id: postId,
		repo_id,
		scheduled_publish_time: scheduledAt,
	});

	if (!validation.success) {
		return {
			success: false,
			message: validation.error.errors[0]?.message ?? "Validation failed.",
		};
	}

	try {
		const url = `/api/v1/posts/?id=${postId}&repo_id=${repo_id}`;
		const response = await apiClient.put(url, {
			scheduled_publish_time: scheduledAt,
		});

		if (response.status === 403) {
			return {
				success: false,
				message: response?.error?.message || "You don't have permission.",
			};
		}

		if (response.status !== 200) {
			return {
				success: false,
				message: `Server error (${response.status}). Try again.`,
			};
		}

		return {
			success: true,
			data: response.data,
			message: "Post rescheduled successfully.",
		};
	} catch (error: any) {
		return {
			success: false,
			message: error?.message ?? "Unexpected error while rescheduling post.",
		};
	}
};
