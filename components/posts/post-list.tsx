"use client";

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
	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{posts.map(post => {
				if ("group_id" in post) {
					return (
						<GroupedPostCard
							group={post}
							key={post.group_id}
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
