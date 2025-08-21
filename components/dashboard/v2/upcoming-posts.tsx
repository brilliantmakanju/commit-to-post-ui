/* eslint-disable import/no-unresolved */
"use client";
import { formatDistanceToNow, parseISO } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import useRetrieveUpcomingPost from "@/hooks/core/upcoming";

export const UpcomingPosts = () => {
	const { posts: data, isUpcomingPostsLoading } = useRetrieveUpcomingPost();

	if (isUpcomingPostsLoading) {
		return <UpcomingPostsSkeleton />;
	}

	if (!data || data.length === 0) {
		return (
			<div className="flex h-[302px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 text-center">
				<p className="text-sm font-medium text-muted-foreground">
					No upcoming posts.
				</p>
				<p className="mt-1 text-xs text-zinc-500">
					When you schedule a post or save a draft, it will appear here.
				</p>
			</div>
		);
	}

	return (
		<div className="no-scrollbar h-[304px] max-h-[306px] overflow-x-auto">
			<Table className="w-full">
				<TableHeader>
					<TableRow className="border-zinc-800 hover:bg-transparent">
						{/* <TableHead className="w-[100px] text-start font-medium text-zinc-300">
							Channel
						</TableHead> */}
						<TableHead className="min-w-[100px] max-w-[300px] text-start font-medium text-zinc-300">
							Post
						</TableHead>
						<TableHead className="w-[120px] text-start font-medium text-zinc-300">
							Status
						</TableHead>
						<TableHead className="w-[150px] text-start font-medium text-zinc-300">
							Date
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{data.slice(0, 5).map((post, index) => (
						<TableRow
							key={index}
							className="group border-zinc-800/50 hover:bg-zinc-900/30"
						>
							{/* <TableCell className="flex items-center gap-2 text-zinc-400">
								{post.platform.map((p: any, index_: number) => (
									<span key={index_}>{platformIconMap[p]}</span>
								))}
							</TableCell> */}
							<TableCell>
								<p className="max-w-sm truncate font-medium">{post.content}</p>
								<p className="text-xs text-zinc-500">{post.repo}</p>
							</TableCell>
							<TableCell>
								<Badge
									variant={
										post.status === "Scheduled" ? "secondary" : "default"
									}
								>
									{post.status}
								</Badge>
							</TableCell>
							<TableCell className="text-xs text-zinc-400">
								{formatDistanceToNow(parseISO(post.date), { addSuffix: true })}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
};

export const UpcomingPostsSkeleton = () => {
	return (
		<div className="no-scrollbar flex h-[304px] flex-col items-start justify-start gap-4 overflow-x-auto">
			{Array.from({ length: 4 }).map((_, index) => (
				<div
					key={index}
					className="flex w-full items-center justify-between gap-4 rounded-md border border-zinc-800/40 bg-zinc-900/40 p-3"
				>
					<Skeleton className="h-5 w-5 rounded-full" />
					<div className="flex-1 space-y-1">
						<Skeleton className="h-4 w-[80%]" />
						<Skeleton className="h-3 w-[50%]" />
					</div>
					<Skeleton className="h-5 w-20" />
					<Skeleton className="h-4 w-24" />
				</div>
			))}
		</div>
	);
};
