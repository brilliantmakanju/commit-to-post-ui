// eslint-disable-next-line import/no-unresolved
import { FeatureLimit } from "@/zustand/feature-limits-store";

// Feature Limit IDs
export const FEATURE_LIMITS = {
	// Workspace limits
	WORKSPACES: "workspaces",

	// AI Settings
	AI_TONES: "ai_tones",

	// Hashtag Automation
	HASHTAG_AUTOMATION: "hashtag_automation",

	// Image Upload
	IMAGE_UPLOAD: "image_upload",

	// Post Scheduling
	SCHEDULE_POST: "schedule_post",

	// Template
	TEMPLATE: "templates",
} as const;

// Default feature limit configurations
export const DEFAULT_FEATURE_LIMITS: Record<
	string,
	Omit<FeatureLimit, "createdAt" | "updatedAt">
> = {
	[FEATURE_LIMITS.WORKSPACES]: {
		category: "workspaces",
		name: "Workspaces",
		id: FEATURE_LIMITS.WORKSPACES,
		description: "Maximum number of team workspaces you can create.",
		limits: {
			basic: 1,
			pro: 2,
			studio: 2,
		},
		requiresAuth: true,
	},

	[FEATURE_LIMITS.AI_TONES]: {
		category: "ai_tones",
		name: "Multi-Tone Generation",
		id: FEATURE_LIMITS.AI_TONES,
		description: "Maximum number of advanced tone presets you can access.",
		limits: {
			basic: 1,
			pro: 40,
			studio: 40,
		},
		requiresAuth: true,
	},

	[FEATURE_LIMITS.HASHTAG_AUTOMATION]: {
		category: "hashtag_automation",
		name: "Advanced Hashtag Automation",
		id: FEATURE_LIMITS.HASHTAG_AUTOMATION,
		description: "Access to smart hashtag generation and defaults.",
		limits: {
			basic: 1,
			pro: 2,
			studio: 2,
		},
		requiresAuth: true,
	},

	[FEATURE_LIMITS.IMAGE_UPLOAD]: {
		category: "image_upload",
		name: "Image & Visual Upload",
		id: FEATURE_LIMITS.IMAGE_UPLOAD,
		description: "Upload and attach images or visuals to posts.",
		limits: {
			basic: 1,
			pro: 2,
			studio: 2,
		},
		requiresAuth: true,
	},

	[FEATURE_LIMITS.SCHEDULE_POST]: {
		category: "schedule_post",
		name: "Post Scheduling",
		id: FEATURE_LIMITS.SCHEDULE_POST,
		description: "Number of scheduled posts you can set up.",
		limits: {
			basic: 1,
			pro: 2,
			studio: 2,
		},
		requiresAuth: true,
	},

	[FEATURE_LIMITS.TEMPLATE]: {
		category: "ai_templates",
		name: "Post Templates",
		id: FEATURE_LIMITS.TEMPLATE,
		description:
			"Controls how many post templates you can use to shape tone, structure, and style of generated posts.",
		limits: {
			basic: 1,
			pro: 2,
			studio: 2,
		},
		requiresAuth: true,
	},
};
