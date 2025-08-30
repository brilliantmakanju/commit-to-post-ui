"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
	createEncryptedCookie,
	deleteCookie,
} from "@/lib/cookies/create-cookies";
import { getDecryptedCookie } from "@/lib/cookies/getcookies";
import { getOrganizations } from "@/server-actions/organizations/get-organizations";
import useOrganizationStore, {
	Organization,
	OrganizationSocial,
} from "@/zustand/useorganization-store";

// Debug utility - can be disabled in production
const DEBUG = process.env.NODE_ENV === "development";

export const debugLog = (category: string, message: string, data?: unknown) => {
	if (!DEBUG) return;
	const timestamp = new Date().toISOString().slice(11, 23);
	console.log(`🏢 [${timestamp}] [${category}] ${message}`, data || "");
};

export const debugGroup = (title: string, functionToExecute: () => unknown) => {
	if (!DEBUG) return functionToExecute();
	console.group(`🏢 ${title}`);
	try {
		const result = functionToExecute();
		console.groupEnd();
		return result;
	} catch (error) {
		console.groupEnd();
		throw error;
	}
};

// Sort organizations to prioritize non-downgraded ones
const sortOrganizationsByDowngradeStatus = (
	organizations: Organization[],
): Organization[] => {
	return [...organizations].sort((organizationA, organizationB) => {
		// Non-downgraded organizations come first
		if (!organizationA.is_downgraded && organizationB.is_downgraded) return -1;
		if (organizationA.is_downgraded && !organizationB.is_downgraded) return 1;

		// If both have same downgrade status, sort by activity score (higher first)
		const scoreA = organizationA.activity_score ?? 0;
		const scoreB = organizationB.activity_score ?? 0;
		if (scoreA !== scoreB) return scoreB - scoreA;

		// Finally sort by name alphabetically
		return organizationA.name.localeCompare(organizationB.name);
	});
};

// Find the best organization to select (non-downgraded with highest activity)
const findBestOrganizationToSelect = (
	organizations: Organization[],
): Organization | undefined => {
	if (organizations.length === 0) return undefined;

	// First try to find a non-downgraded organization
	const nonDowngradedOrganizations = organizations.filter(
		organization => !organization.is_downgraded,
	);
	if (nonDowngradedOrganizations.length > 0) {
		// Sort by activity score and return the best one
		return nonDowngradedOrganizations.sort((organizationA, organizationB) => {
			const scoreA = organizationA.activity_score ?? 0;
			const scoreB = organizationB.activity_score ?? 0;
			return scoreB - scoreA;
		})[0];
	}

	// If all are downgraded, return the one with highest activity score
	return organizations.sort((organizationA, organizationB) => {
		const scoreA = organizationA.activity_score ?? 0;
		const scoreB = organizationB.activity_score ?? 0;
		return scoreB - scoreA;
	})[0];
};

