import React from "react";

// eslint-disable-next-line import/no-unresolved
import { useFeatureFlag } from "@/hooks/use-feature-flag";

interface FeatureFlagWrapperProps {
	flagId: string;
	children: React.ReactNode;
	fallback?: React.ReactNode;
	showWhenDisabled?: boolean;
}

export const FeatureFlagWrapper: React.FC<FeatureFlagWrapperProps> = ({
	flagId,
	children,
	fallback,
	showWhenDisabled = false,
}) => {
	const { isEnabled, isLoading } = useFeatureFlag(flagId);

	if (isLoading) {
		return <div className="animate-pulse">Loading...</div>;
	}

	// If showWhenDisabled is true, show content when flag is disabled
	if (showWhenDisabled) {
		return isEnabled ? <>{fallback}</> : <>{children}</>;
	}

	// Default behavior: show content when flag is enabled
	return isEnabled ? <>{children}</> : <>{fallback}</>;
};

export default FeatureFlagWrapper;
