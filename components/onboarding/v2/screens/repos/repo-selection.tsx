/* eslint-disable import/no-unresolved */
import { Loader2 } from "lucide-react";
import React from "react";

import FeatureLimitWrapper from "@/components/feature-flag/feature-limit-wrapper";
import LimitTooltip from "@/components/feature-flag/limit-tooltip";
// eslint-disable-next-line import/no-unresolved
import { Input } from "@/components/ui/input";
import useRetrieveConnectedRepos from "@/hooks/core/repo/get-repo-hook";
import { useLimitUI } from "@/hooks/use-limit-ui";
import { FEATURE_LIMITS } from "@/lib/constants/feature-limits";

import { RepoCard } from "./repo-card";
import { GitHubRepo } from "./type";

interface RepoSelectionProps {
	searchQuery: string;
	isLoading: boolean;
	selectedRepo: string[];
	repositories: GitHubRepo[];
	maxSelectionAllowed: number;
	shouldShowUpgradePrompt: boolean;
	onSearchChange: (query: string) => void;
	onRepoSelect: (repoId: string) => void;
}

export const RepoSelection: React.FC<RepoSelectionProps> = ({
	isLoading,
	selectedRepo,
	searchQuery,
	repositories,
	onRepoSelect,
	onSearchChange,
	maxSelectionAllowed,
	shouldShowUpgradePrompt,
}) => {
	const { totalRepositories } = useRetrieveConnectedRepos();
	const filteredRepos = repositories.filter(repo => {
		const matchesSearch =
			repo.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			(repo.description &&
				repo.description.toLowerCase().includes(searchQuery.toLowerCase()));
		return matchesSearch && !repo.is_connected && !repo.status;
	});
	const repoCount = totalRepositories;

	const repoLimitUI = useLimitUI({
		warningThreshold: 80,
		currentCount: repoCount,
		limitType: "repositories",
		limitId: FEATURE_LIMITS.REPOSITORIES,
	});

	return (
		<div className="space-y-3">
			<div className="space-y-6 p-1">
				<Input
					className="w-full"
					value={searchQuery}
					placeholder="Search repositories..."
					onChange={event_ => onSearchChange(event_.target.value)}
				/>
			</div>

			<div className="space-y-2 overflow-y-auto p-1">
				{isLoading ? (
					<div className="flex items-center justify-center py-12">
						<Loader2 className="h-6 w-6 animate-spin text-gray-600" />
						<span className="ml-3 text-gray-600">Loading repositories...</span>
					</div>
				) : (
					<>
						{filteredRepos.length > 0 && (
							<div className="flex flex-col space-y-3">
								{filteredRepos.map(repo => {
									const isSelected = selectedRepo.includes(repo.id.toString());
									const shouldDisable =
										!isSelected &&
										(selectedRepo.length >= maxSelectionAllowed ||
											shouldShowUpgradePrompt);

									return (
										<FeatureLimitWrapper
											key={repo.id}
											currentCount={repoCount}
											limitId={FEATURE_LIMITS.REPOSITORIES}
											fallback={
												<LimitTooltip
													maxLimit={repoLimitUI.limit}
													limitType="repositories"
													currentUsage={repoCount}
													position="bottom"
												>
													<div className="inline-block cursor-pointer">
														<RepoCard
															repo={repo}
															isDisabled={true}
															isSelected={false}
															onSelect={() => {}}
														/>
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
												<div
													key={`${repo.id}-${repo.updated_at}-${repo.connected_by_user_id}`}
													className="inline-block cursor-pointer"
												>
													<RepoCard
														repo={repo}
														isSelected={isSelected}
														onSelect={onRepoSelect}
														isDisabled={shouldDisable}
													/>
												</div>
											</LimitTooltip>
										</FeatureLimitWrapper>
									);
								})}
							</div>
						)}

						{selectedRepo.length > 0 && (
							<div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
								<div className="flex items-center justify-between">
									<span className="text-sm font-medium text-arch-black">
										{selectedRepo.length} repository
										{selectedRepo.length === 1 ? "" : "ies"} selected
									</span>
								</div>
							</div>
						)}

						{filteredRepos.length === 0 && (
							<div className="py-12 text-center">
								<p className="text-gray-600">
									No repositories found matching your criteria
								</p>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
};
