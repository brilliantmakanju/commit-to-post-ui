/* eslint-disable import/no-unresolved */
import { format, parseISO } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { PostGroup, PostItem } from "@/types";

import { getPlatformIcon } from "../utils/post-icons";
import { getBadgeStyles, getStatusLabel } from "../utils/post-utils";

interface MobileListViewProps {
	group: PostGroup;
	currentPost: PostItem | undefined;
	selectedPosts: Set<string>;
	onPostSelect: (post: PostItem) => void;
	onToggleSelection: (postId: string) => void;
}

export default function MobileListView({
	group,
	currentPost,
	selectedPosts,
	onPostSelect,
	onToggleSelection,
}: MobileListViewProps) {
	return (
		<>
			<DialogHeader className="flex-shrink-0 border-b border-zinc-800/50 pb-4">
				<div className="flex items-start justify-between">
					<div className="min-w-0 flex-1 text-start">
						<DialogTitle className="text-lg font-medium text-zinc-100">
							Select Post
						</DialogTitle>
						<DialogDescription className="mt-1 text-sm text-zinc-400">
							{group.posts.length} posts available
						</DialogDescription>
					</div>
				</div>
			</DialogHeader>

			<div className="flex-1 overflow-hidden">
				<div className="scrollbar-hide h-full overflow-y-auto">
					<div className="grid grid-cols-1 gap-2">
						{group.posts.map(post => (
							<div
								key={post.id}
								className={`cursor-pointer rounded-2xl border p-4 transition-all duration-200 ${
									currentPost?.id === post.id
										? "border-zinc-500 bg-zinc-900/80 ring-2 ring-blue-500/50"
										: "border-zinc-800/50 bg-zinc-800/20 hover:border-zinc-600 hover:bg-zinc-700/30"
								}`}
								onClick={() => onPostSelect(post)}
							>
								<div className="mb-2 flex items-center justify-between gap-2">
									<div className="flex items-center gap-3">
										<Checkbox
											onClick={event_ => {
												event_.stopPropagation(); // prevent parent handlers from firing
												onToggleSelection(post.id);
											}}
											checked={selectedPosts.has(post.id)}
											className="border-zinc-600 data-[state=checked]:bg-zinc-700"
										/>

										{getPlatformIcon(post.platform)}
									</div>
									<Badge
										variant="outline"
										className={`text-xs font-semibold ${getBadgeStyles(post.status)}`}
									>
										{getStatusLabel(post.status)}
									</Badge>
								</div>
								<p className="line-clamp-2 text-xs leading-relaxed text-zinc-400">
									{post.content}
								</p>
								<div className="mt-2 text-[10px] text-zinc-500">
									{post.created_at &&
										format(
											parseISO(post.created_at),
											"MMM d, yyyy 'at' h:mm a",
										)}
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</>
	);
}
