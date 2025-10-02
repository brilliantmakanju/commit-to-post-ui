/* eslint-disable unicorn/no-empty-file */
// /* eslint-disable import/no-unresolved */
// "use client";
// import React, { useState } from "react";

// import { FeatureFlagWrapper } from "@/components/feature-flag/feature-flag-wrapper";
// import FeatureLimitWrapper from "@/components/feature-flag/feature-limit-wrapper";
// import { LimitReachedModal } from "@/components/feature-flag/limit-reached-modal";
// import LimitTooltip from "@/components/feature-flag/limit-tooltip";
// import { LimitWarningModal } from "@/components/feature-flag/limit-warning-modal";
// import { Button } from "@/components/ui/button";
// import { useFeatureFlag } from "@/hooks/use-feature-flag";
// import { useFeatureLimit } from "@/hooks/use-feature-limits";
// import { useLimitUI } from "@/hooks/use-limit-ui";
// import { FEATURE_FLAGS } from "@/lib/constants/feature-flags";
// import { FEATURE_LIMITS } from "@/lib/constants/feature-limits";

// export const ConnectRepoOnboarding: React.FC = () => {
// 	const [repoCount, setRepoCount] = useState(0);
// 	const {
// 		userPlan,
// 		isAuthenticated,
// 		isEnabled: isStatsEnabled,
// 	} = useFeatureFlag(FEATURE_FLAGS.STATS_DASHBOARD);

// 	const {
// 		limit: repoLimit,
// 		canAdd: canAddRepo,
// 		remaining: remainingRepos,
// 	} = useFeatureLimit(FEATURE_LIMITS.REPOSITORIES, repoCount);

// 	// Repository limit with UI integration
// 	const repoLimitUI = useLimitUI({
// 		warningThreshold: 80,
// 		currentCount: repoCount,
// 		limitType: "repositories",
// 		limitId: FEATURE_LIMITS.REPOSITORIES,
// 	});

// 	const handleAddRepo = () => {
// 		repoLimitUI.checkLimit(() => {
// 			setRepoCount(previous => previous + 1);
// 		});
// 	};
// 	return (
// 		<div className="space-y-4 p-4">
// 			<div className="space-y-4 p-4">
// 				<h2 className="text-xl font-bold">Integrated System Example</h2>

// 				{/* Feature Flag */}
// 				<div className="rounded border p-4">
// 					<h3 className="mb-2 font-medium">Feature Flags</h3>
// 					<FeatureFlagWrapper
// 						flagId={FEATURE_FLAGS.STATS_DASHBOARD}
// 						fallback={
// 							<p className="text-red-600">❌ Stats Dashboard disabled</p>
// 						}
// 					>
// 						<p className="text-green-600">✅ Stats Dashboard available</p>
// 					</FeatureFlagWrapper>
// 				</div>

// 				{/* Repository Limits */}
// 				<div className="rounded border p-4">
// 					<h3 className="mb-4 font-medium">Repository Limits</h3>

// 					<div className="mb-4 space-y-2">
// 						<p>
// 							<strong>Plan:</strong> {userPlan || "None"}
// 						</p>
// 						<p>
// 							<strong>Current:</strong> {repoCount}
// 						</p>
// 						<p>
// 							<strong>Limit:</strong>{" "}
// 							{repoLimitUI.limit === -1 ? "Unlimited" : repoLimitUI.limit}
// 						</p>
// 						<p>
// 							<strong>Usage:</strong> {repoLimitUI.percentage}%
// 						</p>
// 					</div>

// 					<div className="space-y-2">
// 						<Button
// 							onClick={() =>
// 								setRepoCount(previous => Math.max(0, previous - 1))
// 							}
// 							disabled={repoCount === 0}
// 							variant="outline"
// 							size="sm"
// 						>
// 							Remove Repository
// 						</Button>

// 						<FeatureLimitWrapper
// 							limitId={FEATURE_LIMITS.REPOSITORIES}
// 							showWhenLimitReached={repoLimitUI.isAtLimit}
// 							currentCount={repoCount}
// 							fallback={
// 								<div className="space-y-2">
// 									<Button disabled variant="outline" size="sm">
// 										Add Repository
// 									</Button>
// 									<p className="text-sm text-red-600">
// 										❌ Repository limit reached. Upgrade to add more.
// 									</p>
// 								</div>
// 							}
// 						>
// 							<LimitTooltip
// 								maxLimit={repoLimitUI.limit}
// 								limitType="repositories"
// 								currentUsage={repoCount}
// 								position="bottom"
// 							>
// 								<Button
// 									onClick={handleAddRepo}
// 									variant="outline"
// 									size="sm"
// 									className={
// 										repoLimitUI.isNearLimit
// 											? "border-orange-500 text-red-600"
// 											: ""
// 									}
// 								>
// 									Add Repository ({repoLimitUI.remaining} remaining)
// 								</Button>
// 							</LimitTooltip>
// 						</FeatureLimitWrapper>
// 					</div>
// 				</div>

