/* eslint-disable import/no-unresolved */
"use client";

import { Github, Loader2, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Header } from "@/components/general/micro/header";
import { AddRepositoryModal } from "@/components/repositories/add-repo";
import { RepositoryCard } from "@/components/repositories/repo-card";
import { RepositoryFilter } from "@/components/repositories/repo-filter";
import { Button } from "@/components/ui/button";
import useRetrieveConnectedRepos from "@/hooks/core/repo/get-repo-hook";

interface Repository {
	id: string;
	name: string;
	tone: string;
	created_at: string;
	description: string;
	ai_enabled: boolean;
	tracked_branch: string;
	channels_to_post: string[];
	status: "connected" | "paused" | "disconnected";
}

function RepositoryCardSkeleton({ isGrid }: { isGrid: boolean }) {
	return (
		<div className="h-64 animate-pulse rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4" />
	);
}

export default function RepositoriesPage() {
	const { repositories, totalRepositories, isLoadingRepos } =
		useRetrieveConnectedRepos();

	const [filteredRepositories, setFilteredRepositories] = useState<
		Repository[]
	>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [viewMode, setViewMode] = useState<"grid" | "stacked">("grid");
	const [sortBy, setSortBy] = useState<"name" | "latest" | "oldest">("name");

	const handleFilteredRepositories = useMemo(() => {
		if (!repositories) return [];

		const q = searchQuery.trim().toLowerCase();

		const filtered = repositories.filter((repo: any) => {
			return (
				repo.name.toLowerCase().includes(q) ||
				repo.full_name.toLowerCase().includes(q) ||
				(repo.description?.toLowerCase().includes(q) ?? false)
			);
		});

		filtered.sort((a: any, b: any) => {
			switch (sortBy) {
				case "name": {
					return a.name.localeCompare(b.name);
				}
				case "latest": {
					return (
						new Date(b.created_at ?? 0).getTime() -
						new Date(a.created_at ?? 0).getTime()
					);
				}
				case "oldest": {
					return (
						new Date(a.created_at ?? 0).getTime() -
						new Date(b.created_at ?? 0).getTime()
					);
				}
				default: {
					return 0;
				}
			}
		});

		return filtered;
	}, [repositories, searchQuery, sortBy]);

	useEffect(() => {
		setFilteredRepositories(handleFilteredRepositories);
	}, [handleFilteredRepositories]);

	const renderRepositories = () => {
		if (isLoadingRepos) {
			return (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{Array.from({ length: 6 }).map((_, index) => (
						<RepositoryCardSkeleton key={index} isGrid />
					))}
				</div>
			);
		}

		if (filteredRepositories.length === 0) {
			return (
				<div className="mt-8 flex h-[400px] items-center justify-center rounded-lg border border-dashed border-zinc-800/50">
					<div className="space-y-6 text-center">
						<Github className="mx-auto h-16 w-16 text-zinc-600" />
						<div className="space-y-3">
							<h3 className="text-xl font-medium text-zinc-100">
								{searchQuery
									? "No repositories found"
									: "No repositories connected"}
							</h3>
							<p className="mx-auto max-w-sm text-zinc-400">
								{searchQuery
									? "Try adjusting your search terms"
									: "Connect your first Git repository to start generating posts from commits."}
							</p>
						</div>
						{!searchQuery && (
							<Button
								onClick={() => setIsAddModalOpen(true)}
								className="bg-white text-black transition-colors hover:bg-zinc-200"
							>
								<Plus className="mr-2 h-4 w-4" />
								Add Your First Repository
							</Button>
						)}
					</div>
				</div>
			);
		}

		return (
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				{filteredRepositories.map((repo: Repository) => (
					<RepositoryCard key={repo.id} repository={repo} />
				))}
			</div>
		);
	};

	return (
		<section className="flex h-full w-full flex-col gap-6 bg-black px-6 py-8">
			{isAddModalOpen && (
				<AddRepositoryModal
					open={isAddModalOpen}
					onSuccess={() => {
						// Optional: refetch repos on successful add
						// refetchRepos();
					}}
					onOpenChange={setIsAddModalOpen}
				/>
			)}

			<Header
				heading="Repositories"
				text="Manage your connected Git repositories"
			>
				<Button
					onClick={() => setIsAddModalOpen(true)}
					className="bg-white text-black transition-colors hover:bg-zinc-200"
				>
					<Plus className="mr-2 h-4 w-4" />
					Add Repository
				</Button>
			</Header>

			<RepositoryFilter
				sortBy={sortBy}
				viewMode={viewMode}
				searchQuery={searchQuery}
				onViewModeChange={setViewMode}
				onSortChange={setSortBy as any}
				onSearchChange={setSearchQuery}
			/>

			<div className="relative w-full flex-1 overflow-hidden rounded-lg border border-zinc-800/30 bg-zinc-900/20">
				<div className="absolute inset-0 overflow-y-auto p-6">
					{renderRepositories()}
				</div>
			</div>
		</section>
	);
}
