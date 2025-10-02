"use server";

import { UUID } from "node:crypto";

import { z } from "zod";

import { apiClient } from "../../lib/utils/api-client";

// ==================== SCHEMAS ====================

const fetchPostDetailSchema = z.object({
	post_id: z.string().uuid(),
});

const updatePostSchema = z.object({
	post_id: z.string().uuid(),
	data: z.record(z.any()),
});

const bulkOperationSchema = z.object({
	action: z.enum([
		"bulk_delete",
		"bulk_publish",
		"bulk_schedule",
		"bulk_draft",
	]),
	post_ids: z.array(z.string().uuid()),
	scheduled_publish_time: z.string().optional(),
});

const fetchPostsSchema = z.object({
	repo_id: z.string(),
	page_size: z.number().int().positive({
		message: "Page size must be a positive integer.",
	}),
});

const publishPostImmediateSchema = z.object({
	post_id: z.string().uuid(),
	integration_ids: z.array(z.string().uuid()).min(1, {
		message: "At least one integration must be selected",
	}),
	check_credits: z.boolean().optional().default(true),
});

// ==================== HELPER FUNCTIONS ====================

/**
 * Extract user-friendly error message from API response
 */
const getUserFriendlyError = (error: any, defaultMessage: string): string => {
	// Check for axios response errors
	if (error && typeof error === "object" && "response" in error) {
		const status = error.response?.status;
		const data = error.response?.data;

		// Plan restriction errors (403)
		if (status === 403 && data?.plan_restriction) {
			return (
				data.message ||
				"Your current plan doesn't support this feature. Please upgrade to continue."
			);
		}

		// Insufficient credits (402)
		if (status === 402) {
			const creditsNeeded = data?.credits_needed || "more";
			const creditsAvailable = data?.credits_available || 0;
			return `You need ${creditsNeeded} credit(s), but only have ${creditsAvailable} available. Please purchase more credits.`;
		}

		// Validation errors (400)
		if (status === 400 && data?.message) {
			return data.message;
		}

		// Generic server errors (500)
		if (status >= 500) {
			return "Something went wrong on our end. Please try again in a moment.";
		}

		// Use API message if available
		if (data?.message) {
			return data.message;
		}
	}

	// Validation errors
	if (error instanceof z.ZodError) {
		const firstError = error.errors[0];
		return firstError?.message || "Please check your input and try again.";
	}

	// Generic error
	if (error instanceof Error) {
		return error.message;
	}

	return defaultMessage;
};

// ==================== API FUNCTIONS ====================

export const fetchPosts = async ({
	repo_id,
	page_size,
}: {
	repo_id: UUID;
	page_size: number;
}) => {
	try {
		const validatedData = fetchPostsSchema.parse({
			repo_id: repo_id,
			page_size: page_size,
		});

		const response = await apiClient.get(
			validatedData.page_size === 1
				? `/api/v1/posts/?repo_id=${validatedData.repo_id}`
				: `/api/v1/posts/?page=${validatedData.page_size}&repo_id=${validatedData.repo_id}`,
		);

		if (response.status !== 200) {
			return {
				success: false,
				message: "Unable to load posts. Please try again.",
			};
		}

		return {
			success: true,
			data: response.data,
		};
	} catch (error) {
		return {
			success: false,
			message: getUserFriendlyError(
				error,
				"Unable to load posts. Please try again.",
			),
		};
	}
};

export const fetchPostDetail = async ({ post_id }: { post_id: UUID }) => {
	try {
		const validatedData = fetchPostDetailSchema.parse({ post_id });

		const response = await apiClient.get(
			`/api/v1/posts/${validatedData.post_id}/`,
		);

		if (response.status !== 200) {
			return {
				success: false,
				message: "Unable to load post details. Please try again.",
			};
		}

		return {
			success: true,
			data: response.data,
		};
	} catch (error) {
		return {
			success: false,
			message: getUserFriendlyError(
				error,
				"Unable to load post details. Please try again.",
			),
		};
	}
};

