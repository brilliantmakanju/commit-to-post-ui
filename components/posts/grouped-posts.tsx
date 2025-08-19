"use client";

import { UUID } from "node:crypto";

import { useQueryClient } from "@tanstack/react-query";
import {
	format,
	formatDistanceToNow,
	parseISO,
	setHours,
	setMinutes,
} from "date-fns";
import { CalendarClock, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
	FaCalendarAlt,
	FaDiscord,
	FaEdit,
	FaLinkedin,
	FaSlack,
	FaTrash,
} from "react-icons/fa";
import { toast } from "sonner";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { deletePost } from "@/server-actions/core/delete-post";
import { updatePost } from "@/server-actions/core/edit-post";
import { reschedulePost } from "@/server-actions/core/reschedule-post";
import type { PostGroup, PostItem, PostStatus } from "@/types";

interface GroupedPostCardProps {
	group: PostGroup;
}

const getStatusIndicatorColor = (status: PostStatus) => {
	switch (status) {
		case "published": {
			return "bg-green-500";
		}
		case "scheduled": {
			return "bg-blue-500";
		}
		case "drafted": {
			return "bg-gray-500";
		}
		default: {
			return "bg-gray-500";
		}
	}
};

const XIcon: React.FC<{ className?: string }> = ({ className }) => (
	<svg viewBox="0 0 24 24" className={className} fill="currentColor">
		<path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932L18.901 1.153ZM17.61 20.644h2.039L6.486 3.24H4.298L17.61 20.644Z" />
	</svg>
);

const getBadgeStyles = (status: PostStatus) => {
	switch (status) {
		case "published": {
			return "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20";
		}
		case "scheduled": {
			return "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20";
		}
		case "drafted": {
			return "bg-gray-500/10 text-gray-400 border-gray-500/20 hover:bg-gray-500/20";
		}
		default: {
			return "bg-gray-500/10 text-gray-400 border-gray-500/20";
		}
	}
};

const getChannelIcon = (channel: string) => {
	const iconClass = "h-5 w-5 transition-all duration-200";
	switch (channel) {
		case "linkedin": {
			return <FaLinkedin className={`${iconClass} text-blue-300`} />;
		}
		case "twitter": {
			return <XIcon className={`${iconClass} text-sky-300`} />;
		}
		case "slack": {
			return <FaSlack className={`${iconClass} text-purple-300`} />;
		}
		case "discord": {
			return <FaDiscord className={`${iconClass} text-indigo-300`} />;
		}
		default: {
			return;
		}
	}
};

const getStatusLabel = (status: PostStatus) => {
	return status.charAt(0).toUpperCase() + status.slice(1);
};

const getLayoutConfig = (count: number) => {
	if (count <= 3) {
		// 1-3 posts: display side by side
		return {
			showOverlay: false,
			visiblePosts: count,
			gridClass: count === 3 ? "grid-cols-3" : `grid-cols-${count}`,
		};
	} else if (count === 4) {
		// 4 posts: 2x2 grid
		return {
			visiblePosts: 4,
			showOverlay: false,
			gridClass: "grid-cols-2 grid-rows-2",
		};
	} else {
		// 5+ posts: 2x2 grid with overlay
		return {
			visiblePosts: 4,
			showOverlay: true,
			remainingCount: count - 4,
			gridClass: "grid-cols-2 grid-rows-2",
		};
	}
};

const itemClasses = (count: number, index: number) => {
	if (count === 3) {
		if (index === 0) return "col-span-2";
		return "col-span-1";
	}
	return "";
};