export const useFetchOrganizations = () => {
	const queryClient = useQueryClient();
	const [isInitialized, setIsInitialized] = useState(false);
	const [cookieLoaded, setCookieLoaded] = useState(false);

	const {
		setOrganization,
		setOrganizations,
		setCurrentOrganization,
		updateOrganizations,
		organization: currentOrganization,
		organizations: organizationsInStore,
	} = useOrganizationStore();

	// Check if we have organizations in store
	const hasOrganizationsInStore = useMemo(() => {
		const hasOrganizations = organizationsInStore?.length > 0;
		debugLog("COMPUTED", "hasOrganizationsInStore", {
			hasOrganizations,
			count: organizationsInStore?.length || 0,
		});
		return hasOrganizations;
	}, [organizationsInStore]);

	// Check if we have a current organization set
	const hasCurrentOrganization = useMemo(() => {
		const hasCurrent = !!currentOrganization?.domains;
		debugLog("COMPUTED", "hasCurrentOrganization", {
			hasCurrent,
			organizationId: currentOrganization?.id,
			domains: currentOrganization?.domains,
			isDowngraded: currentOrganization?.is_downgraded,
		});
		return hasCurrent;
	}, [currentOrganization]);

	// Background refresh function - non-blocking
	const backgroundRefresh = useCallback(async () => {
		debugGroup("BACKGROUND_REFRESH", () => {
			debugLog("BACKGROUND", "Starting background refresh of cached queries");

			const queryKeys = [
				"posts",
				"gitRepos",
				"repo_details",
				"notifications",
				"connected_repos",
				"top_repo_metrics",
				"dashboard_metrics",
				"repo_webhook_ping",
				"repo_super_details",
				"retrieving_webhooks",
				"recent_notifications",
				"dashboard_heatmap_data",
				"upcoming_posts_metrics",
				"dashboard_channel_data",
				"organization-ownership",
				"upcoming_posts_metrics",
				"dashboard_webhook_errors",
				"retrieving_social_status",
				"unread_notification_counts",
				"retrieving_billing_portal",
			];

			// Fire and forget - don't await
			Promise.allSettled(
				queryKeys.map(key => {
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
				const successful = results.filter(
					result => result.status === "fulfilled",
				).length;
				const failed = results.filter(
					result => result.status === "rejected",
				).length;
				debugLog(
					"BACKGROUND",
					`Background refresh completed: ${successful} successful, ${failed} failed`,
				);
			});
		});
	}, [queryClient]);

	// Force refetch organizations from backend
	const refetchOrganizations = useCallback(async () => {
		debugLog("REFETCH", "Force refetching organizations from backend");

		try {
			await queryClient.invalidateQueries({ queryKey: ["organizations"] });
			const result = await queryClient.refetchQueries({
				queryKey: ["organizations"],
			});
			debugLog("REFETCH", "✅ Organizations refetched successfully", result);
			return result;
		} catch (error) {
			debugLog("REFETCH", "❌ Failed to refetch organizations", error);
			throw error;
		}
	}, [queryClient]);

	// Create organization cookie data
	const createOrganizationCookieData = useCallback(
		(organization: Organization) => {
			return {
				id: organization.id,
				name: organization.name,
				socials: organization.socials,
				domain: organization.domains,
				is_owner: organization.is_owner,
				description: organization.description,
				github_installation_id: organization.github_installation_id,
				github_installation_status: organization.github_installation_status,
				is_downgraded: organization.is_downgraded,
				downgraded_at: organization.downgraded_at,
				downgrade_reason: organization.downgrade_reason,
				activity_score: organization.activity_score,
				last_activity_at: organization.last_activity_at,
			};
		},
		[],
	);

	// Optimized organization synchronization
	const synchronizeOrganization = useCallback(
		async (organizations: Organization[]) => {
			debugLog("SYNC", "Starting organization synchronization", {
				organizationsCount: organizations.length,
				currentOrganizationInStore: currentOrganization?.id,
			});

			try {
				const cookieOrganization = await getDecryptedCookie("organization");
				debugLog("SYNC", "Retrieved cookie organization", cookieOrganization);

				const hasOrganizationFromCookie = !!cookieOrganization?.domain;
				const hasOrganizationFromZustand = !!currentOrganization?.domains;

				debugLog("SYNC", "Synchronization state analysis", {
					hasOrganizationFromCookie,
					hasOrganizationFromZustand,
					cookieDomain: cookieOrganization?.domain,
					zustandDomain: currentOrganization?.domains,
					cookieDowngraded: cookieOrganization?.is_downgraded,
					zustandDowngraded: currentOrganization?.is_downgraded,
				});

				// Sort organizations to prioritize non-downgraded ones
				const sortedOrganizations =
					sortOrganizationsByDowngradeStatus(organizations);

				// Fast path: if everything is in sync, just update the organizations list
				if (
					hasOrganizationFromCookie &&
					hasOrganizationFromZustand &&
					cookieOrganization.domain === currentOrganization.domains &&
					cookieOrganization.is_downgraded === currentOrganization.is_downgraded
				) {
					debugLog(
						"SYNC",
						"✅ Organizations already in sync - updating list only",
					);
					updateOrganizations(sortedOrganizations);
					setIsInitialized(true);
					return;
				}

				// Handle different synchronization scenarios
				if (!hasOrganizationFromCookie && !hasOrganizationFromZustand) {
					debugLog(
						"SYNC",
						"🔄 No organization set anywhere - using best fallback",
					);
					const fallbackOrganization =
						findBestOrganizationToSelect(sortedOrganizations);

					if (fallbackOrganization) {
						debugLog("SYNC", "Setting fallback organization", {
							id: fallbackOrganization.id,
							name: fallbackOrganization.name,
							domain: fallbackOrganization.domains,
							isDowngraded: fallbackOrganization.is_downgraded,
							activityScore: fallbackOrganization.activity_score,
						});

						// Set organization in store first
						setCurrentOrganization(fallbackOrganization);
						setOrganization(fallbackOrganization);
						updateOrganizations(sortedOrganizations);

						// Create cookie asynchronously
						const cookieData =
							createOrganizationCookieData(fallbackOrganization);
						createEncryptedCookie("organization", cookieData);

						debugLog("SYNC", "✅ Created fallback cookie");
					} else {
						debugLog("SYNC", "⚠️ No organizations available for fallback");
					}
				} else if (hasOrganizationFromCookie && !hasOrganizationFromZustand) {
					debugLog(
						"SYNC",
						"🔄 Cookie exists but Zustand empty - syncing to Zustand",
					);

					// Check if the cookie organization still exists and is not downgraded
					const cookieOrganizationStillValid = sortedOrganizations.find(
						organization => organization.id === cookieOrganization.id,
					);

					let organizationToSelect;
					if (
						cookieOrganizationStillValid &&
						!cookieOrganizationStillValid.is_downgraded
					) {
						organizationToSelect = cookieOrganizationStillValid;
						debugLog(
							"SYNC",
							"Cookie organization is still valid and not downgraded",
						);
					} else {
						organizationToSelect =
							findBestOrganizationToSelect(sortedOrganizations);
						debugLog(
							"SYNC",
							"Cookie organization invalid/downgraded, selecting best alternative",
							{
								selectedOrganization: organizationToSelect?.id,
								selectedName: organizationToSelect?.name,
								isDowngraded: organizationToSelect?.is_downgraded,
							},
						);
					}

					if (organizationToSelect) {
						setCurrentOrganization(organizationToSelect);
						setOrganization(organizationToSelect);
						updateOrganizations(sortedOrganizations);

						// Update cookie if we switched organizations
						if (organizationToSelect.id !== cookieOrganization.id) {
							const cookieData =
								createOrganizationCookieData(organizationToSelect);
							createEncryptedCookie("organization", cookieData);
						}
					}
				} else if (!hasOrganizationFromCookie && hasOrganizationFromZustand) {
					debugLog(
						"SYNC",
						"🔄 Zustand exists but cookie empty - syncing to cookie",
					);

					// Check if current organization is still valid and not downgraded
					const currentOrganizationStillValid = sortedOrganizations.find(
						organization => organization.id === currentOrganization.id,
					);

					let organizationToSelect;
					if (
						currentOrganizationStillValid &&
						!currentOrganizationStillValid.is_downgraded
					) {
						organizationToSelect = currentOrganizationStillValid;
					} else {
						organizationToSelect =
							findBestOrganizationToSelect(sortedOrganizations);
						debugLog(
							"SYNC",
							"Current organization invalid/downgraded, selecting best alternative",
						);
					}

					if (organizationToSelect) {
						if (organizationToSelect.id !== currentOrganization.id) {
							setCurrentOrganization(organizationToSelect);
							setOrganization(organizationToSelect);
						}
						updateOrganizations(sortedOrganizations);

						const cookieData =
							createOrganizationCookieData(organizationToSelect);
						createEncryptedCookie("organization", cookieData);
						debugLog("SYNC", "✅ Synced to cookie");
					}
				} else if (
					cookieOrganization?.domain !== currentOrganization.domains ||
					cookieOrganization?.is_downgraded !==
						currentOrganization.is_downgraded
				) {
					debugLog(
						"SYNC",
						"🔄 Cookie and Zustand out of sync - selecting best organization",
						{
							cookieDomain: cookieOrganization?.domain,
							zustandDomain: currentOrganization.domains,
							cookieDowngraded: cookieOrganization?.is_downgraded,
							zustandDowngraded: currentOrganization.is_downgraded,
						},
					);

					// Find the best organization to select (prefer non-downgraded)
					const bestOrganization =
						findBestOrganizationToSelect(sortedOrganizations);

					if (bestOrganization) {
						setCurrentOrganization(bestOrganization);
						setOrganization(bestOrganization);
						updateOrganizations(sortedOrganizations);

						await deleteCookie("organization");
						debugLog("SYNC", "Deleted old cookie");

						const cookieData = createOrganizationCookieData(bestOrganization);
						createEncryptedCookie("organization", cookieData);
						debugLog("SYNC", "✅ Updated cookie with best organization data");
					}
				}

				setIsInitialized(true);
			} catch (error) {
				debugLog("SYNC", "❌ Organization synchronization failed", error);
				setIsInitialized(true); // Still mark as initialized to prevent infinite loading
			}
		},
		[
			currentOrganization,
			setCurrentOrganization,
			setOrganization,
			updateOrganizations,
			createOrganizationCookieData,
		],
	);

	const query = useQuery({
		queryKey: ["organizations"],
		queryFn: async () => {
			debugLog("QUERY", "🚀 Starting organizations fetch");

			const result = await getOrganizations();
			debugLog("QUERY", "getOrganizations result", {
				success: result.success,
				organizationCount: result.organizations?.length || 0,
			});

			if (!result.success) {
				debugLog("QUERY", "❌ Organizations fetch failed");
				throw new Error("Failed to fetch organizations");
			}

			const organizations = result.organizations ?? [];
			debugLog("QUERY", "✅ Organizations fetched successfully", {
				count: organizations.length,
				organizations: organizations.map(organization => ({
					id: organization.id,
					name: organization.name,
					isDowngraded: organization.is_downgraded,
					activityScore: organization.activity_score,
				})),
			});

			// Sort organizations and sync current organization (await to ensure completion)
			await synchronizeOrganization(organizations);

			// Trigger background refresh (non-blocking)
			backgroundRefresh();

			return organizations;
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
		refetchOnMount: false,
		refetchOnReconnect: true,
		refetchOnWindowFocus: false,
		enabled: true,
		retry: 3,
		retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
	});

	// Load from cookie on mount if no store data
	useEffect(() => {
		if (cookieLoaded) return;

		debugLog("MOUNT", "Loading organization from cookie");

		getDecryptedCookie("organization")
			.then(cookieOrganization => {
				debugLog("MOUNT", "Cookie organization retrieved", cookieOrganization);
				if (cookieOrganization?.domain && !hasCurrentOrganization) {
					const organizationData: Organization = {
						id: cookieOrganization.id as string,
						name: cookieOrganization.name as string,
						domains: cookieOrganization.domain as string,
						is_owner: cookieOrganization.is_owner as boolean,
						description: cookieOrganization.description as string,
						socials: cookieOrganization.socials as OrganizationSocial[],
						github_installation_id:
							cookieOrganization.github_installation_id as string,
						github_installation_status:
							cookieOrganization.github_installation_status as string,
						// New fields with proper defaults
						is_downgraded:
							(cookieOrganization.is_downgraded as boolean) ?? false,
						downgraded_at: cookieOrganization.downgraded_at as
							| string
							| undefined,
						downgrade_reason: cookieOrganization.downgrade_reason as
							| string
							| undefined,
						activity_score: (cookieOrganization.activity_score as number) ?? 0,
						last_activity_at: cookieOrganization.last_activity_at as
							| string
							| undefined,
					};
					debugLog(
						"MOUNT",
						"📦 Setting organization from cookie",
						organizationData,
					);
					setCurrentOrganization(organizationData);
					setOrganization(organizationData);
				}
			})
			.catch(error => {
				debugLog("MOUNT", "❌ Failed to load organization from cookie", error);
			})
			.finally(() => {
				setCookieLoaded(true);
			});
	}, [
		cookieLoaded,
		hasCurrentOrganization,
		setCurrentOrganization,
		setOrganization,
	]);

	// Determine comprehensive loading state
	const isInitialLoading =
		!cookieLoaded || query.isLoading || (query.isSuccess && !isInitialized);
	const shouldShowContent =
		isInitialized &&
		(hasOrganizationsInStore || hasCurrentOrganization || !!query.data);

	// Get sorted organizations for return
	const sortedOrganizations = useMemo(() => {
		const organizationsToSort = hasOrganizationsInStore
			? organizationsInStore
			: (query.data ?? []);
		return sortOrganizationsByDowngradeStatus(organizationsToSort);
	}, [hasOrganizationsInStore, organizationsInStore, query.data]);

	// Debug final state
	useEffect(() => {
		debugLog("FINAL_STATE", "Hook state computed", {
			isInitialLoading,
			shouldShowContent,
			hasCurrentOrganization,
			isInitialized,
			cookieLoaded,
			queryStatus: query.status,
			currentOrganizationDowngraded: currentOrganization?.is_downgraded,
			organizationsCount: sortedOrganizations.length,
		});
	}, [
		isInitialLoading,
		shouldShowContent,
		hasCurrentOrganization,
		isInitialized,
		cookieLoaded,
		query.status,
		currentOrganization?.is_downgraded,
		sortedOrganizations.length,
	]);

	return {
		organizations: sortedOrganizations,
		isFetching: query.isFetching,
		isLoading: isInitialLoading,
		isError: query.isError,
		error: query.error,
		shouldShowContent,
		hasCurrentOrganization,
		isInitialized,
		refetchOrganizations, // Expose refetch function
	};
};
