/* eslint-disable import/no-unresolved */
"use client";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow, parseISO } from "date-fns";
import { FileText, Linkedin } from "lucide-react";
import {
	AwaitedReactNode,
	JSXElementConstructor,
	Key,
	ReactElement,
	ReactNode,
	ReactPortal,
	useState,
} from "react";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import useRetrieveUpcomingPost from "@/hooks/core/upcoming";
import { fetchPosts } from "@/server-actions/core/get-posts";

interface Post {
	id: string;
	content: string;
	platform: "twitter" | "linkedin";
	status: "published" | "scheduled" | "drafted";
	original_status: string | null;
	image_urls: string[];
	video_url: string | null;
	is_deleted: boolean;
	is_inactive: boolean;
	post_group: string | null;
	created_at: string;
	updated_at: string;
	scheduled_publish_time: string | null;
	actual_publish_time: string | null;
	organization: string;
}
// Helper function to format the date.
const formatDate = (date: string) => {
	const d = parseISO(date);
	return formatDistanceToNow(d, { addSuffix: true });
};

export function UpcomingPosts() {
	const { posts, isMetricsLoading } = useRetrieveUpcomingPost();
	if (isMetricsLoading) {
		return <UpcomingPostsSkeleton />;
	}

	if (posts && posts.length === 0) {
		return (
			<div className="flex h-[450px] flex-col items-center justify-center space-y-4 text-center">
				<div className="rounded-full bg-muted/10 p-4">
					<FileText className="h-6 w-6 text-muted-foreground/80" />
				</div>
				<div className="flex flex-col items-center justify-center space-y-2 text-center">
					<h3 className="text-lg font-medium text-muted-foreground/90">
						No AI-generated posts yet
					</h3>
					<p className="w-[50%] text-center text-sm text-muted-foreground/60">
						No posts have been generated. Please visit the settings page to
						connect your account and start generating posts.
					</p>
				</div>
			</div>
		);
	}

	return (
		<ScrollArea className="h-full">
			<div className="space-y-4 p-4">
				{posts.map(
					(post: {
						id: Key | null | undefined;
						content:
							| string
							| number
							| bigint
							| boolean
							| ReactElement<any, string | JSXElementConstructor<any>>
							| Iterable<ReactNode>
							| ReactPortal
							| Promise<AwaitedReactNode>
							| null
							| undefined;
						status:
							| string
							| number
							| bigint
							| boolean
							| ReactElement<any, string | JSXElementConstructor<any>>
							| Iterable<ReactNode>
							| Promise<AwaitedReactNode>
							| null
							| undefined;
						created_at: string;
						scheduled_publish_time: any;
					}) => (
						<div
							key={post.id}
							className="flex flex-col gap-2 rounded-lg bg-zinc-700/30 p-4"
						>
							<p className="line-clamp-3 text-xs text-zinc-400">
								{post.content}
							</p>
							<div className="flex flex-wrap items-center gap-2">
								<Badge
									variant="outline"
									className={` ${post.status === "published" ? "bg-green-900/30 text-green-400" : ""} ${post.status === "scheduled" ? "bg-blue-900/30 text-blue-400" : ""} ${post.status === "drafted" ? "bg-zinc-700 text-zinc-300" : ""} `}
								>
									{post.status}
								</Badge>

								<div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
									<div className="flex items-center">
										<Linkedin className="mr-1 h-4 w-4 text-blue-600" />
									</div>
								</div>
								<span className="text-xs text-zinc-500">
									Created {formatDate(post.created_at)}
								</span>
								{post.status === "scheduled" && (
									<span className="text-xs text-zinc-500">
										Scheduled {formatDate(`${post.scheduled_publish_time}`)}
									</span>
								)}
							</div>
						</div>
					),
				)}
			</div>
		</ScrollArea>
	);
}

export function UpcomingPostsSkeleton() {
	return (
		<div className="space-y-4 p-4">
			{[1, 2, 3].map(index => (
				<div
					key={index}
					className="animate-pulse rounded-lg bg-zinc-700/30 p-4"
				>
					<div className="space-y-3">
						<div className="flex items-start justify-between">
							<Skeleton className="h-4 w-3/4 bg-zinc-600" />
							<Skeleton className="h-8 w-8 rounded-full bg-zinc-600" />
						</div>
						<Skeleton className="h-3 w-full bg-zinc-600" />
						<Skeleton className="h-3 w-3/4 bg-zinc-600" />
						<div className="flex gap-2">
							<Skeleton className="h-5 w-16 rounded-full bg-zinc-600" />
							<Skeleton className="h-5 w-20 rounded-full bg-zinc-600" />
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
