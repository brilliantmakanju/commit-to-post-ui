/* eslint-disable import/no-unresolved */
"use client";

import { PostGroup } from "@/types";

import GroupedPostCard from "./grouped-posts";

interface PostsGridProps {
	posts: PostGroup[];
	isLoading: boolean;
}

export default function PostsGrid({ posts, isLoading }: PostsGridProps) {
	if (isLoading) {
		return (
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				{Array.from({ length: 6 }).map((_, index) => (
					<div
						key={index}
						className="h-[280px] w-full animate-pulse rounded-xl bg-zinc-800/30"
					/>
				))}
			</div>
		);
	}

	if (posts.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center gap-4 py-20 text-center text-white">
				<div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-900/50 ring-1 ring-zinc-700">
					<div className="h-10 w-10 rounded bg-zinc-700" />
				</div>
				<h3 className="text-lg font-semibold text-zinc-300">No posts yet</h3>
				<p className="max-w-sm text-sm text-zinc-500">
					Posts will appear here once your project has activity.
				</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{posts.map((postGroup: PostGroup, index) => (
				<GroupedPostCard
					key={`${postGroup.group_id}_${index}`}
					group={postGroup}
				/>
			))}
		</div>
	);
}
