/* eslint-disable import/no-unresolved */
"use client";

import type { FlattenedPostGroup } from "@/types";

import PostGrid from "./components/post-grid";

interface GroupedPostCardProps {
	group: FlattenedPostGroup;
}

export default function GroupedPostCard({ group }: GroupedPostCardProps) {
	return <PostGrid group={group} />;
}
