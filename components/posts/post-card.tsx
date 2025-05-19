"use client";

import { truncate } from "node:fs";

import { useQueryClient } from "@tanstack/react-query";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import {
	Clock,
	Edit,
	Info,
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
import { useCheckAccess } from "@/hooks/plans/use-billing";
import { deletePost } from "@/server-actions/core/delete-post";
import { updatePost } from "@/server-actions/core/edit-post";
import { reschedulePost } from "@/server-actions/core/reschedule-post";

import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "../ui/tooltip";

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
	const hasAccess = useCheckAccess();
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
				const updatedSchedule = await reschedulePost(post.id, isoDate);
				if (updatedSchedule.success) {
					queryClient.fetchQuery({ queryKey: ["posts"] });
					queryClient.invalidateQueries({ queryKey: ["posts"] });
					setIsRescheduleDialogOpen(false);
					toast.success("Post rescheduled successfully");
				} else {
					toast.error(
						updatedSchedule.data ??
							"Failed to reschedule post. Please try again.",
					);
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

	// Status badge styling
	const getBadgeStyles = () => {
		switch (post.status) {
			case "published": {
				return "bg-zinc-900 text-zinc-100 border-zinc-700";
			}
			case "scheduled": {
				return "bg-zinc-800 text-zinc-200 border-zinc-700";
			}
			case "drafted": {
				return "bg-transparent text-zinc-400 border-zinc-700";
			}
			default: {
				return "bg-transparent text-zinc-400 border-zinc-700";
			}
		}
	};

	return (
		<>
			<div
				key={post.id}
				className="flex flex-col gap-3 rounded-lg border border-zinc-800 bg-zinc-950 p-5 transition-all hover:border-zinc-700"
			>
				<div className="flex w-full items-center justify-between">
					<div className="flex items-center justify-start gap-4">
						<Badge variant="outline" className={`${getBadgeStyles()}`}>
							{post.status}
						</Badge>
						<div className="flex items-center justify-between text-xs text-zinc-500">
							<div className="flex items-center">
								{post.platform === "linkedin" ? (
									<Linkedin className="mr-1 h-4 w-4 text-zinc-400" />
								) : (
									<Twitter className="mr-1 h-4 w-4 text-zinc-400" />
								)}
							</div>
						</div>
					</div>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								className="h-8 w-8 p-0 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
							>
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align="end"
							className="border border-zinc-800 bg-zinc-950 text-zinc-300"
						>
							<DropdownMenuItem
								onClick={() => setIsEditDialogOpen(true)}
								className="focus:bg-zinc-900 focus:text-zinc-100"
							>
								<Edit className="mr-2 h-4 w-4" />
								<span>Edit</span>
							</DropdownMenuItem>
							{hasAccess ? (
								<DropdownMenuItem
									disabled={!hasAccess}
									onClick={() => {
										hasAccess && setIsRescheduleDialogOpen(true);
									}}
									className="focus:bg-zinc-900 focus:text-zinc-100"
								>
									<Clock className="mr-2 h-4 w-4" />
									<span>Reschedule</span>
								</DropdownMenuItem>
							) : (
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<DropdownMenuItem
												// disabled={true}
												onClick={() => {}}
												className="focus:bg-zinc-900 focus:text-zinc-100"
											>
												<Clock className="mr-2 h-4 w-4" />
												<span>Reschedule</span>
											</DropdownMenuItem>
										</TooltipTrigger>
										<TooltipContent className="border border-zinc-700 bg-zinc-800 text-white">
											<p>
												Feature not available for free plan , upgrade to use
												feature
											</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							)}
							<DropdownMenuItem
								onClick={() => setIsDeleteDialogOpen(true)}
								className="focus:bg-zinc-900 focus:text-zinc-100"
							>
								<Trash2 className="mr-2 h-4 w-4" />
								<span>Delete</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
				<p className="mb-2 line-clamp-3 text-sm text-zinc-300">
					{post.content}
				</p>
				<div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-zinc-800/50 pt-2">
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

			{/* Delete Confirmation Dialog */}
			<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<DialogContent className="border border-zinc-800 bg-zinc-950 text-zinc-300">
					<DialogHeader>
						<DialogTitle>Delete Post</DialogTitle>
						<DialogDescription className="text-zinc-400">
							Are you sure you want to delete this post? This action cannot be
							undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsDeleteDialogOpen(false)}
							className="border-zinc-800 text-zinc-900 hover:bg-zinc-900 hover:text-zinc-100"
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={handleDelete}
							disabled={isLoading}
							className="bg-zinc-900 text-zinc-100 hover:bg-zinc-800"
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
				open={isRescheduleDialogOpen && hasAccess}
				onOpenChange={setIsRescheduleDialogOpen}
			>
				<DialogContent className="w-auto border border-zinc-800 bg-zinc-950 text-zinc-300">
					<DialogHeader>
						<DialogTitle>Reschedule Post</DialogTitle>
						<DialogDescription className="text-zinc-400">
							Choose a new date and time for your post.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="flex h-auto flex-col items-start justify-start gap-4">
							<Label htmlFor="date" className="text-zinc-300">
								Date
							</Label>
							<Calendar
								initialFocus
								mode="single"
								className="w-full rounded-md border border-zinc-800 bg-zinc-950 text-zinc-300"
								selected={rescheduleDate}
								onSelect={setRescheduleDate}
								disabled={date => {
									// Get today's date and set time to midnight for proper comparison
									const today = new Date();
									today.setHours(0, 0, 0, 0);

									// Calculate date 2 weeks from today
									const twoWeeksFromNow = new Date(today);
									twoWeeksFromNow.setDate(today.getDate() + 14);

									// Disable dates before today or after 2 weeks from today
									return date < today || date > twoWeeksFromNow;
								}}
							/>
						</div>
						<div className="flex flex-col items-start justify-start gap-4">
							<Label htmlFor="time" className="text-zinc-300">
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
								className="col-span-3 border-zinc-800 bg-zinc-950 text-zinc-300"
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsRescheduleDialogOpen(false)}
							className="border-zinc-800 text-zinc-900 hover:bg-zinc-900 hover:text-zinc-100"
						>
							Cancel
						</Button>
						<Button
							onClick={handleReschedule}
							disabled={isLoading}
							className="bg-zinc-900 text-zinc-100 hover:bg-zinc-800"
						>
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
				<DialogContent className="w-full border border-zinc-800 bg-zinc-950 text-zinc-300">
					<DialogHeader>
						<DialogTitle>Edit Post</DialogTitle>
						<DialogDescription className="text-zinc-400">
							Make changes to your post here. Click save when you&apos;re done.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="flex flex-col items-start justify-center gap-4">
							<Label htmlFor="content" className="text-zinc-300">
								Content
							</Label>
							<Textarea
								id="content"
								value={editedPost.content}
								onChange={event =>
									setEditedPost({ ...editedPost, content: event.target.value })
								}
								rows={12}
								className="col-span-3 border-zinc-800 bg-zinc-950 text-zinc-300"
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsEditDialogOpen(false)}
							className="border-zinc-800 text-zinc-900 hover:bg-zinc-900 hover:text-zinc-100"
						>
							Cancel
						</Button>
						<Button
							onClick={handleEdit}
							disabled={isLoading}
							className="bg-zinc-900 text-zinc-100 hover:bg-zinc-800"
						>
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
