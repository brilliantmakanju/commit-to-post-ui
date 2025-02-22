"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { fetchPosts } from "@/server-actions/core/get-posts";

import Pagination from "./pagination";
import PostFilters from "./post-filter";
import PostList from "./post-list";

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

export default function Posts() {
	const [filters, setFilters] = useState<FilterState>({
		date: undefined,
		platform: "all",
		status: "all",
	});
	const [showFullDate, setShowFullDate] = useState(false);
	const [currentPage, setCurrentPage] = useState<number>(1);

	const { data, isLoading, error } = useQuery<PageData, Error>({
		queryKey: ["posts", currentPage, filters],
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

	const handleFilterChange = (
		key: keyof FilterState,
		value: string | Date | undefined,
	) => {
		setFilters(previous => ({ ...previous, [key]: value }));
		setCurrentPage(1); // Reset to first page when filters change
	};
	console.log(data, "Datas");

	const totalPages = data ? Math.ceil(data.count / 50) : 0;
	return (
		<div className="p-4">
			<div className="mb-6">
				<h1 className="text-2xl font-bold">Posts</h1>
			</div>

			<PostFilters
				filters={filters}
				showFullDate={showFullDate}
				onFilterChange={handleFilterChange}
				onToggleFullDate={() => setShowFullDate(!showFullDate)}
			/>

			{isLoading ? (
				<div>Loading...</div>
			) : error ? (
				<div>Error: {error.message}</div>
			) : (
				<>
					<PostList posts={data?.results || []} showFullDate={showFullDate} />
					<Pagination
						currentPage={currentPage}
						totalPages={totalPages}
						onPageChange={setCurrentPage}
					/>
				</>
			)}
		</div>
	);
}
