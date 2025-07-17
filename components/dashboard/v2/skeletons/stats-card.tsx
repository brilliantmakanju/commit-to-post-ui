"use client";
import {
	Card,
	CardContent,
	CardHeader,
	// eslint-disable-next-line import/no-unresolved
} from "@/components/ui/card";
// eslint-disable-next-line import/no-unresolved
import { Skeleton } from "@/components/ui/skeleton";

export function StatCardsSkeleton() {
	return (
		<div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-3">
			{Array.from({ length: 3 }).map((_, index) => (
				<Card
					key={index}
					className="flex h-[150px] flex-col items-start justify-between border-zinc-800/50 bg-zinc-900/40 backdrop-blur-sm"
				>
					<CardHeader className="flex w-full flex-row items-center justify-between space-y-0 pb-2">
						<Skeleton className="h-4 w-[150px] bg-zinc-800/50" />
						<Skeleton className="h-4 w-4 bg-zinc-800/50" />
					</CardHeader>
					<CardContent className="w-full">
						<Skeleton className="mb-2 h-7 w-8 bg-zinc-800/50" />
						<Skeleton className="h-3 w-full bg-zinc-800/50" />
					</CardContent>
				</Card>
			))}
		</div>
	);
}
