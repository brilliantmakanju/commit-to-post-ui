"use client";
import { ArrowUp, GitBranch } from "lucide-react";
import { FaHourglassEnd } from "react-icons/fa";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import useRetrieveMetrics from "@/hooks/core/metric";

import { StatCardsSkeleton } from "./skeletons/stats-card";

const iconMap: { [key: string]: React.ReactNode } = {
	"Posts This Week": <ArrowUp className="h-4 w-4 text-zinc-400" />,
	"Total Repositories": <GitBranch className="h-4 w-4 text-zinc-400" />,
	"Scheduled Posts": <FaHourglassEnd className="h-4 w-4 text-zinc-400" />,
};

export function StatCards() {
	const { totalRepositories, postsThisWeek, scheduledPosts, isMetricsLoading } =
		useRetrieveMetrics();

	if (isMetricsLoading) {
		return <StatCardsSkeleton />;
	}

	const statData = [
		{
			title: "Total Repositories",
			value: "10",
			description: "managed by Push to Draft",
		},
		{
			title: "Posts This Week",
			value: "40",
			description: "across all channels",
		},
		{
			title: "Scheduled Posts",
			value: "20",
			description: "posts awaiting publication",
		},
	];

	return (
		<div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-3">
			{statData.map(stat => (
				<Card
					key={stat.title}
					className="flex flex-col items-start justify-between gap-3 border-zinc-800/50 bg-zinc-900/40 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700/50 hover:bg-zinc-900/60"
				>
					<CardHeader className="flex w-full flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium text-zinc-200">
							{stat.title}
						</CardTitle>
						{iconMap[stat.title]}
					</CardHeader>
					<CardContent className="flex w-full flex-col items-start justify-start gap-3">
						<div className="text-2xl font-bold text-white">{stat.value}</div>
						<CardDescription className="text-zinc-400">
							{stat.description}
						</CardDescription>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