export const updatePost = async ({
	post_id,
	data,
}: {
	post_id: UUID;
	data: Record<string, any>;
}) => {
	try {
		const validatedData = updatePostSchema.parse({ post_id, data });
		const response = await apiClient.put(
			`/api/v1/posts/${validatedData.post_id}/`,
			validatedData.data,
		);

		if (response.status !== 200) {
			return {
				success: false,
				message:
					response.error?.message || "Unable to update post. Please try again.",
				data: {},
			};
		}

		return {
			success: true,
			data: response.data,
			message: "Post updated successfully!",
		};
	} catch (error) {
		return {
			success: false,
			message: getUserFriendlyError(
				error,
				"Unable to update post. Please try again.",
			),
			data: {},
		};
	}
};

export const deletePost = async ({ post_id }: { post_id: UUID }) => {
	try {
		const validatedData = fetchPostDetailSchema.parse({ post_id });

		const response = await apiClient.delete(
			`/api/v1/posts/${validatedData.post_id}/`,
		);

		if (response.status !== 200) {
			return {
				success: false,
				message: "Unable to delete post. Please try again.",
			};
		}

		return {
			success: true,
			message: "Post deleted successfully!",
		};
	} catch (error) {
		return {
			success: false,
			message: getUserFriendlyError(
				error,
				"Unable to delete post. Please try again.",
			),
		};
	}
};

export const bulkPostOperations = async ({
	action,
	post_ids,
	scheduled_publish_time,
}: {
	action: "bulk_delete" | "bulk_publish" | "bulk_schedule" | "bulk_draft";
	post_ids: UUID[];
	scheduled_publish_time?: string;
}) => {
	try {
		const validatedData = bulkOperationSchema.parse({
			action,
			post_ids,
			scheduled_publish_time,
		});

		const response = await apiClient.post(
			"/api/v1/posts/bulk-operations/",
			validatedData,
		);

		if (response.status !== 200) {
			return {
				success: false,
				message: "Unable to complete this action. Please try again.",
			};
		}

		const actionMessages = {
			bulk_delete: "Posts deleted successfully!",
			bulk_publish: "Posts published successfully!",
			bulk_schedule: "Posts scheduled successfully!",
			bulk_draft: "Posts moved to drafts!",
		};

		return {
			success: true,
			data: response.data,
			message: response.data.message || actionMessages[action],
		};
	} catch (error) {
		const actionMessages = {
			bulk_delete: "Unable to delete posts. Please try again.",
			bulk_publish: "Unable to publish posts. Please try again.",
			bulk_schedule: "Unable to schedule posts. Please try again.",
			bulk_draft: "Unable to draft posts. Please try again.",
		};

		return {
			success: false,
			message: getUserFriendlyError(error, actionMessages[action]),
		};
	}
};

export const schedulePost = async ({
	post_id,
	scheduled_publish_time,
	integrationIds,
}: {
	post_id: UUID;
	scheduled_publish_time: string;
	integrationIds: string[];
}) => {
	try {
		const result = await updatePost({
			post_id,
			data: {
				status: "scheduled",
				scheduled_publish_time,
				integration_ids: integrationIds,
			},
		});

		// Check for plan restriction in the response
		if (!result.success && result.message?.includes("Basic plan")) {
			return {
				success: false,
				message:
					"Scheduling posts is only available on Pro and Studio plans. Please upgrade or publish immediately instead.",
				plan_restriction: true,
				data: {},
			};
		}

		if (result.success) {
			return {
				...result,
				message: "Post scheduled successfully!",
			};
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: getUserFriendlyError(
				error,
				"Unable to schedule post. Please try again.",
			),
			data: {},
		};
	}
};

export const draftPost = async ({ post_id }: { post_id: UUID }) => {
	try {
		const result = await updatePost({
			post_id,
			data: {
				status: "drafted",
				scheduled_publish_time: undefined,
			},
		});

		if (result.success) {
			return {
				...result,
				message: "Post moved to drafts!",
			};
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: getUserFriendlyError(
				error,
				"Unable to draft post. Please try again.",
			),
		};
	}
};

