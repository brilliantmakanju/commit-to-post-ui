/* eslint-disable import/no-unresolved */
import { Loader2 } from "lucide-react";
import React from "react";

// eslint-disable-next-line import/no-unresolved
import { Input } from "@/components/ui/input";

import { RepoCard } from "./repo-card";
import { GitHubRepo } from "./type";

interface RepoSelectionProps {
	searchQuery: string;
	isLoading: boolean;
	selectedRepo: string[];
	repositories: GitHubRepo[];
	maxSelectionAllowed: number;
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
}) => {
	const filteredRepos = repositories.filter(repo => {
		const matchesSearch =
			repo.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			(repo.description &&
				repo.description.toLowerCase().includes(searchQuery.toLowerCase()));
		return matchesSearch && !repo.is_connected && !repo.status;
	});

	return (
		<div className="flex h-full max-h-screen flex-col space-y-3">
			<div className="flex-shrink-0 space-y-6 p-1">
				<Input
					className="w-full"
					value={searchQuery}
					placeholder="Search repositories..."
					onChange={event_ => onSearchChange(event_.target.value)}
				/>
			</div>

			<div className="scrollbar-hide max-h-[60vh] min-h-0 flex-1 space-y-2 overflow-y-auto p-1 sm:max-h-[70vh] md:max-h-none">
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
										!isSelected && selectedRepo.length >= maxSelectionAllowed;

									return (
										<div
											key={`${repo.id}-${repo.updated_at}-${repo.connected_by_user_id}`}
											className="inline-block w-full cursor-pointer"
										>
											<RepoCard
												repo={repo}
												isSelected={isSelected}
												onSelect={onRepoSelect}
												isDisabled={shouldDisable}
											/>
										</div>
									);
								})}
							</div>
						)}

						{selectedRepo.length > 0 && (
							<div className="flex-shrink-0 rounded-lg border border-gray-200 bg-gray-50 p-4">
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
