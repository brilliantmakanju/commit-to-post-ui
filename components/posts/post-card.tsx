"use client";

import { useQueryClient } from "@tanstack/react-query";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import {
	Clock,
	Edit,
	Linkedin,
	Loader2,
	MoreHorizontal,
	Trash2,
	Twitter,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { deletePost } from "@/server-actions/core/delete-post";
import { updatePost } from "@/server-actions/core/edit-post";
import { reschedulePost } from "@/server-actions/core/reschedule-post";

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

interface PostCardProps {
	post: Post;
	showFullDate?: boolean;
	onEdit?: (post: Post) => Promise<void>;
	onReschedule?: (post: Post, newDate: Date) => Promise<void>;
	onDelete?: (post: Post) => Promise<void>;
}

const PostCard: React.FC<PostCardProps> = ({
	post,
	showFullDate = false,
	onReschedule,
	onDelete,
}) => {
	const queryClient = useQueryClient();
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [editedPost, setEditedPost] = useState<Post>({ ...post });
	const [rescheduleDate, setRescheduleDate] = useState<Date | undefined>(
		post.actual_publish_time
			? parseISO(post.actual_publish_time)
			: post.scheduled_publish_time
				? parseISO(post.scheduled_publish_time)
				: parseISO(post.created_at),
	);
	// Helper function to format the date.
	const formatDate = (date: string) => {
		const d = parseISO(date);
		return showFullDate
			? format(d, "yyyy-MM-dd'T'HH:mm:ss.SSSSSS'Z'")
			: formatDistanceToNow(d, { addSuffix: true });
	};

	// Determine the badge variant based on post status.
	const badgeVariant =
		post.status === "published"
			? "default"
			: post.status === "scheduled"
				? "secondary"
				: "outline";

	const handleDelete = async () => {
		setIsLoading(true);
		try {
			const deletedPost = await deletePost(post.id);
			if (deletedPost.success) {
				setIsDeleteDialogOpen(false);
				queryClient.fetchQuery({ queryKey: ["posts"] });
				queryClient.invalidateQueries({ queryKey: ["posts"] });
				toast.success("Post deleted successfully");
			} else {
				toast.error("Failed to delete post. Please try again.");
			}
		} catch {
			toast.error("Failed to delete post. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleReschedule = async () => {
		if (rescheduleDate) {
			const date = new Date(rescheduleDate);
			const isoDate = date.toISOString();
			setIsLoading(true);
			try {
				// await onReschedule?.(post, isoDate);
				const updatedSchedule = await reschedulePost(post.id, isoDate);
				if (updatedSchedule.success) {
					queryClient.fetchQuery({ queryKey: ["posts"] });
					queryClient.invalidateQueries({ queryKey: ["posts"] });
					setIsRescheduleDialogOpen(false);
					toast.success("Post rescheduled successfully");
				} else {
					toast.error("Failed to reschedule post. Please try again.");
				}
			} catch {
				toast.error("Failed to reschedule post. Please try again.");
			} finally {
				setIsLoading(false);
			}
		}
	};

	const handleEdit = async () => {
		setIsLoading(true);
		try {
			const updatedPost = await updatePost(post.id, editedPost.content);
			if (updatedPost.success) {
				setIsEditDialogOpen(false);
				queryClient.fetchQuery({ queryKey: ["posts"] });
				queryClient.invalidateQueries({ queryKey: ["posts"] });
				toast.success("Post updated successfully");
			} else {
				toast.error("Failed to update post. Please try again.");
			}
		} catch {
			toast.error("Failed to update post. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			<Card className="single-post">
				<CardContent className="p-4">
					<div className="mb-2 flex items-center justify-between">
						<Badge variant={badgeVariant}>{post.status}</Badge>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" className="h-8 w-8 p-0">
									<MoreHorizontal className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
									<Edit className="mr-2 h-4 w-4" />
									<span>Edit</span>
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => setIsRescheduleDialogOpen(true)}
								>
									<Clock className="mr-2 h-4 w-4" />
									<span>Reschedule</span>
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)}>
									<Trash2 className="mr-2 h-4 w-4" />
									<span>Delete</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
					<p className="mb-2 line-clamp-3 text-sm text-gray-600 dark:text-gray-300">
						{post.content}
					</p>
					<div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
						<div className="flex items-center">
							{post.platform === "twitter" ? (
								<Twitter className="mr-1 h-4 w-4 text-blue-400" />
							) : (
								<Linkedin className="mr-1 h-4 w-4 text-blue-600" />
							)}
							<span>
								{post.platform.charAt(0).toUpperCase() + post.platform.slice(1)}
							</span>
						</div>
						<span>{formatDate(post.created_at)}</span>
					</div>
				</CardContent>
			</Card>

			{/* Delete Confirmation Dialog */}
			<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Post</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete this post? This action cannot be
							undone.
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
							onClick={handleDelete}
							disabled={isLoading}
						>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Deleting...
								</>
							) : (
								"Delete"
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Reschedule Dialog */}
			<Dialog
				open={isRescheduleDialogOpen}
				onOpenChange={setIsRescheduleDialogOpen}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Reschedule Post</DialogTitle>
						<DialogDescription>
							Choose a new date and time for your post.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="flex h-auto flex-col items-start justify-start gap-4">
							<Label htmlFor="date" className="text-right">
								Date
							</Label>
							<Calendar
								initialFocus
								mode="single"
								className="w-full"
								selected={rescheduleDate}
								onSelect={setRescheduleDate}
								disabled={date =>
									date < new Date() ||
									date > new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
								}
							/>
						</div>
						<div className="flex flex-col items-start justify-start gap-4">
							<Label htmlFor="time" className="text-right">
								Time
							</Label>
							<Input
								id="time"
								type="time"
								value={rescheduleDate ? format(rescheduleDate, "HH:mm") : ""}
								onChange={event => {
									const [hours, minutes] = event.target.value.split(":");
									const newDate = new Date(rescheduleDate || new Date());
									newDate.setHours(
										Number.parseInt(hours),
										Number.parseInt(minutes),
									);
									setRescheduleDate(newDate);
								}}
								className="col-span-3"
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsRescheduleDialogOpen(false)}
						>
							Cancel
						</Button>
						<Button onClick={handleReschedule} disabled={isLoading}>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Rescheduling...
								</>
							) : (
								"Reschedule"
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Edit Dialog */}
			<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Edit Post</DialogTitle>
						<DialogDescription>
							Make changes to your post here. Click save when you&apos;re done.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="flex flex-col items-start justify-center gap-4">
							<Label htmlFor="content" className="text-right">
								Content
							</Label>
							<Textarea
								id="content"
								value={editedPost.content}
								onChange={event =>
									setEditedPost({ ...editedPost, content: event.target.value })
								}
								rows={6}
								className="col-span-3"
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsEditDialogOpen(false)}
						>
							Cancel
						</Button>
						<Button onClick={handleEdit} disabled={isLoading}>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Saving...
								</>
							) : (
								"Save changes"
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default PostCard;
