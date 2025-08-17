/* eslint-disable import/no-unresolved */
import { useSession } from "next-auth/react";
import { useEffect, useMemo } from "react";

import { initializeFeatureFlags } from "@/lib/utils/feature-flags-init";
import useFeatureFlagsStore from "@/zustand/feature-flags-store";

export const useFeatureFlag = (flagId: string) => {
	const { data: session } = useSession();
	const { isFeatureEnabled, flags, isLoading } = useFeatureFlagsStore();

	// Initialize feature flags on first use
	useEffect(() => {
		if (Object.keys(flags).length === 0) {
			initializeFeatureFlags();
		}
	}, [flags]);

	const isAuthenticated = !!session?.user;
	// Use session.user.plan instead of userStore.plan
	const userPlan = session?.user?.plan;

	const flag = flags[flagId];
	const isEnabled = useMemo(() => {
		return isFeatureEnabled(flagId, userPlan, isAuthenticated);
	}, [isFeatureEnabled, flagId, userPlan, isAuthenticated]);

	return {
		isEnabled,
		flag,
		isLoading,
		isAuthenticated,
		userPlan,
	};
};

export const useFeatureFlags = (
	category?: "stats" | "subscription" | "general" | "experimental",
) => {
	const { data: session } = useSession();
	const { getFlagsByCategory, flags, isLoading } = useFeatureFlagsStore();

	// Initialize feature flags on first use
	useEffect(() => {
		if (Object.keys(flags).length === 0) {
			initializeFeatureFlags();
		}
	}, [flags]);

	const isAuthenticated = !!session?.user;
	// Use session.user.plan instead of userStore.plan
	const userPlan = session?.user?.plan;

	const filteredFlags = useMemo(() => {
		if (category) {
			return getFlagsByCategory(category);
		}
		return Object.values(flags);
	}, [category, getFlagsByCategory, flags]);

	return {
		flags: filteredFlags,
		isAuthenticated,
		isLoading,
		userPlan,
	};
};
