/* eslint-disable import/no-unresolved */
"use client";
import React, { useState } from "react";

import { FeatureFlagWrapper } from "@/components/feature-flag/feature-flag-wrapper";
import FeatureLimitWrapper from "@/components/feature-flag/feature-limit-wrapper";
import { LimitReachedModal } from "@/components/feature-flag/limit-reached-modal";
import LimitTooltip from "@/components/feature-flag/limit-tooltip";
import { LimitWarningModal } from "@/components/feature-flag/limit-warning-modal";
import { Button } from "@/components/ui/button";
import { useFeatureFlag } from "@/hooks/use-feature-flag";
import { useLimitUI } from "@/hooks/use-limit-ui";
import { FEATURE_FLAGS } from "@/lib/constants/feature-flags";
import { FEATURE_LIMITS } from "@/lib/constants/feature-limits";

export const ExampleIntegratedUsage: React.FC = () => {
	const [repoCount, setRepoCount] = useState(0);

	// Feature flag usage
	const { isEnabled: isStatsEnabled, userPlan } = useFeatureFlag(
		FEATURE_FLAGS.STATS_DASHBOARD,
	);

	// Repository limit with UI integration
	const repoLimitUI = useLimitUI({
		limitId: FEATURE_LIMITS.REPOSITORIES,
		currentCount: repoCount,
		limitType: "repositories",
		warningThreshold: 80,
	});

	const handleAddRepo = () => {
		repoLimitUI.checkLimit(() => {
			setRepoCount(previous => previous + 1);
		});
	};

	return (
		<div className="space-y-4 p-4">
			<h2 className="text-xl font-bold">Integrated System Example</h2>

			{/* Feature Flag */}
			<div className="rounded border p-4">
				<h3 className="mb-2 font-medium">Feature Flags</h3>
				<FeatureFlagWrapper
					flagId={FEATURE_FLAGS.STATS_DASHBOARD}
					fallback={<p className="text-red-600">❌ Stats Dashboard disabled</p>}
				>
					<p className="text-green-600">✅ Stats Dashboard available</p>
				</FeatureFlagWrapper>
			</div>

			{/* Repository Limits */}
			<div className="rounded border p-4">
				<h3 className="mb-4 font-medium">Repository Limits</h3>

				<div className="mb-4 space-y-2">
					<p>
						<strong>Plan:</strong> {userPlan || "None"}
					</p>
					<p>
						<strong>Current:</strong> {repoCount}
					</p>
					<p>
						<strong>Limit:</strong>{" "}
						{repoLimitUI.limit === -1 ? "Unlimited" : repoLimitUI.limit}
					</p>
					<p>
						<strong>Usage:</strong> {repoLimitUI.percentage}%
					</p>
				</div>

				<div className="space-y-2">
					<Button
						onClick={() => setRepoCount(previous => Math.max(0, previous - 1))}
						disabled={repoCount === 0}
						variant="outline"
						size="sm"
					>
						Remove Repository
					</Button>

					<FeatureLimitWrapper
						limitId={FEATURE_LIMITS.REPOSITORIES}
						currentCount={repoCount}
						fallback={
							<div className="space-y-2">
								<Button disabled variant="outline" size="sm">
									Add Repository
								</Button>
								<p className="text-sm text-red-600">
									❌ Repository limit reached. Upgrade to add more.
								</p>
							</div>
						}
					>
						<LimitTooltip
							limitType="repositories"
							currentUsage={repoCount}
							maxLimit={repoLimitUI.limit}
							position="top"
						>
							<Button
								onClick={handleAddRepo}
								variant="outline"
								size="sm"
								className={
									repoLimitUI.isNearLimit
										? "border-orange-500 text-orange-600"
										: ""
								}
							>
								Add Repository ({repoLimitUI.remaining} remaining)
							</Button>
						</LimitTooltip>
					</FeatureLimitWrapper>
				</div>
			</div>

			{/* Manual Triggers */}
			<div className="rounded border p-4">
				<h3 className="mb-2 font-medium">Manual UI Triggers</h3>
				<div className="flex gap-2">
					<Button
						onClick={() => repoLimitUI.showWarning()}
						variant="outline"
						size="sm"
					>
						Show Warning
					</Button>
					<Button
						onClick={() => repoLimitUI.showLimitReached()}
						variant="outline"
						size="sm"
					>
						Show Limit Reached
					</Button>
				</div>
			</div>

			{/* Modals */}
			<LimitWarningModal {...repoLimitUI.warningProps} />
			<LimitReachedModal {...repoLimitUI.reachedProps} />
		</div>
	);
};

export default ExampleIntegratedUsage;
