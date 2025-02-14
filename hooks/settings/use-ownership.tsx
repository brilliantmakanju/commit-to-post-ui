import { useQuery } from "@tanstack/react-query";

import { checkOrganizationOwnership } from "@/server-actions/organizations/check-owner-ship";

const useOrganizationOwnership = () => {
	return useQuery({
		queryKey: ["organization-ownership"],
		queryFn: async () => {
			const result = await checkOrganizationOwnership();
			return { isOwner: Boolean(result.success && result.is_owner) };
		},
		staleTime: 1000 * 60 * 5, // 5 minutes
		refetchOnWindowFocus: false,
	});
};

export default useOrganizationOwnership;
