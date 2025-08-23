"use client";

import { FileText, Settings, Webhook } from "lucide-react";

// eslint-disable-next-line import/no-unresolved
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TabsNavigationProps {
	activeTab: string;
	isLoading: boolean;
	tabCounts: {
		all: number;
		drafted: number;
		published: number;
		scheduled: number;
	};
	webhookErrorCount: number;
}

export default function TabsNavigation({
	isLoading,
	tabCounts,
}: TabsNavigationProps) {
	return (
		<div className="w-full">
			<div className="relative">
				{/* Subtle Background */}
				<div className="absolute inset-0 rounded-2xl bg-zinc-900/30 backdrop-blur-sm"></div>

				{/* Tabs Container */}
				<div className="relative overflow-x-auto">
					<TabsList className="flex min-w-[600px] gap-1 rounded-2xl border border-zinc-800/30 bg-zinc-900/40 p-2 py-6 backdrop-blur-md">
						{/* All */}
						<TabsTrigger
							value="all"
							disabled={isLoading}
							className="group relative flex items-center gap-2 rounded-xl bg-transparent px-4 py-3 text-zinc-400 transition-all duration-300 hover:bg-zinc-800/30 hover:text-zinc-200 data-[state=active]:bg-white data-[state=active]:text-black"
						>
							<FileText className="h-4 w-4" />
							<span className="hidden font-medium sm:inline">All Posts</span>
							<span className="font-medium sm:hidden">All</span>
							{tabCounts.all > 0 && (
								<div className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-zinc-700 px-2">
									<span className="text-xs font-semibold text-zinc-300">
										{tabCounts.all}
									</span>
								</div>
							)}
						</TabsTrigger>

						{/* Published */}
						<TabsTrigger
							value="published"
							disabled={isLoading}
							className="group relative flex items-center gap-2 rounded-xl bg-transparent px-4 py-3 text-zinc-400 transition-all duration-300 hover:bg-zinc-800/30 hover:text-zinc-200 data-[state=active]:bg-white data-[state=active]:text-black"
						>
							<div className="h-2 w-2 rounded-full bg-zinc-500 group-data-[state=active]:bg-zinc-700"></div>
							<span className="hidden font-medium sm:inline">Published</span>
							<span className="font-medium sm:hidden">Live</span>
							{tabCounts.published > 0 && (
								<div className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-zinc-700 px-2">
									<span className="text-xs font-semibold text-zinc-300">
										{tabCounts.published}
									</span>
								</div>
							)}
						</TabsTrigger>

						{/* Draft */}
						<TabsTrigger
							value="drafted"
							disabled={isLoading}
							className="group relative flex items-center gap-2 rounded-xl bg-transparent px-4 py-3 text-zinc-400 transition-all duration-300 hover:bg-zinc-800/30 hover:text-zinc-200 data-[state=active]:bg-white data-[state=active]:text-black"
						>
							<div className="h-2 w-2 rounded-full bg-zinc-500 group-data-[state=active]:bg-zinc-700"></div>
							<span className="font-medium">Drafts</span>
							{tabCounts.drafted > 0 && (
								<div className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-zinc-700 px-2">
									<span className="text-xs font-semibold text-zinc-300">
										{tabCounts.drafted}
									</span>
								</div>
							)}
						</TabsTrigger>

						{/* Scheduled */}
						<TabsTrigger
							value="scheduled"
							disabled={isLoading}
							className="group relative flex items-center gap-2 rounded-xl bg-transparent px-4 py-3 text-zinc-400 transition-all duration-300 hover:bg-zinc-800/30 hover:text-zinc-200 data-[state=active]:bg-white data-[state=active]:text-black"
						>
							<div className="h-2 w-2 rounded-full bg-zinc-500 group-data-[state=active]:bg-zinc-700"></div>
							<span className="hidden font-medium sm:inline">Scheduled</span>
							<span className="font-medium sm:hidden">Queue</span>
							{tabCounts.scheduled > 0 && (
								<div className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-zinc-700 px-2">
									<span className="text-xs font-semibold text-zinc-300">
										{tabCounts.scheduled}
									</span>
								</div>
							)}
						</TabsTrigger>

						{/* Webhooks */}
						<TabsTrigger
							value="webhooks"
							disabled={isLoading}
							className="group relative flex items-center gap-2 rounded-xl bg-transparent px-4 py-3 text-zinc-300 transition-all duration-300 hover:bg-zinc-800/30 hover:text-zinc-200 data-[state=active]:bg-white data-[state=active]:text-black"
						>
							<Webhook className="h-4 w-4" />
							<span className="hidden font-medium sm:inline">Webhooks</span>
							<span className="font-medium sm:hidden">Hooks</span>
						</TabsTrigger>

						{/* Settings */}
						<TabsTrigger
							value="settings"
							disabled={isLoading}
							className="group relative flex items-center gap-2 rounded-xl bg-transparent px-4 py-3 text-zinc-400 transition-all duration-300 hover:bg-zinc-800/30 hover:text-zinc-200 data-[state=active]:bg-white data-[state=active]:text-black"
						>
							<Settings className="h-4 w-4" />
							<span className="hidden font-medium sm:inline">Settings</span>
							<span className="font-medium sm:hidden">Config</span>
						</TabsTrigger>
					</TabsList>
				</div>
			</div>
		</div>
	);
}
