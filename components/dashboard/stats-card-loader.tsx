"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function StatsCardSkeleton() {
	return (
		<Card className="flex h-full flex-col overflow-hidden border border-[#232323] bg-[#121212]">
			<CardHeader className="flex flex-row items-center justify-between pb-2">
				<Skeleton className="h-4 w-24 bg-[#232323]" />
				<Skeleton className="h-8 w-8 rounded-md bg-[#232323]" />
			</CardHeader>
			<CardContent className="flex flex-1 flex-col justify-between">
				<Skeleton className="h-8 w-16 bg-[#232323]" />
				<Skeleton className="mt-2 h-3 w-32 bg-[#232323]" />
			</CardContent>
		</Card>
	);
}
