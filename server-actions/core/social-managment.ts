"use server";
import { z } from "zod";

// eslint-disable-next-line import/no-unresolved
import { apiClient } from "@/lib/utils/api-client";

// Schema for adding integrations to a post
const addPostIntegrationsSchema = z.object({
	post_id: z.string().uuid({ message: "Invalid post ID." }),
	integration_ids: z
		.array(z.string().uuid({ message: "Invalid integration ID." }))
		.min(1, { message: "Please select at least one social account." })
		.max(10, { message: "You can only add up to 10 social accounts at once." }),
});

// Schema for removing integrations from a post
const removePostIntegrationsSchema = z.object({
	post_id: z.string().uuid({ message: "Invalid post ID." }),
	integration_ids: z
		.array(z.string().uuid({ message: "Invalid integration ID." }))
		.min(1, {
			message: "Please select at least one social account to remove.",
		}),
});

/**
 * Add social accounts to a post's planned integrations
 */
export const addPostIntegrations = async (
	postId: string,
	integrationIds: string[],
): Promise<{
	success: boolean;
	message?: string;
	data?: any;
}> => {
	const validation = addPostIntegrationsSchema.safeParse({
		post_id: postId,
		integration_ids: integrationIds,
	});

	if (!validation.success) {
		return {
			success: false,
			message:
				validation.error.errors[0]?.message ?? "Please check your selection.",
		};
	}

	try {
		const url = `/api/v1/posts/${postId}/integrations/`;
		const response = await apiClient.post(url, {
			integration_ids: integrationIds,
		});

		if (response.status !== 200) {
			return {
				success: false,
				message: "Unable to add social accounts. Please try again.",
			};
		}

		const responseData = response.data;

		if (!responseData.success && responseData.data?.errors?.length > 0) {
			return {
				success: false,
				message:
					"Some social accounts couldn't be added. Please check your selection and try again.",
				data: responseData.data,
			};
		}

		const addedCount = responseData.data?.added_integrations?.length || 0;
		const message =
			addedCount === 1
				? "Social account added successfully!"
				: `${addedCount} social accounts added successfully!`;

		return {
			success: true,
			data: responseData.data,
			message,
		};
	} catch {
		return {
			success: false,
			message: "Unable to add social accounts. Please try again.",
		};
	}
};

/**
 * Remove social accounts from a post's planned integrations
 */
export const removePostIntegrations = async (
	postId: string,
	integrationIds: string[],
): Promise<{
	success: boolean;
	message?: string;
	data?: any;
}> => {
	const validation = removePostIntegrationsSchema.safeParse({
		post_id: postId,
		integration_ids: integrationIds,
	});

	if (!validation.success) {
		return {
			success: false,
			message:
				validation.error.errors[0]?.message ?? "Please check your selection.",
		};
	}

	try {
		const url = `/api/v1/posts/${postId}/integrations/`;
		const response = await apiClient.put(url, {
			integration_ids: integrationIds,
		});

		if (response.status !== 200) {
			return {
				success: false,
				message: "Unable to remove social accounts. Please try again.",
			};
		}

		const responseData = response.data;

		if (!responseData.success && responseData.data?.errors?.length > 0) {
			return {
				success: false,
				message: "Some social accounts couldn't be removed. Please try again.",
				data: responseData.data,
			};
		}

		const removedCount = responseData.data?.removed_integrations?.length || 0;
		const message =
			removedCount === 1
				? "Social account removed successfully!"
				: `${removedCount} social accounts removed successfully!`;

		return {
			success: true,
			data: responseData.data,
			message,
		};
	} catch {
		return {
			success: false,
			message: "Unable to remove social accounts. Please try again.",
		};
	}
};
// // Schema for getting post integrations
// const getPostIntegrationsSchema = z.object({
// 	post_id: z.string().uuid({ message: "Invalid post ID." }),
// });

// // Schema for bulk updating integrations
// const bulkUpdatePostIntegrationsSchema = z.object({
// 	post_id: z.string().uuid({ message: "Invalid post ID." }),
// 	integration_ids: z
// 		.array(z.string().uuid({ message: "Invalid integration ID." }))
// 		.max(10, { message: "Cannot set more than 10 integrations at once." }),
// });

// /**
//  * Get all planned integrations for a post with detailed status
//  */
// export const getPostIntegrations = async (
// 	postId: string,
// ): Promise<{
// 	success: boolean;
// 	message?: string;
// 	data?: any;
// }> => {
// 	// Validate input
// 	const validation = getPostIntegrationsSchema.safeParse({
// 		post_id: postId,
// 	});

// 	if (!validation.success) {
// 		return {
// 			success: false,
// 			message: validation.error.errors[0]?.message ?? "Invalid post ID.",
// 		};
// 	}

// 	try {
// 		const url = `/api/v1/posts/${postId}/integrations/`;
// 		const response = await apiClient.get(url);

// 		if (response.status !== 200) {
// 			return {
// 				success: false,
// 				message: `Failed to get integrations. Server responded with ${response.status}`,
// 			};
// 		}

