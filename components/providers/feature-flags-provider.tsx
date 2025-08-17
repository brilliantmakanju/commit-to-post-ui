/* eslint-disable import/no-unresolved */
"use client";
import { useEffect } from "react";

import { initializeFeatureFlags } from "@/lib/utils/feature-flags-init";
import { initializeFeatureLimits } from "@/lib/utils/feature-limits-init";

interface FeatureFlagsProviderProps {
	children: React.ReactNode;
}

export const FeatureFlagsProvider: React.FC<FeatureFlagsProviderProps> = ({
	children,
}) => {
	useEffect(() => {
		// Initialize both feature flags and limits when the app starts
		initializeFeatureFlags();
		initializeFeatureLimits();
	}, []);

	return <>{children}</>;
};

export default FeatureFlagsProvider;
