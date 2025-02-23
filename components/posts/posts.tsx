"use client";

import { useQuery } from "@tanstack/react-query";
import { FileText } from "lucide-react";
import { useState } from "react";

import { fetchPosts } from "@/server-actions/core/get-posts";

import Pagination from "./pagination";
import PostFilters from "./post-filter";
import PostList from "./post-list";
import SkeletonPostCard from "./post-skeleton";

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

interface FilterState {
	date: Date | undefined;
	platform: string;
	status: string;
}

interface PageData {
	count: number;
	next: string | null;
	previous: string | null;
	results: Post[];
}

const PAGE_SIZE = 50;

// Helper function to filter posts (both grouped and single)
function filterPosts(results: any[], filters: FilterState): any[] {
	return results.reduce((accumulator: any[], item: any) => {
		// Check if item is a group (has "posts" property)
		if ("posts" in item && Array.isArray(item.posts)) {
			// If no filter is applied, return the entire group as is
			if (
				filters.platform === "all" &&
				filters.status === "all" &&
				!filters.date
			) {
				accumulator.push(item);
				return accumulator;
			}

			// Filter posts inside the group
			const filteredGroupPosts = (item.posts as Post[]).filter((post: Post) => {
				if (filters.platform !== "all" && post.platform !== filters.platform) {
					return false;
				}
				if (filters.status !== "all" && post.status !== filters.status) {
					return false;
				}
				if (filters.date) {
					const postDate = new Date(post.created_at).toDateString();
					const filterDate = new Date(filters.date).toDateString();
					if (postDate !== filterDate) {
						return false;
					}
				}
				return true;
			});

			// Only include group if any posts match the filters
			if (filteredGroupPosts.length > 0) {
				accumulator.push({ ...item, posts: filteredGroupPosts });
			}
			return accumulator;
		} else {
			// Single post item
			const post = item as Post;
			if (filters.platform !== "all" && post.platform !== filters.platform) {
				return accumulator;
			}
			if (filters.status !== "all" && post.status !== filters.status) {
				return accumulator;
			}
			if (filters.date) {
				const postDate = new Date(post.created_at).toDateString();
				const filterDate = new Date(filters.date).toDateString();
				if (postDate !== filterDate) {
					return accumulator;
				}
			}
			accumulator.push(post);
			return accumulator;
		}
	}, []);
}

export default function Posts() {
	const [filters, setFilters] = useState<FilterState>({
		date: undefined,
		platform: "all",
		status: "all",
	});
	const [showFullDate, setShowFullDate] = useState(false);
	const [currentPage, setCurrentPage] = useState<number>(1);

	const { data, isLoading, error } = useQuery({
		queryKey: ["posts", currentPage],
		queryFn: async () => {
			const result = await fetchPosts({
				page_size: currentPage,
			});
			if (!result.success) {
				throw new Error("Failed to fetch posts");
			}
			return result.data;
		},
	});

	// Frontend filtering: flatten groups and filter both single posts and grouped posts
	const filteredResults = data ? filterPosts(data.results, filters) : [];

	const totalPages = Math.ceil(filteredResults.length / PAGE_SIZE);
	const paginatedResults = filteredResults.slice(
		(currentPage - 1) * PAGE_SIZE,
		currentPage * PAGE_SIZE,
	);

	const handleFilterChange = (
		key: keyof FilterState,
		value: string | Date | undefined,
	) => {
		setFilters(previous => ({ ...previous, [key]: value }));
	};

	const EmptyState = () => (
		<div className="flex h-[52vh] flex-col items-center justify-center">
			<div className="flex h-12 w-12 items-center justify-center">
				<FileText className="h-16 w-16 text-gray-200" />
			</div>
			<h3 className="text-md mt-2 text-center font-medium text-gray-300">
				No AI-generated posts yet
			</h3>
			<p className="mt-2 max-w-sm text-center text-sm text-gray-400">
				No posts have been generated. Please visit the settings page to connect
				your account and start generating posts.
			</p>
		</div>
	);

	const EmptyStateFilter = () => (
		<div className="flex h-[52vh] flex-col items-center justify-center">
			<div className="flex h-12 w-12 items-center justify-center">
				<FileText className="h-16 w-16 text-gray-200" />
			</div>
			<h3 className="text-md mt-2 text-center font-medium text-gray-300">
				No posts found for this filter
			</h3>
			<p className="mt-2 max-w-sm text-center text-sm text-gray-400">
				Try adjusting your filters or check back later for new posts.
			</p>
		</div>
	);

	return (
		<div className="p-4">
			<PostFilters
				filters={filters}
				disabled={isLoading}
				showFullDate={showFullDate}
				onFilterChange={handleFilterChange}
				onToggleFullDate={() => setShowFullDate(!showFullDate)}
			/>

			{isLoading ? (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{Array.from({ length: 20 }).map((_, index) => (
						<SkeletonPostCard key={index} />
					))}
				</div>
			) : error ? (
				<div>Error: {error.message}</div>
			) : data?.results.length === 0 ? (
				<EmptyState />
			) : filteredResults.length === 0 ? (
				<EmptyStateFilter />
			) : (
				<>
					<PostList
						posts={paginatedResults || []}
						showFullDate={showFullDate}
					/>
				</>
			)}
			<Pagination
				disabled={isLoading}
				currentPage={currentPage}
				totalPages={totalPages}
				onPageChange={setCurrentPage}
			/>
		</div>
	);
}
