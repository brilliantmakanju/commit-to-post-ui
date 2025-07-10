"use client";

import { UUID } from "node:crypto";

import {
	Calendar,
	FileText,
	Search,
	SortAsc,
	SortDesc,
	Webhook,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
	// eslint-disable-next-line import/no-unresolved
} from "@/components/ui/pagination";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import PostCard from "../posts/post-card";
import SkeletonPostCard from "../posts/post-skeleton";
import { SettingsPanel } from "./settings/settings-panel";
import { WebhookTable } from "./webhook/webhook-table";

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

interface WebhookLog {
	id: string;
	timestamp: string;
	event_type: string;
	status: "success" | "failed";
	error_message: string | undefined;
}

interface RepoTabsProps {
	posts: Post[];
	repo_id: UUID;
	postsTotalPages: number;
	isLoadingPosts?: boolean;
	postsCurrentPage: number;
	webhookLogs: WebhookLog[];
	onPostsPageChange: (page: number) => void;
}

export function RepoTabs({
	posts,
	repo_id,
	webhookLogs,
	postsTotalPages,
	postsCurrentPage,
	onPostsPageChange,
	isLoadingPosts = false,
}: RepoTabsProps) {
	const [sortBy, setSortBy] = useState("latest");
	const [activeTab, setActiveTab] = useState("all");
	const [searchQuery, setSearchQuery] = useState("");

	// Calculate tab counts
	const tabCounts = useMemo(() => {
		return {
			all: posts.length,
			drafted: posts.filter(p => p.status === "drafted").length,
			published: posts.filter(p => p.status === "published").length,
			scheduled: posts.filter(p => p.status === "scheduled").length,
		};
	}, [posts]);

	// Filter and sort posts
	const filteredAndSortedPosts = useMemo(() => {
		let filtered = posts;

		// Filter by tab
		if (
			activeTab !== "all" &&
			activeTab !== "settings" &&
			activeTab !== "webhooks"
		) {
			filtered = filtered.filter(post => post.status === activeTab);
		}

		// Filter by search query
		if (searchQuery) {
			filtered = filtered.filter(post =>
				post.content.toLowerCase().includes(searchQuery.toLowerCase()),
			);
		}

		// Sort posts
		filtered.sort((a, b) => {
			// eslint-disable-next-line unicorn/consistent-function-scoping
			const getRelevantDate = (post: Post) => {
				switch (activeTab) {
					case "scheduled": {
						return post.scheduled_publish_time || post.created_at;
					}
					case "published": {
						return post.actual_publish_time || post.created_at;
					}
					default: {
						return post.created_at;
					}
				}
			};

			const dateA = new Date(getRelevantDate(a)).getTime();
			const dateB = new Date(getRelevantDate(b)).getTime();

			return sortBy === "latest" ? dateB - dateA : dateA - dateB;
		});

		return filtered;
	}, [posts, activeTab, searchQuery, sortBy]);

	const PostsGrid = ({ posts }: { posts: Post[] }) => {
		if (isLoadingPosts) {
			return (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{Array.from({ length: 6 }).map((_, index) => (
						<SkeletonPostCard key={index} />
					))}
				</div>
			);
		}

		if (posts.length === 0) {
			return (
				<div className="flex flex-col items-center justify-center gap-4 py-20 text-center text-white">
					<div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-900/50 ring-1 ring-zinc-700">
						<Calendar className="h-10 w-10 text-zinc-500" />
					</div>
					<h3 className="text-lg font-semibold text-zinc-300">No posts yet</h3>
					<p className="max-w-sm text-sm text-zinc-500">
						{searchQuery
							? "Try adjusting your search or filters to see matching posts."
							: activeTab === "all"
								? "Posts will appear here once your project has activity."
								: `No ${activeTab} posts available at the moment.`}
					</p>
				</div>
			);
		}

		return (
			<>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{posts.map((post: Post) => (
						<PostCard key={post.id} post={post} />
					))}
				</div>

				{postsTotalPages > 1 && (
					<div className="mt-8">
						<Pagination>
							<PaginationContent className="flex items-center justify-center gap-1">
								<PaginationItem>
									<PaginationPrevious
										href="#"
										onClick={(event: { preventDefault: () => void }) => {
											event.preventDefault();
											if (postsCurrentPage > 1)
												onPostsPageChange(postsCurrentPage - 1);
										}}
										className={`rounded-xl px-3 py-2 text-sm font-medium transition-all duration-300 ${
											postsCurrentPage <= 1
												? "pointer-events-none text-zinc-600 opacity-30"
												: "text-zinc-400 hover:bg-zinc-800/30 hover:text-zinc-200"
										} `}
									/>
								</PaginationItem>

								{Array.from(
									{ length: postsTotalPages },
									(_, index) => index + 1,
								).map(page => {
									if (
										page === 1 ||
										page === postsTotalPages ||
										(page >= postsCurrentPage - 1 &&
											page <= postsCurrentPage + 1)
									) {
										return (
											<PaginationItem key={page}>
												<PaginationLink
													href="#"
													onClick={(event: { preventDefault: () => void }) => {
														event.preventDefault();
														onPostsPageChange(page);
													}}
													className={`rounded-xl px-3 py-2 text-sm font-medium transition-all duration-300 ${
														postsCurrentPage === page
															? "bg-white text-black"
															: "text-zinc-400 hover:bg-zinc-800/30 hover:text-zinc-200"
													} `}
												>
													{page}
												</PaginationLink>
											</PaginationItem>
										);
									} else if (
										page === postsCurrentPage - 2 ||
										page === postsCurrentPage + 2
									) {
										return (
											<PaginationItem key={page}>
												<PaginationEllipsis className="px-2 text-zinc-500" />
											</PaginationItem>
										);
									}
									return;
								})}

								<PaginationItem>
									<PaginationNext
										href="#"
										onClick={(event: any) => {
											event.preventDefault();
											if (postsCurrentPage < postsTotalPages)
												onPostsPageChange(postsCurrentPage + 1);
										}}
										className={`rounded-xl px-3 py-2 text-sm font-medium transition-all duration-300 ${
											postsCurrentPage >= postsTotalPages
												? "pointer-events-none text-zinc-600 opacity-30"
												: "text-zinc-400 hover:bg-zinc-800/30 hover:text-zinc-200"
										} `}
									/>
								</PaginationItem>
							</PaginationContent>
						</Pagination>
					</div>
				)}
			</>
		);
	};

	const webhookErrorCount = webhookLogs.filter(
		log => log.status === "failed",
	).length;

	return (
		<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
			<div className="flex w-full flex-col gap-8 pt-3 text-white">
				{/* Main Header Section */}
				<div className="flex flex-col gap-6">
					{/* Tabs Navigation - Redesigned */}
					<div className="w-full">
						<div className="relative">
							{/* Subtle Background */}
							<div className="absolute inset-0 rounded-2xl bg-zinc-900/30 backdrop-blur-sm"></div>

							{/* Tabs Container */}
							<div className="relative overflow-x-auto">
								<TabsList className="flex min-w-[600px] gap-1 rounded-2xl border border-zinc-800/30 bg-zinc-900/40 p-2 py-6 backdrop-blur-md">
									{/* All */}
									<TabsTrigger
										value="all"
										className="group relative flex items-center gap-2 rounded-xl bg-transparent px-4 py-3 text-zinc-400 transition-all duration-300 hover:bg-zinc-800/30 hover:text-zinc-200 data-[state=active]:bg-white data-[state=active]:text-black"
									>
										<FileText className="h-4 w-4" />
										<span className="hidden font-medium sm:inline">
											All Posts
										</span>
										<span className="font-medium sm:hidden">All</span>
										{tabCounts.all > 0 && (
											<div className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-zinc-700 px-2">
												<span className="text-xs font-semibold text-zinc-300">
													{tabCounts.all}
												</span>
											</div>
										)}
									</TabsTrigger>

									{/* Published */}
									<TabsTrigger
										value="published"
										className="group relative flex items-center gap-2 rounded-xl bg-transparent px-4 py-3 text-zinc-400 transition-all duration-300 hover:bg-zinc-800/30 hover:text-zinc-200 data-[state=active]:bg-white data-[state=active]:text-black"
									>
										<div className="h-2 w-2 rounded-full bg-zinc-500 group-data-[state=active]:bg-zinc-700"></div>
										<span className="hidden font-medium sm:inline">
											Published
										</span>
										<span className="font-medium sm:hidden">Live</span>
										{tabCounts.published > 0 && (
											<div className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-zinc-700 px-2">
												<span className="text-xs font-semibold text-zinc-300">
													{tabCounts.published}
												</span>
											</div>
										)}
									</TabsTrigger>

									{/* Draft */}
									<TabsTrigger
										value="drafted"
										className="group relative flex items-center gap-2 rounded-xl bg-transparent px-4 py-3 text-zinc-400 transition-all duration-300 hover:bg-zinc-800/30 hover:text-zinc-200 data-[state=active]:bg-white data-[state=active]:text-black"
									>
										<div className="h-2 w-2 rounded-full bg-zinc-500 group-data-[state=active]:bg-zinc-700"></div>
										<span className="font-medium">Drafts</span>
										{tabCounts.drafted > 0 && (
											<div className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-zinc-700 px-2">
												<span className="text-xs font-semibold text-zinc-300">
													{tabCounts.drafted}
												</span>
											</div>
										)}
									</TabsTrigger>

									{/* Scheduled */}
									<TabsTrigger
										value="scheduled"
										className="group relative flex items-center gap-2 rounded-xl bg-transparent px-4 py-3 text-zinc-400 transition-all duration-300 hover:bg-zinc-800/30 hover:text-zinc-200 data-[state=active]:bg-white data-[state=active]:text-black"
									>
										<div className="h-2 w-2 rounded-full bg-zinc-500 group-data-[state=active]:bg-zinc-700"></div>
										<span className="hidden font-medium sm:inline">
											Scheduled
										</span>
										<span className="font-medium sm:hidden">Queue</span>
										{tabCounts.scheduled > 0 && (
											<div className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-zinc-700 px-2">
												<span className="text-xs font-semibold text-zinc-300">
													{tabCounts.scheduled}
												</span>
											</div>
										)}
									</TabsTrigger>

									{/* Webhooks */}
									<TabsTrigger
										value="webhooks"
										className="group relative flex items-center gap-2 rounded-xl bg-transparent px-4 py-3 text-zinc-400 transition-all duration-300 hover:bg-zinc-800/30 hover:text-zinc-200 data-[state=active]:bg-white data-[state=active]:text-black"
									>
										<Webhook className="h-4 w-4" />
										<span className="hidden font-medium sm:inline">
											Webhooks
										</span>
										<span className="font-medium sm:hidden">Hooks</span>
										{webhookErrorCount > 0 && (
											<div className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-2">
												<span className="text-xs font-semibold text-white">
													{webhookErrorCount}
												</span>
											</div>
										)}
									</TabsTrigger>

									{/* Settings */}
									<TabsTrigger
										value="settings"
										className="group relative flex items-center gap-2 rounded-xl bg-transparent px-4 py-3 text-zinc-400 transition-all duration-300 hover:bg-zinc-800/30 hover:text-zinc-200 data-[state=active]:bg-white data-[state=active]:text-black"
									>
										<Webhook className="h-4 w-4" />
										<span className="hidden font-medium sm:inline">
											Settings
										</span>
										<span className="font-medium sm:hidden">Config</span>
									</TabsTrigger>
								</TabsList>
							</div>
						</div>
					</div>
					{/* Filters Section - Modern Layout */}
					{["all", "published", "drafted", "scheduled"].includes(activeTab) && (
						<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
							{/* Left Side - Search */}
							<div className="max-w-md flex-1">
								<div className="group relative">
									<div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-100"></div>
									<div className="relative flex items-center">
										<Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 transition-colors duration-200 group-hover:text-zinc-400" />
										<Input
											placeholder="Search your posts..."
											value={searchQuery}
											onChange={event_ => setSearchQuery(event_.target.value)}
											className="h-12 w-full rounded-xl border border-zinc-800/50 bg-zinc-900/50 pl-12 pr-4 font-medium text-white backdrop-blur-sm transition-all duration-200 placeholder:text-zinc-500 hover:border-zinc-700/50 focus:border-blue-500/50 focus:bg-zinc-900/70"
										/>
									</div>
								</div>
							</div>

							{/* Right Side - Sort */}
							<div className="flex items-center gap-3">
								<span className="whitespace-nowrap text-sm font-medium text-zinc-400">
									Sort by:
								</span>
								<div className="w-40">
									<Select value={sortBy} onValueChange={setSortBy}>
										<SelectTrigger className="h-12 rounded-xl border border-zinc-800/50 bg-zinc-900/50 text-white backdrop-blur-sm transition-all duration-200 hover:border-zinc-700/50 focus:border-blue-500/50">
											<div className="flex items-center gap-2">
												<SelectValue placeholder="Choose order" />
											</div>
										</SelectTrigger>
										<SelectContent className="rounded-xl border border-zinc-800/50 bg-zinc-900/95 text-white shadow-2xl backdrop-blur-md">
											<SelectItem value="latest" className="rounded-lg">
												<div className="flex w-full items-center gap-2 px-2 py-2">
													<SortDesc className="h-4 w-4 text-zinc-400" />
													<span className="text-sm">Latest First</span>
												</div>
											</SelectItem>

											<SelectItem value="oldest" className="rounded-lg">
												<div className="flex w-full items-center gap-2 px-2 py-2">
													<SortAsc className="h-4 w-4 text-zinc-400" />
													<span className="text-sm">Oldest First</span>
												</div>
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Optional: Stats Bar */}
				{["all", "published", "drafted", "scheduled"].includes(activeTab) && (
					<div className="flex items-center justify-between rounded-xl border border-zinc-800/30 bg-zinc-900/30 p-4 backdrop-blur-sm">
						<div className="flex items-center gap-4">
							<div className="flex items-center gap-2">
								<div className="h-2 w-2 rounded-full bg-blue-400"></div>
								<span className="text-sm text-zinc-400">
									{activeTab === "all"
										? "All Posts"
										: `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Posts`}
								</span>
							</div>
							{searchQuery && (
								<div className="flex items-center gap-2">
									<div className="h-4 w-1 rounded-full bg-zinc-700"></div>
									<span className="text-sm text-zinc-500">
										Filtered by:{" "}
										<span className="font-medium text-zinc-300">
											&quot;{searchQuery}&quot;
										</span>
									</span>
								</div>
							)}
						</div>
						<div className="text-sm text-zinc-500">
							{sortBy === "latest" ? "Newest to Oldest" : "Oldest to Newest"}
						</div>
					</div>
				)}
			</div>

			<TabsContent value="all" className="space-y-6">
				<PostsGrid posts={filteredAndSortedPosts} />
			</TabsContent>

			<TabsContent value="published" className="space-y-6">
				<PostsGrid posts={filteredAndSortedPosts} />
			</TabsContent>

			<TabsContent value="drafted" className="space-y-6">
				<PostsGrid posts={filteredAndSortedPosts} />
			</TabsContent>

			<TabsContent value="scheduled" className="space-y-6">
				<PostsGrid posts={filteredAndSortedPosts} />
			</TabsContent>

			<TabsContent value="webhooks" className="space-y-6">
				<WebhookTable logs={webhookLogs} isLoading={false} />
			</TabsContent>

			<TabsContent value="settings" className="space-y-6">
				<SettingsPanel repo_id={repo_id} />
			</TabsContent>
		</Tabs>
	);
}
