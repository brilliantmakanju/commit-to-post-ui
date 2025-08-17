// eslint-disable-next-line import/no-unresolved
import useFeatureFlagsStore from "@/zustand/feature-flags-store";

// Utility function to check if a feature is enabled for a specific user
export const checkFeatureAccess = (
	flagId: string,
	userPlan?: string,
	isAuthenticated?: boolean,
): boolean => {
	const { isFeatureEnabled } = useFeatureFlagsStore.getState();
	return isFeatureEnabled(flagId, userPlan, isAuthenticated);
};

// Utility function to get user context for feature flag checks
export const getUserContext = (session?: any, userStore?: any) => {
	return {
		userEmail: session?.user.email,
		userPlan: session?.user?.plan,
		isAuthenticated: !!session?.user,
	};
};

// Utility function to check if user has access to stats features
export const hasStatsAccess = (
	userPlan?: string,
	isAuthenticated?: boolean,
): boolean => {
	if (!isAuthenticated) return false;

	// Basic stats are available for all plans
	return true;
};

// Utility function to check if user has access to advanced stats
export const hasAdvancedStatsAccess = (
	userPlan?: string,
	isAuthenticated?: boolean,
): boolean => {
	if (!isAuthenticated) return false;

	const planHierarchy = { free: 0, pro: 1, studio: 2 };
	const userPlanLevel =
		planHierarchy[userPlan as keyof typeof planHierarchy] ?? -1;

	// Advanced stats require pro or higher
	return userPlanLevel >= 1;
};

// Utility function to check if user has access to real-time stats
export const hasRealTimeStatsAccess = (
	userPlan?: string,
	isAuthenticated?: boolean,
): boolean => {
	if (!isAuthenticated) return false;

	const planHierarchy = { free: 0, pro: 1, studio: 2 };
	const userPlanLevel =
		planHierarchy[userPlan as keyof typeof planHierarchy] ?? -1;

	// Real-time stats require studio plan
	return userPlanLevel >= 2;
};

// Utility function to get available features for a user
export const getAvailableFeatures = (
	userPlan?: string,
	isAuthenticated?: boolean,
) => {
	const { flags } = useFeatureFlagsStore.getState();
	const availableFeatures: string[] = [];

	Object.entries(flags).forEach(([flagId, flag]) => {
		if (checkFeatureAccess(flagId, userPlan, isAuthenticated)) {
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
): boolean => {
	const { flags } = useFeatureFlagsStore.getState();
	const flag = flags[flagId];

	if (!flag || !flag.requiresPlan) return false;

	const planHierarchy = { free: 0, pro: 1, studio: 2 };
	const userPlanLevel =
		planHierarchy[userPlan as keyof typeof planHierarchy] ?? -1;
	const requiredPlanLevel = planHierarchy[flag.requiresPlan];

	return userPlanLevel < requiredPlanLevel;
};
