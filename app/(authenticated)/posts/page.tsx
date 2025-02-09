"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
	CalendarIcon,
	CalendarPlus2Icon as CalendarIcon2,
	Clock,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

import PostCard from "@/components/posts/post-card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { fetchPosts } from "@/server-actions/core/get-posts";

interface Post {
	id: string;
	content: string;
	platform: "twitter" | "linkedin";
	status: "published" | "scheduled" | "drafted";
	created_at: string;
	image_urls: string[];
	is_deleted: boolean;
	is_inactive: boolean;
	organization: string;
	original_status: string | null;
	post_group: string | null;
	updated_at: string;
	video_url: string | null;
}

interface FilterState {
	date: Date | undefined;
	platform: string;
	status: string;
}

interface PageData {
	results: Post[];
	nextCursor: number | null;
}

export default function Posts() {
	const [filters, setFilters] = useState<FilterState>({
		date: undefined,
		platform: "all",
		status: "all",
	});
	const [showFullDate, setShowFullDate] = useState(false);
	const { ref, inView } = useInView();

	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
		useInfiniteQuery<PageData, Error>({
			queryKey: ["posts"],
			queryFn: async ({ pageParam: pageParameter = 1 }) => {
				const result = await fetchPosts(pageParameter);
				if (!result.success) {
					throw new Error("Failed to fetch posts");
				}
				// Limit to 5 posts per page
				result.data.results = result.data.results.slice(0, 5);
				return result.data;
			},
			getNextPageParam: lastPage => lastPage.nextCursor,
			initialPageParam: 1,
		});

	useEffect(() => {
		if (inView && hasNextPage) {
			fetchNextPage();
		}
	}, [inView, fetchNextPage, hasNextPage]);

	const handleFilterChange = (
		key: keyof FilterState,
		value: string | Date | undefined,
	) => {
		setFilters(previous => ({ ...previous, [key]: value }));
	};

	const filteredPosts =
		data?.pages.flatMap(page =>
			page.results.filter((post: Post) => {
				if (
					filters.date &&
					format(new Date(post.created_at), "yyyy-MM-dd") !==
						format(filters.date, "yyyy-MM-dd")
				)
					return false;
				if (filters.platform !== "all" && post.platform !== filters.platform)
					return false;
				if (filters.status !== "all" && post.status !== filters.status)
					return false;
				return true;
			}),
		) || [];

	return (
		<div className="p-4">
			<div className="mb-6">
				<h1 className="text-2xl font-bold">Posts</h1>
			</div>

			<div className="mb-6 flex flex-wrap gap-4 sm:grid sm:grid-cols-4">
				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							className="w-full justify-start bg-transparent text-left font-normal"
						>
							<CalendarIcon className="mr-2 h-4 w-4" />
							{filters.date ? (
								format(filters.date, "PPP")
							) : (
								<span>Pick a date</span>
							)}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-auto p-0" align="start">
						<Calendar
							mode="single"
							selected={filters.date}
							onSelect={date => handleFilterChange("date", date)}
							initialFocus
						/>
					</PopoverContent>
				</Popover>
				<Select onValueChange={value => handleFilterChange("platform", value)}>
					<SelectTrigger className="w-full">
						<SelectValue placeholder="Select platform" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Platforms</SelectItem>
						<SelectItem value="twitter">Twitter</SelectItem>
						<SelectItem value="linkedin">LinkedIn</SelectItem>
					</SelectContent>
				</Select>
				<Select onValueChange={value => handleFilterChange("status", value)}>
					<SelectTrigger className="w-full">
						<SelectValue placeholder="Select status" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Statuses</SelectItem>
						<SelectItem value="drafted">Drafted</SelectItem>
						<SelectItem value="scheduled">Scheduled</SelectItem>
						<SelectItem value="published">Published</SelectItem>
					</SelectContent>
				</Select>
				<Button
					variant="outline"
					size="sm"
					onClick={() => setShowFullDate(!showFullDate)}
					className="w-full items-center justify-start bg-transparent text-left"
				>
					{showFullDate ? (
						<Clock className="mr-2 h-4 w-4" />
					) : (
						<CalendarIcon2 className="mr-2 h-4 w-4" />
					)}
					{showFullDate ? "Show Relative Date" : "Show Full Date"}
				</Button>
			</div>

			<div className="flex gap-[5px]">
				{filteredPosts.map((post: Post) => (
					<PostCard key={post.id} post={post} showFullDate={showFullDate} />
				))}
			</div>

			{isLoading ? (
				<div>Loading...</div>
			) : (
				<div ref={ref} className="pt-[50rem] text-center">
					{isFetchingNextPage
						? "Loading more..."
						: hasNextPage
							? "Load More"
							: "Nothing more to load"}
				</div>
			)}
		</div>
	);
}
