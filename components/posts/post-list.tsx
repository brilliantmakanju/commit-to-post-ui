import PostCard from "@/components/posts/post-card";

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

interface PostListProps {
	posts: Post[];
	showFullDate: boolean;
}

export default function PostList({ posts, showFullDate }: PostListProps) {
	return (
		<div className="grid grid-cols-1 gap-[5px] sm:grid-cols-2 lg:grid-cols-3">
			{posts.map((post: Post) => (
				<PostCard key={post.id} post={post} showFullDate={showFullDate} />
			))}
		</div>
	);
}
