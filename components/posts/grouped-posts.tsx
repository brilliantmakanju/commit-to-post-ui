/* eslint-disable import/no-unresolved */
"use client";

import { format, formatDistanceToNow, parseISO } from "date-fns";
import {
	ChevronDown,
	Clock,
	Edit,
	Linkedin,
	Loader2,
	MoreHorizontal,
	Trash2,
	Twitter,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deletePost } from "@/server-actions/core/delete-post";

import PostCard from "./post-card";

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

interface GroupedPosts {
	group_id: string;
	posts: Post[];
	latest_created_at: string;
}

interface GroupedPostCardProps {
	group: GroupedPosts;
	showFullDate?: boolean;
}

export default function GroupedPostCard({
	group,
	showFullDate = false,
}: GroupedPostCardProps) {
	const [showPostsDialog, setShowPostsDialog] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const platformCounts = group.posts.reduce(
		(accumulator, post) => {
			accumulator[post.platform] = (accumulator[post.platform] || 0) + 1;
			return accumulator;
		},
		{} as Record<string, number>,
	);

	// Get the latest post from the group
	const latestPost = group.posts.reduce((latest, current) => {
		return new Date(current.created_at) > new Date(latest.created_at)
			? current
			: latest;
	}, group.posts[0]);

	const formatDate = (date: string) => {
		const d = parseISO(date);
		return showFullDate
			? format(d, "PPP 'at' pp")
			: formatDistanceToNow(d, { addSuffix: true });
	};

	const handleDeleteGroup = async () => {
		setIsLoading(true);
		try {
			// Delete all posts in the group
			await Promise.all(group.posts.map(post => deletePost(post.id)));
			setIsDeleteDialogOpen(false);
			toast.success("Post group deleted successfully");
		} catch {
			toast.error("Failed to delete post group");
		} finally {
			setIsLoading(false);
		}
	};

	const getStatusCounts = () => {
		const counts = group.posts.reduce(
			(accumulator, post) => {
				accumulator[post.status] = (accumulator[post.status] || 0) + 1;
				return accumulator;
			},
			{} as Record<string, number>,
		);
		return counts;
	};

	const statusCounts = getStatusCounts();

	return (
		<>
			<Card className="group relative overflow-hidden transition-all hover:shadow-md">
				<CardHeader className="space-y-0 pb-2">
					<div className="flex items-center justify-between">
						<div className="flex gap-2">
							{Object.entries(statusCounts).map(([status, count]) => (
								<Badge
									key={status}
									variant={
										status === "published"
											? "default"
											: status === "scheduled"
												? "secondary"
												: "outline"
									}
								>
									{count} {status}
								</Badge>
							))}
						</div>
						{/* <DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" className="h-8 w-8 p-0">
									<MoreHorizontal className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)}>
									<Trash2 className="mr-2 h-4 w-4" />
									<span>Delete Group</span>
								</DropdownMenuItem>
								<DropdownMenuItem>
									<Clock className="mr-2 h-4 w-4" />
									<span>Schedule All</span>
								</DropdownMenuItem>
								<DropdownMenuItem>
									<Edit className="mr-2 h-4 w-4" />
									<span>Edit All</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu> */}
					</div>
				</CardHeader>

				<CardContent className="pb-2">
					<div className="mb-4">
						<p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
							{latestPost.content}
						</p>
					</div>
					<div className="flex items-center justify-between text-xs text-gray-500">
						<div className="flex items-center gap-4">
							<div className="flex items-center gap-1">
								<Twitter className="h-4 w-4 text-blue-400" />
								<span>{platformCounts["twitter"] || 0}</span>
							</div>
							<div className="flex items-center gap-1">
								<Linkedin className="h-4 w-4 text-blue-600" />
								<span>{platformCounts["linkedin"] || 0}</span>
							</div>
						</div>
						<span>Created {formatDate(group.latest_created_at)}</span>
					</div>
				</CardContent>

				<CardFooter className="pt-2">
					<Button
						variant="ghost"
						className="w-full justify-center"
						onClick={() => setShowPostsDialog(true)}
					>
						<ChevronDown className="mr-2 h-4 w-4" />
						Show All Posts ({group.posts.length})
					</Button>
				</CardFooter>
			</Card>

			<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Post Group</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete this group of {group.posts.length}{" "}
							posts? This action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsDeleteDialogOpen(false)}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={handleDeleteGroup}
							disabled={isLoading}
						>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Deleting...
								</>
							) : (
								"Delete Group"
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
			<Dialog open={showPostsDialog} onOpenChange={setShowPostsDialog}>
				<DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Group Posts</DialogTitle>
						<DialogDescription>
							Showing all {group.posts.length} posts in this group
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						{group.posts.map(post => (
							<PostCard key={post.id} post={post} showFullDate={showFullDate} />
						))}
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
