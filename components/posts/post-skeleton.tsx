"use client";
// eslint-disable-next-line import/no-unresolved
import { Card, CardContent } from "@/components/ui/card";
// eslint-disable-next-line import/no-unresolved
import { Skeleton } from "@/components/ui/skeleton";

export default function SkeletonPostCard() {
	return (
		<Card className="single-post">
			<CardContent className="p-4">
				<div className="mb-2 flex items-center justify-between">
					<Skeleton className="h-5 w-20" /> {/* Status badge */}
					<Skeleton className="h-8 w-8 rounded-full" /> {/* Menu button */}
				</div>
				<div className="mb-2 space-y-2">
					<Skeleton className="h-4 w-full" /> {/* Content line 1 */}
					<Skeleton className="h-4 w-4/5" /> {/* Content line 2 */}
					<Skeleton className="h-4 w-2/3" /> {/* Content line 3 */}
				</div>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Skeleton className="h-4 w-4 rounded-full" /> {/* Platform icon */}
						<Skeleton className="h-4 w-16" /> {/* Platform name */}
					</div>
					<Skeleton className="h-4 w-24" /> {/* Date */}
				</div>
			</CardContent>
		</Card>
	);
}