export const bulkDeletePosts = async ({ post_ids }: { post_ids: UUID[] }) => {
	return bulkPostOperations({
		action: "bulk_delete",
		post_ids,
	});
};

export const bulkPublishPosts = async ({ post_ids }: { post_ids: UUID[] }) => {
	return bulkPostOperations({
		action: "bulk_publish",
		post_ids,
	});
};

export const bulkSchedulePosts = async ({
	post_ids,
	scheduled_publish_time,
}: {
	post_ids: UUID[];
	scheduled_publish_time: string;
}) => {
	return bulkPostOperations({
		action: "bulk_schedule",
		post_ids,
		scheduled_publish_time,
	});
};

export const bulkDraftPosts = async ({ post_ids }: { post_ids: UUID[] }) => {
	return bulkPostOperations({
		action: "bulk_draft",
		post_ids,
	});
};

/**
 * Publish a post immediately to selected integrations
 * Handles credit checks and actual publishing
 */
export const publishPostImmediate = async ({
	post_id,
	integration_ids,
	check_credits = true,
}: {
	post_id: UUID;
	integration_ids: string[];
	check_credits?: boolean;
}) => {
	try {
		const validatedData = publishPostImmediateSchema.parse({
			post_id,
			integration_ids,
			check_credits,
		});

		const response = await apiClient.post(
			`/api/v1/posts/${validatedData.post_id}/publish/`,
			{
				integration_ids: validatedData.integration_ids,
				check_credits: validatedData.check_credits,
			},
		);

		// Success (full or partial)
		if (response.status === 200 || response.status === 207) {
			const isPartialSuccess = response.status === 207;

			return {
				success: true,
				data: response.data,
				message: isPartialSuccess
					? "Post published to some accounts. Check details below."
					: "Post published successfully!",
				warning: response.data.warning,
				results: response.data.results,
				credits_used: response.data.credits_used,
				partial_success: isPartialSuccess,
			};
		}

		return {
			success: false,
			message: "Unable to publish post. Please try again.",
		};
	} catch (error) {
		// Handle specific error cases with user-friendly messages
		if (error && typeof error === "object" && "response" in error) {
			const axiosError = error as any;
			const status = axiosError.response?.status;
			const data = axiosError.response?.data;

			// Plan restriction (403)
			if (status === 403 && data?.plan_restriction) {
				return {
					success: false,
					message:
						data.message ||
						"Your plan doesn't support this feature. Please upgrade to continue.",
					plan_restriction: true,
				};
			}

			// Insufficient credits (402)
			if (status === 402) {
				const creditsNeeded = data?.credits_needed || "more";
				const creditsAvailable = data?.credits_available || 0;
				return {
					success: false,
					message: `You need ${creditsNeeded} credit(s) but only have ${creditsAvailable}. Please purchase more credits to continue.`,
					insufficient_credits: true,
					credits_needed: data?.credits_needed,
					credits_available: data?.credits_available,
				};
			}

			// Validation errors (400)
			if (status === 400) {
				return {
					success: false,
					message: data?.message || "Please check your post and try again.",
				};
			}

			// Server errors (500+)
			if (status >= 500) {
				return {
					success: false,
					message:
						"Something went wrong on our end. Please try again in a moment.",
				};
			}

			// Generic API error
			if (data?.message) {
				return {
					success: false,
					message: data.message,
				};
			}
		}

		// Validation error
		if (error instanceof z.ZodError) {
			const firstError = error.errors[0];
			return {
				success: false,
				message:
					firstError?.message ||
					"Please select at least one account to publish to.",
			};
		}

		// Generic error
		return {
			success: false,
			message: getUserFriendlyError(
				error,
				"Unable to publish post. Please try again.",
			),
		};
	}
};

/**
 * Legacy function - updates post status without actual publishing
 * @deprecated Use publishPostImmediate for actual publishing
 */
export const publishPost = async ({ post_id }: { post_id: UUID }) => {
	return updatePost({
		post_id,
		data: { status: "published" },
	});
};
