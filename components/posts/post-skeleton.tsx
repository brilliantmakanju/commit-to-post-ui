import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function SkeletonPostCard() {
	return (
		<Card className="group relative flex aspect-square h-[227px] w-full flex-col overflow-hidden rounded-xl border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700/70 hover:bg-zinc-900/70 hover:shadow-lg hover:shadow-black/20">
			<CardContent className="flex h-[227px] w-full items-center justify-center p-1.5">
				<div className="flex h-full w-full gap-1.5">
					{Array.from({ length: 3 }).map((_, index) => (
						<div
							key={index}
							className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-zinc-800/50 bg-zinc-900/50 p-3 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700/70 hover:bg-zinc-900/70 hover:shadow-lg hover:shadow-black/20"
						>
							{/* Simulated Icon */}
							<Skeleton className="h-5 w-5 rounded-full bg-zinc-800" />

							{/* Simulated Badge */}
							<Skeleton className="h-5 w-14 rounded-md bg-zinc-800" />
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
