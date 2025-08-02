"use client";
import { Info } from "lucide-react";
import React from "react";

import { ActivityHeatmap } from "@/components/dashboard/v2/activity-heatmap";
import { DashboardHeader } from "@/components/dashboard/v2/header";
import { ChannelDistribution } from "@/components/dashboard/v2/platform-chart";
import { RepoCards } from "@/components/dashboard/v2/repo-cards";
import { StatCards } from "@/components/dashboard/v2/stats-cards";
import { UpcomingPosts } from "@/components/dashboard/v2/upcoming-posts";
import { WebhookErrors } from "@/components/dashboard/v2/webhook-errors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

const Page = () => {
	return (
		<section className="flex h-full w-full flex-col space-y-8 bg-[#0A0A0A] p-6">
			{/* Header - Simplified welcome message */}
			<DashboardHeader />
			<div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
				{/* Main Content Column */}
				<div className="flex flex-col gap-8 lg:col-span-2">
					<StatCards />

					<Card className="border-zinc-800/50 bg-zinc-900/40 text-zinc-200 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700/50 hover:bg-zinc-900/60">
						<CardHeader className="flex flex-row items-center justify-between">
							<CardTitle>Upcoming Posts</CardTitle>
							<Popover>
								<PopoverTrigger asChild>
									<Info className="block h-4 w-4 cursor-help text-muted-foreground lg:hidden" />
								</PopoverTrigger>
								<PopoverContent side="top" className="w-auto p-2 text-sm">
									<p>Scroll horizontally to see all columns</p>
								</PopoverContent>
							</Popover>
						</CardHeader>
						<CardContent>
							<UpcomingPosts />
						</CardContent>
					</Card>
				</div>

				{/* Side Panel */}
				<div className="flex flex-col gap-8 lg:col-span-1">
					<Card className="border-zinc-800/50 bg-zinc-900/40 text-zinc-200 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700/50 hover:bg-zinc-900/60">
						<CardHeader>
							<CardTitle>Activity</CardTitle>
						</CardHeader>
						<CardContent>
							<ActivityHeatmap />
						</CardContent>
					</Card>
					<Card className="h-[272px] border-zinc-800/50 bg-zinc-900/40 text-zinc-200 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700/50 hover:bg-zinc-900/60">
						<CardHeader>
							<CardTitle>Channel Distribution</CardTitle>
						</CardHeader>
						<CardContent>
							<ChannelDistribution />
						</CardContent>
					</Card>

					{/* <Card className="border-zinc-800/50 bg-zinc-900/40 text-zinc-200 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700/50 hover:bg-zinc-900/60">
						<CardHeader>
							<CardTitle>Webhook Errors</CardTitle>
						</CardHeader>
						<CardContent>
							<WebhookErrors />
						</CardContent>
					</Card> */}
				</div>
			</div>
			<Card className="h-full w-full border-zinc-800/50 bg-zinc-900/40 text-zinc-200 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700/50 hover:bg-zinc-900/60">
				<CardHeader>
					<CardTitle>Top Repositories</CardTitle>
				</CardHeader>
				<CardContent>
					<RepoCards />
				</CardContent>
			</Card>
		</section>
	);
};

export default Page;
