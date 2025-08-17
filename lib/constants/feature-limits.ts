// eslint-disable-next-line import/no-unresolved
import { FeatureLimit } from "@/zustand/feature-limits-store";

// Feature Limit IDs
export const FEATURE_LIMITS = {
	// Repository limits
	REPOSITORIES: "repositories",

	// Social account limits
	SOCIAL_ACCOUNTS: "social_accounts",
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
		description: "Maximum number of GitHub repositories you can connect",
		limits: {
			free: 1, // Free: 1 repository
			pro: 5, // Pro: 5 repositories
			studio: 300, // Studio: 300 repositories (unlimited)
		},
		requiresAuth: true,
	},

	[FEATURE_LIMITS.SOCIAL_ACCOUNTS]: {
		name: "Social Media Accounts",
		category: "social_integrations",
		id: FEATURE_LIMITS.SOCIAL_ACCOUNTS,
		description: "Maximum number of social media accounts you can connect",
		limits: {
			free: 1, // Free: 1 social account (LinkedIn only)
			pro: 5, // Pro: 5 social accounts
			studio: 20, // Studio: 10 social accounts
		},
		requiresAuth: true,
	},
};
