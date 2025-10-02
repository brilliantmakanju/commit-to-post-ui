/* eslint-disable import/no-unresolved */
"use client";
import { formatDistanceToNow, parseISO } from "date-fns";
import { useMemo, useState } from "react";
import {
	FaCheckCircle,
	FaClock,
	FaDiscord,
	FaFilter,
	FaGlobe,
	FaLinkedin,
	FaTimes,
	FaTwitter,
	FaUsers,
} from "react-icons/fa";

import { XIcon } from "@/components/posts/utils/post-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import useRetrieveUpcomingPost from "@/hooks/core/upcoming";

const platformIconMap = {
	Twitter: <XIcon className="h-4 w-4" />,
	LinkedIn: <FaLinkedin className="h-4 w-4 text-blue-600" />,
	Discord: <FaDiscord className="h-4 w-4 text-indigo-500" />,
	default: <FaGlobe className="h-4 w-4 text-gray-400" />,
} as const;

type Platform = keyof typeof platformIconMap;

const getPlatformIcon = (platform: string) => {
	return platformIconMap[platform as Platform] ?? platformIconMap.default;
};

// Helper function to get status styles (black & white shades only)
const getStatusStyles = (status: string = "") => {
	switch (status.toLowerCase()) {
		case "scheduled": {
			return `
        bg-gray-100 text-gray-900 border border-gray-300
        hover:bg-gray-200 hover:text-black
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400
        active:bg-gray-300
        dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600
        dark:hover:bg-gray-700 dark:hover:text-white
        dark:focus-visible:ring-gray-500
        dark:active:bg-gray-600
      `;
		}
		case "draft": {
			return `
        bg-gray-200 text-gray-800 border border-gray-300
        hover:bg-gray-300 hover:text-black
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400
        active:bg-gray-400
        dark:bg-gray-700 dark:text-gray-200 dark:border-gray-500
        dark:hover:bg-gray-600 dark:hover:text-white
        dark:focus-visible:ring-gray-400
        dark:active:bg-gray-500
      `;
		}
		case "published": {
			return `
        bg-gray-900 text-white border border-gray-900
        hover:bg-black hover:text-white
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500
        active:bg-gray-800
        dark:bg-gray-100 dark:text-black dark:border-gray-300
        dark:hover:bg-gray-200 dark:hover:text-black
        dark:focus-visible:ring-gray-400
        dark:active:bg-gray-300
      `;
		}
		case "failed": {
			return `
        bg-gray-300 text-gray-900 border border-gray-400
        hover:bg-gray-400 hover:text-black
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500
        active:bg-gray-500
        dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500
        dark:hover:bg-gray-500 dark:hover:text-white
        dark:focus-visible:ring-gray-400
        dark:active:bg-gray-400
      `;
		}
		default: {
			return `
        bg-gray-100 text-gray-800 border border-gray-300
        hover:bg-gray-200 hover:text-black
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400
        active:bg-gray-300
        dark:bg-gray-700 dark:text-gray-200 dark:border-gray-500
        dark:hover:bg-gray-600 dark:hover:text-white
        dark:focus-visible:ring-gray-400
        dark:active:bg-gray-500
      `;
		}
	}
};

