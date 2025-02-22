"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

import { Card } from "@/components/ui/card";

import GroupedPostCard from "./grouped-posts";
import PostCard from "./post-card";

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

interface GroupedPosts {
	group_id: string;
	posts: Post[];
	latest_created_at: string;
}

interface PostListProps {
	posts: (Post | GroupedPosts)[];
	showFullDate: boolean;
}

export default function PostList({ posts, showFullDate }: PostListProps) {
	const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

	const toggleGroup = (groupId: string) => {
		setExpandedGroups(previous => {
			const newSet = new Set(previous);
			if (newSet.has(groupId)) {
				newSet.delete(groupId);
			} else {
				newSet.add(groupId);
			}
			return newSet;
		});
	};

	const renderSinglePost = (post: Post) => (
		<div key={post.id} className="col-span-1">
			<PostCard post={post} showFullDate={showFullDate} />
		</div>
	);

	const renderGroupedPosts = (groupedPosts: GroupedPosts) => {
		const isExpanded = expandedGroups.has(groupedPosts.group_id);
		const platformCounts = groupedPosts.posts.reduce(
			(accumulator, post) => {
				accumulator[post.platform] = (accumulator[post.platform] || 0) + 1;
				return accumulator;
			},
			{} as Record<string, number>,
		);

		return (
			<div key={groupedPosts.group_id} className="col-span-1 space-y-2">
				<Card className="bg-muted/50 p-4">
					<button
						onClick={() => toggleGroup(groupedPosts.group_id)}
						className="flex w-full items-center justify-between"
					>
						<div className="flex flex-col items-start">
							<span className="text-sm font-medium">Post Group</span>
							<span className="text-xs text-muted-foreground">
								{Object.entries(platformCounts)
									.map(([platform, count]) => `${count} ${platform}`)
									.join(", ")}
							</span>
						</div>
						{isExpanded ? (
							<ChevronUp className="h-4 w-4" />
						) : (
							<ChevronDown className="h-4 w-4" />
						)}
					</button>
				</Card>
				{isExpanded && (
					<div className="space-y-2 border-l-2 border-muted pl-4">
						{groupedPosts.posts.map(post => (
							<PostCard key={post.id} post={post} showFullDate={showFullDate} />
						))}
					</div>
				)}
			</div>
		);
	};

	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{posts.map(post => {
				if ("group_id" in post) {
					return (
						<GroupedPostCard
							key={post.group_id}
							group={post}
							showFullDate={showFullDate}
						/>
					);
				}
				return (
					<PostCard key={post.id} post={post} showFullDate={showFullDate} />
				);
			})}
		</div>
	);
}