// 				{/* Manual Triggers */}
// 				<div className="rounded border p-4">
// 					<h3 className="mb-2 font-medium">Manual UI Triggers</h3>
// 					<div className="flex gap-2">
// 						<Button
// 							onClick={() => repoLimitUI.showWarning()}
// 							variant="outline"
// 							size="sm"
// 						>
// 							Show Warning
// 						</Button>
// 						<Button
// 							onClick={() => repoLimitUI.showLimitReached()}
// 							variant="outline"
// 							size="sm"
// 						>
// 							Show Limit Reached
// 						</Button>
// 					</div>
// 				</div>

// 				{/* Modals */}
// 				<LimitWarningModal {...repoLimitUI.warningProps} />
// 				<LimitReachedModal {...repoLimitUI.reachedProps} />
// 			</div>
// 			<h2 className="text-xl font-bold">Feature Flag Example</h2>

// 			{/* Direct hook usage */}
// 			<div className="rounded border p-4">
// 				<h3 className="mb-2 font-medium">Direct Hook Usage:</h3>
// 				{isStatsEnabled ? (
// 					<p className="text-green-600">✅ Stats Dashboard is enabled</p>
// 				) : (
// 					<p className="text-red-600">❌ Stats Dashboard is disabled</p>
// 				)}
// 			</div>

// 			{/* Wrapper component usage */}
// 			<div className="rounded border p-4">
// 				<h3 className="mb-2 font-medium">Wrapper Component Usage:</h3>
// 				<FeatureFlagWrapper
// 					flagId={FEATURE_FLAGS.STATS_ANALYTICS}
// 					fallback={
// 						<p className="text-red-600">❌ Analytics requires Pro plan</p>
// 					}
// 				>
// 					<p className="text-green-600">✅ Advanced Analytics available</p>
// 				</FeatureFlagWrapper>

// 				<FeatureFlagWrapper
// 					flagId={FEATURE_FLAGS.STATS_DASHBOARD}
// 					fallback={<p className="text-red-600">❌ Stats requires Pro plan</p>}
// 				>
// 					<p className="text-green-600">✅ Advanced Dashboard available</p>
// 				</FeatureFlagWrapper>
// 			</div>

// 			{/* User context */}
// 			<div className="rounded border p-4">
// 				<h3 className="mb-2 font-medium">User Context:</h3>
// 				<p className="text-sm">Plan: {userPlan || "None"}</p>
// 				<p className="text-sm">
// 					Authenticated: {isAuthenticated ? "Yes" : "No"}
// 				</p>
// 			</div>

// 			<div className="space-y-4 p-4">
// 				<h2 className="text-xl font-bold">Feature Limits Example</h2>

// 				<div className="rounded border p-4">
// 					<h3 className="mb-4 font-medium">Repository Limits</h3>

// 					<div className="mb-4 space-y-2">
// 						<p>
// 							<strong>Plan:</strong> {userPlan || "None"}
// 						</p>
// 						<p>
// 							<strong>Current Repositories:</strong> {repoCount}
// 						</p>
// 						<p>
// 							<strong>Limit:</strong>{" "}
// 							{repoLimit === -1 ? "Unlimited" : repoLimit}
// 						</p>
// 						<p>
// 							<strong>Remaining:</strong>{" "}
// 							{remainingRepos === -1 ? "Unlimited" : remainingRepos}
// 						</p>
// 						<p>
// 							<strong>Can Add More:</strong> {canAddRepo ? "✅ Yes" : "❌ No"}
// 						</p>
// 					</div>

// 					<div className="space-y-2">
// 						<Button
// 							onClick={() =>
// 								setRepoCount(previous => Math.max(0, previous - 1))
// 							}
// 							disabled={repoCount === 0}
// 							variant="outline"
// 							size="sm"
// 						>
// 							Remove Repository
// 						</Button>

// 						<FeatureLimitWrapper
// 							limitId={FEATURE_LIMITS.REPOSITORIES}
// 							currentCount={repoCount}
// 							fallback={
// 								<div className="space-y-2">
// 									<Button disabled variant="outline" size="sm">
// 										Add Repository
// 									</Button>
// 									<p className="text-sm text-red-600">
// 										❌ Repository limit reached. Upgrade to add more.
// 									</p>
// 								</div>
// 							}
// 						>
// 							<Button
// 								onClick={() => setRepoCount(previous => previous + 1)}
// 								variant="outline"
// 								size="sm"
// 							>
// 								Add Repository ({remainingRepos} remaining)
// 							</Button>
// 						</FeatureLimitWrapper>
// 					</div>
// 				</div>
// 			</div>
// 		</div>
// 	);
// };

// export default ConnectRepoOnboarding;
