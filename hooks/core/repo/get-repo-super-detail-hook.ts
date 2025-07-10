import { useQuery } from "@tanstack/react-query";

import { fetchRepoSuperDetails } from "@/server-actions/core/repo/get-repo";

const useRepoSuperDetails = (repoId: string) => {
	const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
		queryKey: ["repo_super_details", repoId],
		queryFn: () => fetchRepoSuperDetails({ repoId }),
		enabled: !!repoId,
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

export default useRepoSuperDetails;
