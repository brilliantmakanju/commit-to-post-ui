import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function SkeletonPostCard() {
	return (
		<Card className="group relative overflow-hidden rounded-xl border border-zinc-800/50 bg-zinc-900/50 shadow backdrop-blur-sm transition-all duration-300">
			<CardHeader className="pb-4">
				<div className="flex items-start justify-between">
					{/* Status Badge Skeleton */}
					<Skeleton className="h-6 w-20 rounded-full bg-zinc-900" />

					{/* Dots Dropdown Icon */}
					<Skeleton className="h-8 w-8 rounded-full bg-zinc-900" />
				</div>
			</CardHeader>

			<CardContent className="space-y-6">
				{/* Fake post content */}
				<div className="space-y-2">
					<Skeleton className="h-4 w-full bg-zinc-900" />
					<Skeleton className="h-4 w-4/5 bg-zinc-900" />
					<Skeleton className="h-4 w-3/4 bg-zinc-900" />
				</div>

				{/* Footer (posted to + date) */}
				<div className="flex items-center justify-between border-t border-zinc-800/50 pt-4">
					{/* Channels */}
					<div className="flex items-center space-x-3">
						<Skeleton className="h-4 w-16 bg-zinc-900" />
						<div className="flex items-center space-x-2">
							<Skeleton className="h-6 w-6 rounded-full bg-zinc-900" />
							<Skeleton className="h-6 w-6 rounded-full bg-zinc-900" />
						</div>
					</div>
					{/* Date */}
					<Skeleton className="h-4 w-20 bg-zinc-900" />
				</div>
			</CardContent>
		</Card>
	);
}
