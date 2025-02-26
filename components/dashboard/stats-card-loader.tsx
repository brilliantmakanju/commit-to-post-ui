"use client";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export default function StatsCardSkeleton() {
	return (
		<Card className="border-zinc-700/50 bg-zinc-800/50 p-1">
			<CardHeader className="flex flex-row items-center justify-between p-3">
				<Skeleton className="h-4 w-[100px] bg-zinc-700" />
				<Skeleton className="h-4 w-4 rounded-full bg-zinc-700" />
			</CardHeader>
			<CardContent className="p-3 pt-0">
				<Skeleton className="mb-2 h-6 w-[60px] bg-zinc-700" />
				<Skeleton className="h-3 w-[140px] bg-zinc-700" />
			</CardContent>
		</Card>
	);
}
