/* eslint-disable import/no-unresolved */
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { PostGroup } from "@/types";

import { getLayoutConfig } from "../utils/post-utils";
import PostCard from "./post-card";

interface PostGridProps {
	group: PostGroup;
	onPostClick: (postId: string) => void;
	onShowMoreClick: () => void;
}

export default function PostGrid({
	group,
	onPostClick,
	onShowMoreClick,
}: PostGridProps) {
	const layoutConfig = getLayoutConfig(group.posts.length);
	const postsToShow = group.posts.slice(0, layoutConfig.visiblePosts);

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
						<PostCard
							key={`${post.id}_${index}`}
							post={post}
							index={index}
							onClick={onPostClick}
						/>
					))}
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
					)}
				</div>
			</CardContent>
		</Card>
	);
}
