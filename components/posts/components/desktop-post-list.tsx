/* eslint-disable import/no-unresolved */
import { format, parseISO } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { PostGroup, PostItem } from "@/types";

import { getPlatformIcon } from "../utils/post-icons";
import { getBadgeStyles, getStatusLabel } from "../utils/post-utils";

interface DesktopPostListProps {
	group: PostGroup;
	currentPost: PostItem | undefined;
	selectedPosts: Set<string>;
	onPostSelect: (post: PostItem) => void;
	onToggleSelection: (postId: string) => void;
}

export default function DesktopPostList({
	group,
	currentPost,
	selectedPosts,
	onPostSelect,
	onToggleSelection,
}: DesktopPostListProps) {
	return (
		<div className="flex min-h-0 w-full flex-shrink-0 flex-col lg:w-80 xl:lg:w-96">
			<div className="scrollbar-hide flex-1 overflow-y-auto">
				<div className="scrollbar-hide grid grid-cols-1 gap-2 overflow-y-auto px-2 py-4">
					{group.posts.map(post => (
						<div
							key={post.id}
							className={`relative cursor-pointer rounded-2xl border p-4 transition-all duration-200 ${
								selectedPosts.has(post.id)
									? "border-zinc-600 bg-zinc-800/60"
									: "border-zinc-800/50 bg-zinc-800/20 hover:border-zinc-600 hover:bg-zinc-700/30"
							} ${
								currentPost?.id === post.id
									? "border-zinc-500 bg-zinc-900/80 ring-2 ring-blue-500/50"
									: ""
							}`}
							onClick={() => {
								onPostSelect(post);
							}}
						>
							<div className="mb-2 flex items-center justify-between gap-2">
								<div className="flex items-start justify-start gap-3">
									<Checkbox
										onClick={() => {
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

							<p className="line-clamp-2 pr-6 text-xs leading-relaxed text-zinc-400">
								{post.content}
							</p>
							<div
								className={`mt-2 text-[10px] transition-all duration-200 ${
									currentPost?.id === post.id
										? "font-medium text-zinc-300"
										: "text-zinc-500"
								}`}
							>
								{post.created_at &&
									format(parseISO(post.created_at), "MMM d, yyyy 'at' h:mm a")}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
