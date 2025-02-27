import { useQuery } from "@tanstack/react-query";

// eslint-disable-next-line import/no-unresolved
import { getMetrics } from "@/server-actions/core/metrics";

const useRetrieveMetrics = () => {
	const { data, isLoading, refetch } = useQuery({
		queryKey: ["dashboard_metrics"],
		queryFn: async () => {
			const response = await getMetrics();

			if (response) {
				return {
					scheduled_posts_count: response.data.scheduled_posts_count ?? 0,
					generated_posts_count: response.data.generated_posts_count ?? 0,
				};
			}

			return {
				scheduled_posts_count: 0,
				generated_posts_count: 0,
			};
		},
		enabled: true,
	});

	return {
		scheduledPostsCount: data?.scheduled_posts_count,
		generatedPostsCount: data?.generated_posts_count,
		isMetricsLoading: isLoading,
		refetchMetrics: refetch,
	};
};

export default useRetrieveMetrics;
