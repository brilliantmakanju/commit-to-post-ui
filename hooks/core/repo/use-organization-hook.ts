// import { useQuery, useQueryClient } from "@tanstack/react-query";

// import {
// 	createEncryptedCookie,
// 	deleteCookie,
// } from "@/lib/cookies/create-cookies";
// import { getDecryptedCookie } from "@/lib/cookies/getcookies";
// import { getOrganizations } from "@/server-actions/organizations/get-organizations";
// import useOrganizationStore from "@/zustand/useorganization-store";

// export const useFetchOrganizations = () => {
// 	const queryClient = useQueryClient();

// 	const setCurrentOrganization =
// 		useOrganizationStore.getState().setCurrentOrganization;
// 	const setOrganization = useOrganizationStore.getState().setOrganization;
// 	const currentOrganization = useOrganizationStore.getState().organization;
// 	const setOrganizations = useOrganizationStore.getState().setOrganizations;
// 	const organizationsInStore = useOrganizationStore.getState().organizations;

// 	const query = useQuery({
// 		queryKey: ["organizations"],
// 		queryFn: async () => {
// 			const result = await getOrganizations();

// 			if (!result.success) return [];

// 			const organizations = result.organizations ?? [];

// 			const cookieOrg = await getDecryptedCookie("organization");

// 			const hasOrgFromCookie = !!cookieOrg?.domain;
// 			const hasOrgFromZustand = !!currentOrganization?.domains;

// 			if (!hasOrgFromCookie && !hasOrgFromZustand) {
// 				const fallbackOrg = organizations[0];
// 				if (fallbackOrg) {
// 					setCurrentOrganization(fallbackOrg);
// 					setOrganization(fallbackOrg);
// 					await createEncryptedCookie("organization", {
// 						id: fallbackOrg.id,
// 						name: fallbackOrg.name,
// 						domain: fallbackOrg.domains[0],
// 						is_owner: fallbackOrg.is_owner,
// 						description: fallbackOrg.description,
// 					});
// 				} else {
// 				}
// 			} else if (hasOrgFromCookie && !hasOrgFromZustand) {
// 				setCurrentOrganization({
// 					id: cookieOrg.id as string,
// 					name: cookieOrg.name as string,
// 					domains: cookieOrg.domain as string,
// 					is_owner: cookieOrg.is_owner as boolean,
// 					description: cookieOrg.description as string,
// 				});
// 				setOrganization({
// 					id: cookieOrg.id as string,
// 					name: cookieOrg.name as string,
// 					domains: cookieOrg.domain as string,
// 					is_owner: cookieOrg.is_owner as boolean,
// 					description: cookieOrg.description as string,
// 				});
// 			} else if (!hasOrgFromCookie && hasOrgFromZustand) {
// 				await deleteCookie("organization");
// 				await createEncryptedCookie("organization", {
// 					id: currentOrganization.id,
// 					name: currentOrganization.name,
// 					domain: currentOrganization.domains[0],
// 					is_owner: currentOrganization.is_owner,
// 					description: currentOrganization.description,
// 				});
// 			} else if (
// 				hasOrgFromCookie &&
// 				hasOrgFromZustand &&
// 				cookieOrg.domain !== currentOrganization.domains[0]
// 			) {
// 				await deleteCookie("organization");
// 				await createEncryptedCookie("organization", {
// 					id: currentOrganization.id,
// 					name: currentOrganization.name,
// 					domain: currentOrganization.domains[0],
// 					is_owner: currentOrganization.is_owner,
// 					description: currentOrganization.description,
// 				});
// 			} else {
// 			}

// 			// ✅ Sync org list to Zustand regardless
// 			setOrganizations(organizations);

// 			// ♻️ Background refresh
// 			const keys = [
// 				"repo_details",
// 				"notifications",
// 				"connected_repos",
// 				"dashboard_metrics",
// 				"repo_super_details",
// 				"retrieving_webhooks",
// 				"recent_notifications",
// 				"organization-ownership",
// 				"upcoming_posts_metrics",
// 				"retrieving_social_status",
// 			];

// 			await Promise.allSettled(
// 				keys.map(key =>
// 					queryClient
// 						.fetchQuery({ queryKey: [key] })
// 						.then(() => queryClient.invalidateQueries({ queryKey: [key] })),
// 				),
// 			);

// 			return organizations;
// 		},

