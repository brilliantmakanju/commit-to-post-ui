"use client";

import type { UUID } from "node:crypto";

import { format, formatDistanceToNow, parseISO } from "date-fns";
import {
	Calendar,
	ChevronDown,
	Hash,
	Linkedin,
	Loader2,
	MessageSquare,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { deletePost } from "@/server-actions/core/delete-post";

import PostCard from "./post-card";

type PostStatus = "published" | "scheduled" | "drafted";

interface PostItem {
	id: string;
	content: string;
	created_at: string;
	updated_at: string;
	is_deleted: boolean;
	image_urls: string[];
	organization: string;
	is_inactive: boolean;
	video_url: string | null;
	posted_channels: string[];
	planned_channels: string[];
	post_group: string | null;
	original_status: string | null;
	actual_publish_time: string | null;
	scheduled_publish_time: string | null;
	status: PostStatus;
}

interface PostGroup {
	group_id: UUID;
	posts: PostItem[];
	latest_created_at: string;
	repo_name?: string;
	commit_message?: string;
}

interface GroupedPostCardProps {
	group: PostGroup;
	showFullDate?: boolean;
}

// Platform icon mapping
const getPlatformIcon = (platform: string) => {
	switch (platform.toLowerCase()) {
		case "linkedin": {
			return <Linkedin className="h-3 w-3" />;
		}
		case "slack": {
			return <MessageSquare className="h-3 w-3" />;
		}
		case "discord": {
			return <Hash className="h-3 w-3" />;
		}
		default: {
			return <MessageSquare className="h-3 w-3" />;
		}
	}
};

// Status badge styling
const getBadgeStyles = (status: PostStatus) => {
	switch (status) {
		case "published": {
			return "bg-white text-black border-zinc-700";
		}
		case "scheduled": {
			return "bg-blue-100 text-blue-800 border-blue-200";
		}
		case "drafted": {
			return "bg-zinc-100 text-zinc-600 border-zinc-300";
		}
		default: {
			return "bg-zinc-100 text-zinc-600 border-zinc-300";
		}
	}
};

const getStatusLabel = (status: PostStatus) => {
	switch (status) {
		case "published": {
			return "Published";
		}
		case "scheduled": {
			return "Scheduled";
		}
		case "drafted": {
			return "Draft";
		}
		default: {
			return status;
		}
	}
};

// Tile component for grid layout
const PostTile = ({
	post,
	isOverflow = false,
	overflowCount = 0,
}: {
	post: PostItem;
	isOverflow?: boolean;
	overflowCount?: number;
}) => {
	const channels =
		post.status === "scheduled" ? post.planned_channels : post.posted_channels;

	return (
		<div
			className={`relative rounded-lg border p-3 transition-colors ${post.status === "drafted" ? "border-zinc-200 bg-zinc-50" : ""} ${post.status === "scheduled" ? "border-blue-200 bg-blue-50" : ""} ${post.status === "published" ? "border-zinc-200 bg-white" : ""} hover:border-zinc-300`}
		>
			{isOverflow ? (
				<div className="flex h-full min-h-[80px] items-center justify-center text-zinc-500">
					<span className="text-sm font-medium">+{overflowCount} more</span>
				</div>
			) : (
				<>
					{/* Status badge - top right */}
					<Badge
						variant="outline"
						className={`absolute right-2 top-2 text-xs ${getBadgeStyles(post.status)}`}
					>
						{getStatusLabel(post.status)}
					</Badge>

					{/* Content */}
					<p className="mb-3 line-clamp-3 pr-16 text-xs text-zinc-700">
						{post.content}
					</p>

					{/* Platform icons - bottom left */}
					<div className="flex gap-1">
						{channels.map((channel, index) => (
							<div
								key={index}
								className="rounded bg-zinc-100 p-1 text-zinc-600"
								title={channel}
							>
								{getPlatformIcon(channel)}
							</div>
						))}
					</div>
				</>
			)}
		</div>
	);
};

export default function GroupedPostCard({
	group,
	showFullDate = false,
}: GroupedPostCardProps) {
	const [showEditDialog, setShowEditDialog] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());

	// If only one post, render individual PostCard
	if (group.posts.length === 1) {
		return <PostCard post={group.posts[0]} showFullDate={showFullDate} />;
	}

	const formatDate = (date: string) => {
		const d = parseISO(date);
		return showFullDate
			? format(d, "PPP 'at' pp")
			: formatDistanceToNow(d, { addSuffix: true });
	};

	const handleDeleteSelected = async () => {
		if (selectedPosts.size === 0) return;

		setIsLoading(true);
		try {
			await Promise.all(
				[...selectedPosts].map(postId => deletePost("" as UUID, postId)),
			);
			setSelectedPosts(new Set());
			toast.success(`${selectedPosts.size} posts deleted successfully`);
		} catch {
			// console.error("Failed to delete posts:", error);
			toast.error("Failed to delete posts");
		} finally {
			setIsLoading(false);
		}
	};

	const togglePostSelection = (postId: string) => {
		const newSelected = new Set(selectedPosts);
		if (newSelected.has(postId)) {
			newSelected.delete(postId);
		} else {
			newSelected.add(postId);
		}
		setSelectedPosts(newSelected);
	};

	const selectAll = () => {
		if (selectedPosts.size === group.posts.length) {
			setSelectedPosts(new Set());
		} else {
			setSelectedPosts(new Set(group.posts.map(p => p.id)));
		}
	};

	// Grid layout logic
	const renderPostGrid = () => {
		const postCount = group.posts.length;

		if (postCount === 2) {
			return (
				<div className="grid grid-cols-2 gap-2">
					<PostTile post={group.posts[0]} />
					<PostTile post={group.posts[1]} />
				</div>
			);
		}

		if (postCount === 3) {
			return (
				<div className="grid grid-cols-2 grid-rows-2 gap-2">
					<PostTile post={group.posts[0]} />
					<PostTile post={group.posts[1]} />
					<div className="col-span-2">
						<PostTile post={group.posts[2]} />
					</div>
				</div>
			);
		}

		if (postCount === 4) {
			return (
				<div className="grid grid-cols-2 grid-rows-2 gap-2">
					<PostTile post={group.posts[0]} />
					<PostTile post={group.posts[1]} />
					<PostTile post={group.posts[2]} />
					<PostTile post={group.posts[3]} />
				</div>
			);
		}

		// More than 4 posts
		return (
			<div className="grid grid-cols-2 grid-rows-2 gap-2">
				<PostTile post={group.posts[0]} />
				<PostTile post={group.posts[1]} />
				<PostTile post={group.posts[2]} />
				<PostTile
					post={group.posts[3]}
					isOverflow={true}
					overflowCount={postCount - 3}
				/>
			</div>
		);
	};

	return (
		<>
			<Card className="group relative overflow-hidden transition-all hover:shadow-md">
				<CardHeader className="space-y-0 pb-3">
					<div className="flex items-center justify-between">
						<Badge variant="secondary" className="text-xs">
							Post Group ({group.posts.length})
						</Badge>
					</div>
				</CardHeader>

				<CardContent className="pb-4">
					{/* Post Grid */}
					<div className="mb-4">{renderPostGrid()}</div>

					{/* Footer */}
					<div className="flex items-center justify-between text-xs text-zinc-500">
						<span>Created {formatDate(group.latest_created_at)}</span>
						{group.repo_name && (
							<span className="font-mono">{group.repo_name}</span>
						)}
					</div>
				</CardContent>

				{/* Hover overlay */}
				<div className="absolute inset-0 flex items-center justify-center bg-white/90 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
					<Button
						variant="outline"
						onClick={() => setShowEditDialog(true)}
						className="shadow-sm"
					>
						<ChevronDown className="mr-2 h-4 w-4" />
						View/Edit Group
					</Button>
				</div>
			</Card>

			{/* Edit Group Modal */}
			<Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
				<DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Edit Post Group</DialogTitle>
						{group.commit_message && (
							<DialogDescription>
								{group.posts.length} posts from commit{" "}
								<span className="rounded bg-zinc-100 px-1 font-mono text-xs">
									{group.commit_message}
								</span>
							</DialogDescription>
						)}
					</DialogHeader>

					{/* Bulk Controls */}
					<div className="flex items-center gap-4 rounded-lg bg-zinc-50 p-4">
						<div className="flex items-center space-x-2">
							<Checkbox
								id="select-all"
								checked={selectedPosts.size === group.posts.length}
								onCheckedChange={selectAll}
							/>
							<label htmlFor="select-all" className="text-sm font-medium">
								Select All
							</label>
						</div>

						<Button
							variant="outline"
							size="sm"
							onClick={handleDeleteSelected}
							disabled={selectedPosts.size === 0 || isLoading}
							className="ml-auto bg-transparent"
						>
							{isLoading ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : (
								<Trash2 className="mr-2 h-4 w-4" />
							)}
							Delete Selected ({selectedPosts.size})
						</Button>

						<Button
							variant="outline"
							size="sm"
							disabled={selectedPosts.size === 0}
						>
							<Calendar className="mr-2 h-4 w-4" />
							Reschedule All
						</Button>
					</div>

					{/* Post List */}
					<div className="space-y-4">
						{group.posts.map(post => {
							const channels =
								post.status === "scheduled"
									? post.planned_channels
									: post.posted_channels;

							return (
								<div key={post.id} className="rounded-lg border">
									<Collapsible>
										<div className="flex items-center p-4">
											<Checkbox
												checked={selectedPosts.has(post.id)}
												onCheckedChange={() => togglePostSelection(post.id)}
												className="mr-3"
											/>

											<CollapsibleTrigger className="flex flex-1 items-center justify-between text-left">
												<div className="flex items-center gap-3">
													{channels.map((channel, index) => (
														<div
															key={index}
															className="flex items-center gap-1"
														>
															{getPlatformIcon(channel)}
															<span className="text-sm font-medium capitalize">
																{channel}
															</span>
														</div>
													))}
													<Badge
														variant="outline"
														className={getBadgeStyles(post.status)}
													>
														{getStatusLabel(post.status)}
													</Badge>
												</div>
												<ChevronDown className="h-4 w-4" />
											</CollapsibleTrigger>
										</div>

										<CollapsibleContent>
											<div className="space-y-4 px-4 pb-4">
												<Textarea
													defaultValue={post.content}
													className="min-h-[100px]"
													placeholder="Post content..."
												/>

												<div className="flex items-center justify-between">
													<div className="text-sm text-zinc-500">
														{post.scheduled_publish_time && (
															<span>
																Scheduled:{" "}
																{format(
																	parseISO(post.scheduled_publish_time),
																	"PPP 'at' pp",
																)}
															</span>
														)}
													</div>

													<Button
														variant="outline"
														size="sm"
														onClick={() => togglePostSelection(post.id)}
													>
														<Trash2 className="mr-2 h-4 w-4" />
														Delete
													</Button>
												</div>
											</div>
										</CollapsibleContent>
									</Collapsible>
								</div>
							);
						})}
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
