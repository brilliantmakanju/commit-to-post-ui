"use server";

import { z } from "zod";

import { apiClient } from "@/lib/utils/api-client";

const reschedulePostSchema = z.object({
	id: z.string().uuid({
		message: "Invalid post ID. Must be a valid UUID.",
	}),
	scheduled_publish_time: z.string().datetime({
		message: "Invalid date. Must be a valid ISO 8601 date string.",
	}),
});

export const reschedulePost = async (
	postId: string,
	scheduledAt: string,
): Promise<{
	success: boolean;
	data: any;
}> => {
	try {
		const validatedData = reschedulePostSchema.parse({
			id: postId,
			scheduled_publish_time: scheduledAt,
		});

		const url = `/api/v1/posts/?id=${validatedData.id}`;

		const response = await apiClient.put(url, {
			scheduled_publish_time: validatedData.scheduled_publish_time,
		});

		if (response.status !== 200) {
			throw new Error(
				`Failed to reschedule post. Server responded with status ${response.status}`,
			);
		}

		return {
			success: true,
			data: response.data,
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
			throw new TypeError(`Failed to reschedule post: ${error.message}`);
		}

		throw new Error(
			"An unexpected error occurred while rescheduling the post. Please try again later.",
		);
	}
};
