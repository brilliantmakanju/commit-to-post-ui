"use client";
import { useState } from "react";
import { FaChartBar, FaChartPie, FaDiscord, FaLinkedin } from "react-icons/fa";
import {
	Bar,
	BarChart,
	Cell,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

import { XIcon } from "@/components/posts/utils/post-icons";
import { Button } from "@/components/ui/button";
import { ChartContainer } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import useDashboardMetrics from "@/hooks/core/charts";
import { channelDistributionConfig } from "@/lib/data";

const PLATFORM_CONFIG = {
	twitter: {
		icon: XIcon,
		color: "#ffffff",
		label: "Twitter/X",
	},
	linkedin: {
		icon: FaLinkedin,
		color: "#d4d4d8",
		label: "LinkedIn",
	},
	discord: {
		icon: FaDiscord,
		color: "#a1a1aa",
		label: "Discord",
	},
} as const;

const CustomTooltip = ({ active, payload }: any) => {
	if (!active || !payload?.length) return;
	const data = payload[0].payload;
	const platformKey =
		data.platform.toLowerCase() as keyof typeof PLATFORM_CONFIG;
	const config = PLATFORM_CONFIG[platformKey];

	if (!config) return;

	const Icon = config.icon;

	return (
		<div className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 shadow-lg">
			<div className="flex items-center gap-2">
				<Icon className="h-4 w-4" style={{ color: data.fill }} />
				<span className="text-sm font-medium text-zinc-100">
					{config.label}
				</span>
			</div>
			<div className="mt-1 text-sm text-zinc-300">
				{data.posts} {data.posts === 1 ? "post" : "posts"}
				{data.percentage && (
					<span className="ml-1 text-zinc-500">({data.percentage}%)</span>
				)}
			</div>
		</div>
	);
};

export function ChannelDistribution() {
	const { channelData, isChannelLoading } = useDashboardMetrics();
	const [viewType, setViewType] = useState<"pie" | "bar">("pie");

	if (isChannelLoading) {
		return <ChannelDistributionSkeleton />;
	}

	const hasData = channelData?.some((item: any) => item.posts > 0);

	if (!hasData) {
		return (
			<div className="flex h-[280px] flex-col items-center justify-center gap-2 text-center">
				<FaChartPie className="h-8 w-8 text-zinc-700" />
				<p className="text-sm font-medium text-zinc-400">
					No platform activity yet
				</p>
				<p className="text-xs text-zinc-500">
					Schedule posts to see distribution
				</p>
			</div>
		);
	}

	const total = channelData.reduce(
		(sum: number, item: any) => sum + item.posts,
		0,
	);

	const processedData = channelData
		.filter((item: any) => {
			const platformKey = item.platform.toLowerCase();
			return (
				platformKey === "twitter" ||
				platformKey === "linkedin" ||
				platformKey === "discord"
			);
		})
		.map((item: any) => {
			const platformKey =
				item.platform.toLowerCase() as keyof typeof PLATFORM_CONFIG;
			const config = PLATFORM_CONFIG[platformKey];
			return {
				...item,
				fill: config?.color || "#71717a",
				percentage: Math.round((item.posts / total) * 100),
			};
		})
		.sort((a: any, b: any) => b.posts - a.posts);

	return (
		<div className="space-y-3">
			<span className="-mt-3 flex w-full items-end justify-end text-xs text-zinc-500">
				{total} {total === 1 ? "post" : "posts"}
			</span>

			{viewType === "pie" ? (
				<div className="flex items-center justify-center py-2">
					<div className="-mt-10 space-y-1.5 rounded-lg border border-zinc-800/50 bg-zinc-900/30">
						{processedData.map((item: any) => {
							const platformKey =
								item.platform.toLowerCase() as keyof typeof PLATFORM_CONFIG;
							const config = PLATFORM_CONFIG[platformKey];
							if (!config) return;

							const Icon = config.icon;

							return (
								<div
									key={item.platform}
									className="flex items-center justify-between gap-3 rounded-md border border-zinc-800/40 bg-zinc-900/50 px-3 py-2 transition-colors hover:border-zinc-700/60 hover:bg-zinc-900/70"
								>
									<div className="flex items-center gap-2">
										<div className="flex h-7 w-7 items-center justify-center rounded bg-zinc-800/50">
											<Icon
												className="h-3.5 w-3.5"
												style={{ color: item.fill }}
											/>
										</div>
										<span className="text-sm font-medium text-zinc-300">
											{config.label}
										</span>
									</div>
									<div className="flex items-baseline gap-1.5">
										<span className="text-sm font-semibold text-zinc-200">
											{item.posts}
										</span>
										<span className="text-xs text-zinc-500">
											({item.percentage}%)
										</span>
									</div>
								</div>
							);
						})}
					</div>
					<ChartContainer
						config={channelDistributionConfig}
						className="mx-auto h-[160px] w-[160px]"
					>
						<PieChart>
							<Tooltip cursor={false} content={<CustomTooltip />} />
							<Pie
								dataKey="posts"
								innerRadius={45}
								outerRadius={80}
								strokeWidth={2}
								stroke="#18181b"
								nameKey="platform"
								data={processedData}
							>
								{processedData.map((entry: any) => (
									<Cell key={entry.platform} fill={entry.fill} />
								))}
							</Pie>
						</PieChart>
					</ChartContainer>
				</div>
			) : (
				<div className="h-[160px] w-full py-2">
					<ResponsiveContainer width="100%" height="100%">
						<BarChart
							data={processedData}
							margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
						>
							<XAxis
								dataKey="platform"
								tick={{ fill: "#71717a", fontSize: 11 }}
								axisLine={{ stroke: "#3f3f46" }}
								tickLine={false}
							/>
							<YAxis
								tick={{ fill: "#71717a", fontSize: 11 }}
								axisLine={{ stroke: "#3f3f46" }}
								tickLine={false}
								width={30}
							/>
							<Tooltip
								cursor={{ fill: "#27272a" }}
								content={<CustomTooltip />}
							/>
							<Bar dataKey="posts" radius={[4, 4, 0, 0]}>
								{processedData.map((entry: any) => (
									<Cell key={entry.platform} fill={entry.fill} />
								))}
							</Bar>
						</BarChart>
					</ResponsiveContainer>
				</div>
			)}
		</div>
	);
}

export function ChannelDistributionSkeleton() {
	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<Skeleton className="h-9 w-32 bg-zinc-800/50" />
				<Skeleton className="h-4 w-20 bg-zinc-800/50" />
			</div>
			<div className="flex items-center justify-center py-2">
				<Skeleton className="h-[160px] w-[160px] rounded-full bg-zinc-800/50" />
			</div>
			<div className="space-y-1.5 rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-2">
				{Array.from({ length: 3 }).map((_, index) => (
					<Skeleton key={index} className="h-11 bg-zinc-800/50" />
				))}
			</div>
		</div>
	);
}
