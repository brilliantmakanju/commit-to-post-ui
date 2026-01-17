/* eslint-disable import/no-unresolved */
"use server";

import { z } from "zod";

import { apiClient } from "@/lib/utils/api-client";
import {
	PostGenerationInput,
	PostGenerationResponse,
	postGenerationSchema,
} from "@/types/playground";

/**
 * Server action to generate social media posts from commit messages
 */
export const generatePost = async ({
	commits,
	tone = "casual",
	platform = "linkedin",
}: PostGenerationInput): Promise<PostGenerationResponse> => {
	try {
		// Validate input data
		const validatedData = postGenerationSchema.parse({
			commits,
			tone,
			platform,
		});

		// Make the API call to generate posts
		const response = await apiClient.post(
			"/api/v1/playground/post-gen/", // Adjust endpoint as needed
			{
				commits: validatedData.commits,
				tone: validatedData.tone,
				platform: validatedData.platform,
			},
			{},
			30000,
			0,
		);

		// Handle different response status codes
		if (response.error) {
			const errorCode = response.error.error || "unknown_error";

			// Handle specific error cases
			if (
				[
					"monthly_limit_exceeded",
					"daily_limit_exceeded",
					"insufficient_credits",
					"rate_limit_exceeded",
				].includes(errorCode)
			) {
				return {
					success: false,
					error: errorCode,
					message: response.error.message || "Generation limit exceeded.",
				};
			}

			return {
				success: false,
				error: errorCode,
				message:
					response.error.message || "Failed to generate social media post.",
			};
		}

		// Return successful response
		return {
			success: true,
			data: {
				posts: response.data.post,
				user_limits: response.data.user_limits,
				generation_type: response.data.generation_type,
			},
		};
	} catch (error: any) {
		// Handle validation errors
		if (error instanceof z.ZodError) {
			const errorMessages = error.errors.map(error_ => ({
				field: error_.path.join("."),
				message: error_.message,
			}));

			return {
				success: false,
				error: "validation_error",
				message: errorMessages[0]?.message || "Validation failed",
			};
		}

		// Handle other errors
		return {
			success: false,
			error: "server_error",
			message:
				error?.message ||
				"An unexpected error occurred while generating the post.",
		};
	}
};
