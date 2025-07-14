import { useQuery } from "@tanstack/react-query";

// eslint-disable-next-line import/no-unresolved
import { fetchRepoWebhook } from "@/server-actions/core/repo/get-repo";

const useRepoWebhookPing = (repoId: string) => {
	const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
		queryKey: ["repo_webhook_ping", repoId],
		queryFn: () => fetchRepoWebhook({ repoId }),
		enabled: !!repoId,
		refetchOnMount: true,
		refetchOnWindowFocus: false,
	});

	return {
		webhookLogs: data ?? undefined,
		isLoading,
		isFetching,
		isError,
		errorMessage: error instanceof Error ? error.message : "Unknown error",
		refetchWebhookLogs: refetch,
	};
};

export default useRepoWebhookPing;
