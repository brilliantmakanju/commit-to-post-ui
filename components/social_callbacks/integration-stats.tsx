"use client";

import { Activity, Target, TrendingUp, Zap } from "lucide-react";
import { useEffect, useState } from "react";

// eslint-disable-next-line import/no-unresolved
import { Badge } from "@/components/ui/badge";
// eslint-disable-next-line import/no-unresolved
import { Card } from "@/components/ui/card";

interface IntegrationStatsProps {
	provider: string;
}

const PROVIDER_STATS = {
	github: {
		totalCommits: 247,
		postsGenerated: 89,
		avgEngagement: "+23%",
		bestTime: "9:00 AM",
		topHashtags: ["#webdev", "#javascript", "#react", "#nodejs"],
		conversionRate: "36%",
		avgLikes: 156,
	},
	linkedin: {
		totalCommits: 189,
		postsGenerated: 67,
		avgEngagement: "+31%",
		bestTime: "8:30 AM",
		topHashtags: ["#leadership", "#technology", "#innovation", "#career"],
		conversionRate: "35%",
		avgLikes: 203,
	},
	twitter: {
		totalCommits: 312,
		postsGenerated: 156,
		avgEngagement: "+45%",
		bestTime: "2:00 PM",
		topHashtags: ["#coding", "#javascript", "#webdev", "#buildinpublic"],
		conversionRate: "50%",
		avgLikes: 189,
	},
};

export function IntegrationStats({ provider }: IntegrationStatsProps) {
	const [stats, setStats] = useState(
		PROVIDER_STATS[provider as keyof typeof PROVIDER_STATS],
	);
	const [isAnimating, setIsAnimating] = useState(false);

	useEffect(() => {
		const updateStats = () => {
			setIsAnimating(true);
			setTimeout(() => {
				const baseStats =
					PROVIDER_STATS[provider as keyof typeof PROVIDER_STATS];
				setStats({
					...baseStats,
					totalCommits: baseStats.totalCommits + Math.floor(Math.random() * 5),
					postsGenerated:
						baseStats.postsGenerated + Math.floor(Math.random() * 3),
					avgLikes: baseStats.avgLikes + Math.floor(Math.random() * 20) - 10,
				});
				setIsAnimating(false);
			}, 300);
		};

		const interval = setInterval(updateStats, 15000); // Update every 15 seconds
		return () => clearInterval(interval);
	}, [provider]);

	return (
		<Card className="border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
			<div className="mb-4 flex items-center gap-2">
				<Activity className="h-4 w-4 text-gray-600 dark:text-gray-400" />
				<h3 className="font-mono text-sm font-semibold text-gray-900 dark:text-gray-100">
					Performance Stats
				</h3>
				<div className="ml-auto">
					<TrendingUp className="h-3 w-3 text-green-500" />
				</div>
			</div>
			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<span className="text-sm text-gray-600 dark:text-gray-400">
						Total Commits
					</span>
					<span
						className={`font-mono text-sm font-semibold text-gray-900 transition-all duration-300 dark:text-gray-100 ${
							isAnimating ? "scale-110 text-blue-500" : ""
						}`}
					>
						{stats.totalCommits}
					</span>
				</div>
				<div className="flex items-center justify-between">
					<span className="text-sm text-gray-600 dark:text-gray-400">
						Posts Generated
					</span>
					<span
						className={`font-mono text-sm font-semibold text-gray-900 transition-all duration-300 dark:text-gray-100 ${
							isAnimating ? "scale-110 text-green-500" : ""
						}`}
					>
						{stats.postsGenerated}
					</span>
				</div>
				<div className="flex items-center justify-between">
					<span className="text-sm text-gray-600 dark:text-gray-400">
						Conversion Rate
					</span>
					<span className="flex items-center gap-1 font-mono text-sm font-semibold text-purple-600 dark:text-purple-400">
						<Target className="h-3 w-3" />
						{stats.conversionRate}
					</span>
				</div>
				<div className="flex items-center justify-between">
					<span className="text-sm text-gray-600 dark:text-gray-400">
						Avg Engagement
					</span>
					<span className="flex items-center gap-1 font-mono text-sm font-semibold text-green-600 dark:text-green-400">
						<Zap className="h-3 w-3" />
						{stats.avgEngagement}
					</span>
				</div>
				<div className="flex items-center justify-between">
					<span className="text-sm text-gray-600 dark:text-gray-400">
						Best Time
					</span>
					<span className="font-mono text-sm font-semibold text-gray-900 dark:text-gray-100">
						{stats.bestTime}
					</span>
				</div>
				<div className="border-t border-gray-200 pt-2 dark:border-gray-800">
					<span className="mb-2 block text-sm text-gray-600 dark:text-gray-400">
						Trending Tags
					</span>
					<div className="flex flex-wrap gap-1">
						{stats.topHashtags.map((tag, index) => (
							<Badge
								key={index}
								variant="secondary"
								className="bg-gray-200 text-xs text-gray-700 transition-colors hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
							>
								{tag}
							</Badge>
						))}
					</div>
				</div>
			</div>
			<div className="mt-3 border-t border-gray-200 pt-3 dark:border-gray-800">
				<div className="text-center text-xs text-gray-500">
					📈 Your developer brand is growing automatically
				</div>
			</div>
		</Card>
	);
}
