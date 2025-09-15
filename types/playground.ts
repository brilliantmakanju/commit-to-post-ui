import { z } from "zod";
// Validation schema for post generation
export const postGenerationSchema = z.object({
	commits: z
		.string()
		.min(1, "Commit message is required")
		.max(5000, "Commit message too long. Please keep under 5000 characters."),
	tone: z
		.enum(["professional", "casual", "technical", "friendly"])
		.default("professional"),
	platform: z.enum(["linkedin", "twitter", "discord"]).default("linkedin"),
});

export type PostGenerationInput = z.infer<typeof postGenerationSchema>;

export interface PostGenerationResponse {
	success: boolean;
	message?: string;
	data?: {
		posts: string;
		user_limits?: {
			plan_type?: string;
			daily_remaining?: number;
			remaining_credits?: number;
			monthly_remaining?: number;
		};
		generation_type?: string;
	};
	error?: string;
}

export interface GenerationLimitsResponse {
	success: boolean;
	message?: string;
	data: GenerationLimitsData;
	error?: string;
}

// types/playground.ts

export interface UserLimits {
	plan_type?: string;
	plan?: string; // Keep both for compatibility
	monthly_usage?: number;
	monthly_limit?: number;
	monthly_remaining?: number;
	daily_usage?: number;
	daily_limit?: number;
	daily_remaining?: number;
	total_credits?: number;
	remaining_credits?: number;
	purchased_credits?: number; // Keep for backward compatibility
	quality_settings?: QualitySettings;
	is_authenticated?: boolean;
}

export interface GenerationCosts {
	post_generation: number;
	image_generation: number;
	meme_generation: number;
}

export interface QualitySettings {
	max_image_resolution?: string;
	max_video_length?: number;
	priority_queue?: boolean;
	advanced_features?: boolean;
	[key: string]: any;
}

export interface FeaturesByPlan {
	anonymous: QualitySettings;
	basic: QualitySettings;
	pro: QualitySettings;
	studio: QualitySettings;
	ltd: QualitySettings;
}

export interface GenerationLimitsData {
	limits: UserLimits;
	costs: GenerationCosts;
	features_by_plan: FeaturesByPlan;
}

// Additional utility types
export type PlanType = "anonymous" | "basic" | "pro" | "studio" | "ltd";

export interface LimitStatus {
	canGenerate: boolean;
	remaining: number;
	cost: number;
	limitType: "daily" | "monthly" | "credits";
}

// Enums for better type safety
export enum GenerationType {
	POST = "post",
	IMAGE = "image",
	MEME = "meme",
}

export enum UserPlan {
	ANONYMOUS = "anonymous",
	BASIC = "basic",
	PRO = "pro",
	STUDIO = "studio",
	LTD = "ltd",
}
