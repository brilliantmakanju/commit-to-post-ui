/* eslint-disable import/no-unresolved */
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { createEncryptedCookie } from "@/lib/cookies/create-cookies";
import { getOrganizations } from "@/server-actions/organizations/get-organizations";
import useOrganizationStore from "@/zustand/useorganization-store";

export const useFetchOrganizations = () => {
	const queryClient = useQueryClient();

	const organizationsInStore = useOrganizationStore(
		state => state.organizations,
	);
	const setOrganizations = useOrganizationStore(
		state => state.setOrganizations,
	);
	const setCurrentOrganization = useOrganizationStore(
		state => state.setCurrentOrganization,
	);

	const query = useQuery({
		queryKey: ["organizations"],
		queryFn: async () => {
			const result = await getOrganizations();

			if (!result.success) return [];

			if (
				result.organizations !== undefined &&
				result.organizations?.length > 0
			) {
				const firstOrg = result.organizations[0];

				// Update Zustand
				setOrganizations(result.organizations);
				setCurrentOrganization(firstOrg);

				// Save to cookie
				await createEncryptedCookie("organization", {
					domain: firstOrg.domains?.[0] ?? "",
				});

				// Background refresh of related data
				const keys = [
					"repo_details",
					"notifications",
					"connected_repos",
					"dashboard_metrics",
					"repo_super_details",
					"retrieving_webhooks",
					"recent_notifications",
					"organization-ownership",
					"upcoming_posts_metrics",
					"retrieving_social_status",
				];

				for (const key of keys) {
					queryClient.fetchQuery({ queryKey: [key] });
					queryClient.invalidateQueries({ queryKey: [key] });
				}
			}

			return result.organizations;
		},
		// Keep staleTime high to avoid re-fetching too often
		enabled: true,
		staleTime: Infinity,
		refetchOnMount: true,
		refetchOnReconnect: true,
		refetchOnWindowFocus: true,
	});

	// 👇 Override loading state if we already have some orgs in Zustand
	const hasOrgInStore = organizationsInStore?.length > 0;

	return {
		organizations: hasOrgInStore ? organizationsInStore : (query.data ?? []),
		isFetching: query.isFetching,
		isLoading: hasOrgInStore ? false : query.isLoading,
		isError: query.isError,
	};
};
