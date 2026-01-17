"use server";
import { z } from "zod";

// eslint-disable-next-line import/no-unresolved
import { apiClient } from "@/lib/utils/api-client";

// Import types from a separate file
import type { CreatePostVariationsInput } from "./types/post-variations";

// Server action to create post variations
export const createPostVariations = async ({
	post_id,
	commit_message,
	platform,
	tones,
	templates,
}: CreatePostVariationsInput) => {
	try {
		// Define validation schema inline since we can't export it
		const createPostVariationsSchema = z.object({
			post_id: z.string().uuid("Invalid post ID format"),
			commit_message: z.string().min(1, "Commit message is required"),
			platform: z.enum(["linkedin", "twitter", "slack", "discord"], {
				errorMap: () => ({ message: "Invalid platform selection" }),
			}),
			tones: z
				.array(z.string())
				.min(1, "At least one tone is required")
				.max(3, "Maximum 3 tones allowed"),
			templates: z.array(z.string()),
		});

		// Validate input data
		const validatedData = createPostVariationsSchema.parse({
			tones,
			post_id,
			platform,
			commit_message,
			templates,
		});

		// Make API call to create variations
		const response = await apiClient.post(
			"/api/v1/posts/variations/",
			{
				tone: validatedData.tones[0],
				post_id: validatedData.post_id,
				platform: validatedData.platform,
				templates: validatedData.templates,
				commit_message: validatedData.commit_message,
			},
			{},
			4000000,
		);

		if (response.status !== 201) {
			throw new Error("Failed to create post variations.");
		}

		return {
			success: true,
			data: response.data,
			message: response.data.message || "Post variations created successfully.",
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
			throw new TypeError(`Failed to create post variations: ${error.message}`);
		}

		throw new Error(
			"An unexpected error occurred while creating post variations. Please try again later.",
		);
	}
};
