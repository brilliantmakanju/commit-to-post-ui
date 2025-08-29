// eslint-disable-next-line import/no-unresolved
import { FeatureLimit } from "@/zustand/feature-limits-store";

// Feature Limit IDs
export const FEATURE_LIMITS = {
	// Repository limits
	REPOSITORIES: "repositories",

	// Social account limits
	SOCIAL_ACCOUNTS: "social_accounts",

	// Workspace limits
	WORKSPACES: "workspaces",
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
			basic: 1, // Basic: 1 repository
			pro: 5, // Pro: 5 repositories
			studio: 300, // Studio: 300 repositories
		},
		requiresAuth: true,
	},

	[FEATURE_LIMITS.SOCIAL_ACCOUNTS]: {
		name: "Social Media Integrations",
		category: "social_integrations",
		id: FEATURE_LIMITS.SOCIAL_ACCOUNTS,
		description: "Maximum number of social media accounts you can integrate.",
		limits: {
			basic: 1, // Basic: 1 social account (LinkedIn only)
			pro: 5, // Pro: 5 social accounts
			studio: 25, // Studio: 20 social accounts
		},
		requiresAuth: true,
	},

	[FEATURE_LIMITS.WORKSPACES]: {
		name: "Workspaces",
		category: "workspaces",
		id: FEATURE_LIMITS.WORKSPACES,
		description: "Maximum number of workspaces you can create.",
		limits: {
			basic: 1, // Basic: 1 workspace
			pro: 3, // Pro: 3 workspaces
			studio: 10, // Studio: 10 workspaces
		},
		requiresAuth: true,
	},
};
