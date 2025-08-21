"use client";

import { UUID } from "node:crypto";

import {
	Calendar,
	FileText,
	Search,
	Settings,
	SortAsc,
	SortDesc,
	Webhook,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import GroupedPostCard from "../posts/grouped-posts";
import SkeletonPostCard from "../posts/post-skeleton";
import { SettingsPanel } from "./settings/settings-panel";
import WebhookTable from "./webhook/webhook-table";

interface PostItem {
	id: string;
	content: string;
	created_at: string;
	updated_at: string;
	is_deleted: boolean;
	image_urls: string[];
	video_url: string | null;
	organization: string;
	is_inactive: boolean;
	posted_channels: string[];
	planned_channels: string[];
	actual_publish_time: string | null;
	scheduled_publish_time: string | null;
	status: "published" | "scheduled" | "drafted";
	post_group: string | null;
	original_status: string | null;
}

interface PostGroup {
	group_id: UUID;
	latest_created_at: string;
	posts: PostItem[];
}

interface WebhookPingLog {
	id: string;
	client_ip: string;
	received_at: string;
	github_event: string;
	request_size: number;
	http_status: number | null;
	completed_at: string | null;
	response_body: string | null;
	processing_time_ms: number | null;
	status: "processing" | "success" | "failed";
}

interface RepoTabsProps {
	repo_id: UUID;
	posts: PostGroup[];
	postsTotalPages: number;
	isLoadingPosts?: boolean;
	postsCurrentPage: number;
	webhookLogs: WebhookPingLog[];
	onPostsPageChange: (page: number) => void;
}

// Valid tab values
const VALID_TABS = [
	"all",
	"published",
	"drafted",
	"scheduled",
	"webhooks",
	"settings",
] as const;
type ValidTab = (typeof VALID_TABS)[number];

// Helper function to validate and normalize tab value
const normalizeTabValue = (tab: string | null): ValidTab => {
	if (!tab) return "all";

	// Handle common variations
	const tabMap: Record<string, ValidTab> = {
		all: "all",
		posts: "all",
		published: "published",
		live: "published",
		drafted: "drafted",
		drafts: "drafted",
		draft: "drafted",
		scheduled: "scheduled",
		queue: "scheduled",
		webhooks: "webhooks",
		hooks: "webhooks",
		webhook: "webhooks",
		settings: "settings",
		setting: "settings",
		config: "settings",
	};

	const normalizedTab = tabMap[tab.toLowerCase()];
	return normalizedTab || "all";
};

// Helper function to get the primary status of a post group
const getGroupStatus = (
	group: PostGroup,
): "published" | "scheduled" | "drafted" => {
	// If all posts have the same status, return that status
	const statuses = group.posts.map(post => post.status);
	const uniqueStatuses = [...new Set(statuses)];

	if (uniqueStatuses.length === 1) {
		return uniqueStatuses[0];
	}

	// If mixed statuses, prioritize in order: published > scheduled > drafted
	if (statuses.includes("published")) return "published";
	if (statuses.includes("scheduled")) return "scheduled";
	return "drafted";
};

const getRelevantDate = (group: PostGroup, activeTab: ValidTab) => {
	const groupStatus = getGroupStatus(group);

	// Find the most relevant post in the group for sorting
	const relevantPost =
		group.posts.find(post => post.status === groupStatus) || group.posts[0];

	switch (activeTab) {
		case "scheduled": {
			return relevantPost.scheduled_publish_time || relevantPost.created_at;
		}
		case "published": {
			return relevantPost.actual_publish_time || relevantPost.created_at;
		}
		default: {
			return group.latest_created_at;
		}
	}
};

export function RepoTabs({
	posts,
	repo_id,
	webhookLogs,
	postsTotalPages,
	postsCurrentPage,
	onPostsPageChange,
	isLoadingPosts = false,
}: RepoTabsProps) {
	const router = useRouter();
	const searchParams = useSearchParams();

	// Use refs to track previous values and prevent unnecessary updates
	const previousSearchParamsRef = useRef<string>("");
	const updateTimeoutRef = useRef<NodeJS.Timeout>();

	// Initialize state from URL params
	const initialTab = normalizeTabValue(searchParams.get("tab"));
	const initialSort =
		searchParams.get("sort") === "oldest" ? "oldest" : "latest";
	const initialSearch = searchParams.get("search") || "";

	const [sortBy, setSortBy] = useState(initialSort);
	const [activeTab, setActiveTab] = useState<ValidTab>(initialTab);
	const [searchQuery, setSearchQuery] = useState(initialSearch);

	// Memoized function to update URL parameters - prevents recreation on every render
	const updateURL = useCallback(
		(newTab?: ValidTab, newSort?: string, newSearch?: string) => {
			const params = new URLSearchParams(searchParams.toString());

			// Update tab parameter
			if (newTab !== undefined) {
				if (newTab === "all") {
					params.delete("tab");
				} else {
					params.set("tab", newTab);
				}
			}

			// Update sort parameter
			if (newSort !== undefined) {
				if (newSort === "latest") {
					params.delete("sort");
				} else {
					params.set("sort", newSort);
				}
			}

			// Update search parameter
			if (newSearch !== undefined) {
				if (newSearch === "") {
					params.delete("search");
				} else {
					params.set("search", newSearch);
				}
			}

			const newParamsString = params.toString();

			// Only update URL if it actually changed
			if (previousSearchParamsRef.current !== newParamsString) {
				previousSearchParamsRef.current = newParamsString;
				const newURL = newParamsString
					? `?${newParamsString}`
					: globalThis.location.pathname;
				router.replace(newURL, { scroll: false });
			}
		},
		[searchParams, router],
	);

	// Memoized tab change handler
	const handleTabChange = useCallback(
		(newTab: string) => {
			const normalizedTab = normalizeTabValue(newTab);
			setActiveTab(normalizedTab);
			updateURL(normalizedTab);
		},
		[updateURL],
	);

	// Memoized sort change handler
	const handleSortChange = useCallback(
		(newSort: string) => {
			setSortBy(newSort);
			updateURL(undefined, newSort);
		},
		[updateURL],
	);

	// Memoized search change handler
	const handleSearchChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			setSearchQuery(event.target.value);
		},
		[],
	);

	// Handle search change with debouncing - separated from the input handler
	useEffect(() => {
		// Clear existing timeout
		if (updateTimeoutRef.current) {
			clearTimeout(updateTimeoutRef.current);
		}

		updateTimeoutRef.current = setTimeout(() => {
			updateURL(undefined, undefined, searchQuery);
		}, 300); // 300ms debounce

		return () => {
			if (updateTimeoutRef.current) {
				clearTimeout(updateTimeoutRef.current);
			}
		};
	}, [searchQuery, updateURL]);

	// Sync state with URL changes (for browser back/forward) - only when actually changed
	useEffect(() => {
		const currentParamsString = searchParams.toString();

		// Only update if params actually changed
		if (previousSearchParamsRef.current !== currentParamsString) {
			const tab = normalizeTabValue(searchParams.get("tab"));
			const sort = searchParams.get("sort") === "oldest" ? "oldest" : "latest";
			const search = searchParams.get("search") || "";

			setActiveTab(tab);
			setSortBy(sort);
			setSearchQuery(search);
			previousSearchParamsRef.current = currentParamsString;
		}
	}, [searchParams]);

	// Calculate tab counts - counts actual PostItem, not groups
	const tabCounts = useMemo(() => {
		const allPosts = posts.flatMap(group => group.posts);

		return {
			all: allPosts.length,
			drafted: allPosts.filter(post => post.status === "drafted").length,
			published: allPosts.filter(post => post.status === "published").length,
			scheduled: allPosts.filter(post => post.status === "scheduled").length,
		};
	}, [posts]);

	// Filter and sort posts - memoized with stable dependencies
	const filteredAndSortedPosts = useMemo(() => {
		let filtered = posts;

		// Filter by tab
		if (
			activeTab !== "all" &&
			activeTab !== "settings"
			// &&
			// activeTab !== "webhooks"
		) {
			filtered = filtered.filter(group => getGroupStatus(group) === activeTab);
		}

		// Filter by search query
		if (searchQuery) {
			const lowerSearchQuery = searchQuery.toLowerCase();
			filtered = filtered.filter(group =>
				group.posts.some(post =>
					post.content.toLowerCase().includes(lowerSearchQuery),
				),
			);
		}

		// Sort posts
		filtered.sort((a, b) => {
			const dateA = new Date(getRelevantDate(a, activeTab)).getTime();
			const dateB = new Date(getRelevantDate(b, activeTab)).getTime();
			return sortBy === "latest" ? dateB - dateA : dateA - dateB;
		});

		return filtered;
	}, [posts, activeTab, searchQuery, sortBy]);

	// Memoized pagination handlers to prevent re-renders
	const handlePreviousPage = useCallback(
		(event: React.MouseEvent) => {
			event.preventDefault();
			if (postsCurrentPage > 1) {
				onPostsPageChange(postsCurrentPage - 1);
			}
		},
		[postsCurrentPage, onPostsPageChange],
	);

	const handleNextPage = useCallback(
		(event: React.MouseEvent) => {
			event.preventDefault();
			if (postsCurrentPage < postsTotalPages) {
				onPostsPageChange(postsCurrentPage + 1);
			}
		},
		[postsCurrentPage, postsTotalPages, onPostsPageChange],
	);

	const handlePageClick = useCallback(
		(page: number) => {
			return (event: React.MouseEvent) => {
				event.preventDefault();
				onPostsPageChange(page);
			};
		},
		[onPostsPageChange],
	);

	// Memoized webhook error count
	const webhookErrorCount = useMemo(() => {
		return webhookLogs.filter(log => log.status === "failed").length;
	}, [webhookLogs]);

	// Memoized PostsGrid component to prevent unnecessary re-renders
	const PostsGrid = useCallback(
		({ posts }: { posts: PostGroup[] }) => {
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
						<h3 className="text-lg font-semibold text-zinc-300">
							No posts yet
						</h3>
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
						{posts.map((postGroup: PostGroup, index) => (
							<GroupedPostCard
								key={`${postGroup.group_id}_${index}`}
								group={postGroup}
							/>
						))}
					</div>

					{postsTotalPages > 1 && (
						<div className="mt-8">
							<Pagination>
								<PaginationContent className="flex items-center justify-center gap-1">
									<PaginationItem>
										<PaginationPrevious
											href="#"
											onClick={handlePreviousPage}
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
														onClick={handlePageClick(page)}
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
											onClick={handleNextPage}
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
		},
		[
			isLoadingPosts,
			searchQuery,
			activeTab,
			postsTotalPages,
			postsCurrentPage,
			handlePreviousPage,
			handleNextPage,
			handlePageClick,
		],
	);

	return (
		<Tabs
			value={activeTab}
			onValueChange={handleTabChange}
			className="space-y-6 pb-5"
		>
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
										disabled={isLoadingPosts}
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
									{/* <TabsTrigger
										value="published"
										disabled={isLoadingPosts}
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
									</TabsTrigger> */}

									{/* Draft */}
									{/* <TabsTrigger
										value="drafted"
										disabled={isLoadingPosts}
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
									</TabsTrigger> */}

									{/* Scheduled */}
									{/* <TabsTrigger
										value="scheduled"
										disabled={isLoadingPosts}
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
									</TabsTrigger> */}

									{/* Webhooks */}
									<TabsTrigger
										value="webhooks"
										disabled={isLoadingPosts}
										className="group relative flex items-center gap-2 rounded-xl bg-transparent px-4 py-3 text-zinc-400 transition-all duration-300 hover:bg-zinc-800/30 hover:text-zinc-200 data-[state=active]:bg-white data-[state=active]:text-black"
									>
										<Webhook className="h-4 w-4" />
										<span className="hidden font-medium sm:inline">
											Webhooks
										</span>
										<span className="font-medium sm:hidden">Hooks</span>
										{/* {webhookErrorCount > 0 && (
											<div className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-2">
												<span className="text-xs font-semibold text-white">
													{webhookErrorCount}
												</span>
											</div>
										)} */}
									</TabsTrigger>

									{/* Settings */}
									<TabsTrigger
										value="settings"
										disabled={isLoadingPosts}
										className="group relative flex items-center gap-2 rounded-xl bg-transparent px-4 py-3 text-zinc-400 transition-all duration-300 hover:bg-zinc-800/30 hover:text-zinc-200 data-[state=active]:bg-white data-[state=active]:text-black"
									>
										<Settings className="h-4 w-4" />
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
											value={searchQuery}
											disabled={isLoadingPosts}
											placeholder="Search your posts..."
											onChange={handleSearchChange}
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
									<Select value={sortBy} onValueChange={handleSortChange}>
										<SelectTrigger
											disabled={isLoadingPosts}
											className="h-12 rounded-xl border border-zinc-800/50 bg-zinc-900/50 text-white backdrop-blur-sm transition-all duration-200 hover:border-zinc-700/50 focus:border-blue-500/50"
										>
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

			{/* <TabsContent value="published" className="space-y-6">
				<PostsGrid posts={filteredAndSortedPosts} />
			</TabsContent>

			<TabsContent value="drafted" className="space-y-6">
				<PostsGrid posts={filteredAndSortedPosts} />
			</TabsContent>

			<TabsContent value="scheduled" className="space-y-6">
				<PostsGrid posts={filteredAndSortedPosts} />
			</TabsContent> */}

			<TabsContent value="webhooks" className="space-y-6">
				<WebhookTable logs={webhookLogs} isLoading={false} />
			</TabsContent>

			<TabsContent value="settings" className="space-y-6">
				<SettingsPanel repo_id={repo_id} />
			</TabsContent>
		</Tabs>
	);
}
