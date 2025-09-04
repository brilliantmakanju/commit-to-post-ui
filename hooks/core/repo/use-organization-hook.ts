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
	const [hasLoadedFromCookie, setHasLoadedFromCookie] = useState(false);
	const [initializationStarted, setInitializationStarted] = useState(false);

	const {
		setOrganization,
		setCurrentOrganization,
		updateOrganizations,
		organization: currentOrganization,
		organizations: organizationsInStore,
	} = useOrganizationStore();

	// Simplified check for organizations in store
	const hasOrganizationsInStore = useMemo(() => {
		return organizationsInStore?.length > 0;
	}, [organizationsInStore]);

	// Check if we have a current organization set
	const hasCurrentOrganization = useMemo(() => {
		return !!currentOrganization?.domains;
	}, [currentOrganization]);

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

	// Simplified organization synchronization with timeout
	const synchronizeOrganization = useCallback(
		async (organizations: Organization[]) => {
			if (initializationStarted) return;
			setInitializationStarted(true);

			debugLog("SYNC", "Starting organization synchronization", {
				organizationsCount: organizations.length,
				currentOrganizationInStore: currentOrganization?.id,
			});

			// Set a timeout to prevent infinite hanging
			const syncTimeout = setTimeout(() => {
				debugLog("SYNC", "⚠️ Synchronization timeout - forcing completion");
				setIsInitialized(true);
			}, 10000); // 10 second timeout

			try {
				// Sort organizations first
				const sortedOrganizations =
					sortOrganizationsByDowngradeStatus(organizations);

				// Always update the organizations list first
				updateOrganizations(sortedOrganizations);

				// If no current organization, select the best one
				if (!currentOrganization?.domains && sortedOrganizations.length > 0) {
					const bestOrganization =
						findBestOrganizationToSelect(sortedOrganizations);

					if (bestOrganization) {
						debugLog("SYNC", "Setting best organization", {
							id: bestOrganization.id,
							name: bestOrganization.name,
							domain: bestOrganization.domains,
							isDowngraded: bestOrganization.is_downgraded,
						});

						setCurrentOrganization(bestOrganization);
						setOrganization(bestOrganization);

						// Create cookie asynchronously (don't await)
						const cookieData = createOrganizationCookieData(bestOrganization);
						createEncryptedCookie("organization", cookieData).catch(error => {
							debugLog("SYNC", "Failed to create cookie", error);
						});
					}
				}

				clearTimeout(syncTimeout);
				setIsInitialized(true);
				debugLog("SYNC", "✅ Organization synchronization completed");
			} catch (error) {
				clearTimeout(syncTimeout);
				debugLog("SYNC", "❌ Organization synchronization failed", error);
				setIsInitialized(true); // Still mark as initialized to prevent infinite loading
			}
		},
		[
			initializationStarted,
			currentOrganization,
			setCurrentOrganization,
			setOrganization,
			updateOrganizations,
			createOrganizationCookieData,
		],
	);

	// Background refresh function - simplified and non-blocking
	const backgroundRefresh = useCallback(async () => {
		debugLog("BACKGROUND", "Starting background refresh of cached queries");

		const criticalQueries = ["posts", "notifications", "dashboard_metrics"];

		// Fire and forget - don't block initialization
		Promise.allSettled(
			criticalQueries.map(key =>
				queryClient.invalidateQueries({ queryKey: [key] }),
			),
		)
			.then(results => {
				const successful = results.filter(
					result => result.status === "fulfilled",
				).length;
				debugLog(
					"BACKGROUND",
					`Background refresh completed: ${successful} successful`,
				);
			})
			.catch(() => {
				// Ignore background refresh errors
			});
	}, [queryClient]);

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
			});

			// Sync organizations (this will set isInitialized)
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
		retry: 2, // Reduced retries
		retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 5000),
	});

	// Load from cookie on mount - simplified
	useEffect(() => {
		if (hasLoadedFromCookie) return;

		const loadFromCookie = async () => {
			try {
				const cookieOrganization = await getDecryptedCookie("organization");

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
			} catch (error) {
				debugLog("MOUNT", "❌ Failed to load organization from cookie", error);
			} finally {
				setHasLoadedFromCookie(true);
			}
		};

		// Add a small delay to prevent race conditions
		const timeout = setTimeout(loadFromCookie, 100);
		return () => clearTimeout(timeout);
	}, [
		hasLoadedFromCookie,
		hasCurrentOrganization,
		setCurrentOrganization,
		setOrganization,
	]);

	// Force refetch organizations from backend
	const refetchOrganizations = useCallback(async () => {
		debugLog("REFETCH", "Force refetching organizations from backend");

		setIsInitialized(false);
		setInitializationStarted(false);

		try {
			await queryClient.invalidateQueries({ queryKey: ["organizations"] });
			const result = await queryClient.refetchQueries({
				queryKey: ["organizations"],
			});
			debugLog("REFETCH", "✅ Organizations refetched successfully");
			return result;
		} catch (error) {
			debugLog("REFETCH", "❌ Failed to refetch organizations", error);
			setIsInitialized(true); // Prevent infinite loading
			throw error;
		}
	}, [queryClient]);

	// Determine loading state - simplified logic
	const isInitialLoading =
		!hasLoadedFromCookie ||
		(query.isLoading && !isInitialized) ||
		(!isInitialized && query.isSuccess);

	const shouldShowContent =
		isInitialized &&
		hasLoadedFromCookie &&
		(hasOrganizationsInStore || hasCurrentOrganization || !!query.data);

	// Get sorted organizations for return
	const sortedOrganizations = useMemo(() => {
		const organizationsToSort = hasOrganizationsInStore
			? organizationsInStore
			: (query.data ?? []);
		return sortOrganizationsByDowngradeStatus(organizationsToSort);
	}, [hasOrganizationsInStore, organizationsInStore, query.data]);

	// Add emergency timeout to prevent infinite loading
	useEffect(() => {
		if (isInitialLoading) {
			const emergencyTimeout = setTimeout(() => {
				debugLog(
					"EMERGENCY",
					"⚠️ Emergency timeout triggered - forcing initialization",
				);
				setIsInitialized(true);
				setHasLoadedFromCookie(true);
			}, 15000); // 15 second emergency timeout

			return () => clearTimeout(emergencyTimeout);
		}
	}, [isInitialLoading]);

	// Debug final state
	useEffect(() => {
		debugLog("FINAL_STATE", "Hook state computed", {
			isInitialLoading,
			shouldShowContent,
			hasCurrentOrganization,
			isInitialized,
			hasLoadedFromCookie,
			queryStatus: query.status,
			organizationsCount: sortedOrganizations.length,
		});
	}, [
		isInitialLoading,
		shouldShowContent,
		hasCurrentOrganization,
		isInitialized,
		hasLoadedFromCookie,
		query.status,
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
		refetchOrganizations,
	};
};
