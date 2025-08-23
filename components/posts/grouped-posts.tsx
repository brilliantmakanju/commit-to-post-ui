"use client";

import { UUID } from "node:crypto";

import { useQueryClient } from "@tanstack/react-query";
import {
	format,
	formatDistanceToNow,
	isFuture,
	parseISO,
	setHours,
	setMinutes,
} from "date-fns";
import { Edit3, Loader2, Save, Trash2 } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FaCalendarAlt, FaDiscord, FaLinkedin, FaSlack } from "react-icons/fa";
import { toast } from "sonner";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import useRepoSuperDetails from "@/hooks/core/repo/get-repo-super-detail-hook";
import { cn } from "@/lib/utils";
import { deletePost } from "@/server-actions/core/delete-post";
import { updatePost } from "@/server-actions/core/edit-post";
import { reschedulePost } from "@/server-actions/core/reschedule-post";
import type { PostGroup, PostItem, PostStatus } from "@/types";

import { ConnectedIntegration } from "../repositories/settings/channel-settings";

interface GroupedPostCardProps {
	group: PostGroup;
}

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
	const iconClass =
		"h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 transition-all duration-200";
	switch (channel) {
		case "linkedin": {
			return <FaLinkedin className={`${iconClass} text-blue-300`} />;
		}
		case "twitter":
		case "x":
		case "x-twitter": {
			return <XIcon className={`${iconClass} text-arch-white`} />;
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

const getPlatformIcon = (platform: string) => {
	const iconClass = "h-4 w-4";
	switch (platform) {
		case "linkedin": {
			return <FaLinkedin className={`${iconClass} text-blue-500`} />;
		}
		case "twitter":
		case "x":
		case "x-twitter": {
			return <XIcon className={`${iconClass} text-white`} />;
		}
		case "slack": {
			return <FaSlack className={`${iconClass} text-purple-500`} />;
		}
		case "discord": {
			return <FaDiscord className={`${iconClass} text-indigo-500`} />;
		}
		default: {
			return <div className="h-4 w-4 rounded bg-zinc-500" />;
		}
	}
};

const getStatusLabel = (status: PostStatus) => {
	return status.charAt(0).toUpperCase() + status.slice(1);
};

const getLayoutConfig = (count: number) => {
	if (count <= 3) {
		return {
			showOverlay: false,
			visiblePosts: count,
			gridClass: count === 3 ? "grid-cols-3" : `grid-cols-${count}`,
		};
	} else if (count === 4) {
		return {
			visiblePosts: 4,
			showOverlay: false,
			gridClass: "grid-cols-2 grid-rows-2",
		};
	} else {
		return {
			visiblePosts: 4,
			showOverlay: true,
			remainingCount: count - 4,
			gridClass: "grid-cols-2 grid-rows-2",
		};
	}
};

const normalizePlatform = (p?: string) => {
	const v = (p || "").toLowerCase();
	if (v === "x" || v === "twitter" || v === "x-twitter") return "twitter";
	if (v === "linkedin") return "linkedin";
	if (v === "discord") return "discord";
	if (v === "slack") return "slack";
	return;
};

export default function GroupedPostCard({ group }: GroupedPostCardProps) {
	const params = useParams();
	const queryClient = useQueryClient();
	const [imgError, setImgError] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [activeTab, setActiveTab] = useState("posted");
	const [editedContent, setEditedContent] = useState("");
	const [selectedSocials, setSelectedSocials] = useState(new Set());
	const [socials, setSocials] = useState<any[]>([]);
	const [editingPost, setEditingPost] = useState<PostItem | undefined>();
	const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
	const [reschedulingPosts, setReschedulingPosts] = useState<PostItem[]>([]);
	const [newScheduleDate, setNewScheduleDate] = useState<Date | undefined>(
		new Date(),
	);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [newScheduleTime, setNewScheduleTime] = useState("12:00");
	const [currentPost, setCurrentPost] = useState<PostItem | undefined>();

	const layoutConfig = getLayoutConfig(group.posts.length);
	const postsToShow = group.posts.slice(0, layoutConfig.visiblePosts);

	const repoId = useMemo(() => params?.id as UUID, [params?.id]);
	const { repoDetails: repository } = useRepoSuperDetails(repoId);

	const refreshData = useCallback(() => {
		queryClient.invalidateQueries({ queryKey: ["posts"] });
	}, [queryClient]);

	// Set socials from repository details when available
	useEffect(() => {
		if (
			repository?.settings?.connected_integration_ids &&
			Array.isArray(repository.settings.connected_integration_ids) &&
			repository?.social_connections?.connected_integrations
		) {
			const connectedIds = repository.settings.connected_integration_ids;
			const allIntegrations = repository.social_connections
				.connected_integrations as ConnectedIntegration;

			// Flatten the integrations into one array
			const flatIntegrations: ConnectedIntegration[] = Object.entries(
				allIntegrations,
			).flatMap(([platform, integrations]) =>
				(integrations as ConnectedIntegration[]).map(integration => ({
					...integration,
					platform, // inject platform key (linkedin, twitter, etc.)
				})),
			);

			// Only keep integrations whose IDs are in connected_integration_ids
			const hydrated = flatIntegrations.filter(integration =>
				connectedIds.includes(integration.id),
			);

			setSocials(hydrated);
		} else {
			setSocials([]);
		}
	}, [
		repository,
		repository.settings.connected_integration_ids,
		repository.social_connections,
	]);

	// Reset selected socials when current post changes
	useEffect(() => {
		setSelectedSocials(new Set());
	}, [currentPost?.id]);

	const availableSocials = useMemo<ConnectedIntegration[]>(() => {
		if (
			!currentPost?.platform ||
			!Array.isArray(socials) ||
			socials.length === 0
		) {
			return [];
		}

		// Normalize and restrict to same platform
		const normalizedPlatform = normalizePlatform(currentPost.platform);

		// Socials that match currentPost's platform
		const samePlatformSocials = socials.filter(
			social => social.platform === normalizedPlatform,
		);

		// Collect IDs of integrations already tied to this post
		const usedIntegrationIds = new Set([
			...(currentPost.posted_integrations_data || []).map(index => index.id),
			...(currentPost.planned_integrations_data || []).map(index => index.id),
			...(currentPost.pending_integrations_data || []).map(index => index.id),
		]);

		// Filter: only keep socials of the same platform that are not already used
		const available = samePlatformSocials.filter(
			social => !usedIntegrationIds.has(social.id),
		);

		return available;
	}, [currentPost, socials]);

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

	const togglePostSelection = useCallback((postId: string) => {
		setSelectedPosts(previous => {
			const newSelected = new Set(previous);
			if (newSelected.has(postId)) {
				newSelected.delete(postId);
			} else {
				newSelected.add(postId);
			}
			return newSelected;
		});
	}, []);

	const selectAll = useCallback(() => {
		setSelectedPosts(previous =>
			previous.size === group.posts.length
				? new Set()
				: new Set(group.posts.map(p => p.id)),
		);
	}, [group.posts]);

	const startEdit = useCallback((post: PostItem) => {
		setEditingPost(post);
		setEditedContent(post.content);
	}, []);

	// Fixed: Separate the dialog opening from accordion state
	const handleCardClick = useCallback(
		(postId: string) => {
			const post = group.posts.find(p => p.id === postId);
			if (post && post.id !== currentPost?.id) {
				setCurrentPost(post);
				setIsDialogOpen(true);
			}
		},
		[group.posts, currentPost?.id],
	);

	// Fixed: Handle dialog close properly
	const handleDialogClose = useCallback(() => {
		setIsDialogOpen(false);
		setCurrentPost(undefined);
	}, []);

	const handleCancelIntegration = (integrationId: string) => {
		if (!currentPost) return;

		// Optimistically update UI
		const updatedPending = currentPost.pending_integrations_data.filter(
			integration => integration.id !== integrationId,
		);

		setCurrentPost({
			...currentPost,
			pending_integrations_data: updatedPending,
		});
	};

	return (
		<>
			<Card
				className={cn(
					"group relative flex aspect-square h-[200px] w-full flex-col overflow-hidden rounded-xl border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700/70 hover:bg-zinc-900/70 hover:shadow-lg hover:shadow-black/20 sm:h-[240px] md:h-[280px]",
				)}
			>
				<CardContent className="flex h-full w-full items-center justify-center p-1 sm:p-1.5">
					<div
						className={cn(
							"relative grid h-full w-full gap-1 sm:gap-1.5",
							layoutConfig.gridClass,
						)}
					>
						{postsToShow.map((post, index) => {
							return (
								<div
									key={`${post.id}_${index}`}
									className={cn(
										"flex w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700/70 hover:bg-zinc-900/70 hover:shadow-lg hover:shadow-black/20 sm:gap-2",
									)}
									onClick={() => {
										handleCardClick(post.id);
									}}
								>
									{getChannelIcon(post.platform)}
									<Badge
										variant="outline"
										className={cn(
											"px-1 py-0.5 text-[10px] font-semibold sm:px-2 sm:text-xs",
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
								className="absolute left-1/2 top-1/2 z-20 flex h-12 w-16 -translate-x-1/2 -translate-y-1/2 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-lg bg-black/80 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-black/90 sm:h-16 sm:w-20 sm:gap-1"
							>
								<div className="text-sm font-bold text-white sm:text-lg">
									+{layoutConfig.remainingCount}
								</div>
								<div className="text-[10px] text-zinc-300 sm:text-xs">
									Show More
								</div>
							</div>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Main Dialog */}
			<Dialog open={!!isDialogOpen} onOpenChange={() => handleDialogClose()}>
				<DialogContent className="flex h-[90vh] w-[95vw] max-w-5xl flex-col overflow-hidden border-zinc-800/50 bg-zinc-900/90 backdrop-blur-xl sm:h-[85vh] md:h-[43rem]">
					{/* Header Section */}
					<DialogHeader className="flex-shrink-0 border-b border-zinc-800/50 pb-4">
						<div className="flex items-center justify-between">
							<div className="min-w-0 flex-1 items-start justify-start text-left">
								<DialogTitle className="truncate text-lg font-medium text-zinc-100 sm:text-xl">
									Manage Posts
								</DialogTitle>
								<DialogDescription className="mt-1 text-sm text-zinc-400">
									{group.posts.length} posts • Edit and schedule across
									platforms
								</DialogDescription>
							</div>

							{/* Quick Actions */}
							<div className="hidden flex-shrink-0 items-center gap-2 sm:flex">
								<Checkbox
									id="select-all"
									checked={
										selectedPosts.size > 0 &&
										selectedPosts.size === group.posts.length
									}
									onCheckedChange={selectAll}
									className="border-zinc-600 data-[state=checked]:border-zinc-600 data-[state=checked]:bg-zinc-700"
								/>
								<Button
									variant="outline"
									size="sm"
									disabled={selectedPosts.size === 0}
									onClick={() =>
										startReschedule(
											[...selectedPosts]
												.map(id => group.posts.find(p => p.id === id)!)
												.filter(Boolean),
										)
									}
									className="hidden border-zinc-700/50 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700/70 hover:text-zinc-100 sm:flex"
								>
									<FaCalendarAlt className="h-3 w-3" />
								</Button>
								<Button
									variant="outline"
									size="sm"
									disabled={selectedPosts.size === 0}
									onClick={handleDeleteSelected}
									className="border-red-800/50 bg-red-900/50 text-red-300 transition-all duration-300 hover:border-red-700/70 hover:bg-red-800/70 hover:text-red-100 disabled:opacity-50"
								>
									<Trash2 className="h-3 w-3" />
									{selectedPosts.size > 0 && (
										<span className="ml-1 text-xs">({selectedPosts.size})</span>
									)}
								</Button>
							</div>
						</div>
					</DialogHeader>

					{/* Main Content Area */}
					<div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden lg:flex-row lg:gap-6">
						{/* Left Panel - Posts Grid */}
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
												setCurrentPost(post);
											}}
										>
											<div className="mb-2 flex items-center justify-between gap-2">
												<div className="flex items-start justify-start gap-3">
													<Checkbox
														onClick={() => {
															togglePostSelection(post.id);
														}}
														checked={selectedPosts.has(post.id)}
														className="border-zinc-600 data-[state=checked]:bg-zinc-700"
													/>
													{getPlatformIcon(post.platform)}
												</div>
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

						{/* Right Panel - Content Editor & Integrations */}
						<div className="flex min-h-0 flex-1 flex-col overflow-hidden">
							{currentPost ? (
								<>
									{/* Content Editor */}
									<div className="mb-4 flex-shrink-0 lg:mb-6">
										<div className="mb-3 flex items-center justify-between">
											<span className="text-xs text-zinc-500">
												{currentPost.created_at &&
													(() => {
														const createdAt = parseISO(currentPost.created_at);

														if (currentPost.status === "published") {
															return `${formatDistanceToNow(createdAt, { addSuffix: true })}`;
															// → "30 minutes ago"
														}

														if (
															currentPost.status === "scheduled" &&
															currentPost.scheduled_publish_time
														) {
															const scheduledAt = parseISO(
																currentPost.scheduled_publish_time,
															);
															return isFuture(scheduledAt)
																? `in ${formatDistanceToNow(scheduledAt)}`
																: `${formatDistanceToNow(scheduledAt, { addSuffix: true })}`;
															// → "in 2 days" or "3 hours ago" if already passed
														}

														// fallback (drafts etc.)
														return format(createdAt, "MMM d, yyyy 'at' h:mm a");
													})()}
											</span>
											<div className="flex items-center justify-end gap-2">
												<Badge
													variant="outline"
													className={cn(
														"text-xs font-semibold",
														getBadgeStyles(currentPost.status),
													)}
												>
													{getStatusLabel(currentPost.status)}
												</Badge>
											</div>
										</div>

										<p className="scrollbar-hide max-h-32 overflow-y-auto rounded-lg border-zinc-800/30 bg-zinc-800/30 p-6 leading-relaxed text-zinc-300 backdrop-blur-sm">
											{editedContent || currentPost.content}
										</p>
										<div className="mt-3 flex items-center justify-between">
											<Button
												size="sm"
												variant="ghost"
												onClick={() => startEdit(currentPost)}
												className="bg-transparent text-zinc-400 hover:bg-transparent hover:text-zinc-100 hover:underline"
											>
												<Edit3 className="mr-1 h-3 w-3" />
												Edit
											</Button>
											<div className="flex items-center gap-2">
												<Button
													size="sm"
													variant="outline"
													onClick={() => startReschedule([currentPost])}
													className="border-zinc-700/50 bg-zinc-800/50 text-zinc-300 transition-all duration-300 hover:border-zinc-600/70 hover:bg-zinc-700/70 hover:text-zinc-100 disabled:opacity-50"
												>
													<FaCalendarAlt className="h-3 w-3" />
												</Button>
												<Button
													size="sm"
													onClick={handleEditPost}
													disabled={selectedSocials.size === 0}
													className="border-emerald-600/30 bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 disabled:opacity-50"
												>
													<Save className="h-3 w-3" />
												</Button>
											</div>
										</div>
									</div>

									{/* Platform Integrations */}
									<div className="flex min-h-0 flex-1 flex-col overflow-hidden">
										<Tabs
											value={activeTab}
											onValueChange={setActiveTab}
											className="flex h-full flex-col"
										>
											<TabsList
												className={`grid w-full flex-shrink-0 rounded-lg border border-zinc-800/50 bg-zinc-900/50 p-1 ${
													currentPost.status === "published"
														? "grid-cols-1"
														: "grid-cols-3"
												}`}
											>
												{/* Always show Posted */}
												<TabsTrigger
													value="posted"
													className="text-[10px] text-zinc-400 data-[state=active]:bg-zinc-100 data-[state=active]:text-zinc-900 sm:text-xs"
												>
													<span className="hidden sm:inline">Posted</span>
													<span className="sm:hidden">Post</span>
													<span className="ml-1">
														({currentPost.posted_integrations_data.length})
													</span>
												</TabsTrigger>

												{/* Only show if NOT published */}
												{currentPost.status !== "published" && (
													<>
														<TabsTrigger
															value="pending"
															className="text-[10px] text-zinc-400 data-[state=active]:bg-zinc-100 data-[state=active]:text-zinc-900 sm:text-xs"
														>
															<span className="hidden sm:inline">Pending</span>
															<span className="sm:hidden">Pend</span>
															<span className="ml-1">
																({currentPost.pending_integrations_data.length})
															</span>
														</TabsTrigger>

														<TabsTrigger
															value="add"
															className="text-[10px] text-zinc-400 data-[state=active]:bg-zinc-100 data-[state=active]:text-zinc-900 sm:text-xs"
														>
															Add
														</TabsTrigger>
													</>
												)}
											</TabsList>

											<div className="mt-4 flex-1 overflow-hidden">
												<div className="h-full overflow-y-auto">
													<TabsContent
														value="posted"
														className="scrollbar-hide m-0 h-full space-y-3"
													>
														{currentPost.posted_integrations_data.length ===
														0 ? (
															<div className="py-8 text-center text-zinc-500 sm:py-12">
																<div className="text-sm">
																	No published integrations
																</div>
															</div>
														) : (
															<div className="space-y-3">
																{currentPost.posted_integrations_data.map(
																	integration => (
																		<div
																			key={integration.id}
																			className="flex items-center justify-between rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 sm:p-4"
																		>
																			<div className="flex min-w-0 flex-1 items-center gap-3">
																				<div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-xs font-medium text-zinc-900 sm:h-8 sm:w-8 sm:text-sm">
																					{integration.name.charAt(0)}
																				</div>
																				<div className="min-w-0 flex-1">
																					<div className="truncate text-sm font-medium text-zinc-100">
																						{integration.name}
																					</div>
																					<div className="truncate text-xs text-zinc-400">
																						{integration.handle}
																					</div>
																				</div>
																			</div>
																			<Badge className="flex-shrink-0 border-emerald-500/30 bg-emerald-500/20 text-emerald-300">
																				Published
																			</Badge>
																		</div>
																	),
																)}
															</div>
														)}
													</TabsContent>

													<TabsContent
														value="pending"
														className="scrollbar-hide m-0 h-full"
													>
														{currentPost.pending_integrations_data.length ===
														0 ? (
															<div className="py-8 text-center text-zinc-500 sm:py-12">
																<div className="text-sm">
																	No pending integrations
																</div>
															</div>
														) : (
															<div className="space-y-3">
																{currentPost.pending_integrations_data.map(
																	integration => {
																		const shouldShowFallback =
																			imgError ||
																			!integration.profile_image_url ||
																			["null", "undefined"].includes(
																				integration.profile_image_url,
																			);
																		return (
																			<div
																				key={integration.id}
																				className="flex items-center justify-between rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 sm:p-4"
																			>
																				{/* Left side: icon + name + handle */}
																				<div className="flex min-w-0 flex-1 items-center gap-3">
																					{shouldShowFallback ? (
																						<div
																							className={
																								"flex h-[25px] w-[25px] items-center justify-center rounded-full border border-zinc-700/50 bg-zinc-700 text-xs font-medium text-zinc-100"
																							}
																						>
																							{integration.name
																								.split(" ")
																								.map(word => word[0])
																								.join("")
																								.toUpperCase()
																								.slice(0, 2)}
																						</div>
																					) : (
																						<Image
																							width={30}
																							height={30}
																							alt={integration.name}
																							src={
																								integration.profile_image_url!
																							}
																							onError={() => setImgError(true)}
																							className={
																								'bg-zinc-800/30" rounded-full border border-zinc-700/50'
																							}
																						/>
																					)}

																					<div className="min-w-0 flex-1">
																						<div className="truncate text-sm font-medium text-zinc-100">
																							{integration.name}
																						</div>
																						<div className="truncate text-xs text-zinc-400">
																							{integration.handle}
																						</div>
																					</div>
																				</div>

																				{/* Right side: status + cancel */}
																				<div className="flex items-center gap-2">
																					<Button
																						onClick={() =>
																							handleCancelIntegration(
																								integration.id,
																							)
																						}
																						className="rounded-md border border-zinc-700/50 bg-zinc-800/40 px-2 py-1 text-xs text-zinc-400 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
																					>
																						Cancel
																					</Button>
																				</div>
																			</div>
																		);
																	},
																)}
															</div>
														)}
													</TabsContent>

													<TabsContent
														value="add"
														className="scrollbar-hide m-0 h-full flex-1 space-y-4 overflow-y-auto"
													>
														{availableSocials.length === 0 ? (
															<div className="py-8 text-center text-zinc-500 sm:py-12">
																<div className="text-sm">
																	No available social connections to add
																</div>
																<div className="mt-1 text-xs text-zinc-600">
																	All social connections for this platform are
																	already used
																</div>
															</div>
														) : (
															availableSocials.map((social: any) => {
																const shouldShowFallback =
																	imgError ||
																	!social.profile_image_url ||
																	["null", "undefined"].includes(
																		social.profile_image_url,
																	);
																return (
																	<div
																		key={social.id}
																		className="flex cursor-pointer items-center justify-between rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 hover:bg-zinc-800/40 sm:p-4"
																		onClick={() => {
																			const newSelected = new Set(
																				selectedSocials,
																			);
																			if (newSelected.has(social.id)) {
																				newSelected.delete(social.id);
																			} else {
																				newSelected.add(social.id);
																			}
																			setSelectedSocials(newSelected);
																		}}
																	>
																		<div className="flex min-w-0 flex-1 items-center gap-3">
																			<Checkbox
																				checked={selectedSocials.has(social.id)}
																				className="flex-shrink-0 border-zinc-600 data-[state=checked]:bg-zinc-700"
																			/>
																			{shouldShowFallback ? (
																				<div
																					className={
																						"flex h-[25px] w-[25px] items-center justify-center rounded-full border border-zinc-700/50 bg-zinc-700 text-xs font-medium text-zinc-100"
																					}
																				>
																					{social.display_name
																						.split(" ")
																						.map((word: any) => word[0])
																						.join("")
																						.toUpperCase()
																						.slice(0, 2)}
																				</div>
																			) : (
																				<Image
																					width={30}
																					height={30}
																					alt={social.display_name}
																					src={social.profile_image_url!}
																					onError={() => setImgError(true)}
																					className={
																						'bg-zinc-800/30" rounded-full border border-zinc-700/50'
																					}
																				/>
																			)}
																			<div className="min-w-0 flex-1">
																				<div className="truncate text-sm font-medium text-zinc-100">
																					{social.display_name}
																				</div>
																				<div className="truncate text-xs text-zinc-400">
																					{social.handle}
																				</div>
																			</div>
																		</div>
																		<span className="flex-shrink-0 text-xs capitalize text-zinc-500">
																			{social.platform}
																		</span>
																	</div>
																);
															})
														)}
													</TabsContent>
												</div>
											</div>
										</Tabs>
									</div>
								</>
							) : (
								<div className="flex flex-1 items-center justify-center text-zinc-500">
									<div className="text-center">
										<div className="mb-2 text-lg">Select a post</div>
										<div className="text-sm">
											Choose a post from the left to view and edit details
										</div>
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Mobile Action Bar */}
					<div className="flex gap-2 border-t border-zinc-800/50 pt-3 sm:hidden">
						<Button
							variant="outline"
							size="sm"
							disabled={selectedPosts.size === 0}
							onClick={() =>
								startReschedule(
									[...selectedPosts]
										.map(id => group.posts.find(p => p.id === id)!)
										.filter(Boolean),
								)
							}
							className="flex-1 border-zinc-700/50 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700/70 hover:text-zinc-100"
						>
							<FaCalendarAlt className="mr-1 h-3 w-3" />
							Reschedule
						</Button>
						<Button
							variant="outline"
							size="sm"
							disabled={selectedPosts.size === 0}
							onClick={handleDeleteSelected}
							className="flex-1 border-red-800/50 bg-red-900/50 text-red-300 transition-all duration-300 hover:border-red-700/70 hover:bg-red-800/70 hover:text-red-100 disabled:opacity-50"
						>
							<Trash2 className="mr-1 h-3 w-3" />
							Delete {selectedPosts.size > 0 && `(${selectedPosts.size})`}
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			{/* Edit Post Dialog */}
			<Dialog
				open={!!editingPost}
				onOpenChange={open => !open && setEditingPost(undefined)}
			>
				<DialogContent className="w-[95vw] max-w-2xl rounded-2xl border-zinc-800/50 bg-zinc-900/50 shadow-2xl shadow-black/40 backdrop-blur-sm sm:w-full">
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
					<DialogFooter className="flex-col gap-3 sm:flex-row">
						<Button
							variant="outline"
							onClick={() => setEditingPost(undefined)}
							className="w-full border-zinc-700/50 bg-zinc-800/50 text-zinc-300 transition-all duration-300 hover:border-zinc-600/70 hover:bg-zinc-700/70 hover:text-zinc-100 sm:w-auto"
						>
							Cancel
						</Button>
						<Button
							onClick={handleEditPost}
							disabled={isLoading}
							className="w-full border-zinc-700/50 bg-zinc-700/50 text-zinc-100 transition-all duration-300 hover:border-zinc-600/70 hover:bg-zinc-600/70 hover:shadow-lg hover:shadow-black/20 disabled:opacity-50 sm:w-auto"
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
				<DialogContent className="w-[95vw] rounded-xl border border-zinc-800/50 bg-zinc-900/95 text-zinc-300 backdrop-blur-md sm:w-auto">
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
									const today = new Date();
									today.setHours(0, 0, 0, 0);
									const thirtyDaysFromNow = new Date(today);
									thirtyDaysFromNow.setDate(today.getDate() + 30);
									return date < today || date > thirtyDaysFromNow;
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
					<DialogFooter className="flex-col gap-3 sm:flex-row">
						<Button
							variant="outline"
							onClick={() => setReschedulingPosts([])}
							className="w-full border-zinc-700/50 bg-zinc-800/50 text-zinc-300 transition-all duration-300 hover:border-zinc-600/70 hover:bg-zinc-700/70 hover:text-zinc-100 sm:w-auto"
						>
							Cancel
						</Button>
						<Button
							onClick={handleReschedule}
							disabled={isLoading}
							className="w-full border-zinc-700/50 bg-zinc-700/50 text-zinc-100 transition-all duration-300 hover:border-zinc-600/70 hover:bg-zinc-600/70 hover:shadow-lg hover:shadow-black/20 disabled:opacity-50 sm:w-auto"
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
