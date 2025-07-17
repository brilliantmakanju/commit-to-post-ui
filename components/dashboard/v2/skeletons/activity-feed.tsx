"use client";

export function ActivityFeedSkeleton() {
	return (
		<div className="mt-4 space-y-6">
			{Array.from({ length: 5 }).map((_, index) => (
				<div key={index} className="flex items-start space-x-4">
					<div className="mt-0.5 h-5 w-5 animate-pulse rounded-full bg-zinc-800" />
					<div className="flex-grow space-y-2">
						<div className="h-4 w-4/5 animate-pulse rounded bg-zinc-800" />
						<div className="space-y-2">
							<div className="flex items-center space-x-3">
								<div className="h-4 w-4 animate-pulse rounded bg-zinc-800" />
								<div className="h-3 w-20 animate-pulse rounded bg-zinc-800" />
							</div>
						</div>
					</div>
					<div className="h-4 w-12 flex-shrink-0 animate-pulse rounded bg-zinc-800" />
				</div>
			))}
		</div>
	);
}
