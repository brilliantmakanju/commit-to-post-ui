/* eslint-disable import/no-unresolved */
import { useSession } from "next-auth/react";
import { useEffect, useMemo } from "react";

import { initializeFeatureLimits } from "@/lib/utils/feature-limits-init";
import useFeatureLimitsStore, {
	FeatureCategory,
} from "@/zustand/feature-limits-store";

export const useFeatureLimit = (limitId: string, currentCount: number = 0) => {
	const { data: session } = useSession();
	const { getLimitForPlan, canAddMore, getRemainingCount, limits, isLoading } =
		useFeatureLimitsStore();

	// Initialize feature limits on first use
	useEffect(() => {
		if (Object.keys(limits).length === 0) {
			initializeFeatureLimits();
		}
	}, [limits]);

	const isAuthenticated = !!session?.user;
	const userPlan = session?.user?.plan.toLocaleLowerCase();

	const limit = useMemo(() => {
		return getLimitForPlan(limitId, userPlan);
	}, [getLimitForPlan, limitId, userPlan]);

	const canAdd = useMemo(() => {
		return canAddMore(limitId, currentCount, userPlan);
	}, [canAddMore, limitId, currentCount, userPlan]);

	const remaining = useMemo(() => {
		return getRemainingCount(limitId, currentCount, userPlan);
	}, [getRemainingCount, limitId, currentCount, userPlan]);

	const limitConfig = limits[limitId];

	return {
		limit,
		canAdd,
		remaining,
		userPlan,
		isLoading,
		limitConfig,
		currentCount,
		isAuthenticated,
	};
};

export const useFeatureLimits = (category?: FeatureCategory) => {
	const { data: session } = useSession();
	const { getLimitsByCategory, limits, isLoading } = useFeatureLimitsStore();

	// Initialize feature limits on first use
	useEffect(() => {
		if (Object.keys(limits).length === 0) {
			initializeFeatureLimits();
		}
	}, [limits]);

	const isAuthenticated = !!session?.user;
	const userPlan = session?.user?.plan;

	const filteredLimits = useMemo(() => {
		if (category) {
			return getLimitsByCategory(category);
		}
		return Object.values(limits);
	}, [category, getLimitsByCategory, limits]);

	return {
		limits: filteredLimits,
		isAuthenticated,
		isLoading,
		userPlan,
	};
};