// 		staleTime: Infinity,
// 		refetchOnMount: true,
// 		refetchOnReconnect: true,
// 		refetchOnWindowFocus: true,
// 	});

// 	const hasOrgInStore = organizationsInStore?.length > 0;

// 	return {
// 		organizations: hasOrgInStore ? organizationsInStore : (query.data ?? []),
// 		isFetching: query.isFetching,
// 		isLoading: hasOrgInStore ? false : query.isLoading,
// 		isError: query.isError,
// 	};
// };

"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo } from "react";

import {
	createEncryptedCookie,
	deleteCookie,
} from "@/lib/cookies/create-cookies";
import { getDecryptedCookie } from "@/lib/cookies/getcookies";
import { getOrganizations } from "@/server-actions/organizations/get-organizations";
import useOrganizationStore from "@/zustand/useorganization-store";

// Debug utility - can be disabled in production
const DEBUG = process.env.NODE_ENV === "development";

const debugLog = (category: string, message: string, data?: any) => {
	if (!DEBUG) return;
	const timestamp = new Date().toISOString().slice(11, 23);
	console.log(`🏢 [${timestamp}] [${category}] ${message}`, data || "");
};

const debugGroup = (title: string, function_: () => void) => {
	if (!DEBUG) return function_();
	console.group(`🏢 ${title}`);
	function_();
	console.groupEnd();
};

