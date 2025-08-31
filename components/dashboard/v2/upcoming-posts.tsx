/* eslint-disable import/no-unresolved */
"use client";
import { formatDistanceToNow, parseISO } from "date-fns";
import {
	FaDiscord,
	FaFacebook,
	FaGlobe,
	FaInstagram,
	FaLinkedin,
	FaReddit,
	FaTiktok,
	FaTwitch,
	FaTwitter,
	FaYoutube,
} from "react-icons/fa";

import { Badge } from "@/components/ui/badge";
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

// Platform icon mapping
const platformIconMap: Record<string, JSX.Element> = {
	Twitter: <FaTwitter className="h-4 w-4 text-blue-400" />,
	LinkedIn: <FaLinkedin className="h-4 w-4 text-blue-600" />,
	Facebook: <FaFacebook className="h-4 w-4 text-blue-500" />,
	Instagram: <FaInstagram className="h-4 w-4 text-pink-500" />,
	YouTube: <FaYoutube className="h-4 w-4 text-red-500" />,
	TikTok: <FaTiktok className="h-4 w-4 text-black" />,
	Reddit: <FaReddit className="h-4 w-4 text-orange-500" />,
	Discord: <FaDiscord className="h-4 w-4 text-indigo-500" />,
	Twitch: <FaTwitch className="h-4 w-4 text-purple-500" />,
	// Fallback for unknown platforms
	default: <FaGlobe className="h-4 w-4 text-gray-400" />,
};

// Helper function to get platform icon
const getPlatformIcon = (platform: string) => {
	return platformIconMap[platform] || platformIconMap.default;
};

// Helper function to get status badge variant
const getStatusVariant = (status: string) => {
	switch (status.toLowerCase()) {
		case "scheduled": {
			return "secondary";
		}
		case "draft": {
			return "outline";
		}
		case "published": {
			return "default";
		}
		case "failed": {
			return "destructive";
		}
		default: {
			return "default";
		}
	}
};

export const UpcomingPosts = () => {
	const { posts: data, isUpcomingPostsLoading } = useRetrieveUpcomingPost();

	if (isUpcomingPostsLoading) {
		return <UpcomingPostsSkeleton />;
	}

	if (!data || data.length === 0) {
		return (
			<div className="flex h-[302px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 text-center">
				<p className="text-sm font-medium text-muted-foreground">
					No upcoming posts.
				</p>
				<p className="mt-1 text-xs text-zinc-500">
					When you schedule a post or save a draft, it will appear here.
				</p>
			</div>
		);
	}

	return (
		<div className="no-scrollbar h-[304px] max-h-[306px] overflow-x-auto">
			<Table className="w-full">
				<TableHeader>
					<TableRow className="border-zinc-800 hover:bg-transparent">
						<TableHead className="w-[100px] text-start font-medium text-zinc-300">
							Platform
						</TableHead>
						<TableHead className="min-w-[200px] max-w-[300px] text-start font-medium text-zinc-300">
							Content
						</TableHead>
						<TableHead className="w-[120px] text-start font-medium text-zinc-300">
							Status
						</TableHead>
						<TableHead className="w-[150px] text-start font-medium text-zinc-300">
							Scheduled
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{data.slice(0, 5).map((post, index) => (
						<TableRow
							key={`${post.repo}-${post.date}-${index}`}
							className="scrollbar-hide group border-zinc-800/50 hover:bg-zinc-900/30"
						>
							<TableCell className="flex items-center justify-center text-zinc-400">
								<div className="flex items-center gap-1.5">
									{post.platform?.map(
										(platform: string, platformIndex: number) => (
											<div
												key={`${platform}-${platformIndex}`}
												className="flex items-center justify-center rounded-md p-1.5 transition-colors hover:bg-zinc-700/50"
												title={platform}
											>
												{getPlatformIcon(platform)}
											</div>
										),
									)}
								</div>
							</TableCell>
							<TableCell>
								<div className="space-y-1">
									<p className="max-w-sm truncate font-medium text-zinc-200">
										{post.content || "No content"}
									</p>
									<p className="text-xs text-zinc-500">
										{post.repo || "Unknown repo"}
									</p>
								</div>
							</TableCell>
							<TableCell>
								<Badge variant={getStatusVariant(post.status || "unknown")}>
									{post.status || "Unknown"}
								</Badge>
							</TableCell>
							<TableCell className="text-xs text-zinc-400">
								{post.date ? (
									<div className="space-y-1">
										<div>
											{formatDistanceToNow(parseISO(post.date), {
												addSuffix: true,
											})}
										</div>
										<div className="text-xs text-zinc-500">
											{new Date(post.date).toLocaleDateString()}
										</div>
									</div>
								) : (
									"No date"
								)}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
};

export const UpcomingPostsSkeleton = () => {
	return (
		<div className="no-scrollbar flex h-[304px] flex-col items-start justify-start gap-4 overflow-x-auto">
			{Array.from({ length: 4 }).map((_, index) => (
				<div
					key={index}
					className="flex w-full items-center justify-between gap-4 rounded-md border border-zinc-800/40 bg-zinc-900/40 p-3"
				>
					<div className="flex gap-2">
						<Skeleton className="h-6 w-6 rounded-md" />
						<Skeleton className="h-6 w-6 rounded-md" />
					</div>
					<div className="flex-1 space-y-2">
						<Skeleton className="h-4 w-[80%]" />
						<Skeleton className="h-3 w-[50%]" />
					</div>
					<Skeleton className="h-5 w-20 rounded-full" />
					<div className="space-y-1">
						<Skeleton className="h-4 w-24" />
						<Skeleton className="h-3 w-20" />
					</div>
				</div>
			))}
		</div>
	);
};
