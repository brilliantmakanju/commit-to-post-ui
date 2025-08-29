"use client";

import { UUID } from "node:crypto";

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
import { useParams } from "next/navigation";
import type React from "react";
import { useState } from "react";
import { FaDiscord, FaLinkedin, FaSlack, FaTwitter } from "react-icons/fa";
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

import { Card, CardContent, CardHeader } from "../ui/card";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "../ui/tooltip";

interface Post {
	id: string;
	content: string;
	created_at: string;
	updated_at: string;
	is_deleted: boolean;
	image_urls: string[];
	organization: string;
	is_inactive: boolean;
	posted_channels: string[];
	planned_channels: string[];
	actual_publish_time: string | null | undefined;
	scheduled_publish_time: string | null | undefined;
	status: "published" | "scheduled" | "drafted";
	// video_url: string | null;
	// post_group: string | null;
	// original_status: string | null;
	// platform: "twitter" | "linkedin";
}

interface PostCardProps {
	post: Post;
	showFullDate?: boolean;
}

// Status badge styling
const getBadgeStyles = (status: string) => {
	switch (status) {
		case "published": {
			return "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20";
		}
		case "drafted": {
			return "bg-gray-500/10 text-gray-400 border-gray-500/20 hover:bg-gray-500/20";
		}
		case "scheduled": {
			return "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20";
		}
		default: {
			return "bg-gray-500/10 text-gray-400 border-gray-500/20 hover:bg-gray-500/20";
		}
	}
};

const getChannelIcon = (channel: string) => {
	const iconClass = "h-4 w-4 transition-all duration-200";
	switch (channel) {
		case "linkedin": {
			return (
				<FaLinkedin
					className={`${iconClass} text-blue-400 hover:text-blue-300`}
				/>
			);
		}
		case "twitter": {
			return (
				<FaTwitter className={`${iconClass} text-sky-400 hover:text-sky-300`} />
			);
		}
		case "slack": {
			return (
				<FaSlack
					className={`${iconClass} text-purple-400 hover:text-purple-300`}
				/>
			);
		}
		case "discord": {
			return (
				<FaDiscord
					className={`${iconClass} text-indigo-400 hover:text-indigo-300`}
				/>
			);
		}
		default: {
			return;
		}
	}
};

const getChannelName = (channel: string) => {
	switch (channel) {
		case "linkedin": {
			return "LinkedIn";
		}
		case "twitter": {
			return "Twitter";
		}
		case "slack": {
			return "Slack";
		}
		case "discord": {
			return "Discord";
		}
		default: {
			return channel;
		}
	}
};

