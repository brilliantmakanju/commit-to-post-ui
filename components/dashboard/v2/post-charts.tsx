"use client";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	// eslint-disable-next-line import/no-unresolved
} from "@/components/ui/chart";
// eslint-disable-next-line import/no-unresolved
import { Skeleton } from "@/components/ui/skeleton";
export const postsChartConfig = {
	posts: {
		label: "Posts",
	},
} satisfies ChartConfig;
export const defaultPostsPerDayData = [
	{ date: "Sunday", posts: 5 },
	{ date: "Monday", posts: 8 },
	{ date: "Tuesday", posts: 3 },
	{ date: "Wednesday", posts: 6 },
	{ date: "Thursday", posts: 4 },
	{ date: "Friday", posts: 10 },
	{ date: "Saturday", posts: 7 },
];
export function PostsChart() {
	// const data = defaultPostsPerDayData.map(d => ({ ...d, posts: 0 }))
	const data = defaultPostsPerDayData;
	return (
		<div className="h-[250px] w-full rounded-lg border border-zinc-800/30 bg-zinc-900/30 p-4 backdrop-blur-sm">
			<ChartContainer config={postsChartConfig} className="h-full w-full">
				<LineChart
					accessibilityLayer
					data={data}
					margin={{
						left: 12,
						right: 12,
						top: 10,
						bottom: 10,
					}}
				>
					<CartesianGrid
						vertical={false}
						strokeDasharray="3 3"
						stroke="rgb(63 63 70 / 0.3)"
					/>
					<XAxis
						dataKey="date"
						tickLine={false}
						axisLine={false}
						tickMargin={8}
						tickFormatter={value => value.slice(0, 3)}
						tick={{
							fill: "rgb(161 161 170)",
							fontSize: 12,
						}}
					/>
					<ChartTooltip
						cursor={false}
						content={<ChartTooltipContent indicator="line" />}
						contentStyle={{
							backgroundColor: "rgb(24 24 27)",
							border: "1px solid rgb(63 63 70 / 0.3)",
							borderRadius: "8px",
							color: "rgb(244 244 245)",
							boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
						}}
					/>
					<Line
						dataKey="posts"
						type="monotone"
						stroke="rgb(244 244 245)"
						strokeWidth={2}
						dot={{
							fill: "rgb(244 244 245)",
							strokeWidth: 2,
							r: 4,
						}}
						activeDot={{
							r: 6,
							fill: "rgb(244 244 245)",
							stroke: "rgb(0 0 0)",
							strokeWidth: 2,
						}}
					/>
				</LineChart>
			</ChartContainer>
		</div>
	);
}
export function PostsChartSkeleton() {
	return <Skeleton className="h-[250px] w-full rounded-lg bg-zinc-900/30" />;
}