export const useFetchOrganizations = () => {
	const queryClient = useQueryClient();

	const {
		setOrganization,
		setOrganizations,
		setCurrentOrganization,
		organization: currentOrganization,
		organizations: organizationsInStore,
	} = useOrganizationStore();

	// Debug store state changes
	useEffect(() => {
		debugLog("STORE", "Organizations in store changed", {
			count: organizationsInStore?.length || 0,
			organizations: organizationsInStore?.map(org => ({
				id: org.id,
				name: org.name,
			})),
		});
	}, [organizationsInStore]);

	useEffect(() => {
		debugLog("STORE", "Current organization changed", {
			id: currentOrganization?.id,
			name: currentOrganization?.name,
			domain: currentOrganization?.domains,
		});
	}, [currentOrganization]);

	// Check if we have organizations in store immediately
	const hasOrgInStore = useMemo(() => {
		const hasOrgs = organizationsInStore?.length > 0;
		debugLog("COMPUTED", "hasOrgInStore", {
			hasOrgs,
			count: organizationsInStore?.length || 0,
		});
		return hasOrgs;
	}, [organizationsInStore]);

	// Check if we have a current organization set
	const hasCurrentOrg = useMemo(() => {
		const hasCurrent = !!currentOrganization?.domains;
		debugLog("COMPUTED", "hasCurrentOrg", {
			hasCurrent,
			orgId: currentOrganization?.id,
			domains: currentOrganization?.domains,
		});
		return hasCurrent;
	}, [currentOrganization]);

	// Background refresh function - non-blocking
	const backgroundRefresh = useCallback(async () => {
		debugGroup("BACKGROUND_REFRESH", () => {
			debugLog("BACKGROUND", "Starting background refresh of cached queries");

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
				"unread_notification_counts",
			];

			debugLog("BACKGROUND", "Refreshing query keys", keys);

			// Fire and forget - don't await
			Promise.allSettled(
				keys.map(key => {
					debugLog("BACKGROUND", `Fetching query: ${key}`);
					return queryClient
						.fetchQuery({ queryKey: [key] })
						.then(() => {
							debugLog("BACKGROUND", `✅ Successfully refreshed: ${key}`);
							return queryClient.invalidateQueries({ queryKey: [key] });
						})
						.catch(error => {
							debugLog("BACKGROUND", `❌ Failed to refresh: ${key}`, error);
						});
				}),
			).then(results => {
				const successful = results.filter(r => r.status === "fulfilled").length;
				const failed = results.filter(r => r.status === "rejected").length;
				debugLog(
					"BACKGROUND",
					`Background refresh completed: ${successful} successful, ${failed} failed`,
				);
			});
		});
	}, [queryClient]);

	// Optimized organization synchronization
	const syncOrganization = useCallback(
		async (organizations: any[]) => {
			debugGroup("SYNC_ORGANIZATION", async () => {
				debugLog("SYNC", "Starting organization sync", {
					orgsCount: organizations.length,
					currentOrgInStore: currentOrganization?.id,
				});

				try {
					const cookieOrg = await getDecryptedCookie("organization");
					debugLog("SYNC", "Retrieved cookie organization", cookieOrg);

					const hasOrgFromCookie = !!cookieOrg?.domain;
					const hasOrgFromZustand = !!currentOrganization?.domains;

					debugLog("SYNC", "Sync state analysis", {
						hasOrgFromCookie,
						hasOrgFromZustand,
						cookieDomain: cookieOrg?.domain,
						zustandDomain: currentOrganization?.domains?.[0],
					});

					// Fast path: if everything is in sync, do nothing
					if (
						hasOrgFromCookie &&
						hasOrgFromZustand &&
						cookieOrg.domain === currentOrganization.domains?.[0]
					) {
						debugLog("SYNC", "✅ Organizations already in sync - skipping");
						return;
					}

					// Handle different sync scenarios
					if (!hasOrgFromCookie && !hasOrgFromZustand) {
						debugLog("SYNC", "🔄 No org set anywhere - using fallback");
						const fallbackOrg = organizations[0];
						if (fallbackOrg) {
							debugLog("SYNC", "Setting fallback organization", {
								id: fallbackOrg.id,
								name: fallbackOrg.name,
								domain: fallbackOrg.domains[0],
							});

							const orgData = {
								id: fallbackOrg.id,
								name: fallbackOrg.name,
								domains: fallbackOrg.domains[0],
								is_owner: fallbackOrg.is_owner,
								description: fallbackOrg.description,
							};

							setCurrentOrganization(fallbackOrg);
							setOrganization(fallbackOrg);

							// Create cookie asynchronously
							createEncryptedCookie("organization", {
								id: fallbackOrg.id,
								name: fallbackOrg.name,
								domain: fallbackOrg.domains[0],
								is_owner: fallbackOrg.is_owner,
								description: fallbackOrg.description,
							})
								.then(() => {
									debugLog("SYNC", "✅ Created fallback cookie");
								})
								.catch(error => {
									debugLog(
										"SYNC",
										"❌ Failed to create fallback cookie",
										error,
									);
								});
						} else {
							debugLog("SYNC", "⚠️ No organizations available for fallback");
						}
					} else if (hasOrgFromCookie && !hasOrgFromZustand) {
						debugLog(
							"SYNC",
							"🔄 Cookie exists but Zustand empty - syncing to Zustand",
						);
						const orgData = {
							id: cookieOrg.id as string,
							name: cookieOrg.name as string,
							domains: cookieOrg.domain as string,
							is_owner: cookieOrg.is_owner as boolean,
							description: cookieOrg.description as string,
						};

						debugLog("SYNC", "Syncing cookie to Zustand", orgData);
						setCurrentOrganization(orgData);
						setOrganization(orgData);
					} else if (!hasOrgFromCookie && hasOrgFromZustand) {
						debugLog(
							"SYNC",
							"🔄 Zustand exists but cookie empty - syncing to cookie",
						);
						createEncryptedCookie("organization", {
							id: currentOrganization.id,
							name: currentOrganization.name,
							domain: currentOrganization.domains[0],
							is_owner: currentOrganization.is_owner,
							description: currentOrganization.description,
						})
							.then(() => {
								debugLog("SYNC", "✅ Synced Zustand to cookie");
							})
							.catch(error => {
								debugLog("SYNC", "❌ Failed to sync Zustand to cookie", error);
							});
					} else if (cookieOrg?.domain !== currentOrganization.domains?.[0]) {
						debugLog(
							"SYNC",
							"🔄 Cookie and Zustand out of sync - Zustand wins",
							{
								cookieDomain: cookieOrg?.domain,
								zustandDomain: currentOrganization.domains?.[0],
							},
						);

						await deleteCookie("organization");
						debugLog("SYNC", "Deleted old cookie");

						createEncryptedCookie("organization", {
							id: currentOrganization.id,
							name: currentOrganization.name,
							domain: currentOrganization.domains[0],
							is_owner: currentOrganization.is_owner,
							description: currentOrganization.description,
						})
							.then(() => {
								debugLog("SYNC", "✅ Updated cookie with Zustand data");
							})
							.catch(error => {
								debugLog("SYNC", "❌ Failed to update cookie", error);
							});
					}
				} catch (error) {
					debugLog("SYNC", "❌ Organization sync failed", error);
					console.warn("Organization sync failed", error);
				}
			});
		},
		[currentOrganization, setCurrentOrganization, setOrganization],
	);

	const query = useQuery({
		queryKey: ["organizations"],
		queryFn: async () => {
			debugGroup("QUERY_FN", async () => {
				debugLog("QUERY", "🚀 Starting organizations fetch");

				const result = await getOrganizations();
				debugLog("QUERY", "getOrganizations result", {
					success: result.success,
					orgCount: result.organizations?.length || 0,
				});

				if (!result.success) {
					debugLog("QUERY", "❌ Organizations fetch failed");
					return [];
				}

				const organizations = result.organizations ?? [];
				debugLog("QUERY", "✅ Organizations fetched successfully", {
					count: organizations.length,
					orgs: organizations.map(org => ({ id: org.id, name: org.name })),
				});

				// Sync organizations to store immediately
				debugLog("QUERY", "📦 Setting organizations in store");
				setOrganizations(organizations);

				// Sync current organization (non-blocking)
				debugLog("QUERY", "🔄 Triggering organization sync");
				syncOrganization(organizations);

				// Trigger background refresh (non-blocking)
				debugLog("QUERY", "🔄 Triggering background refresh");
				backgroundRefresh();

				return organizations;
			});
		},
		staleTime: 5 * 60 * 1000, // 5 minutes instead of Infinity
		gcTime: 10 * 60 * 1000, // 10 minutes
		refetchOnMount: false, // Only refetch if stale
		refetchOnReconnect: true,
		refetchOnWindowFocus: false, // Reduce unnecessary refetches
		enabled: true,
	});

	// Debug query state changes
	useEffect(() => {
		debugLog("QUERY_STATE", "Query state changed", {
			isLoading: query.isLoading,
			isFetching: query.isFetching,
			isError: query.isError,
			isSuccess: query.isSuccess,
			// dataLength: query.data?.length || 0,
			error: query.error,
		});
	}, [
		query.isLoading,
		query.isFetching,
		query.isError,
		query.isSuccess,
		query.data,
		query.error,
	]);

	// Load from cookie on mount if no store data
	useEffect(() => {
		debugGroup("MOUNT_EFFECT", () => {
			debugLog("MOUNT", "Checking if should load from cookie", {
				hasOrgInStore,
				hasCurrentOrg,
				shouldLoad: !hasOrgInStore && !hasCurrentOrg,
			});

			if (!hasOrgInStore && !hasCurrentOrg) {
				debugLog("MOUNT", "📂 Loading organization from cookie");
				getDecryptedCookie("organization")
					.then(cookieOrg => {
						debugLog("MOUNT", "Cookie organization retrieved", cookieOrg);
						if (cookieOrg?.domain) {
							const orgData = {
								id: cookieOrg.id as string,
								name: cookieOrg.name as string,
								domains: cookieOrg.domain as string,
								is_owner: cookieOrg.is_owner as boolean,
								description: cookieOrg.description as string,
							};
							debugLog("MOUNT", "📦 Setting organization from cookie", orgData);
							setCurrentOrganization(orgData);
							setOrganization(orgData);
						} else {
							debugLog("MOUNT", "⚠️ No valid organization in cookie");
						}
					})
					.catch(error => {
						debugLog(
							"MOUNT",
							"❌ Failed to load organization from cookie",
							error,
						);
					});
			}
		});
	}, [hasOrgInStore, hasCurrentOrg, setCurrentOrganization, setOrganization]);

	// Determine loading state more intelligently
	const isInitialLoading = query.isLoading && !hasOrgInStore && !hasCurrentOrg;
	const shouldShowContent =
		hasOrgInStore || hasCurrentOrg || (query.data as any) > 0;

	// Debug final state
	useEffect(() => {
		debugLog("FINAL_STATE", "Hook state computed", {
			isInitialLoading,
			shouldShowContent,
			hasCurrentOrg,
			// organizationsCount: hasOrgInStore
			// 	? organizationsInStore?.length
			// 	: query.data?.length || 0,
			isFetching: query.isFetching,
			isError: query.isError,
		});
	}, [
		isInitialLoading,
		shouldShowContent,
		hasCurrentOrg,
		hasOrgInStore,
		organizationsInStore,
		query.data,
		query.isFetching,
		query.isError,
	]);

	return {
		organizations: hasOrgInStore ? organizationsInStore : (query.data ?? []),
		isFetching: query.isFetching,
		isLoading: isInitialLoading,
		isError: query.isError,
		shouldShowContent,
		hasCurrentOrg,
	};
};
