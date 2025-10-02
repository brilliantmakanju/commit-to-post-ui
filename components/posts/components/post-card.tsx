/* eslint-disable import/no-unresolved */
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PostItem } from "@/types";

import { getChannelIcon } from "../utils/post-icons";
import { getBadgeStyles, getStatusLabel } from "../utils/post-utils";

interface PostCardProps {
	post: PostItem;
	index: number;
}

export default function PostCard({ post, index }: PostCardProps) {
	return (
		<div
			key={`${post.id}_${index}`}
			className={cn(
				"flex h-full w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700/70 hover:bg-zinc-900/70 hover:shadow-lg hover:shadow-black/20 sm:gap-2",
			)}
		>
			{getChannelIcon(post.platform)}
			<Badge
				variant="outline"
				className={cn(
					"px-1 py-0.5 text-[10px] font-semibold sm:px-2 sm:text-xs",
					getBadgeStyles(post.status),
				)}
			>
				{getStatusLabel(post.status)}
			</Badge>
		</div>
	);
}
