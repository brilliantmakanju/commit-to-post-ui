"use client";

// Skeleton Component
export function RepoTableSkeleton() {
	return (
		<div className="w-full space-y-4">
			<div className="flex items-center justify-between px-4 pb-2.5 pt-3.5">
				<div className="h-5 w-2/5 animate-pulse rounded bg-zinc-800" />
				<div className="h-5 w-1/5 animate-pulse rounded bg-zinc-800" />
				<div className="h-5 w-1/5 animate-pulse rounded bg-zinc-800" />
				<div className="h-5 w-10 animate-pulse rounded bg-zinc-800" />
			</div>
			<div className="space-y-2">
				{Array.from({ length: 3 }).map((_, index) => (
					<div
						key={index}
						className="flex items-center space-x-4 rounded-md border border-zinc-800/50 p-4"
					>
						<div className="flex-1">
							<div className="h-5 w-3/4 animate-pulse rounded bg-zinc-800" />
						</div>
						<div className="w-[180px]">
							<div className="h-5 w-1/2 animate-pulse rounded bg-zinc-800" />
						</div>
						<div className="w-[240px]">
							<div className="h-5 w-1/2 animate-pulse rounded bg-zinc-800" />
						</div>
						<div className="flex w-[50px] justify-center">
							<div className="mx-auto h-6 w-6 animate-pulse rounded-full bg-zinc-800" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
