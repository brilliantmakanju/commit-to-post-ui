"use client";

import { format, formatDistanceToNow } from "date-fns";
import {
	CalendarIcon as IconCalendar,
	Clock,
	Edit,
	Linkedin,
	Loader2,
	MoreHorizontal,
	Trash2,
	Twitter,
} from "lucide-react";
import React, { useState } from "react";

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
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface Post {
	id: string;
	content: string;
	created_at: string;
	image_urls: string[];
	is_deleted: boolean;
	is_inactive: boolean;
	organization: string;
	original_status: string | null;
	platform: "linkedin" | "twitter";
	post_group: string | null;
	status: "published" | "scheduled" | "drafted";
	updated_at: string;
	video_url: string | null;
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
	onEdit,
	onReschedule,
	onDelete,
}) => {
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [editedPost, setEditedPost] = useState<Post>({ ...post });
	const [rescheduleDate, setRescheduleDate] = useState<Date | undefined>(
		new Date(post.created_at),
	);

	// Helper function to format the date.
	const formatDate = (date: string) => {
		const d = new Date(date);
		return showFullDate
			? format(d, "MMM d, yyyy")
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
			await onDelete?.(post);
			setIsDeleteDialogOpen(false);
		} catch (error) {
			console.error("Error deleting post:", error);
			// Handle error (e.g., show error message to user)
		} finally {
			setIsLoading(false);
		}
	};

	const handleReschedule = async () => {
		if (rescheduleDate) {
			setIsLoading(true);
			try {
				await onReschedule?.(post, rescheduleDate);
				setIsRescheduleDialogOpen(false);
			} catch (error) {
				console.error("Error rescheduling post:", error);
				// Handle error (e.g., show error message to user)
			} finally {
				setIsLoading(false);
			}
		}
	};

	const handleEdit = async () => {
		setIsLoading(true);
		try {
			await onEdit?.(editedPost);
			setIsEditDialogOpen(false);
		} catch (error) {
			console.error("Error editing post:", error);
			// Handle error (e.g., show error message to user)
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
						<div className="flex flex-col items-start justify-start gap-4">
							<Label htmlFor="platform" className="text-right">
								Platform
							</Label>
							<Select
								value={editedPost.platform}
								onValueChange={(value: "twitter" | "linkedin") =>
									setEditedPost({ ...editedPost, platform: value })
								}
							>
								<SelectTrigger className="col-span-3">
									<SelectValue placeholder="Select platform" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="twitter">Twitter</SelectItem>
									<SelectItem value="linkedin">LinkedIn</SelectItem>
								</SelectContent>
							</Select>
						</div>
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
