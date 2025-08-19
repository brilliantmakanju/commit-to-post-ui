"use client";
// eslint-disable-next-line import/no-unresolved
import { Plus } from "lucide-react";
import { useState } from "react";

import FeatureLimitWrapper from "@/components/feature-flag/feature-limit-wrapper";
import LimitTooltip from "@/components/feature-flag/limit-tooltip";
// eslint-disable-next-line import/no-unresolved
import { AddRepositoryModal } from "@/components/repositories/add-repo";
// eslint-disable-next-line import/no-unresolved
import { Button } from "@/components/ui/button";
import useRetrieveConnectedRepos from "@/hooks/core/repo/get-repo-hook";
import { useLimitUI } from "@/hooks/use-limit-ui";
import { FEATURE_LIMITS } from "@/lib/constants/feature-limits";

export function DashboardHeader() {
	const { totalRepositories } = useRetrieveConnectedRepos();
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);

	const repoCount = totalRepositories;

	const repoLimitUI = useLimitUI({
		warningThreshold: 80,
		currentCount: repoCount,
		limitType: "repositories",
		limitId: FEATURE_LIMITS.REPOSITORIES,
	});
	return (
		<>
			{isAddModalOpen && (
				<AddRepositoryModal
					onSuccess={() => {}}
					open={isAddModalOpen}
					onOpenChange={setIsAddModalOpen}
				/>
			)}
			<div className="flex items-center justify-between">
				{/* <h1 className="text-xl font-semibold">{greeting}</h1> */}
				<h1 className="text-xl font-semibold">Dashboard</h1>

				<FeatureLimitWrapper
					currentCount={repoCount}
					limitId={FEATURE_LIMITS.REPOSITORIES}
					fallback={
						<LimitTooltip
							maxLimit={repoLimitUI.limit}
							currentUsage={repoCount}
							limitType="repositories"
							position="bottom"
						>
							<div className="inline-block cursor-pointer">
								<Button
									disabled
									className="bg-white text-black transition-colors hover:bg-zinc-200"
								>
									<Plus className="mr-2 h-4 w-4" />
									Add Repository
								</Button>
							</div>
						</LimitTooltip>
					}
				>
					<LimitTooltip
						maxLimit={repoLimitUI.limit}
						limitType="repositories"
						currentUsage={repoCount}
						position="bottom"
					>
						<Button
							onClick={() => setIsAddModalOpen(true)}
							className="bg-white text-black transition-colors hover:bg-zinc-200"
						>
							<Plus className="mr-2 h-4 w-4" />
							Add Repository
						</Button>
					</LimitTooltip>
				</FeatureLimitWrapper>
			</div>
		</>
	);
}
