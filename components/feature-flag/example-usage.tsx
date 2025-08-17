/* eslint-disable import/no-unresolved */
"use client";
import React from "react";

import { useFeatureFlag } from "@/hooks/use-feature-flag";
import { FEATURE_FLAGS } from "@/lib/constants/feature-flags";

import { FeatureFlagWrapper } from "./feature-flag-wrapper";

export const ConnectRepoOnboarding: React.FC = () => {
	const {
		isEnabled: isStatsEnabled,
		userPlan,
		isAuthenticated,
	} = useFeatureFlag(FEATURE_FLAGS.STATS_DASHBOARD);

	return (
		<div className="space-y-4 p-4">
			<h2 className="text-xl font-bold">Feature Flag Example</h2>

			{/* Direct hook usage */}
			<div className="rounded border p-4">
				<h3 className="mb-2 font-medium">Direct Hook Usage:</h3>
				{isStatsEnabled ? (
					<p className="text-green-600">✅ Stats Dashboard is enabled</p>
				) : (
					<p className="text-red-600">❌ Stats Dashboard is disabled</p>
				)}
			</div>

			{/* Wrapper component usage */}
			<div className="rounded border p-4">
				<h3 className="mb-2 font-medium">Wrapper Component Usage:</h3>
				<FeatureFlagWrapper
					flagId={FEATURE_FLAGS.STATS_ANALYTICS}
					fallback={
						<p className="text-red-600">❌ Analytics requires Pro plan</p>
					}
				>
					<p className="text-green-600">✅ Advanced Analytics available</p>
				</FeatureFlagWrapper>
			</div>

			{/* User context */}
			<div className="rounded border p-4">
				<h3 className="mb-2 font-medium">User Context:</h3>
				<p className="text-sm">Plan: {userPlan || "None"}</p>
				<p className="text-sm">
					Authenticated: {isAuthenticated ? "Yes" : "No"}
				</p>
			</div>
		</div>
	);
};

export default ConnectRepoOnboarding;
