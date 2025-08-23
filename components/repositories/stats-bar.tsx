"use client";

interface StatsBarProps {
	activeTab: string;
	searchQuery: string;
	sortBy: string;
}

export default function StatsBar({
	activeTab,
	searchQuery,
	sortBy,
}: StatsBarProps) {
	return (
		<div className="flex items-center justify-between rounded-xl border border-zinc-800/30 bg-zinc-900/30 p-4 backdrop-blur-sm">
			<div className="flex items-center gap-4">
				<div className="flex items-center gap-2">
					<div className="h-2 w-2 rounded-full bg-blue-400"></div>
					<span className="text-sm text-zinc-400">
						{activeTab === "all"
							? "All Posts"
							: `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Posts`}
					</span>
				</div>
				{searchQuery && (
					<div className="flex items-center gap-2">
						<div className="h-4 w-1 rounded-full bg-zinc-700"></div>
						<span className="text-sm text-zinc-500">
							Filtered by:{" "}
							<span className="font-medium text-zinc-300">
								&quot;{searchQuery}&quot;
							</span>
						</span>
					</div>
				)}
			</div>
			<div className="text-sm text-zinc-500">
				{sortBy === "latest" ? "Newest to Oldest" : "Oldest to Newest"}
			</div>
		</div>
	);
}
