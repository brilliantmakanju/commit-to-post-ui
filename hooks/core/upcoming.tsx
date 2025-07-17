import { useQuery } from "@tanstack/react-query";

import { UpcomingPost } from "@/lib/data";
// eslint-disable-next-line import/no-unresolved
import { fetchUpcomingPosts } from "@/server-actions/core/upcoming";

const useRetrieveUpcomingPost = () => {
	const { data, isLoading, refetch } = useQuery<{
		posts: UpcomingPost[];
	}>({
		queryKey: ["upcoming_posts_metrics"],
		queryFn: async () => {
			const response = await fetchUpcomingPosts();

			if (!response?.data || !Array.isArray(response.data)) {
				return { posts: [] };
			}

			// Optional: validate or sanitize here if needed
			return {
				posts: response.data as UpcomingPost[],
			};
		},
		enabled: true,
	});

	return {
		posts: data?.posts ?? [],
		isUpcomingPostsLoading: isLoading,
		refetchUpcomingPosts: refetch,
	};
};

export default useRetrieveUpcomingPost;
