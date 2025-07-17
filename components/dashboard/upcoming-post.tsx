/* eslint-disable unicorn/no-empty-file */
// "use client";

// import { formatDistanceToNow, parseISO } from "date-fns";
// import {
// 	Calendar,
// 	Clock,
// 	FileText,
// 	Instagram,
// 	Linkedin,
// 	Twitter,
// } from "lucide-react";
// import type {
// 	AwaitedReactNode,
// 	JSXElementConstructor,
// 	Key,
// 	ReactElement,
// 	ReactNode,
// 	ReactPortal,
// } from "react";

// import { Badge } from "@/components/ui/badge";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Skeleton } from "@/components/ui/skeleton";
// import useRetrieveUpcomingPost from "@/hooks/core/upcoming";

// // Helper function to format the date
// const formatDate = (date: string) => {
// 	const d = parseISO(date);
// 	return formatDistanceToNow(d, { addSuffix: true });
// };

// // Platform icon mapping
// const PlatformIcon = ({ platform }: { platform: string }) => {
// 	switch (platform.toLowerCase()) {
// 		case "linkedin": {
// 			return <Linkedin className="h-3.5 w-3.5 text-[#0077B5]" />;
// 		}
// 		case "twitter": {
// 			return <Twitter className="h-3.5 w-3.5 text-[#1DA1F2]" />;
// 		}
// 		case "instagram": {
// 			return <Instagram className="h-3.5 w-3.5 text-[#E1306C]" />;
// 		}
// 		default: {
// 			return <Linkedin className="h-3.5 w-3.5 text-[#0077B5]" />;
// 		}
// 	}
// };

// export function UpcomingPosts({ filter = "all" }: { filter?: string }) {
// 	const { posts, isUpcomingPostsLoading: isMetricsLoading } =
// 		useRetrieveUpcomingPost();

// 	if (isMetricsLoading) {
// 		return <UpcomingPostsSkeleton />;
// 	}

// 	// Filter posts based on the selected filter
// 	const filteredPosts =
// 		filter === "all"
// 			? posts
// 			: posts?.filter((post: { status: string }) => post.status === filter);

// 	if (!filteredPosts || filteredPosts.length === 0) {
// 		return (
// 			<div className="flex h-[300px] flex-col items-center justify-center space-y-4 text-center">
// 				<div className="rounded-full border border-[#232323] bg-[#1A1A1A] p-4">
// 					<FileText className="h-6 w-6 text-zinc-500" />
// 				</div>
// 				<div className="flex flex-col items-center justify-center space-y-2 text-center">
// 					<h3 className="text-lg font-medium text-white">
// 						{filter === "all" ? "No posts found" : `No ${filter} posts found`}
// 					</h3>
// 					<p className="w-[70%] text-center text-sm text-zinc-500">
// 						{filter === "all"
// 							? "No posts have been generated yet."
// 							: `You don't have any ${filter} posts at the moment.`}
// 					</p>
// 				</div>
// 			</div>
// 		);
// 	}

// 	return (
// 		<ScrollArea className="h-[400px]">
// 			<div className="space-y-3 p-4">
// 				{filteredPosts.map(
// 					(post: {
// 						id: Key | null | undefined;
// 						content:
// 							| string
// 							| number
// 							| bigint
// 							| boolean
// 							| ReactElement<any, string | JSXElementConstructor<any>>
// 							| Iterable<ReactNode>
// 							| ReactPortal
// 							| Promise<AwaitedReactNode>
// 							| null
// 							| undefined;
// 						status: string;
// 						created_at: string;
// 						scheduled_publish_time: any;
// 						platform: string;
// 					}) => (
// 						<div
// 							key={post.id}
// 							className="rounded-lg border border-[#232323] bg-[#1A1A1A] p-4 transition-all hover:border-[#2A2A2A] hover:shadow-sm"
// 						>
// 							<p className="line-clamp-2 font-mono text-sm text-zinc-300">
// 								{post.content}
// 							</p>
// 							<div className="mt-3 flex flex-wrap items-center gap-2">
// 								<Badge
// 									variant="outline"
// 									className={`px-2 py-0.5 text-xs font-medium ${
// 										post.status === "published"
// 											? "border-emerald-900/50 bg-emerald-900/20 text-emerald-400"
// 											: post.status === "scheduled"
// 												? "border-[#4F46E5]/30 bg-[#4F46E5]/10 text-[#4F46E5]"
// 												: "border-[#232323] bg-[#1A1A1A] text-zinc-400"
// 									}`}
// 								>
// 									{post.status}
// 								</Badge>

// 								<div className="flex items-center gap-1 rounded-full border border-[#232323] bg-[#1A1A1A] px-2 py-0.5 text-xs text-zinc-400">
// 									<PlatformIcon platform={post.platform || "linkedin"} />
// 									<span>{post.platform || "LinkedIn"}</span>
// 								</div>

// 								<span className="flex items-center gap-1 text-xs text-zinc-500">
// 									<Calendar className="h-3 w-3 text-zinc-500" />
// 									{formatDate(post.created_at)}
// 								</span>

// 								{post.status === "scheduled" && (
// 									<span className="flex items-center gap-1 text-xs text-zinc-500">
// 										<Clock className="h-3 w-3 text-zinc-500" />
// 										{formatDate(`${post.scheduled_publish_time}`)}
// 									</span>
// 								)}
// 							</div>
// 						</div>
// 					),
// 				)}
// 			</div>
// 		</ScrollArea>
// 	);
// }

// export function UpcomingPostsSkeleton() {
// 	return (
// 		<div className="space-y-3 p-4">
// 			{[1, 2, 3].map(index => (
// 				<div
// 					key={index}
// 					className="rounded-lg border border-[#232323] bg-[#1A1A1A] p-4"
// 				>
// 					<div className="space-y-3">
// 						<Skeleton className="h-4 w-3/4 bg-[#232323]" />
// 						<Skeleton className="h-4 w-full bg-[#232323]" />
// 						<div className="flex gap-2">
// 							<Skeleton className="h-5 w-16 rounded-full bg-[#232323]" />
// 							<Skeleton className="h-5 w-20 rounded-full bg-[#232323]" />
// 						</div>
// 					</div>
// 				</div>
// 			))}
// 		</div>
// 	);
// }
