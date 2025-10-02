import { useSession } from "next-auth/react";
import React from "react";

// eslint-disable-next-line import/no-unresolved
import { useFeatureFlag } from "@/hooks/use-feature-flag";
import {
	checkFeatureAccess,
	getFeatureCreditCost,
} from "@/lib/utils/feature-flag-utils";
import useUserStore from "@/zustand/useuser-store";

interface FeatureFlagWrapperProps {
	flagId: string;
	children: React.ReactNode;
	fallback?: React.ReactNode;
	showWhenDisabled?: boolean;
	// NEW: Credit-based props
	requireCredits?: boolean;
	creditCost?: number;
}

export const FeatureFlagWrapper: React.FC<FeatureFlagWrapperProps> = ({
	flagId,
	children,
	fallback,
	showWhenDisabled = false,
	requireCredits = true,
	creditCost,
}) => {
	const { data: session } = useSession();
	const userStore = useUserStore();
	const { isEnabled, isLoading } = useFeatureFlag(flagId);

	// Get user context for credit and plan checks
	const userPlan = userStore.plan;
	const userCredits = userStore.credits || 0;
	const isAuthenticated = !!session?.user;

	// Calculate credit cost (use provided cost or get from feature)
	const actualCreditCost = creditCost ?? getFeatureCreditCost(flagId);

	// Check if user has access considering both feature flag and credits
	const hasAccess = checkFeatureAccess(
		flagId,
		userPlan,
		isAuthenticated,
		userCredits,
	);

	// Additional credit check if required
	const hasSufficientCredits = requireCredits
		? userCredits >= actualCreditCost
		: true;

	// Final access determination
	const finalAccess = isEnabled && hasAccess && hasSufficientCredits;

	if (isLoading) {
		return <div className="animate-pulse">Loading...</div>;
	}

	// If showWhenDisabled is true, show content when flag is disabled
	if (showWhenDisabled) {
		return finalAccess ? <>{fallback}</> : <>{children}</>;
	}

	// Default behavior: show content when flag is enabled and user has access
	return finalAccess ? <>{children}</> : <>{fallback}</>;
};

export default FeatureFlagWrapper;
