import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
	createEncryptedCookie,
	deleteCookie,
} from "@/lib/cookies/create-cookies";
import { getDecryptedCookie } from "@/lib/cookies/getcookies";
import { getOrganizations } from "@/server-actions/organizations/get-organizations";
import useOrganizationStore from "@/zustand/useorganization-store";

export const useFetchOrganizations = () => {
	const queryClient = useQueryClient();

	const setCurrentOrganization =
		useOrganizationStore.getState().setCurrentOrganization;
	const setOrganization = useOrganizationStore.getState().setOrganization;
	const currentOrganization = useOrganizationStore.getState().organization;
	const setOrganizations = useOrganizationStore.getState().setOrganizations;
	const organizationsInStore = useOrganizationStore.getState().organizations;

	const query = useQuery({
		queryKey: ["organizations"],
		queryFn: async () => {
			const result = await getOrganizations();

			if (!result.success) return [];

			const organizations = result.organizations ?? [];

			const cookieOrg = await getDecryptedCookie("organization");

			const hasOrgFromCookie = !!cookieOrg?.domain;
			const hasOrgFromZustand = !!currentOrganization?.domains;

			if (!hasOrgFromCookie && !hasOrgFromZustand) {
				const fallbackOrg = organizations[0];
				if (fallbackOrg) {
					setCurrentOrganization(fallbackOrg);
					setOrganization(fallbackOrg);
					await createEncryptedCookie("organization", {
						id: fallbackOrg.id,
						name: fallbackOrg.name,
						domain: fallbackOrg.domains[0],
						is_owner: fallbackOrg.is_owner,
						description: fallbackOrg.description,
					});
				} else {
				}
			} else if (hasOrgFromCookie && !hasOrgFromZustand) {
				setCurrentOrganization({
					id: cookieOrg.id as string,
					name: cookieOrg.name as string,
					domains: cookieOrg.domain as string,
					is_owner: cookieOrg.is_owner as boolean,
					description: cookieOrg.description as string,
				});
				setOrganization({
					id: cookieOrg.id as string,
					name: cookieOrg.name as string,
					domains: cookieOrg.domain as string,
					is_owner: cookieOrg.is_owner as boolean,
					description: cookieOrg.description as string,
				});
			} else if (!hasOrgFromCookie && hasOrgFromZustand) {
				await deleteCookie("organization");
				await createEncryptedCookie("organization", {
					id: currentOrganization.id,
					name: currentOrganization.name,
					domain: currentOrganization.domains[0],
					is_owner: currentOrganization.is_owner,
					description: currentOrganization.description,
				});
			} else if (
				hasOrgFromCookie &&
				hasOrgFromZustand &&
				cookieOrg.domain !== currentOrganization.domains[0]
			) {
				await deleteCookie("organization");
				await createEncryptedCookie("organization", {
					id: currentOrganization.id,
					name: currentOrganization.name,
					domain: currentOrganization.domains[0],
					is_owner: currentOrganization.is_owner,
					description: currentOrganization.description,
				});
			} else {
			}

			// ✅ Sync org list to Zustand regardless
			setOrganizations(organizations);

			// ♻️ Background refresh
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

			await Promise.allSettled(
				keys.map(key =>
					queryClient
						.fetchQuery({ queryKey: [key] })
						.then(() => queryClient.invalidateQueries({ queryKey: [key] })),
				),
			);

			return organizations;
		},

		staleTime: Infinity,
		refetchOnMount: true,
		refetchOnReconnect: true,
		refetchOnWindowFocus: true,
	});

	const hasOrgInStore = organizationsInStore?.length > 0;

	return {
		organizations: hasOrgInStore ? organizationsInStore : (query.data ?? []),
		isFetching: query.isFetching,
		isLoading: hasOrgInStore ? false : query.isLoading,
		isError: query.isError,
	};
};
