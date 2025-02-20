"use client";
import { useQuery } from "@tanstack/react-query";

import { billingPortal } from "@/server-actions/organizations/get-billing-portal";

export const useBillingPortal = () => {
	const { data, isFetching, isLoading, refetch } = useQuery({
		queryKey: ["retrieving_billing_portal"],
		queryFn: async () => {
			const result = await billingPortal();

			if (!result.success || !result.data) {
				return false;
			}

			return result.data.portal_url;
		},
		staleTime: Infinity, // Keep the data fresh indefinitely
		refetchOnMount: true,
		refetchOnWindowFocus: true,
		refetchOnReconnect: true,
	});

	return { data, isFetching, isLoading, refetch };
};
