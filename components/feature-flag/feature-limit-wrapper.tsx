import React from "react";

// eslint-disable-next-line import/no-unresolved
import { useFeatureLimit } from "@/hooks/use-feature-limits";

interface FeatureLimitWrapperProps {
	limitId: string;
	currentCount: number;
	children: React.ReactNode;
	fallback?: React.ReactNode;
	showWhenLimitReached?: boolean;
}

const FeatureLimitWrapper: React.FC<FeatureLimitWrapperProps> = ({
	limitId,
	children,
	fallback,
	currentCount,
	showWhenLimitReached = false,
}) => {
	const { canAdd, isLoading } = useFeatureLimit(limitId, currentCount);

	if (isLoading) {
		return <div className="animate-pulse">Loading...</div>;
	}

	// If showWhenLimitReached is true, show content when limit is reached
	if (showWhenLimitReached) {
		return canAdd ? <>{fallback}</> : <>{children}</>;
	}

	// Default behavior: show content when user can add more
	return canAdd ? <>{children}</> : <>{fallback}</>;
};

export default FeatureLimitWrapper;
