"use client";

import {
	format,
	formatDistanceToNow,
	parseISO,
	setHours,
	setMinutes,
} from "date-fns";
import {
	Calendar as CalendarIcon,
	CalendarClock,
	Edit,
	Loader2,
	MoreHorizontal,
	MoreVertical,
	Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaDiscord, FaLinkedin, FaSlack, FaTwitter } from "react-icons/fa";

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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
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
			return <FaTwitter className={`${iconClass} text-sky-300`} />;
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

const gridClasses = (count: number) => {
	switch (count) {
		case 1: {
			return "grid-cols-1 grid-rows-1";
		}
		case 2: {
			return "grid-cols-2 grid-rows-1";
		}
		case 3: {
			return "grid-cols-2 grid-rows-2";
		}
		case 4: {
			return "grid-cols-2 grid-rows-2";
		}
		default: {
			return "grid-cols-2 grid-rows-2";
		}
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
	const router = useRouter();
	const { toast } = useToast();
	const [showEditDialog, setShowEditDialog] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
	const [editingPost, setEditingPost] = useState<PostItem | undefined>();
	const [editedContent, setEditedContent] = useState("");
	const [reschedulingPosts, setReschedulingPosts] = useState<PostItem[]>([]);
	const [newScheduleDate, setNewScheduleDate] = useState<Date | undefined>(
		new Date(),
	);
	const [newScheduleTime, setNewScheduleTime] = useState("12:00");
	const [openAccordionItem, setOpenAccordionItem] = useState<
		string | undefined
	>();

	const refreshData = () => {
		router.refresh();
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
			toast({
				variant: "destructive",
				title: "Cannot Reschedule",
				description: "No draft or scheduled posts to reschedule.",
			});
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
					reschedulePost("mock-org-id", post.id, finalDate.toISOString()),
				),
			);

			refreshData();
			toast({
				title: "Success",
				description: `${reschedulingPosts.length} post(s) rescheduled successfully.`,
			});
			setReschedulingPosts([]);
		} catch {
			toast({
				variant: "destructive",
				title: "Error",
				description: "Failed to reschedule posts.",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleDeleteSelected = async () => {
		if (selectedPosts.size === 0) return;
		setIsLoading(true);
		try {
			await Promise.all(
				[...selectedPosts].map(postId => deletePost("mock-org-id", postId)),
			);
			setSelectedPosts(new Set());
			refreshData();
			toast({
				title: "Success",
				description: `${selectedPosts.size} posts deleted successfully.`,
			});
		} catch {
			toast({
				variant: "destructive",
				title: "Error",
				description: "Failed to delete posts.",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleDeleteSingle = async (postId: string) => {
		setIsLoading(true);
		try {
			await deletePost("mock-org-id", postId);
			refreshData();
			toast({ title: "Success", description: "Post deleted successfully." });
			const newSelected = new Set(selectedPosts);
			newSelected.delete(postId);
			setSelectedPosts(newSelected);
		} catch {
			toast({
				variant: "destructive",
				title: "Error",
				description: "Failed to delete post.",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleDeleteGroup = async () => {
		setIsLoading(true);
		try {
			await Promise.all(
				group.posts.map(post => deletePost("mock-org-id", post.id)),
			);
			refreshData();
			toast({
				title: "Success",
				description: "Post group deleted successfully.",
			});
		} catch {
			toast({
				variant: "destructive",
				title: "Error",
				description: "Failed to delete post group.",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleEditPost = async () => {
		if (!editingPost) return;
		setIsLoading(true);
		try {
			await updatePost("mock-org-id", editingPost.id, editedContent);
			setEditingPost(undefined);
			setEditedContent("");
			refreshData();
			toast({ title: "Success", description: "Post updated successfully." });
		} catch {
			toast({
				variant: "destructive",
				title: "Error",
				description: "Failed to update post.",
			});
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

	const handleCardClick = (postId: string) => {
		setOpenAccordionItem(postId);
		setShowEditDialog(true);
	};

	return (
		<>
			<Card className="group relative flex aspect-square flex-col overflow-hidden rounded-xl border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700/70 hover:bg-zinc-900/70 hover:shadow-lg hover:shadow-black/20">
				<CardContent className="h-full flex-grow p-1.5">
					<div
						className={cn(
							"grid h-full w-full gap-1.5",
							gridClasses(group.posts.length),
						)}
					>
						{group.posts.map((post, index) => {
							const channel = post.planned_channels[0];
							return (
								<div
									key={post.id}
									className={cn(
										"flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700/70 hover:bg-zinc-900/70 hover:shadow-lg hover:shadow-black/20",
										itemClasses(group.posts.length, index),
									)}
									onClick={() => handleCardClick(post.id)}
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
					</div>
				</CardContent>
			</Card>

			<Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
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
									<Trash2 className="mr-2 h-4 w-4" />
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
											<div className="flex items-center p-4">
												<Checkbox
													checked={selectedPosts.has(post.id)}
													onCheckedChange={() => togglePostSelection(post.id)}
													className="mr-4 border-zinc-600 data-[state=checked]:border-zinc-600 data-[state=checked]:bg-zinc-700"
												/>
												<AccordionTrigger className="flex-1 py-0 text-left hover:no-underline">
													<div className="flex w-full flex-col gap-3">
														<div className="flex flex-wrap items-center gap-3">
															{postChannels.map((channel, index) => (
																<div
																	key={index}
																	className="flex items-center gap-2 rounded-full border-zinc-700/50 bg-zinc-800/50 px-3 py-1 backdrop-blur-sm transition-all duration-200 hover:border-zinc-600/70 hover:bg-zinc-700/70"
																>
																	{getChannelIcon(channel)}
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
											<AccordionContent>
												<div className="space-y-4 px-4 pb-4">
													<div className="rounded-lg border-zinc-800/30 bg-zinc-800/30 p-4 backdrop-blur-sm">
														<div className="scrollbar-hide max-h-32 overflow-y-auto">
															<p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-zinc-300">
																{post.content}
															</p>
														</div>
													</div>
													<div className="flex flex-wrap items-center justify-between gap-3">
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
														<DropdownMenu>
															<DropdownMenuTrigger asChild>
																<Button
																	variant="ghost"
																	size="icon"
																	className="h-8 w-8 rounded-lg border-zinc-700/50 bg-zinc-800/50 text-zinc-400 transition-all duration-200 hover:border-zinc-600/70 hover:bg-zinc-700/70 hover:text-zinc-200"
																>
																	<MoreHorizontal className="h-4 w-4" />
																</Button>
															</DropdownMenuTrigger>
															<DropdownMenuContent
																align="end"
																className="rounded-xl border-zinc-800/50 bg-zinc-900/90 backdrop-blur-sm"
															>
																{post.status !== "published" && (
																	<>
																		<DropdownMenuItem
																			onClick={() => startEdit(post)}
																			className="text-zinc-300 hover:bg-zinc-800/50 hover:text-zinc-100"
																		>
																			<Edit className="mr-2 h-4 w-4" /> Edit
																		</DropdownMenuItem>
																		<DropdownMenuItem
																			onClick={() => startReschedule([post])}
																			className="text-zinc-300 hover:bg-zinc-800/50 hover:text-zinc-100"
																		>
																			<CalendarClock className="mr-2 h-4 w-4" />{" "}
																			Reschedule
																		</DropdownMenuItem>
																	</>
																)}
																<DropdownMenuItem
																	onClick={() => handleDeleteSingle(post.id)}
																	className="text-red-400 hover:bg-red-900/30 hover:text-red-300"
																>
																	<Trash2 className="mr-2 h-4 w-4" /> Delete
																</DropdownMenuItem>
															</DropdownMenuContent>
														</DropdownMenu>
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
				<DialogContent className="w-full max-w-md rounded-2xl border-zinc-800/50 bg-zinc-900/50 shadow-2xl shadow-black/40 backdrop-blur-sm">
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
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										className={cn(
											"w-full justify-start rounded-xl border-zinc-800/50 bg-zinc-800/30 text-left font-normal text-zinc-300 backdrop-blur-sm transition-all duration-300 hover:border-zinc-600/70 hover:bg-zinc-800/50 hover:text-zinc-100",
											!newScheduleDate && "text-zinc-500",
										)}
									>
										<CalendarIcon className="mr-2 h-4 w-4" />
										{newScheduleDate ? (
											format(newScheduleDate, "PPP")
										) : (
											<span>Pick a date</span>
										)}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto rounded-xl border-zinc-800/50 bg-zinc-900/90 p-0 backdrop-blur-sm">
									<Calendar
										mode="single"
										selected={newScheduleDate}
										onSelect={setNewScheduleDate}
										initialFocus
										className="text-zinc-300"
									/>
								</PopoverContent>
							</Popover>
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
								className="rounded-xl border-zinc-800/50 bg-zinc-800/30 text-zinc-200 backdrop-blur-sm transition-all duration-300 focus:border-zinc-600/70 focus:bg-zinc-800/50 focus:outline-none focus:ring-2 focus:ring-zinc-600/30"
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

			<style jsx>{`
				.scrollbar-hide {
					scrollbar-width: none;
					-ms-overflow-style: none;
				}
				.scrollbar-hide::-webkit-scrollbar {
					display: none;
				}
			`}</style>
		</>
	);
}
