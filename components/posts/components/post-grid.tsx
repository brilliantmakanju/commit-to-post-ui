/* eslint-disable import/no-unresolved */
import { useMemo } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { useCreatePostModal } from "@/hooks/core/use-createpost-modal";
import { cn } from "@/lib/utils";
import type { FlattenedPostGroup, PostItem } from "@/types";

import { getLayoutConfig } from "../utils/post-utils";
import PostCard from "./post-card";

interface PostGridProps {
	group: FlattenedPostGroup;
}

export default function PostGrid({ group }: PostGridProps) {
	// Group posts by platform and select the most relevant one per platform
	const representativePosts = useMemo(() => {
		const postsByPlatform = new Map<string, PostItem[]>();

		// Group posts by platform
		group.posts.forEach(post => {
			const platform = post.platform;
			if (!postsByPlatform.has(platform)) {
				postsByPlatform.set(platform, []);
			}
			postsByPlatform.get(platform)!.push(post);
		});

		// Select the most relevant post per platform
		const selected: PostItem[] = [];
		postsByPlatform.forEach((posts, platform) => {
			let selectedPost = posts[0]; // Default fallback

			// Priority 1: Published posts
			const publishedPosts = posts.filter(p => p.status === "published");
			if (publishedPosts.length > 0) {
				selectedPost = publishedPosts[0];
			}
			// Priority 2: Scheduled posts (if no published)
			else {
				const scheduledPosts = posts.filter(p => p.status === "scheduled");
				if (scheduledPosts.length > 0) {
					selectedPost = scheduledPosts[0];
				}
				// Priority 3: Original post (if no published/scheduled)
				else {
					const originalPosts = posts.filter(p => p.is_original === true);
					selectedPost = originalPosts.length > 0 ? originalPosts[0] : posts[0];
				}
			}

			selected.push(selectedPost);
		});

		return selected;
	}, [group.posts]);

	const { openCreatePostModal } = useCreatePostModal();

	const layoutConfig = getLayoutConfig(representativePosts.length);
	const postsToShow = representativePosts.slice(0, layoutConfig.visiblePosts);

	return (
		<Card
			className={cn(
				"group relative flex aspect-square h-[200px] w-full flex-col overflow-hidden rounded-xl border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700/70 hover:bg-zinc-900/70 hover:shadow-lg hover:shadow-black/20 sm:h-[240px] md:h-[280px]",
			)}
		>
			<CardContent className="flex h-full w-full items-center justify-center p-1 sm:p-1.5">
				<div
					className={cn(
						"relative grid h-full w-full gap-1 sm:gap-1.5",
						layoutConfig.gridClass,
					)}
				>
					{postsToShow.map((post, index) => (
						<div
							onClick={() => {
								openCreatePostModal({
									platform:
										(post.platform as "linkedin") || "twitter" || "discord",
									posts: group.posts,
									selectedPost: post,
								});
							}}
							key={`${post.id}+${post.created_at}_${index}_${post.source_commit_message}`}
							className="h-full w-full border-none bg-transparent"
						>
							<PostCard post={post} index={index} />
						</div>
					))}
					{/* 					
					{layoutConfig.showOverlay && (
						<div
							onClick={onShowMoreClick}
							className="absolute left-1/2 top-1/2 z-20 flex h-12 w-16 -translate-x-1/2 -translate-y-1/2 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-lg bg-black/80 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-black/90 sm:h-16 sm:w-20 sm:gap-1"
						>
							<div className="text-sm font-bold text-white sm:text-lg">
								+{layoutConfig.remainingCount}
							</div>
							<div className="text-[10px] text-zinc-300 sm:text-xs">
								Show More
							</div>
						</div>
					)} */}
				</div>
			</CardContent>
		</Card>
	);
}
