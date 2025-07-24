"use client";

import { Cell, Pie, PieChart, Tooltip } from "recharts";

import {
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import useDashboardMetrics from "@/hooks/core/charts";
import { channelDistributionConfig } from "@/lib/data";

// Optimized monochromatic color palette with better contrast
const CHART_COLORS = {
	linkedin: "#f9fafb", // lightest
	slack: "#e5e7eb",
	twitter: "#d1d5db",
	facebook: "#9ca3af",
	instagram: "#6b7280",
	discord: "#4b5563",
	telegram: "#374151", // darkest
	whatsapp: "#f3f4f6",
} as const;

// Custom tooltip component for better visibility
const CustomTooltip = ({ active, payload }: any) => {
	if (!active || !payload?.length) return;

	const data = payload[0].payload;
	const isLightColor = ["#f9fafb", "#e5e7eb", "#d1d5db", "#f3f4f6"].includes(
		data.fill,
	);

	return (
		<div className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 shadow-lg">
			<div className="flex items-center gap-2">
				<div
					className="h-3 w-3 rounded-full border"
					style={{
						backgroundColor: data.fill,
						borderColor: isLightColor ? "#374151" : "transparent",
					}}
				/>
				<span className="text-sm font-medium text-zinc-100">
					{data.platform}
				</span>
			</div>
			<div className="mt-1 text-sm text-zinc-300">{data.posts} posts</div>
		</div>
	);
};

export function ChannelDistribution() {
	const { channelData, isChannelLoading } = useDashboardMetrics();

	if (isChannelLoading) {
		return <ChannelDistributionSkeleton />;
	}

	const hasData = channelData?.some((item: any) => item.posts > 0);

	if (!hasData) {
		return (
			<div className="flex h-[200px] items-center justify-center text-sm text-zinc-400">
				No posts to analyze yet.
			</div>
		);
	}

	// Process data with colors
	const processedData = channelData.map((item: any) => ({
		...item,
		fill:
			CHART_COLORS[item.platform.toLowerCase() as keyof typeof CHART_COLORS] ||
			"#9ca3af",
	}));

	return (
		<div className="w-full">
			<div className="-mt-[18px] flex h-[220px] items-center justify-center">
				<ChartContainer
					config={channelDistributionConfig}
					className="aspect-square h-[200px] w-[200px]"
				>
					<PieChart>
						<Tooltip cursor={false} content={<CustomTooltip />} />
						<Pie
							dataKey="posts"
							innerRadius={40}
							outerRadius={80}
							strokeWidth={1}
							stroke="#111827"
							nameKey="platform"
							data={processedData}
						>
							{processedData.map((entry: any) => (
								<Cell key={entry.platform} fill={entry.fill} />
							))}
						</Pie>
						{/* <ChartLegend
							content={<ChartLegendContent nameKey="platform" />}
							className="flex-wrap gap-2 *:basis-1/4 *:justify-center"
						/> */}
					</PieChart>
				</ChartContainer>
			</div>
		</div>
	);
}

export function ChannelDistributionSkeleton() {
	return (
		<div className="flex h-[200px] items-center justify-center">
			<Skeleton className="h-[160px] w-[160px] rounded-full bg-zinc-800/50" />
		</div>
	);
}
