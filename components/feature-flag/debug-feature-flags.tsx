/* eslint-disable unicorn/no-null */
/* eslint-disable import/no-unresolved */
"use client";
import { useSession } from "next-auth/react";
import React, { useEffect } from "react";

import { useFeatureFlag } from "@/hooks/use-feature-flag";
import { FEATURE_FLAGS } from "@/lib/constants/feature-flags";
import { initializeFeatureFlags } from "@/lib/utils/feature-flags-init";
import useFeatureFlagsStore from "@/zustand/feature-flags-store";

export const DebugFeatureFlags: React.FC = () => {
	const { data: session } = useSession();
	const { flags, setFlags } = useFeatureFlagsStore();
	const {
		isEnabled: isStatsEnabled,
		userPlan,
		isAuthenticated,
	} = useFeatureFlag(FEATURE_FLAGS.STATS_DASHBOARD);

	useEffect(() => {
		// Force initialize if no flags exist
		if (Object.keys(flags).length === 0) {
			console.log("No flags found, initializing...");
			initializeFeatureFlags();
		}
	}, [flags]);

	return (
		<div className="space-y-4 rounded border p-4">
			<h3 className="font-bold">Feature Flags Debug</h3>

			<div className="space-y-2">
				<p>
					<strong>Session:</strong> {JSON.stringify(session?.user, null, 2)}
				</p>
				<p>
					<strong>User Plan:</strong> {userPlan || "None"}
				</p>
				<p>
					<strong>Authenticated:</strong> {isAuthenticated ? "Yes" : "No"}
				</p>
				<p>
					<strong>Flags Count:</strong> {Object.keys(flags).length}
				</p>
				<p>
					<strong>Stats Dashboard Enabled:</strong>{" "}
					{isStatsEnabled ? "Yes" : "No"}
				</p>
			</div>

			<div className="space-y-2">
				<h4 className="font-medium">Available Flags:</h4>
				{Object.entries(flags).map(([key, flag]) => (
					<div key={key} className="text-sm">
						<strong>{key}:</strong> {flag.enabled ? "✅" : "❌"} - {flag.name}
					</div>
				))}
			</div>

			<button
				onClick={() => {
					console.log("Current flags:", flags);
					initializeFeatureFlags();
				}}
				className="rounded bg-blue-500 px-4 py-2 text-white"
			>
				Reinitialize Flags
			</button>
		</div>
	);
};

export default DebugFeatureFlags;
