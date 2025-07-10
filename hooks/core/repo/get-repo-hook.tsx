import { useQuery } from "@tanstack/react-query";

// eslint-disable-next-line import/no-unresolved
import { fetchConnectedRepos } from "@/server-actions/core/repo/get-repos";

const useRetrieveConnectedRepos = () => {
	const { data, isLoading, refetch, isError, error } = useQuery({
		queryKey: ["connected_repos"],
		queryFn: async () => {
			const response = await fetchConnectedRepos({ page: 1 });
			return {
				total: response?.data?.total ?? 0,
				repositories: response?.data?.repositories ?? [],
			};
		},
		enabled: true,
	});

	return {
		repositories: data?.repositories ?? [],
		totalRepositories: data?.total ?? 0,
		isLoadingRepos: isLoading,
		refetchRepos: refetch,
		isError,
		error,
	};
};

export default useRetrieveConnectedRepos;
