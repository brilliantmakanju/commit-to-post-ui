import { useQuery } from "@tanstack/react-query";

// eslint-disable-next-line import/no-unresolved
import { fetchRepoDetails } from "@/server-actions/core/repo/get-repo";

const useRepoDetails = (repoId: string) => {
	const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
		queryKey: ["repo_details", repoId],
		queryFn: () => fetchRepoDetails({ repoId }),
		enabled: !!repoId,
		refetchOnMount: true,
		refetchOnWindowFocus: false,
	});

	return {
		repoDetails: data?.data,
		isLoadingRepoDetails: isLoading,
		isFetchingRepoDetails: isFetching,
		isError,
		error,
		refetchRepoDetails: refetch,
	};
};

export default useRepoDetails;
