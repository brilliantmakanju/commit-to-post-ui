import { useQuery } from "@tanstack/react-query";

import { getMetrics, getTopRepoMetrics } from "@/server-actions/core/metrics";
import { getWebhookErrors } from "@/server-actions/core/webhook-errors";

type MetricsResponse = {
	scheduled_posts_count: number;
	generated_posts_count: number;
	total_repositories: number;
	posts_this_week: number;
	scheduled_posts: number;
};

type ConnectedIntegration = {
	platform: string;
	handle: string;
	display_name: string;
};

type TopRepoMetric = {
	name: string;
	full_name: string;
	postsThisWeek: number;
	totalPosts: number;
	scheduledPosts: number;
	trend: "up" | "down" | "stable";
	channelDistribution: {
		twitter?: number;
		linkedin?: number;
		discord?: number;
		[key: string]: number | undefined;
	};
	connectedIntegrations: ConnectedIntegration[];
	lastActivity: string | undefined;
	repoUrl: string | undefined;
	isPrivate: boolean;
	activePlatforms: string[];
};

export type WebhookError = {
	repo: string;
	error: string;
	time: string;
	status: number;
};

const useRetrieveMetrics = () => {
	// General dashboard metrics
	const {
		data: mainData,
		isLoading: isLoadingMain,
		refetch: refetchMain,
	} = useQuery<MetricsResponse>({
		queryKey: ["dashboard_metrics"],
		queryFn: async () => {
			const response = await getMetrics();
			if (response?.data) {
				const {
					scheduled_posts_count,
					generated_posts_count,
					total_repositories,
					posts_this_week,
					scheduled_posts,
				} = response.data;
				return {
					scheduled_posts_count: scheduled_posts_count ?? 0,
					generated_posts_count: generated_posts_count ?? 0,
					total_repositories: total_repositories ?? 0,
					posts_this_week: posts_this_week ?? 0,
					scheduled_posts: scheduled_posts ?? 0,
				};
			}
			return {
				scheduled_posts_count: 0,
				generated_posts_count: 0,
				total_repositories: 0,
				posts_this_week: 0,
				scheduled_posts: 0,
			};
		},
		enabled: true,
	});

	// Top repo metrics
	const {
		data: topRepoMetrics,
		isLoading: isLoadingTopRepos,
		refetch: refetchTopRepos,
	} = useQuery<TopRepoMetric[]>({
		queryKey: ["top_repo_metrics"],
		queryFn: async () => {
			const response = await getTopRepoMetrics();
			if (Array.isArray(response.data)) {
				return response.data;
			}
			return [];
		},
		enabled: true,
	});

	const {
		data: webhookErrors,
		isLoading: isWebhookLoading,
		error: webhookError,
		refetch: refetchWebhookErrors,
	} = useQuery<WebhookError[]>({
		queryKey: ["dashboard_webhook_errors"],
		queryFn: async () => {
			const response = await getWebhookErrors();
			return response.data;
		},
		refetchOnMount: true,
		refetchOnWindowFocus: true,
	});

	return {
		// main stats
		scheduledPostsCount: mainData?.scheduled_posts_count,
		generatedPostsCount: mainData?.generated_posts_count,
		totalRepositories: mainData?.total_repositories,
		postsThisWeek: mainData?.posts_this_week,
		scheduledPosts: mainData?.scheduled_posts,
		isMetricsLoading: isLoadingMain,

		// top repo data
		topRepoMetrics: topRepoMetrics ?? [],
		isTopRepoLoading: isLoadingTopRepos,

		// refetchers
		refetchMetrics: refetchMain,
		refetchTopRepoMetrics: refetchTopRepos,

		// webhook errors
		webhookErrors: webhookErrors ?? [],
		isWebhookLoading,
		webhookError,
		refetchWebhookErrors,
	};
};

export default useRetrieveMetrics;