export const UpcomingPosts = () => {
	const { posts: data, isUpcomingPostsLoading } = useRetrieveUpcomingPost();

	// Filter states
	const [searchTerm, setSearchTerm] = useState("");
	const [showFilters, setShowFilters] = useState(false);
	const [selectedRepo, setSelectedRepo] = useState("all");
	const [selectedStatus, setSelectedStatus] = useState("all");
	const [selectedPlatform, setSelectedPlatform] = useState("all");

	// Get unique values for filter options
	const uniqueRepos = useMemo(() => {
		if (!data) return [];
		return [...new Set(data.map(post => post.repo))].sort();
	}, [data]);

	const uniquePlatforms = useMemo(() => {
		if (!data) return [];
		return [...new Set(data.map(post => post.platform))].sort();
	}, [data]);

	// Filtered data
	const filteredData = useMemo(() => {
		if (!data) return [];

		return data.filter(post => {
			const matchesSearch =
				(post.content || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
				(post.repo || "").toLowerCase().includes(searchTerm.toLowerCase());
			const matchesRepo = selectedRepo === "all" || post.repo === selectedRepo;
			const matchesPlatform =
				selectedPlatform === "all" || post.platform === selectedPlatform;
			const matchesStatus =
				selectedStatus === "all" || post.status === selectedStatus;

			return matchesSearch && matchesRepo && matchesPlatform && matchesStatus;
		});
	}, [data, searchTerm, selectedRepo, selectedPlatform, selectedStatus]);

	// Clear all filters
	const clearFilters = () => {
		setSearchTerm("");
		setSelectedRepo("all");
		setSelectedPlatform("all");
		setSelectedStatus("all");
	};

	const hasActiveFilters =
		searchTerm ||
		selectedRepo !== "all" ||
		selectedPlatform !== "all" ||
		selectedStatus !== "all";

	if (isUpcomingPostsLoading) {
		return <UpcomingPostsSkeleton />;
	}

	if (!data || data.length === 0) {
		return (
			<div className="flex h-[304px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-800/50 p-4 text-center">
				<p className="text-sm font-medium text-zinc-300">No upcoming posts.</p>
				<p className="mt-1 text-xs text-zinc-500">
					When you schedule a post or save a draft, it will appear here.
				</p>
			</div>
		);
	}

	return (
		<div className="no-scrollbar h-[304px] max-h-[306px] space-y-4 overflow-hidden">
			{/* Filter Controls */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Button
						size="sm"
						onClick={() => setShowFilters(!showFilters)}
						className="flex items-center gap-2 border-zinc-800 bg-zinc-900/50 text-zinc-300"
					>
						<FaFilter className="h-3 w-3" />
						Filters
						{hasActiveFilters && (
							<Badge className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 p-0 text-[10px] text-white">
								{
									[
										searchTerm && "search",
										selectedRepo !== "all" && "repo",
										selectedPlatform !== "all" && "platform",
										selectedStatus !== "all" && "status",
									].filter(Boolean).length
								}
							</Badge>
						)}
					</Button>

					{hasActiveFilters && (
						<Button
							variant="ghost"
							size="sm"
							onClick={clearFilters}
							className="text-xs text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300"
						>
							<FaTimes className="mr-1 h-3 w-3" />
							Clear all
						</Button>
					)}
				</div>

				<div className="text-xs text-zinc-500">
					{filteredData.length} of {data.length} posts
				</div>
			</div>

			{/* Filter Panel */}
			{showFilters && (
				<div className="grid grid-cols-1 gap-3 rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4 md:grid-cols-3">
					<div>
						<label className="mb-1 block text-xs font-medium text-zinc-300">
							Search
						</label>
						<Input
							placeholder="Search content or repo..."
							value={searchTerm}
							onChange={event_ => setSearchTerm(event_.target.value)}
							className="h-8 border-zinc-700 bg-zinc-800/50 text-xs text-zinc-200 placeholder:text-zinc-500 focus:border-zinc-600"
						/>
					</div>

					<div>
						<label className="mb-1 block text-xs font-medium text-zinc-300">
							Repository
						</label>
						<Select value={selectedRepo} onValueChange={setSelectedRepo}>
							<SelectTrigger className="h-8 border-zinc-700 bg-zinc-800/50 text-xs text-zinc-200">
								<SelectValue placeholder="All Repositories" />
							</SelectTrigger>
							<SelectContent className="border-zinc-700 bg-zinc-800">
								<SelectItem value="all" className="text-zinc-200">
									All Repositories
								</SelectItem>
								{uniqueRepos.map(repo => (
									<SelectItem key={repo} value={repo} className="text-zinc-200">
										{repo}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div>
						<label className="mb-1 block text-xs font-medium text-zinc-300">
							Platform
						</label>
						<Select
							value={selectedPlatform}
							onValueChange={setSelectedPlatform}
						>
							<SelectTrigger className="h-8 border-zinc-700 bg-zinc-800/50 text-xs text-zinc-200">
								<SelectValue placeholder="All Platforms" />
							</SelectTrigger>
							<SelectContent className="border-zinc-700 bg-zinc-800">
								<SelectItem value="all" className="text-zinc-200">
									All Platforms
								</SelectItem>
								{uniquePlatforms.map(platform => (
									<SelectItem
										key={platform}
										value={platform}
										className="text-zinc-200"
									>
										{platform}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* <div>
						<label className="mb-1 block text-xs font-medium text-zinc-300">
							Status
						</label>
						<Select value={selectedStatus} onValueChange={setSelectedStatus}>
							<SelectTrigger className="h-8 border-zinc-700 bg-zinc-800/50 text-xs text-zinc-200">
								<SelectValue placeholder="All Statuses" />
							</SelectTrigger>
							<SelectContent className="border-zinc-700 bg-zinc-800">
								<SelectItem value="all" className="text-zinc-200">
									All Statuses
								</SelectItem>
								<SelectItem value="Scheduled" className="text-zinc-200">
									Scheduled
								</SelectItem>
								<SelectItem value="Draft" className="text-zinc-200">
									Draft
								</SelectItem>
								<SelectItem value="Published" className="text-zinc-200">
									Published
								</SelectItem>
								<SelectItem value="Failed" className="text-zinc-200">
									Failed
								</SelectItem>
							</SelectContent>
						</Select>
					</div> */}
				</div>
			)}

			{/* Table Container */}
			<div className="scrollbar-hide h-[240px] overflow-auto rounded-lg border border-zinc-800/50">
				{filteredData.length === 0 ? (
					<div className="flex h-full items-center justify-center p-4 text-center">
						<div>
							<p className="text-sm font-medium text-zinc-400">
								No posts match your filters.
							</p>
							<p className="mt-1 text-xs text-zinc-500">
								Try adjusting your search criteria.
							</p>
						</div>
					</div>
				) : (
					<Table>
						<TableHeader>
							<TableRow className="border-zinc-800 hover:bg-transparent">
								<TableHead className="w-[80px] text-start font-medium text-zinc-300">
									Platform
								</TableHead>
								<TableHead className="min-w-[250px] text-start font-medium text-zinc-300">
									Content
								</TableHead>
								<TableHead className="w-[100px] text-start font-medium text-zinc-300">
									Status
								</TableHead>
								<TableHead className="w-[120px] text-start font-medium text-zinc-300">
									Integrations
								</TableHead>
								<TableHead className="w-[150px] text-start font-medium text-zinc-300">
									Scheduled
								</TableHead>
								{/* <TableHead className="w-[80px] text-start font-medium text-zinc-300">
									Media
								</TableHead> */}
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredData.map((post, index) => (
								<TableRow
									key={post.id || `${post.repo}-${post.date}-${index}`}
									className="border-zinc-800/50 hover:bg-zinc-900/30"
								>
									<TableCell className="text-zinc-400">
										<div
											className="flex cursor-pointer items-center justify-center rounded-md p-1.5 transition-colors"
											title={post.platform || "Unknown platform"}
										>
											{getPlatformIcon(post.platform)}
										</div>
									</TableCell>

									<TableCell>
										<div className="space-y-1">
											<div className="flex items-start gap-2">
												<p className="max-w-xs truncate text-sm font-medium text-zinc-200">
													{post.content || "No content"}
												</p>
												<div className="flex items-center gap-1">
													{/* {post.priority && (
														<Badge className="h-4 bg-red-600 px-1 text-xs text-white">
															!
														</Badge>
													)} */}
													{post.is_edited && (
														<Badge className="h-4 border-zinc-600 px-1 text-xs text-zinc-400">
															Edited
														</Badge>
													)}
													{post.is_grouped && (
														<Badge className="h-4 bg-zinc-700 px-1 text-xs text-zinc-300">
															Grouped
														</Badge>
													)}
												</div>
											</div>
											<p className="text-xs text-zinc-500">
												{post.repo || "Unknown repo"}
											</p>
										</div>
									</TableCell>

									<TableCell>
										<Badge className={getStatusStyles(post.status)}>
											{post.status || "Unknown"}
										</Badge>
									</TableCell>

									<TableCell>
										{post.integrations ? (
											<div
												className="group relative cursor-pointer"
												title={`Integrations: ${post.integrations.posted_count || 0}/${post.integrations.planned_count || 0} posted`}
											>
												<div className="flex items-center gap-1 text-xs text-zinc-400">
													<FaUsers className="h-3 w-3" />
													<span>
														{post.integrations.posted_count || 0}/
														{post.integrations.planned_count || 0}
													</span>
													{post.integrations.is_fully_posted && (
														<FaCheckCircle className="h-3 w-3 text-green-500" />
													)}
												</div>

												{/* Tooltip */}
												<div className="absolute bottom-full left-0 z-10 mb-2 hidden w-64 rounded-md border border-zinc-700 bg-zinc-900 p-3 text-white shadow-lg group-hover:block">
													<p className="mb-2 text-xs font-medium">
														Integration Status
													</p>
													{post.integrations.details &&
														post.integrations.details.map(integration => (
															<div
																key={integration.id}
																className="mb-1 flex items-center gap-2 text-xs"
															>
																<div
																	className={`h-2 w-2 rounded-full ${
																		integration.posted
																			? "bg-green-500"
																			: "bg-yellow-500"
																	}`}
																/>
																<span>{integration.display_name}</span>
																<span className="text-zinc-400">
																	({integration.handle})
																</span>
															</div>
														))}
												</div>
											</div>
										) : (
											<div className="flex items-center gap-1 text-xs text-zinc-500">
												<FaUsers className="h-3 w-3" />
												<span>-/-</span>
											</div>
										)}
									</TableCell>

									<TableCell className="text-xs text-zinc-400">
										{post.status === "Scheduled" &&
										post.scheduled_publish_time ? (
											<div className="space-y-1">
												<div className="flex items-center gap-1">
													<FaClock className="h-3 w-3" />
													{formatDistanceToNow(
														new Date(post.scheduled_publish_time),
														{
															addSuffix: true,
														},
													)}
												</div>
												<div className="text-xs text-zinc-500">
													{new Date(
														post.scheduled_publish_time,
													).toLocaleDateString()}
												</div>
											</div>
										) : post.date ? (
											<div className="space-y-1">
												<div className="flex items-center gap-1">
													<FaClock className="h-3 w-3" />
													{formatDistanceToNow(parseISO(post.date), {
														addSuffix: true,
													})}
												</div>
												<div className="text-xs text-zinc-500">
													{new Date(post.date).toLocaleDateString()}
												</div>
											</div>
										) : (
											<div className="space-y-1">
												<div>Draft</div>
												<div className="text-xs text-zinc-500">
													{post.created_at
														? formatDistanceToNow(new Date(post.created_at), {
																addSuffix: true,
															})
														: "Unknown"}
												</div>
											</div>
										)}
									</TableCell>

									{/* <TableCell>
										<div className="flex items-center gap-2">
											{post.media?.has_images && (
												<div
													className="flex cursor-pointer items-center gap-1 text-zinc-400 hover:text-zinc-300"
													title={`${post.media.image_count || 1} image(s)`}
												>
													<FaImage className="h-3 w-3" />
													<span className="text-xs">
														{post.media.image_count || 1}
													</span>
												</div>
											)}
											{post.media?.has_video && (
												<div
													className="cursor-pointer text-zinc-400 hover:text-zinc-300"
													title="Video attached"
												>
													<FaVideo className="h-3 w-3" />
												</div>
											)}
										</div>
									</TableCell> */}
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
			</div>

			{/* Summary Stats */}
			{/* <div className="flex items-center justify-between text-xs text-zinc-500">
				<div className="flex items-center gap-4">
					<span>
						Scheduled:{" "}
						{filteredData.filter(p => p.status === "Scheduled").length}
					</span>
					<span>
						Drafts: {filteredData.filter(p => p.status === "Draft").length}
					</span>
					<span>
						Published:{" "}
						{filteredData.filter(p => p.status === "Published").length}
					</span>
				</div>
				{filteredData.length !== data.length && (
					<div>Filtered from {data.length} total posts</div>
				)}
			</div> */}
		</div>
	);
};

export const UpcomingPostsSkeleton = () => {
	return (
		<div className="no-scrollbar flex h-[304px] flex-col gap-4 overflow-hidden">
			{/* Filter skeleton */}
			<div className="flex items-center justify-between">
				<Skeleton className="h-8 w-20 bg-zinc-800/50" />
				<Skeleton className="h-4 w-24 bg-zinc-800/50" />
			</div>

			{/* Table skeleton */}
			<div className="flex-1 space-y-3 rounded-lg border border-zinc-800/50 p-4">
				{Array.from({ length: 5 }).map((_, index) => (
					<div
						key={index}
						className="flex w-full items-center gap-4 rounded-md border border-zinc-800/40 bg-zinc-900/40 p-3"
					>
						<Skeleton className="h-6 w-6 rounded-md bg-zinc-700" />
						<div className="flex-1 space-y-2">
							<Skeleton className="h-4 w-[70%] bg-zinc-700" />
							<Skeleton className="h-3 w-[40%] bg-zinc-700" />
						</div>
						<Skeleton className="h-5 w-20 rounded-full bg-zinc-700" />
						<div className="space-y-1">
							<Skeleton className="h-4 w-16 bg-zinc-700" />
							<Skeleton className="h-3 w-12 bg-zinc-700" />
						</div>
						<div className="space-y-1">
							<Skeleton className="h-4 w-20 bg-zinc-700" />
							<Skeleton className="h-3 w-16 bg-zinc-700" />
						</div>
						<Skeleton className="h-4 w-8 bg-zinc-700" />
					</div>
				))}
			</div>
		</div>
	);
};
