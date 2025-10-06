"use client";
import { FaDiscord, FaGithub, FaLinkedin, FaLock } from "react-icons/fa";
import { HiOutlineTrendingDown, HiOutlineTrendingUp } from "react-icons/hi";

import { XIcon } from "@/components/posts/utils/post-icons";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import useRetrieveMetrics from "@/hooks/core/metric";

const PLATFORM_ICONS = {
	twitter: XIcon,
	discord: FaDiscord,
	linkedin: FaLinkedin,
} as const;

export const RepoCards = () => {
	const { topRepoMetrics, isTopRepoLoading } = useRetrieveMetrics();

	if (isTopRepoLoading) return <StatCardsSkeleton />;

	if (!topRepoMetrics || topRepoMetrics.length === 0) {
		return (
			<div className="flex h-[160px] flex-col items-center justify-center rounded-lg border border-dashed border-zinc-800/50 bg-zinc-900/20">
				<FaGithub className="mb-2 h-8 w-8 text-zinc-700" />
				<p className="text-sm font-medium text-zinc-400">
					No active repositories
				</p>
				<p className="mt-1 text-xs text-zinc-500">
					Connect a repository to see its stats
				</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{topRepoMetrics.map((repo: any) => {
				const isUpTrend = repo.trend === "up";
				const isDownTrend = repo.trend === "down";
				const isStable = !repo.trend || repo.trend === "stable";

				// unique active platforms only
				const uniquePlatforms = [
					...new Set(repo.activePlatforms || []),
				] as string[];

				return (
					<Card
						key={repo.id}
						className="h-full border border-zinc-800/50 bg-zinc-900/40"
					>
						<CardHeader className="pb-2">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2 truncate">
									<div className="flex h-7 w-7 items-center justify-center rounded bg-zinc-800/50">
										<FaGithub className="h-3.5 w-3.5 text-zinc-400" />
									</div>
									<span className="truncate text-base font-semibold text-zinc-200">
										{repo.name}
									</span>
									{repo.isPrivate && (
										<FaLock
											className="h-3 w-3 shrink-0 text-zinc-600"
											title="Private repo"
										/>
									)}
								</div>
								{/* trend icon instead of "last activity" */}
								{isUpTrend && (
									<HiOutlineTrendingUp
										className="h-4 w-4 text-green-400"
										title="Trending up"
									/>
								)}
								{isDownTrend && (
									<HiOutlineTrendingDown
										className="h-4 w-4 text-red-400"
										title="Trending down"
									/>
								)}
								{isStable && (
									<span
										className="h-4 w-4 text-zinc-500"
										title="Stable activity"
									>
										•
									</span>
								)}
							</div>
						</CardHeader>

						<CardContent className="space-y-3">
							{/* Main Stats Row */}
							<div className="flex items-center justify-between text-sm">
								<div className="flex items-center gap-2">
									<span className="text-xl font-bold text-zinc-100">
										{repo.postsThisWeek}
									</span>
									<span className="text-xs text-zinc-500">this week</span>
								</div>

								<div className="flex items-center gap-4 text-xs text-zinc-400">
									{repo.scheduledPosts !== undefined && (
										<span>
											{repo.scheduledPosts}{" "}
											<span className="text-zinc-500">scheduled</span>
										</span>
									)}
									{repo.totalPosts !== undefined && (
										<span>
											{repo.totalPosts}{" "}
											<span className="text-zinc-500">total</span>
										</span>
									)}
								</div>
							</div>

							{/* Active Platforms (unique icons only) */}
							{uniquePlatforms.length > 0 && (
								<div className="flex items-center gap-2">
									{uniquePlatforms.map((platform: string) => {
										const Icon =
											PLATFORM_ICONS[platform as keyof typeof PLATFORM_ICONS];
										return (
											Icon && (
												<div
													key={platform}
													className="flex h-6 w-6 items-center justify-center rounded bg-zinc-800/50"
													title={platform}
												>
													<Icon className="h-3.5 w-3.5 text-zinc-400" />
												</div>
											)
										);
									})}
								</div>
							)}
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
};

export function StatCardsSkeleton() {
	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{Array.from({ length: 3 }).map((_, index) => (
				<Card
					key={index}
					className="h-full border border-zinc-800/50 bg-zinc-900/40"
				>
					{/* Header Row: Repo identity + trend */}
					<CardHeader className="pb-2">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2 truncate">
								<Skeleton className="h-7 w-7 rounded bg-zinc-800/50" />
								<Skeleton className="h-5 w-28 bg-zinc-800/50" />
							</div>
							<Skeleton className="h-4 w-4 rounded-full bg-zinc-800/50" />
						</div>
					</CardHeader>

					<CardContent className="space-y-3">
						{/* Main Stats Row */}
						<div className="flex items-center justify-between text-sm">
							<div className="flex items-center gap-2">
								<Skeleton className="h-6 w-10 bg-zinc-800/50" />
							</div>
							<div className="flex items-center gap-4">
								<Skeleton className="h-4 w-16 bg-zinc-800/50" />
							</div>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