export default function GroupedPostCard({ group }: GroupedPostCardProps) {
	const params = useParams();
	const queryClient = useQueryClient();
	const [isLoading, setIsLoading] = useState(false);
	const [editedContent, setEditedContent] = useState("");
	const [editingPost, setEditingPost] = useState<PostItem | undefined>();
	const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
	const [reschedulingPosts, setReschedulingPosts] = useState<PostItem[]>([]);
	const [newScheduleDate, setNewScheduleDate] = useState<Date | undefined>(
		new Date(),
	);
	const [newScheduleTime, setNewScheduleTime] = useState("12:00");

	// Separate states for dialog and accordion
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [openAccordionItem, setOpenAccordionItem] = useState<
		string | undefined
	>();

	const [isPageLoading, setIsPageLoading] = useState(true);
	const layoutConfig = getLayoutConfig(group.posts.length);
	const postsToShow = group.posts.slice(0, layoutConfig.visiblePosts);

	const markLoaded = useCallback(() => {
		// Delay just to ensure rendering complete (optional but useful)
		requestAnimationFrame(() => {
			setIsPageLoading(false);
		});
	}, []);

	useEffect(() => {
		// Only run once on mount
		markLoaded();
	}, [markLoaded]);
	const refreshData = () => {
		queryClient.invalidateQueries({ queryKey: ["posts"] });
		queryClient.fetchQuery({ queryKey: ["posts"] });
	};

	const startReschedule = (posts: PostItem[]) => {
		const postsToReschedule = posts.filter(p => p.status !== "published");
		if (postsToReschedule.length > 0) {
			setReschedulingPosts(postsToReschedule);
			const initialDate = postsToReschedule[0]?.scheduled_publish_time
				? parseISO(postsToReschedule[0].scheduled_publish_time)
				: new Date();
			setNewScheduleDate(initialDate);
			setNewScheduleTime(format(initialDate, "HH:mm"));
		} else {
			toast.error(
				"Cannot reschedule: No draft or scheduled posts to reschedule.",
			);
		}
	};

	const handleReschedule = async () => {
		if (!newScheduleDate || reschedulingPosts.length === 0) return;
		setIsLoading(true);
		try {
			const [hours, minutes] = newScheduleTime.split(":").map(Number);
			const finalDate = setMinutes(setHours(newScheduleDate, hours), minutes);
			await Promise.all(
				reschedulingPosts.map(post =>
					reschedulePost(params.id as UUID, post.id, finalDate.toISOString()),
				),
			);
			refreshData();
			setReschedulingPosts([]);
			toast.success(
				`${reschedulingPosts.length} ${reschedulingPosts.length === 1 ? "post" : "posts"} rescheduled successfully.`,
			);
		} catch {
			toast.error("Failed to reschedule posts.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleDeleteSelected = async () => {
		if (selectedPosts.size === 0) return;
		setIsLoading(true);
		try {
			await Promise.all(
				[...selectedPosts].map(postId => deletePost(params.id as UUID, postId)),
			);
			setSelectedPosts(new Set());
			refreshData();
			toast.success(`${selectedPosts.size} posts deleted successfully.`);
		} catch {
			toast.error("Failed to delete posts.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleDeleteSingle = async (postId: string) => {
		setIsLoading(true);
		try {
			await deletePost(params.id as UUID, postId);
			refreshData();
			toast.success("Post deleted successfully.");
			const newSelected = new Set(selectedPosts);
			newSelected.delete(postId);
			setSelectedPosts(newSelected);
		} catch {
			toast.error("Failed to delete post.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleDeleteGroup = async () => {
		setIsLoading(true);
		try {
			await Promise.all(
				group.posts.map(post => deletePost(params.id as UUID, post.id)),
			);
			refreshData();
			toast.success("Post group deleted successfully.");
		} catch {
			toast.error("Failed to delete post group.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleEditPost = async () => {
		if (!editingPost) return;
		setIsLoading(true);
		try {
			await updatePost(params.id as UUID, editingPost.id, editedContent);
			setEditingPost(undefined);
			setEditedContent("");
			refreshData();
			toast.success("Post updated successfully.");
		} catch {
			toast.error("Failed to update post.");
		} finally {
			setIsLoading(false);
		}
	};

	const togglePostSelection = (postId: string) => {
		const newSelected = new Set(selectedPosts);
		if (newSelected.has(postId)) newSelected.delete(postId);
		else newSelected.add(postId);
		setSelectedPosts(newSelected);
	};

	const selectAll = () => {
		setSelectedPosts(
			selectedPosts.size === group.posts.length
				? new Set()
				: new Set(group.posts.map(p => p.id)),
		);
	};

	const startEdit = (post: PostItem) => {
		setEditingPost(post);
		setEditedContent(post.content);
	};

	// Fixed: Separate the dialog opening from accordion state
	const handleCardClick = (postId: string) => {
		setIsDialogOpen(true);
		setOpenAccordionItem(postId); // Set the accordion item to open by default
	};

	// Fixed: Handle dialog close properly
	const handleDialogClose = () => {
		setIsDialogOpen(false);
		setOpenAccordionItem(undefined); // Reset accordion state when dialog closes
	};

	return (
		<>
			<Card
				className={cn(
					"group relative flex aspect-square h-[227px] w-full flex-col overflow-hidden rounded-xl border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700/70 hover:bg-zinc-900/70 hover:shadow-lg hover:shadow-black/20",
					{
						"pointer-events-none opacity-50 grayscale": isPageLoading, // disables interaction + gives visual cue
					},
				)}
			>
				{/* Optional: overlay to block interaction + show spinner */}
				{isPageLoading && (
					<div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 backdrop-blur-sm">
						<div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
					</div>
				)}

				<CardContent className="flex h-[227px] w-full items-center justify-center p-1.5">
					<div
						className={cn(
							"relative grid h-full w-full gap-1.5",
							layoutConfig.gridClass,
						)}
					>
						{postsToShow.map((post, index) => {
							const channel = post.planned_channels[0];
							return (
								<div
									key={post.id}
									className={cn(
										"flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700/70 hover:bg-zinc-900/70 hover:shadow-lg hover:shadow-black/20",
										itemClasses(group.posts.length, index),
									)}
									onClick={() => {
										if (!isPageLoading) {
											handleCardClick(post.id);
										}
									}}
								>
									{getChannelIcon(channel)}
									<Badge
										variant="outline"
										className={cn(
											"text-xs font-semibold",
											getBadgeStyles(post.status),
										)}
									>
										{getStatusLabel(post.status)}
									</Badge>
								</div>
							);
						})}
						{layoutConfig.showOverlay && (
							<div
								onClick={() => setIsDialogOpen(true)}
								className="absolute left-1/2 top-1/2 z-20 flex h-16 w-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg bg-black/80 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-black/90"
							>
								<div className="text-lg font-bold text-white">
									+{layoutConfig.remainingCount}
								</div>
								<div className="text-xs text-zinc-300">Show More</div>
							</div>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Fixed: Use separate state for dialog */}
			<Dialog open={!!isDialogOpen} onOpenChange={() => handleDialogClose()}>
				<DialogContent className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border-zinc-800/50 bg-zinc-900/50 shadow-2xl shadow-black/40 backdrop-blur-sm">
					<DialogHeader className="pb-6">
						<DialogTitle className="text-xl font-light text-zinc-100">
							Manage Posts
						</DialogTitle>
						<DialogDescription className="text-zinc-400">
							{group.posts.length} posts in this group
						</DialogDescription>
					</DialogHeader>

					{/* Action Bar */}
					<div className="flex items-center justify-between gap-3 rounded-xl border-zinc-800/30 bg-zinc-800/30 p-4 backdrop-blur-sm">
						<div className="flex items-center space-x-3">
							<Checkbox
								id="select-all"
								checked={
									selectedPosts.size > 0 &&
									selectedPosts.size === group.posts.length
								}
								onCheckedChange={selectAll}
								className="border-zinc-600 data-[state=checked]:border-zinc-600 data-[state=checked]:bg-zinc-700"
							/>
							<label
								htmlFor="select-all"
								className="text-sm font-medium text-zinc-300"
							>
								Select All
							</label>
						</div>

						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() =>
									startReschedule(
										group.posts.filter(p => selectedPosts.has(p.id)),
									)
								}
								disabled={
									selectedPosts.size === 0 ||
									isLoading ||
									![...selectedPosts].some(
										postId =>
											group.posts.find(p => p.id === postId)?.status !==
											"published",
									)
								}
								className="border-zinc-700/50 bg-zinc-800/50 text-zinc-300 transition-all duration-300 hover:border-zinc-600/70 hover:bg-zinc-700/70 hover:text-zinc-100 disabled:opacity-50"
							>
								<CalendarClock className="mr-2 h-4 w-4" />
								Reschedule
							</Button>
							<Button
								variant="destructive"
								size="sm"
								onClick={handleDeleteSelected}
								disabled={selectedPosts.size === 0 || isLoading}
								className="border-red-800/50 bg-red-900/50 text-red-300 transition-all duration-300 hover:border-red-700/70 hover:bg-red-800/70 hover:text-red-100 disabled:opacity-50"
							>
								{isLoading ? (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								) : (
									<FaTrash className="mr-2 h-4 w-4" />
								)}
								Delete ({selectedPosts.size})
							</Button>
						</div>
					</div>

					{/* Posts List */}
					<div className="flex-1 overflow-hidden">
						<div className="scrollbar-hide h-full overflow-y-auto pr-2">
							<Accordion
								type="single"
								collapsible
								className="w-full space-y-3"
								value={openAccordionItem}
								onValueChange={setOpenAccordionItem}
							>
								{group.posts.map(post => {
									const postChannels =
										post.status === "published"
											? post.posted_channels
											: post.planned_channels;
									return (
										<AccordionItem
											key={post.id}
											value={post.id}
											className="rounded-xl border-zinc-800/50 bg-zinc-900/30 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700/70 hover:bg-zinc-900/50 hover:shadow-lg hover:shadow-black/20"
										>
											<div className="flex w-full items-center justify-between gap-4 border-b border-zinc-700 p-4">
												<div className="flex w-auto items-start justify-start gap-3">
													<Checkbox
														checked={selectedPosts.has(post.id)}
														onCheckedChange={() => togglePostSelection(post.id)}
														className="mt-[8px] border-zinc-600 data-[state=checked]:border-zinc-600 data-[state=checked]:bg-zinc-700"
													/>

													<AccordionTrigger className="flex-1 gap-3 py-0 text-left hover:no-underline">
														<div className="flex w-full flex-col gap-4">
															{/* Channel Badges */}
															<div className="flex flex-wrap items-center gap-2">
																{postChannels.map((channel, index) => (
																	<div
																		key={index}
																		className="flex items-center gap-2 rounded-full border border-zinc-700/50 bg-zinc-800/50 px-3 py-1 backdrop-blur-sm transition-all duration-200 hover:border-zinc-600/70 hover:bg-zinc-700/70"
																	>
																		<span className="text-sm text-zinc-300">
																			{getChannelIcon(channel)}
																		</span>
																		<span className="text-xs font-medium capitalize text-zinc-300">
																			{channel}
																		</span>
																		<span
																			className={`h-1.5 w-1.5 rounded-full ${getStatusIndicatorColor(post.status)}`}
																			title={getStatusLabel(post.status)}
																		/>
																	</div>
																))}
															</div>
														</div>
													</AccordionTrigger>
												</div>

												{/* Action Buttons */}
												<div className="flex w-auto flex-wrap gap-3">
													{post.status !== "published" && (
														<>
															<Button
																onClick={() => startEdit(post)}
																className="flex items-center gap-2 text-sm text-zinc-300 hover:bg-zinc-800/50 hover:text-zinc-100"
															>
																<FaEdit className="h-4 w-4 text-zinc-400" />
															</Button>
															<Button
																onClick={() => startReschedule([post])}
																className="flex items-center gap-2 text-sm text-zinc-300 hover:bg-zinc-800/50 hover:text-zinc-100"
															>
																<FaCalendarAlt className="h-4 w-4 text-zinc-400" />
															</Button>
														</>
													)}
													<Button
														onClick={() => handleDeleteSingle(post.id)}
														className="border-red-800/50 bg-red-900/50 text-red-300 transition-all duration-300 hover:border-red-700/70 hover:bg-red-800/70 hover:text-red-100 disabled:opacity-50"
													>
														<FaTrash className="h-4 w-4" />
													</Button>
												</div>
											</div>

											<AccordionContent>
												<div className="space-y-4 px-4 pb-4">
													<div className="mt-6 rounded-lg border-zinc-800/30 bg-zinc-800/30 p-4 backdrop-blur-sm">
														<div className="scrollbar-hide max-h-32 overflow-y-auto">
															<p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-zinc-300">
																{post.content}
															</p>
														</div>
													</div>
													<div className="flex w-full flex-wrap items-center justify-end gap-3">
														<div className="text-xs text-zinc-500">
															{post.status === "scheduled" &&
																post.scheduled_publish_time && (
																	<span>
																		Scheduled:{" "}
																		{formatDistanceToNow(
																			parseISO(post.scheduled_publish_time),
																			{ addSuffix: true },
																		)}
																	</span>
																)}
															{post.status === "published" &&
																post.actual_publish_time && (
																	<span>
																		Published:{" "}
																		{formatDistanceToNow(
																			parseISO(post.actual_publish_time),
																			{ addSuffix: true },
																		)}
																	</span>
																)}
															{post.status === "drafted" && (
																<span>
																	Created:{" "}
																	{formatDistanceToNow(
																		parseISO(post.created_at),
																		{ addSuffix: true },
																	)}
																</span>
															)}
														</div>
													</div>
												</div>
											</AccordionContent>
										</AccordionItem>
									);
								})}
							</Accordion>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* Edit Post Dialog */}
			<Dialog
				open={!!editingPost}
				onOpenChange={open => !open && setEditingPost(undefined)}
			>
				<DialogContent className="w-full max-w-2xl rounded-2xl border-zinc-800/50 bg-zinc-900/50 shadow-2xl shadow-black/40 backdrop-blur-sm">
					<DialogHeader className="pb-6">
						<DialogTitle className="text-xl font-light text-zinc-100">
							Edit Post
						</DialogTitle>
						<DialogDescription className="text-zinc-400">
							Make changes to your post content
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<Label
							htmlFor="content"
							className="text-sm font-medium text-zinc-300"
						>
							Content
						</Label>
						<Textarea
							id="content"
							value={editedContent}
							onChange={event_ => setEditedContent(event_.target.value)}
							rows={12}
							className="resize-none rounded-xl border-zinc-800/50 bg-zinc-800/30 text-zinc-200 backdrop-blur-sm transition-all duration-300 placeholder:text-zinc-500 focus:border-zinc-600/70 focus:bg-zinc-800/50 focus:outline-none focus:ring-2 focus:ring-zinc-600/30"
							placeholder="Write your post content here..."
						/>
					</div>
					<DialogFooter className="gap-3">
						<Button
							variant="outline"
							onClick={() => setEditingPost(undefined)}
							className="border-zinc-700/50 bg-zinc-800/50 text-zinc-300 transition-all duration-300 hover:border-zinc-600/70 hover:bg-zinc-700/70 hover:text-zinc-100"
						>
							Cancel
						</Button>
						<Button
							onClick={handleEditPost}
							disabled={isLoading}
							className="border-zinc-700/50 bg-zinc-700/50 text-zinc-100 transition-all duration-300 hover:border-zinc-600/70 hover:bg-zinc-600/70 hover:shadow-lg hover:shadow-black/20 disabled:opacity-50"
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

			{/* Reschedule Dialog */}
			<Dialog
				open={reschedulingPosts.length > 0}
				onOpenChange={open => !open && setReschedulingPosts([])}
			>
				<DialogContent className="w-auto rounded-xl border border-zinc-800/50 bg-zinc-900/95 text-zinc-300 backdrop-blur-md">
					<DialogHeader className="pb-6">
						<DialogTitle className="text-xl font-light text-zinc-100">
							Reschedule Posts
						</DialogTitle>
						<DialogDescription className="text-zinc-400">
							Select new date and time for {reschedulingPosts.length} post(s)
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-6 py-4">
						<div className="grid gap-3">
							<Label className="text-sm font-medium text-zinc-300">Date</Label>
							<Calendar
								initialFocus
								mode="single"
								selected={newScheduleDate}
								onSelect={setNewScheduleDate}
								className="w-full rounded-lg"
								disabled={date => {
									// Get today's date and set time to midnight for proper comparison
									const today = new Date();
									today.setHours(0, 0, 0, 0);

									// Calculate date 1 months from today
									const twoWeeksFromNow = new Date(today);
									twoWeeksFromNow.setDate(today.getDate() + 30);

									// Disable dates before today or after 1 month from today
									return date < today || date > twoWeeksFromNow;
								}}
							/>
						</div>
						<div className="grid gap-3">
							<Label
								htmlFor="time"
								className="text-sm font-medium text-zinc-300"
							>
								Time
							</Label>
							<Input
								id="time"
								type="time"
								value={newScheduleTime}
								onChange={event_ => setNewScheduleTime(event_.target.value)}
								className="col-span-3 rounded-lg border-zinc-800/50 bg-zinc-900/50 text-zinc-300 transition-all duration-200 focus:border-zinc-700/50"
							/>
						</div>
					</div>
					<DialogFooter className="gap-3">
						<Button
							variant="outline"
							onClick={() => setReschedulingPosts([])}
							className="border-zinc-700/50 bg-zinc-800/50 text-zinc-300 transition-all duration-300 hover:border-zinc-600/70 hover:bg-zinc-700/70 hover:text-zinc-100"
						>
							Cancel
						</Button>
						<Button
							onClick={handleReschedule}
							disabled={isLoading}
							className="border-zinc-700/50 bg-zinc-700/50 text-zinc-100 transition-all duration-300 hover:border-zinc-600/70 hover:bg-zinc-600/70 hover:shadow-lg hover:shadow-black/20 disabled:opacity-50"
						>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Rescheduling...
								</>
							) : (
								"Confirm"
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
