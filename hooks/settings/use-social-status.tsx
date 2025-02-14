"use client";
import { useQuery } from "@tanstack/react-query";

import { getSocialStatus } from "@/server-actions/organizations/get-social-status";

export const useSocialStatus = () => {
	const { data, isFetching, isLoading, refetch } = useQuery({
		queryKey: ["retrieving_social_status"],
		queryFn: async () => {
			const result = await getSocialStatus();

			if (!result.success || !result.data) {
				return false;
			}

			return result.data.has_linkedin;
		},
		staleTime: Infinity, // Keep the data fresh indefinitely
		refetchOnMount: true,
		refetchOnWindowFocus: true,
		refetchOnReconnect: true,
	});

	return { data, isFetching, isLoading, refetch };
};
