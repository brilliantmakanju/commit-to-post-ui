// eslint-disable-next-line import/no-unresolved
import { FeatureLimit } from "@/zustand/feature-limits-store";

// Feature Limit IDs
export const FEATURE_LIMITS = {
	// Repository limits
	REPOSITORIES: "repositories",

	// Social account limits
	SOCIAL_ACCOUNTS: "social_integrations",

	// Repo → Social connections
	REPO_SOCIALS: "repo_socials",

	// Workspace limits
	WORKSPACES: "workspaces",

	// Post limits
	POSTS: "posts",

	// AI Settings
	AI_TONES: "ai_tones",

	// Hashtag Automation
	HASHTAG_AUTOMATION: "hashtag_automation",

	// Example inactive-only feature
	ADVANCED_ANALYTICS: "analytics",
} as const;

// Default feature limit configurations
export const DEFAULT_FEATURE_LIMITS: Record<
	string,
	Omit<FeatureLimit, "createdAt" | "updatedAt">
> = {
	[FEATURE_LIMITS.REPOSITORIES]: {
		category: "repositories",
		name: "GitHub Repositories",
		id: FEATURE_LIMITS.REPOSITORIES,
		description: "Maximum number of GitHub repositories you can connect.",
		limits: {
			basic: 1,
			pro: 5,
			studio: -1,
		},
		requiresAuth: true,
	},

	[FEATURE_LIMITS.SOCIAL_ACCOUNTS]: {
		category: "social_integrations",
		name: "Social Media Integrations",
		id: FEATURE_LIMITS.SOCIAL_ACCOUNTS,
		description: "Maximum number of social media accounts you can integrate.",
		limits: {
			basic: 1,
			pro: 5,
			studio: -1,
		},
		requiresAuth: true,
	},

	[FEATURE_LIMITS.REPO_SOCIALS]: {
		category: "repo_socials",
		name: "Repository → Social Connections",
		id: FEATURE_LIMITS.REPO_SOCIALS,
		description:
			"Maximum number of repositories you can connect to social accounts for automation.",
		limits: {
			basic: 1,
			pro: 5,
			studio: -1,
		},
		requiresAuth: true,
	},

	[FEATURE_LIMITS.WORKSPACES]: {
		category: "workspaces",
		name: "Workspaces",
		id: FEATURE_LIMITS.WORKSPACES,
		description: "Maximum number of workspaces you can create.",
		limits: {
			basic: 1,
			pro: 3,
			studio: 400,
		},
		requiresAuth: true,
	},

	[FEATURE_LIMITS.POSTS]: {
		category: "posts",
		name: "Posts",
		id: FEATURE_LIMITS.POSTS,
		description: "Maximum number of posts you can create.",
		limits: {
			basic: 5,
			pro: 100,
			studio: -1,
		},
		requiresAuth: true,
	},

	[FEATURE_LIMITS.AI_TONES]: {
		category: "ai_tones",
		name: "AI Tone Presets",
		id: FEATURE_LIMITS.AI_TONES,
		description: "Maximum number of AI tone presets you can access.",
		limits: {
			basic: 1,
			pro: 4,
			studio: -1,
		},
		requiresAuth: true,
	},

	[FEATURE_LIMITS.HASHTAG_AUTOMATION]: {
		category: "hashtag_automation",
		name: "Hashtag Automation",
		id: FEATURE_LIMITS.HASHTAG_AUTOMATION,
		description: "Access to automatic hashtag generation and defaults.",
		limits: {
			basic: 1,
			pro: 2,
			studio: 2,
		},
		requiresAuth: true,
	},

	[FEATURE_LIMITS.ADVANCED_ANALYTICS]: {
		category: "analytics",
		name: "Advanced Analytics",
		id: FEATURE_LIMITS.ADVANCED_ANALYTICS,
		description: "Unlock advanced analytics and insights.",
		limits: {
			basic: 1, // Disabled
			pro: 2, // Enabled
			studio: 2, // Enabled
		},
		requiresAuth: true,
	},
};
