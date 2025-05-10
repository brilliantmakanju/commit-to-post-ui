import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function SkeletonPostCard() {
	return (
		<Card className="border border-zinc-800 bg-zinc-950">
			<CardHeader className="pb-2">
				<div className="flex items-center justify-between">
					<Skeleton className="h-5 w-20 bg-zinc-900" />
					<Skeleton className="h-8 w-8 rounded-full bg-zinc-900" />
				</div>
			</CardHeader>
			<CardContent>
				<div className="space-y-2">
					<Skeleton className="h-4 w-full bg-zinc-900" />
					<Skeleton className="h-4 w-3/4 bg-zinc-900" />
					<Skeleton className="h-4 w-1/2 bg-zinc-900" />
				</div>
				<div className="mt-4 flex items-center justify-between">
					<Skeleton className="h-3 w-24 bg-zinc-900" />
					<Skeleton className="h-3 w-24 bg-zinc-900" />
				</div>
			</CardContent>
		</Card>
	);
}
