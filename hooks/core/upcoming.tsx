import { useQuery } from "@tanstack/react-query";

// eslint-disable-next-line import/no-unresolved
import { fetchUpcomingPosts } from "@/server-actions/core/upcoming";

const useRetrieveUpcomingPost = () => {
	const { data, isLoading, refetch } = useQuery({
		queryKey: ["upcoming_posts_metrics"],
		queryFn: async () => {
			const response = await fetchUpcomingPosts();

			return {
				posts: response.data,
			};
		},
		enabled: true,
	});

	return {
		posts: data?.posts,
		isMetricsLoading: isLoading,
		refetchMetrics: refetch,
	};
};

export default useRetrieveUpcomingPost;