// 		return {
// 			success: true,
// 			data: response.data.data,
// 			message: "Post integrations retrieved successfully.",
// 		};
// 	} catch (error: any) {
// 		return {
// 			success: false,
// 			message:
// 				error?.response?.data?.error ||
// 				error?.message ||
// 				"Unexpected error while fetching integrations.",
// 		};
// 	}
// };

// /**
//  * Replace all planned integrations for a post (bulk update)
//  */
// export const bulkUpdatePostIntegrations = async (
// 	postId: string,
// 	integrationIds: string[],
// ): Promise<{
// 	success: boolean;
// 	message?: string;
// 	data?: any;
// }> => {
// 	// Validate input
// 	const validation = bulkUpdatePostIntegrationsSchema.safeParse({
// 		post_id: postId,
// 		integration_ids: integrationIds,
// 	});

// 	if (!validation.success) {
// 		return {
// 			success: false,
// 			message: validation.error.errors[0]?.message ?? "Invalid input.",
// 		};
// 	}

// 	try {
// 		const url = `/api/v1/posts/${postId}/integrations/bulk-update/`;
// 		const response = await apiClient.put(url, {
// 			integration_ids: integrationIds,
// 		});

// 		if (response.status !== 200) {
// 			return {
// 				success: false,
// 				message: `Failed to update integrations. Server responded with ${response.status}`,
// 			};
// 		}

// 		const responseData = response.data;

// 		// Check if there were any errors in the response
// 		if (!responseData.success) {
// 			return {
// 				success: false,
// 				message: responseData.error || "Failed to update integrations.",
// 				data: responseData.data,
// 			};
// 		}

// 		return {
// 			success: true,
// 			data: responseData.data,
// 			message: `Successfully updated integrations. Now planning for ${responseData.data?.new_planned_count || 0} integration(s).`,
// 		};
// 	} catch (error: any) {
// 		return {
// 			success: false,
// 			message:
// 				error?.response?.data?.error ||
// 				error?.message ||
// 				"Unexpected error while updating integrations.",
// 		};
// 	}
// };

// /**
//  * Get available integrations for a post's platform
//  */
// export const getAvailablePostIntegrations = async (
// 	postId: string,
// ): Promise<{
// 	success: boolean;
// 	message?: string;
// 	data?: any;
// }> => {
// 	// Validate input
// 	const validation = getPostIntegrationsSchema.safeParse({
// 		post_id: postId,
// 	});

// 	if (!validation.success) {
// 		return {
// 			success: false,
// 			message: validation.error.errors[0]?.message ?? "Invalid post ID.",
// 		};
// 	}

// 	try {
// 		const url = `/api/v1/posts/${postId}/integrations/available/`;
// 		const response = await apiClient.get(url);

// 		if (response.status !== 200) {
// 			return {
// 				success: false,
// 				message: `Failed to get available integrations. Server responded with ${response.status}`,
// 			};
// 		}

// 		return {
// 			success: true,
// 			data: response.data.data,
// 			message: "Available integrations retrieved successfully.",
// 		};
// 	} catch (error: any) {
// 		return {
// 			success: false,
// 			message:
// 				error?.response?.data?.error ||
// 				error?.message ||
// 				"Unexpected error while fetching available integrations.",
// 		};
// 	}
// };

// /**
//  * Toggle a single integration in/out of a post's planned integrations
//  */
// export const togglePostIntegration = async (
// 	postId: string,
// 	integrationId: string,
// ): Promise<{
// 	success: boolean;
// 	message?: string;
// 	data?: any;
// }> => {
// 	// Validate input
// 	const validation = z
// 		.object({
// 			post_id: z.string().uuid({ message: "Invalid post ID." }),
// 			integration_id: z.string().uuid({ message: "Invalid integration ID." }),
// 		})
// 		.safeParse({
// 			post_id: postId,
// 			integration_id: integrationId,
// 		});

// 	if (!validation.success) {
// 		return {
// 			success: false,
// 			message: validation.error.errors[0]?.message ?? "Invalid input.",
// 		};
// 	}

// 	try {
// 		const url = `/api/v1/posts/${postId}/integrations/${integrationId}/toggle/`;
// 		const response = await apiClient.post(url);

// 		if (response.status !== 200) {
// 			return {
// 				success: false,
// 				message: `Failed to toggle integration. Server responded with ${response.status}`,
// 			};
// 		}

// 		const responseData = response.data;

// 		if (!responseData.success) {
// 			return {
// 				success: false,
// 				message: responseData.error || "Failed to toggle integration.",
// 			};
// 		}

// 		const action = responseData.data?.action;
// 		const integrationName =
// 			responseData.data?.integration?.name || "Integration";

// 		return {
// 			success: true,
// 			data: responseData.data,
// 			message: `Successfully ${action} ${integrationName} ${action === "added" ? "to" : "from"} planned integrations.`,
// 		};
// 	} catch (error: any) {
// 		return {
// 			success: false,
// 			message:
// 				error?.response?.data?.error ||
// 				error?.message ||
// 				"Unexpected error while toggling integration.",
// 		};
// 	}
// };
