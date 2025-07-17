"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { FaDiscord, FaLinkedin, FaSlack } from "react-icons/fa";

// eslint-disable-next-line import/no-unresolved
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// eslint-disable-next-line import/no-unresolved
import useRetrieveMetrics from "@/hooks/core/metric";

import { StatCardsSkeleton } from "./skeletons/stats-card";

export const RepoCards = () => {
	const { topRepoMetrics, isTopRepoLoading } = useRetrieveMetrics();

	if (isTopRepoLoading) {
		return <StatCardsSkeleton />;
	}

	if (!topRepoMetrics || topRepoMetrics.length === 0) {
		return (
			<div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed text-sm text-muted-foreground">
				No active repositories. Connect one to see its stats here.
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-3">
			{topRepoMetrics.map((repo: any) => (
				<Card
					key={repo.name}
					className="flex flex-col justify-between border-zinc-800/50 bg-zinc-900/40 text-zinc-200 backdrop-blur-sm transition-colors hover:bg-zinc-800/50"
				>
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle className="truncate text-base font-semibold">
								<Link
									href="#"
									className="flex items-center gap-1 hover:underline"
								>
									{repo.name}
									<ArrowUpRight className="h-3 w-3 text-muted-foreground" />
								</Link>
							</CardTitle>
						</div>
					</CardHeader>
					<CardContent>
						<div className="flex items-center justify-between text-sm">
							<div className="flex flex-col">
								<span className="text-lg font-bold">{repo.postsThisWeek}</span>
								<span className="text-xs text-muted-foreground">
									Posts this week
								</span>
							</div>
							<div className="flex items-center gap-2">
								{repo.channelDistribution.linkedIn > 0 && (
									<FaLinkedin className="h-4 w-4 text-muted-foreground" />
								)}
								{repo.channelDistribution.slack > 0 && (
									<FaSlack className="h-4 w-4 text-muted-foreground" />
								)}
								{repo.channelDistribution.discord > 0 && (
									<FaDiscord className="h-4 w-4 text-muted-foreground" />
								)}
							</div>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
};
