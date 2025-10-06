/* eslint-disable import/no-unresolved */
"use client";
import { formatDistanceToNow } from "date-fns";
import { useMemo, useState } from "react";
import {
	FaClock,
	FaDiscord,
	FaFilter,
	FaGlobe,
	FaLinkedin,
	FaTimes,
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
import useRetrieveUpcomingPost from "@/hooks/core/upcoming";

const platformIconMap = {
	Twitter: <XIcon className="h-3 w-3" />,
	default: <FaGlobe className="h-3 w-3 text-gray-400" />,
	LinkedIn: <FaLinkedin className="h-3 w-3 text-blue-600" />,
	Discord: <FaDiscord className="h-3 w-3 text-indigo-500" />,
} as const;

type Platform = keyof typeof platformIconMap;

const getPlatformIcon = (platform: string) => {
	return platformIconMap[platform as Platform] ?? platformIconMap.default;
};

export const UpcomingPosts = () => {
	const { posts: data, isUpcomingPostsLoading } = useRetrieveUpcomingPost();

	const [searchTerm, setSearchTerm] = useState("");
	const [showFilters, setShowFilters] = useState(false);
	const [selectedRepo, setSelectedRepo] = useState("all");
	const [selectedPlatform, setSelectedPlatform] = useState("all");

	const uniqueRepos = useMemo(() => {
		if (!data) return [];
		return [...new Set(data.map(post => post.repo))].sort();
	}, [data]);

	const uniquePlatforms = useMemo(() => {
		if (!data) return [];
		return [...new Set(data.map(post => post.platform))].sort();
	}, [data]);

	const filteredData = useMemo(() => {
		if (!data) return [];
		return data.filter(post => {
			const matchesSearch =
				(post.content || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
				(post.repo || "").toLowerCase().includes(searchTerm.toLowerCase());
			const matchesRepo = selectedRepo === "all" || post.repo === selectedRepo;
			const matchesPlatform =
				selectedPlatform === "all" || post.platform === selectedPlatform;
			return matchesSearch && matchesRepo && matchesPlatform;
		});
	}, [data, searchTerm, selectedRepo, selectedPlatform]);

	const clearFilters = () => {
		setSearchTerm("");
		setSelectedRepo("all");
		setSelectedPlatform("all");
	};

	const hasActiveFilters =
		searchTerm || selectedRepo !== "all" || selectedPlatform !== "all";

	if (isUpcomingPostsLoading) {
		return <UpcomingPostsSkeleton />;
	}

	if (!data || data.length === 0) {
		return (
			<div className="flex h-[304px] flex-col items-center justify-center rounded-lg border border-dashed border-zinc-800/50 bg-zinc-900/20 p-4 text-center">
				<p className="text-sm font-medium text-zinc-300">No scheduled posts</p>
				<p className="mt-1 text-xs text-zinc-500">
					Schedule git commits to post automatically
				</p>
			</div>
		);
	}

	return (
		<div className="h-[304px] space-y-2">
			{/* Top Bar */}
			<div className="flex items-center gap-2">
				<Button
					size="sm"
					onClick={() => setShowFilters(!showFilters)}
					className="h-6 gap-1 border-zinc-800 bg-zinc-900/50 px-2 text-[11px] text-zinc-300 hover:bg-zinc-800"
				>
					<FaFilter className="h-2.5 w-2.5" />
					{hasActiveFilters && (
						<Badge className="h-3 w-3 rounded-full bg-blue-600 p-0 text-[8px]">
							{
								[
									searchTerm,
									selectedRepo !== "all",
									selectedPlatform !== "all",
								].filter(Boolean).length
							}
						</Badge>
					)}
				</Button>

				{showFilters && (
					<div className="flex flex-1 gap-1.5">
						<Input
							value={searchTerm}
							placeholder="Search..."
							onChange={event_ => setSearchTerm(event_.target.value)}
							className="h-6 flex-1 border-zinc-700 bg-zinc-800/50 px-2 text-[11px] text-zinc-200 placeholder:text-zinc-500"
						/>
						<Select value={selectedRepo} onValueChange={setSelectedRepo}>
							<SelectTrigger className="h-6 w-24 border-zinc-700 bg-zinc-800/50 px-2 text-[11px] text-zinc-200">
								<SelectValue placeholder="Repo" />
							</SelectTrigger>
							<SelectContent className="border-zinc-700 bg-zinc-800">
								<SelectItem value="all" className="text-[11px] text-zinc-200">
									All
								</SelectItem>
								{uniqueRepos.map(repo => (
									<SelectItem
										key={repo}
										value={repo}
										className="text-[11px] text-zinc-200"
									>
										{repo}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Select
							value={selectedPlatform}
							onValueChange={setSelectedPlatform}
						>
							<SelectTrigger className="h-6 w-24 border-zinc-700 bg-zinc-800/50 px-2 text-[11px] text-zinc-200">
								<SelectValue placeholder="Platform" />
							</SelectTrigger>
							<SelectContent className="border-zinc-700 bg-zinc-800">
								<SelectItem value="all" className="text-[11px] text-zinc-200">
									All
								</SelectItem>
								{uniquePlatforms.map(platform => (
									<SelectItem
										key={platform}
										value={platform}
										className="text-[11px] text-zinc-200"
									>
										{platform}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}

				{hasActiveFilters && (
					<Button
						variant="ghost"
						size="sm"
						onClick={clearFilters}
						className="h-6 px-2 text-[11px] text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300"
					>
						<FaTimes className="h-2.5 w-2.5" />
					</Button>
				)}

				<span className="ml-auto text-[11px] text-zinc-500">
					{filteredData.length}
				</span>
			</div>

			{/* Posts List */}
			<div className="scrollbar-hide h-[274px] space-y-1 overflow-auto rounded-lg border border-zinc-800/50 bg-zinc-900/20 p-1.5">
				{filteredData.length === 0 ? (
					<div className="flex h-full items-center justify-center">
						<p className="text-xs text-zinc-400">No posts match filters</p>
					</div>
				) : (
					filteredData.map((post, index) => (
						<div
							key={post.id || `${post.repo}-${index}`}
							className="group flex gap-1.5 rounded border border-zinc-800/40 bg-zinc-900/50 p-1.5 transition-colors hover:border-zinc-700/60 hover:bg-zinc-900/70"
						>
							{/* Platform */}
							<div
								className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-zinc-800/50"
								title={post.platform}
							>
								{getPlatformIcon(post.platform)}
							</div>

							{/* Content */}
							<div className="min-w-0 flex-1 space-y-0.5">
								<div className="flex items-start gap-1.5">
									<p className="line-clamp-1 flex-1 text-[11px] font-medium leading-tight text-zinc-200">
										{post.content || "No content"}
									</p>
									{(post.is_grouped || post.is_edited) && (
										<div className="flex shrink-0 gap-0.5">
											{post.is_grouped && (
												<Badge className="h-3.5 border-zinc-600 bg-zinc-800 px-1 text-[8px] text-zinc-400">
													G
												</Badge>
											)}
											{post.is_edited && (
												<Badge className="h-3.5 border-zinc-600 bg-zinc-800 px-1 text-[8px] text-zinc-400">
													E
												</Badge>
											)}
										</div>
									)}
								</div>

								<div className="flex items-center justify-between text-[10px] text-zinc-500">
									<span className="truncate">{post.repo}</span>
									<div className="flex shrink-0 items-center gap-1.5">
										{post.integrations && (
											<span
												className={
													post.integrations.is_fully_posted
														? "text-green-500"
														: "text-yellow-500"
												}
												title={`${post.integrations.posted_count}/${post.integrations.planned_count} posted`}
											>
												{post.integrations.posted_count}/
												{post.integrations.planned_count}
											</span>
										)}
										{post.scheduled_publish_time && (
											<span
												className="flex items-center gap-0.5"
												title={new Date(
													post.scheduled_publish_time,
												).toLocaleString()}
											>
												<FaClock className="h-2 w-2" />
												{formatDistanceToNow(
													new Date(post.scheduled_publish_time),
													{
														addSuffix: true,
													},
												)}
											</span>
										)}
									</div>
								</div>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
};

export const UpcomingPostsSkeleton = () => {
	return (
		<div className="h-[104px] space-y-2">
			<div className="flex items-center gap-2">
				<Skeleton className="h-6 w-14 bg-zinc-800/50" />
				<Skeleton className="h-3 w-6 bg-zinc-800/50" />
			</div>
			<div className="space-y-1 rounded-lg border border-zinc-800/50 bg-zinc-900/20 p-1.5">
				{Array.from({ length: 3 }).map((_, index) => (
					<div
						key={index}
						className="flex gap-1.5 rounded border border-zinc-800/40 bg-zinc-900/50 p-1.5"
					>
						<Skeleton className="h-5 w-5 shrink-0 rounded bg-zinc-700" />
						<div className="min-w-0 flex-1 space-y-1">
							<Skeleton className="h-3 w-[90%] bg-zinc-700" />
							<div className="flex justify-between">
								<Skeleton className="h-2 w-16 bg-zinc-700" />
								<Skeleton className="h-2 w-20 bg-zinc-700" />
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};
