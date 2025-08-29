// eslint-disable-next-line import/no-unresolved
import { FeatureFlag } from "@/zustand/feature-flags-store";

// Feature Flag IDs
export const FEATURE_FLAGS = {
	// Stats related flags
	STATS_EXPORT: "stats_export",
	STATS_DASHBOARD: "stats_dashboard",
	STATS_ANALYTICS: "stats_analytics",
	STATS_REAL_TIME: "stats_real_time",
	STATS_HISTORICAL: "stats_historical",

	// Subscription related flags
	SUBSCRIPTION_CANCEL: "subscription_cancel",
	SUBSCRIPTION_UPGRADE: "subscription_upgrade",
	SUBSCRIPTION_DOWNGRADE: "subscription_downgrade",

	// General feature flags
	ENHANCED_UI: "enhanced_ui",
	BETA_FEATURES: "beta_features",

	// Experimental flags
	EXPERIMENTAL_AI: "experimental_ai",
	EXPERIMENTAL_INTEGRATIONS: "experimental_integrations",
} as const;

// Default feature flag configurations
export const DEFAULT_FEATURE_FLAGS: Record<
	string,
	Omit<FeatureFlag, "createdAt" | "updatedAt">
> = {
	[FEATURE_FLAGS.STATS_DASHBOARD]: {
		enabled: true,
		category: "stats",
		requiresAuth: true,
		requiresPlan: "basic", // Basic stats available for basic users
		name: "Stats Dashboard",
		id: FEATURE_FLAGS.STATS_DASHBOARD,
		description: "Enable the main statistics dashboard for users",
	},

	[FEATURE_FLAGS.STATS_ANALYTICS]: {
		enabled: true,
		category: "stats",
		requiresPlan: "studio", // Advanced analytics for pro users
		requiresAuth: true,
		name: "Advanced Analytics",
		id: FEATURE_FLAGS.STATS_ANALYTICS,
		description: "Enable advanced analytics and insights",
	},

	[FEATURE_FLAGS.STATS_EXPORT]: {
		enabled: true,
		category: "stats",
		requiresPlan: "pro", // Export for pro users
		requiresAuth: true,
		name: "Stats Export",
		id: FEATURE_FLAGS.STATS_EXPORT,
		description: "Allow users to export their statistics data",
	},

	[FEATURE_FLAGS.STATS_REAL_TIME]: {
		id: FEATURE_FLAGS.STATS_REAL_TIME,
		name: "Real-time Stats",
		description: "Enable real-time statistics updates",
		enabled: true,
		category: "stats",
		requiresPlan: "studio", // Real-time for studio users
		requiresAuth: true,
	},

	[FEATURE_FLAGS.STATS_HISTORICAL]: {
		id: FEATURE_FLAGS.STATS_HISTORICAL,
		name: "Historical Stats",
		description: "Enable historical statistics and trends",
		enabled: true,
		category: "stats",
		requiresPlan: "basic", // Historical data for all users
		requiresAuth: true,
	},

	[FEATURE_FLAGS.SUBSCRIPTION_UPGRADE]: {
		id: FEATURE_FLAGS.SUBSCRIPTION_UPGRADE,
		name: "Subscription Upgrade",
		description: "Allow users to upgrade their subscription",
		enabled: true,
		category: "subscription",
		requiresAuth: true,
	},

	[FEATURE_FLAGS.SUBSCRIPTION_DOWNGRADE]: {
		id: FEATURE_FLAGS.SUBSCRIPTION_DOWNGRADE,
		name: "Subscription Downgrade",
		description: "Allow users to downgrade their subscription",
		enabled: true,
		category: "subscription",
		requiresAuth: true,
	},

	[FEATURE_FLAGS.SUBSCRIPTION_CANCEL]: {
		id: FEATURE_FLAGS.SUBSCRIPTION_CANCEL,
		name: "Subscription Cancel",
		description: "Allow users to cancel their subscription",
		enabled: true,
		category: "subscription",
		requiresAuth: true,
	},

	[FEATURE_FLAGS.ENHANCED_UI]: {
		id: FEATURE_FLAGS.ENHANCED_UI,
		name: "Enhanced UI",
		description: "Enable enhanced user interface features",
		enabled: true,
		category: "general",
		requiresAuth: false,
	},

	[FEATURE_FLAGS.BETA_FEATURES]: {
		id: FEATURE_FLAGS.BETA_FEATURES,
		name: "Beta Features",
		description: "Enable beta features for testing",
		enabled: false,
		category: "general",
		requiresAuth: true,
	},

	[FEATURE_FLAGS.EXPERIMENTAL_AI]: {
		id: FEATURE_FLAGS.EXPERIMENTAL_AI,
		name: "Experimental AI",
		description: "Enable experimental AI features",
		enabled: false,
		category: "experimental",
		requiresPlan: "studio",
		requiresAuth: true,
	},

	[FEATURE_FLAGS.EXPERIMENTAL_INTEGRATIONS]: {
		id: FEATURE_FLAGS.EXPERIMENTAL_INTEGRATIONS,
		name: "Experimental Integrations",
		description: "Enable experimental third-party integrations",
		enabled: false,
		category: "experimental",
		requiresPlan: "pro",
		requiresAuth: true,
	},
};
