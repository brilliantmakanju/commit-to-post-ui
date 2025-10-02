/* eslint-disable unicorn/no-empty-file */
// /* eslint-disable import/no-unresolved */
// "use client";
// import React, { useState } from "react";

// import FeatureLimitWrapper from "@/components/feature-flag/feature-limit-wrapper";
// import { Button } from "@/components/ui/button";
// import { useFeatureLimit } from "@/hooks/use-feature-limits";
// import { FEATURE_LIMITS } from "@/lib/constants/feature-limits";

// export const ExampleLimitUsage: React.FC = () => {
// 	const [repoCount, setRepoCount] = useState(0);

// 	const {
// 		limit: repoLimit,
// 		canAdd: canAddRepo,
// 		remaining: remainingRepos,
// 		userPlan,
// 	} = useFeatureLimit(FEATURE_LIMITS.REPOSITORIES, repoCount);

// 	return (
// 		<div className="space-y-4 p-4">
// 			<h2 className="text-xl font-bold">Feature Limits Example</h2>

// 			<div className="rounded border p-4">
// 				<h3 className="mb-4 font-medium">Repository Limits</h3>

// 				<div className="mb-4 space-y-2">
// 					<p>
// 						<strong>Plan:</strong> {userPlan || "None"}
// 					</p>
// 					<p>
// 						<strong>Current Repositories:</strong> {repoCount}
// 					</p>
// 					<p>
// 						<strong>Limit:</strong> {repoLimit === -1 ? "Unlimited" : repoLimit}
// 					</p>
// 					<p>
// 						<strong>Remaining:</strong>{" "}
// 						{remainingRepos === -1 ? "Unlimited" : remainingRepos}
// 					</p>
// 					<p>
// 						<strong>Can Add More:</strong> {canAddRepo ? "✅ Yes" : "❌ No"}
// 					</p>
// 				</div>

// 				<div className="space-y-2">
// 					<Button
// 						onClick={() => setRepoCount(previous => Math.max(0, previous - 1))}
// 						disabled={repoCount === 0}
// 						variant="outline"
// 						size="sm"
// 					>
// 						Remove Repository
// 					</Button>

// 					<FeatureLimitWrapper
// 						limitId={FEATURE_LIMITS.REPOSITORIES}
// 						currentCount={repoCount}
// 						fallback={
// 							<div className="space-y-2">
// 								<Button disabled variant="outline" size="sm">
// 									Add Repository
// 								</Button>
// 								<p className="text-sm text-red-600">
// 									❌ Repository limit reached. Upgrade to add more.
// 								</p>
// 							</div>
// 						}
// 					>
// 						<Button
// 							onClick={() => setRepoCount(previous => previous + 1)}
// 							variant="outline"
// 							size="sm"
// 						>
// 							Add Repository ({remainingRepos} remaining)
// 						</Button>
// 					</FeatureLimitWrapper>
// 				</div>
// 			</div>
// 		</div>
// 	);
// };

// export default ExampleLimitUsage;
