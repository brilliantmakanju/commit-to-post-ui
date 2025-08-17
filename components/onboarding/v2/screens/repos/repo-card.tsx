import React from "react";
import { FaStar } from "react-icons/fa";

// eslint-disable-next-line import/no-unresolved
import { cn } from "@/lib/utils";

import { GitHubRepo } from "./type";

interface RepoCardProps {
	repo: GitHubRepo;
	isSelected: boolean;
	isDisabled: boolean;
	onSelect: (repoId: string) => void;
}

export const RepoCard: React.FC<RepoCardProps> = ({
	repo,
	isSelected,
	isDisabled,
	onSelect,
}) => {
	return (
		<div
			className={cn(
				"rounded-lg border border-gray-200 p-4 transition-colors",
				!isDisabled && "cursor-pointer hover:bg-gray-50",
				isDisabled && "cursor-not-allowed opacity-50",
				isSelected && "border-arch-black bg-gray-50",
			)}
			onClick={() => {
				if (!isDisabled) {
					onSelect(repo.id.toString());
				}
			}}
		>
			<div className="flex items-center space-x-4">
				<input
					type="checkbox"
					checked={isSelected}
					onChange={() => onSelect(repo.id.toString())}
					disabled={isDisabled}
					className="h-4 w-4 rounded border-gray-300 text-arch-black focus:ring-arch-black"
				/>
				<div className="flex-1">
					<div className="mb-1 flex items-center space-x-3">
						<h4 className="font-medium text-arch-black">{repo.name}</h4>
						{repo.private && (
							<span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
								Private
							</span>
						)}
						{repo.language && (
							<span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
								{repo.language}
							</span>
						)}
					</div>
					{repo.description && (
						<p className="mb-2 text-sm text-gray-600">{repo.description}</p>
					)}
					<div className="flex items-center space-x-4 text-xs text-gray-600">
						<span className="flex items-center gap-1">
							<FaStar className="text-gray-400" />
							{repo.stargazers_count}
						</span>
						<span>Default: {repo.default_branch}</span>
						<span>
							Updated {new Date(repo.updated_at).toLocaleDateString()}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
};
