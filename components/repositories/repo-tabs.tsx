/* eslint-disable import/no-unresolved */
"use client";

import { UUID } from "node:crypto";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
	countPostsByStatus,
	getAllPostsFromGroup,
	groupHasStatus,
} from "@/lib/post-transformer";
import { PostGroup } from "@/types";

import PostsGrid from "../posts/posts-grid";
import PaginationControls from "../ui/pagination-controls";
import SearchAndFilters from "./search-and-filters";
import { SettingsPanel } from "./settings/settings-panel";
import StatsBar from "./stats-bar";
import TabsNavigation from "./tabs-navigation";
import WebhookTable from "./webhook/webhook-table";

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
	// Get all posts from the nested structure
	const allPosts = getAllPostsFromGroup(group);

	if (allPosts.length === 0) return "drafted";

	// If all posts have the same status, return that status
	const statuses = allPosts.map(post => post.status);
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
	const allPosts = getAllPostsFromGroup(group);
	const groupStatus = getGroupStatus(group);

	// Find the most relevant post in the group for sorting
	const relevantPost =
		allPosts.find(post => post.status === groupStatus) || allPosts[0];

	if (!relevantPost) return group.latest_created_at;

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

	// Calculate tab counts - Updated to work with nested structure
	const tabCounts = useMemo(() => {
		if (!posts || posts.length === 0) {
			return { all: 0, drafted: 0, published: 0, scheduled: 0 };
		}

		let allCount = 0;
		let draftedCount = 0;
		let publishedCount = 0;
		let scheduledCount = 0;

		posts.forEach(group => {
			allCount += group.total_posts;
			draftedCount += countPostsByStatus(group, "drafted");
			publishedCount += countPostsByStatus(group, "published");
			scheduledCount += countPostsByStatus(group, "scheduled");
		});

		return {
			all: allCount,
			drafted: draftedCount,
			published: publishedCount,
			scheduled: scheduledCount,
		};
	}, [posts]);

	// Filter and sort posts - Updated for nested structure
	const filteredAndSortedPosts = useMemo(() => {
		if (!posts || posts.length === 0) return [];

		let filtered = [...posts];

		// Filter by tab
		if (activeTab !== "all" && activeTab !== "settings") {
			filtered = filtered.filter(group =>
				groupHasStatus(
					group,
					activeTab as "published" | "scheduled" | "drafted",
				),
			);
		}

		// Filter by search query
		if (searchQuery) {
			const lowerSearchQuery = searchQuery.toLowerCase();
			filtered = filtered.filter(group => {
				const allPosts = getAllPostsFromGroup(group);
				return allPosts.some(post =>
					post.content.toLowerCase().includes(lowerSearchQuery),
				);
			});
		}

		// Sort posts
		filtered.sort((a, b) => {
			const dateA = new Date(getRelevantDate(a, activeTab)).getTime();
			const dateB = new Date(getRelevantDate(b, activeTab)).getTime();
			return sortBy === "latest" ? dateB - dateA : dateA - dateB;
		});

		return filtered;
	}, [posts, activeTab, searchQuery, sortBy]);

	// Memoized webhook error count
	const webhookErrorCount = useMemo(() => {
		return webhookLogs.filter(log => log.status === "failed").length;
	}, [webhookLogs]);

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
					<TabsNavigation
						activeTab={activeTab}
						tabCounts={tabCounts}
						isLoading={isLoadingPosts}
						webhookErrorCount={webhookErrorCount}
					/>
					{/* Filters Section - Modern Layout */}
					{["all", "published", "drafted", "scheduled"].includes(activeTab) && (
						<SearchAndFilters
							sortBy={sortBy}
							searchQuery={searchQuery}
							isLoading={isLoadingPosts}
							onSortChange={handleSortChange}
							onSearchChange={handleSearchChange}
						/>
					)}
				</div>

				{/* Optional: Stats Bar */}
				{["all", "published", "drafted", "scheduled"].includes(activeTab) && (
					<StatsBar
						sortBy={sortBy}
						activeTab={activeTab}
						searchQuery={searchQuery}
					/>
				)}
			</div>

			<TabsContent value="all" className="space-y-6">
				<PostsGrid posts={filteredAndSortedPosts} isLoading={isLoadingPosts} />
				<PaginationControls
					totalPages={postsTotalPages}
					currentPage={postsCurrentPage}
					onPageChange={onPostsPageChange}
				/>
			</TabsContent>

			<TabsContent value="published" className="space-y-6">
				<PostsGrid posts={filteredAndSortedPosts} isLoading={isLoadingPosts} />
				<PaginationControls
					totalPages={postsTotalPages}
					currentPage={postsCurrentPage}
					onPageChange={onPostsPageChange}
				/>
			</TabsContent>

			<TabsContent value="drafted" className="space-y-6">
				<PostsGrid posts={filteredAndSortedPosts} isLoading={isLoadingPosts} />
				<PaginationControls
					totalPages={postsTotalPages}
					currentPage={postsCurrentPage}
					onPageChange={onPostsPageChange}
				/>
			</TabsContent>

			<TabsContent value="scheduled" className="space-y-6">
				<PostsGrid posts={filteredAndSortedPosts} isLoading={isLoadingPosts} />
				<PaginationControls
					totalPages={postsTotalPages}
					currentPage={postsCurrentPage}
					onPageChange={onPostsPageChange}
				/>
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