const PostCard: React.FC<PostCardProps> = ({ post, showFullDate = false }) => {
	const maxLength = 190;
	const params = useParams();
	const hasAccess = useCheckAccess();
	const queryClient = useQueryClient();
	const [isExpanded, setIsExpanded] = useState(false);
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
			const deletedPost = await deletePost(params.id as UUID, post.id);
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
				const updatedSchedule = await reschedulePost(
					params.id as UUID,
					post.id,
					isoDate,
				);
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
			const updatedPost = await updatePost(
				params.id as UUID,
				post.id,
				editedPost.content,
			);
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

	const getRelevantDate = () => {
		switch (post.status) {
			case "published": {
				return post.actual_publish_time
					? formatDate(post.actual_publish_time)
					: formatDate(post.created_at);
			}
			case "scheduled": {
				return post.scheduled_publish_time
					? `Scheduled for ${formatDate(post.scheduled_publish_time)}`
					: formatDate(post.created_at);
			}
			default: {
				return formatDate(post.created_at);
			}
		}
	};

	const shouldTruncate = post.content.length > maxLength;
	const displayContent =
		shouldTruncate && !isExpanded
			? post.content.slice(0, Math.max(0, maxLength)) + "..."
			: post.content;

	return (
		<>
			<Card
				key={post.id}
				className="group relative overflow-hidden rounded-xl border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700/70 hover:bg-zinc-900/70 hover:shadow-lg hover:shadow-black/20"
			>
				<CardHeader className="pb-4">
					<div className="flex items-start justify-between">
						<Badge
							variant="outline"
							className={`${getBadgeStyles(post.status)} rounded-full px-3 py-1 text-xs font-medium transition-all duration-200`}
						>
							{post.status.charAt(0).toUpperCase() + post.status.slice(1)}
						</Badge>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									className="h-8 w-8 rounded-full p-0 text-zinc-500 opacity-0 transition-all duration-200 hover:bg-zinc-800/50 hover:text-zinc-300 group-hover:opacity-100"
								>
									<MoreHorizontal className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								align="end"
								className="rounded-lg border border-zinc-800/50 bg-zinc-900/95 text-zinc-300 shadow-xl backdrop-blur-md"
							>
								{post.status !== "published" && (
									<>
										<DropdownMenuItem
											onClick={() => setIsEditDialogOpen(true)}
											className="rounded-md transition-all duration-200 focus:bg-zinc-800/50 focus:text-zinc-100"
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
												className="rounded-md transition-all duration-200 focus:bg-zinc-800/50 focus:text-zinc-100"
											>
												<Clock className="mr-2 h-4 w-4" />
												<span>Reschedule</span>
											</DropdownMenuItem>
										) : (
											<TooltipProvider>
												<Tooltip>
													<TooltipTrigger asChild>
														<DropdownMenuItem
															onClick={() => {}}
															className="rounded-md transition-all duration-200 focus:bg-zinc-800/50 focus:text-zinc-100"
														>
															<Clock className="mr-2 h-4 w-4" />
															<span>Reschedule</span>
														</DropdownMenuItem>
													</TooltipTrigger>
													<TooltipContent className="rounded-lg border border-zinc-700/50 bg-zinc-800/95 text-white backdrop-blur-md">
														<p>
															Feature not available for basic plan, upgrade to
															use feature
														</p>
													</TooltipContent>
												</Tooltip>
											</TooltipProvider>
										)}
									</>
								)}
								<DropdownMenuItem
									onClick={() => setIsDeleteDialogOpen(true)}
									className="rounded-md transition-all duration-200 focus:bg-red-500/10 focus:text-red-400"
								>
									<Trash2 className="mr-2 h-4 w-4" />
									<span>Delete</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="whitespace-pre-wrap break-words leading-relaxed text-zinc-100">
						{displayContent}
						{shouldTruncate && (
							<button
								onClick={() => setIsExpanded(!isExpanded)}
								className="ml-2 text-sm font-medium text-blue-400 transition-colors duration-200 hover:text-blue-300"
							>
								{isExpanded ? "Show less" : "Show more"}
							</button>
						)}
					</div>

					<div className="flex items-center justify-between border-t border-zinc-800/50 pt-4">
						{post.status === "published" ? (
							<div className="flex items-center space-x-3">
								<span className="text-xs font-medium text-zinc-500">
									Posted to:
								</span>
								<div className="flex items-center space-x-2">
									{post.posted_channels.map(channel => (
										<div
											key={channel}
											title={getChannelName(channel)}
											className="cursor-pointer rounded-full bg-zinc-800/50 p-1.5 transition-all duration-200 hover:bg-zinc-700/50"
										>
											{getChannelIcon(channel)}
										</div>
									))}
								</div>
							</div>
						) : (
							<div className="flex items-center space-x-3">
								<span className="text-xs font-medium text-zinc-500">
									Post to:
								</span>
								<div className="flex items-center space-x-2">
									{post.planned_channels.map(channel => (
										<div
											key={channel}
											title={getChannelName(channel)}
											className="cursor-pointer rounded-full bg-zinc-800/50 p-1.5 transition-all duration-200 hover:bg-zinc-700/50"
										>
											{getChannelIcon(channel)}
										</div>
									))}
								</div>
							</div>
						)}
						<div className="text-xs font-medium text-zinc-500">
							{getRelevantDate()}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Delete Confirmation Dialog */}
			<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<DialogContent className="rounded-xl border border-zinc-800/50 bg-zinc-900/95 text-zinc-300 backdrop-blur-md">
					<DialogHeader>
						<DialogTitle className="text-zinc-100">Delete Post</DialogTitle>
						<DialogDescription className="text-zinc-400">
							Are you sure you want to delete this post? This action cannot be
							undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsDeleteDialogOpen(false)}
							className="border-zinc-700/50 bg-zinc-800/50 text-zinc-300 transition-all duration-200 hover:bg-zinc-700/50 hover:text-zinc-100"
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={handleDelete}
							disabled={isLoading}
							className="border border-red-500/20 bg-red-500/10 text-red-400 transition-all duration-200 hover:border-red-500/30 hover:bg-red-500/20"
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
				<DialogContent className="w-auto rounded-xl border border-zinc-800/50 bg-zinc-900/95 text-zinc-300 backdrop-blur-md">
					<DialogHeader>
						<DialogTitle className="text-zinc-100">Reschedule Post</DialogTitle>
						<DialogDescription className="text-zinc-400">
							Choose a new date and time for your post.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="flex h-auto flex-col items-start justify-start gap-4">
							<Label htmlFor="date" className="font-medium text-zinc-300">
								Date
							</Label>
							<Calendar
								initialFocus
								mode="single"
								className="w-full rounded-lg border border-zinc-800/50 bg-zinc-900/50 text-zinc-300"
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
							<Label htmlFor="time" className="font-medium text-zinc-300">
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
								className="col-span-3 rounded-lg border-zinc-800/50 bg-zinc-900/50 text-zinc-300 transition-all duration-200 focus:border-zinc-700/50"
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsRescheduleDialogOpen(false)}
							className="border-zinc-700/50 bg-zinc-800/50 text-zinc-300 transition-all duration-200 hover:bg-zinc-700/50 hover:text-zinc-100"
						>
							Cancel
						</Button>
						<Button
							onClick={handleReschedule}
							disabled={isLoading}
							className="border border-blue-500/20 bg-blue-500/10 text-blue-400 transition-all duration-200 hover:border-blue-500/30 hover:bg-blue-500/20"
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
				<DialogContent className="w-full max-w-2xl rounded-xl border border-zinc-800/50 bg-zinc-900/95 text-zinc-300 backdrop-blur-md">
					<DialogHeader>
						<DialogTitle className="text-zinc-100">Edit Post</DialogTitle>
						<DialogDescription className="text-zinc-400">
							Make changes to your post here. Click save when you&apos;re done.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="flex flex-col items-start justify-center gap-4">
							<Label htmlFor="content" className="font-medium text-zinc-300">
								Content
							</Label>
							<Textarea
								id="content"
								value={editedPost.content}
								onChange={event =>
									setEditedPost({ ...editedPost, content: event.target.value })
								}
								rows={12}
								className="col-span-3 resize-none rounded-lg border-zinc-800/50 bg-zinc-900/50 text-zinc-300 transition-all duration-200 focus:border-zinc-700/50"
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsEditDialogOpen(false)}
							className="border-zinc-700/50 bg-zinc-800/50 text-zinc-300 transition-all duration-200 hover:bg-zinc-700/50 hover:text-zinc-100"
						>
							Cancel
						</Button>
						<Button
							onClick={handleEdit}
							disabled={isLoading}
							className="border border-green-500/20 bg-green-500/10 text-green-400 transition-all duration-200 hover:border-green-500/30 hover:bg-green-500/20"
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
