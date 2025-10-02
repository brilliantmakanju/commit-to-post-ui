// types/post-variations.ts
import { z } from "zod";

// Validation schema for creating post variations
export const createPostVariationsSchema = z.object({
	post_id: z.string().uuid("Invalid post ID format"),
	commit_message: z.string().min(1, "Commit message is required"),
	platform: z.enum(["linkedin", "twitter", "slack", "discord"], {
		errorMap: () => ({ message: "Invalid platform selection" }),
	}),
	tones: z
		.array(z.string())
		.min(1, "At least one tone is required")
		.max(3, "Maximum 3 tones allowed"),
});

export type CreatePostVariationsInput = z.infer<
	typeof createPostVariationsSchema
>;

// Types for the response data
export interface PostVariation {
	id: string;
	content: string;
	platform: string;
	tone: string;
	status: string;
	created_at: string;
	scheduled_publish_time: string | null;
}

export interface CreatePostVariationsResponse {
	message: string;
	original_post_id: string;
	variation_group_id: string | null;
	variations: PostVariation[];
}
