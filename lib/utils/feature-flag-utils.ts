// eslint-disable-next-line import/no-unresolved
import useFeatureFlagsStore from "@/zustand/feature-flags-store";

// Updated plan hierarchy for credit-based system
const PLAN_HIERARCHY = {
	basic: 0,
	pro: 1,
	studio: 2,
	ltd: 3, // Lifetime access
} as const;

// Utility function to check if a feature is enabled for a specific user
export const checkFeatureAccess = (
	flagId: string,
	userPlan?: string,
	isAuthenticated?: boolean,
	userCredits?: number,
): boolean => {
	const { isFeatureEnabled } = useFeatureFlagsStore.getState();

	// For credit-based features, check if user has sufficient credits
	if (userCredits !== undefined && userCredits <= 0) {
		return false;
	}

	return isFeatureEnabled(flagId, userPlan, isAuthenticated);
};

// Utility function to check if user has access to stats features
export const hasStatsAccess = (
	userPlan?: string,
	isAuthenticated?: boolean,
	userCredits?: number,
): boolean => {
	if (!isAuthenticated) return false;

	// Basic stats are available for all authenticated users with credits
	return (userCredits ?? 0) > 0;
};

// Utility function to check if user has access to advanced stats
export const hasAdvancedStatsAccess = (
	userPlan?: string,
	isAuthenticated?: boolean,
	userCredits?: number,
): boolean => {
	if (!isAuthenticated) return false;

	const userPlanLevel =
		PLAN_HIERARCHY[userPlan as keyof typeof PLAN_HIERARCHY] ?? -1;

	// Advanced stats require pro or higher AND sufficient credits
	return userPlanLevel >= 1 && (userCredits ?? 0) > 0;
};

// Utility function to check if user has access to real-time stats
export const hasRealTimeStatsAccess = (
	userPlan?: string,
	isAuthenticated?: boolean,
	userCredits?: number,
): boolean => {
	if (!isAuthenticated) return false;

	const userPlanLevel =
		PLAN_HIERARCHY[userPlan as keyof typeof PLAN_HIERARCHY] ?? -1;

	// Real-time stats require studio plan AND sufficient credits
	return userPlanLevel >= 2 && (userCredits ?? 0) > 0;
};

// NEW: Utility function to check workspace access (studio plan only)
export const hasWorkspaceAccess = (
	userPlan?: string,
	isAuthenticated?: boolean,
	userCredits?: number,
): boolean => {
	if (!isAuthenticated) return false;

	const userPlanLevel =
		PLAN_HIERARCHY[userPlan as keyof typeof PLAN_HIERARCHY] ?? -1;

	// Workspace access requires studio plan AND sufficient credits
	return userPlanLevel >= 2 && (userCredits ?? 0) > 0;
};

// NEW: Utility function to check if user has sufficient credits for an action
export const hasSufficientCredits = (
	requiredCredits: number,
	userCredits?: number,
): boolean => {
	return (userCredits ?? 0) >= requiredCredits;
};

// Utility function to get available features for a user
export const getAvailableFeatures = (
	userPlan?: string,
	isAuthenticated?: boolean,
	userCredits?: number,
) => {
	const { flags } = useFeatureFlagsStore.getState();
	const availableFeatures: string[] = [];

	Object.entries(flags).forEach(([flagId, flag]) => {
		if (checkFeatureAccess(flagId, userPlan, isAuthenticated, userCredits)) {
			availableFeatures.push(flagId);
		}
	});

	return availableFeatures;
};

// Utility function to check if a feature requires upgrade
export const requiresUpgrade = (
	flagId: string,
	userPlan?: string,
	isAuthenticated?: boolean,
	userCredits?: number,
): boolean => {
	const { flags } = useFeatureFlagsStore.getState();
	const flag = flags[flagId];

	if (!flag || !flag.requiresPlan) return false;

	const userPlanLevel =
		PLAN_HIERARCHY[userPlan as keyof typeof PLAN_HIERARCHY] ?? -1;
	const requiredPlanLevel =
		PLAN_HIERARCHY[flag.requiresPlan as keyof typeof PLAN_HIERARCHY] ?? 0;

	// Check both plan level and credits
	const needsPlanUpgrade = userPlanLevel < requiredPlanLevel;
	const needsCredits = (userCredits ?? 0) <= 0;

	return needsPlanUpgrade || needsCredits;
};

// NEW: Utility function to get credit cost for a feature
export const getFeatureCreditCost = (flagId: string): number => {
	// Define credit costs for different features
	const creditCosts: Record<string, number> = {
		stats_dashboard: 1,
		stats_analytics: 1,
		stats_export: 1,
		stats_real_time: 1,
		experimental_ai: 1,
		experimental_integrations: 1,
	};

	return creditCosts[flagId] ?? 1; // Default cost is 1 credit
};
