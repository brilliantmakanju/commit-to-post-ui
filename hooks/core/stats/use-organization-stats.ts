/* eslint-disable import/no-unresolved */
"use client";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

import { fetchOrganizationStats } from "@/server-actions/core/stats/get-organization-stats";
import { OrganizationStatsResponse } from "@/types/organization-stats";
import { useOrganizationStatsStore } from "@/zustand/organization-stats-store";

interface UseOrganizationStatsOptions {
	enabled?: boolean;
	refetchInterval?: number;
	staleTime?: number;
}

const useOrganizationStats = (options: UseOrganizationStatsOptions = {}) => {
	const {
		enabled = true,
		refetchInterval = 5 * 60 * 1000, // 5 minutes
		staleTime = 2 * 60 * 1000, // 2 minutes
	} = options;

	const {
		setStats,
		setError,
		clearError,
		setLoading,
		setRefreshing,
		summary,
		organizations,
		totalOrganizations,
		isLoading: storeIsLoading,
		error: storeError,
		hasError,
		lastFetched,
		// Getters and filters
		getFilteredOrganizations,
		getSelectedOrganizations,
		getOrganizationById,
		// Actions
		updateOrganization,
		clearStats,
		setSortBy,
		setSortOrder,
		toggleSortOrder,
		setShowDowngradedOnly,
		toggleOrganizationSelection,
		selectAllOrganizations,
		clearOrganizationSelection,
		sortBy,
		sortOrder,
		showDowngradedOnly,
		selectedOrganizationIds,
	} = useOrganizationStatsStore();

	const { data, isLoading, isRefetching, isError, error, refetch, isFetching } =
		useQuery<{
			data: OrganizationStatsResponse;
			success: boolean;
			message: string;
		}>({
			queryKey: ["organization-stats"],
			queryFn: fetchOrganizationStats,
			enabled,
			refetchInterval,
			staleTime,
			refetchOnWindowFocus: false,
			retry: 3,
			retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
		});

	// Handle successful data fetching and errors
	useEffect(() => {
		if (data?.success && data.data) {
			clearError();
			setStats(data.data); // Extract the actual data from the wrapper
		}
	}, [data, setStats, clearError]);

	useEffect(() => {
		if (isError && error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: "Failed to fetch organization stats";
			setError(errorMessage);
		}
	}, [isError, error, setError]);

	// Update loading states
	useEffect(() => {
		setLoading(isLoading && !data);
		setRefreshing(isRefetching);
	}, [isLoading, isRefetching, data, setLoading, setRefreshing]);

	// Helper functions
	const forceRefresh = async () => {
		setRefreshing(true);
		try {
			await refetch();
		} finally {
			setRefreshing(false);
		}
	};

	const refreshIfStale = () => {
		if (!lastFetched || Date.now() - lastFetched.getTime() > staleTime) {
			refetch();
		}
	};

	const getStatsForOrganization = (orgId: string) => {
		return getOrganizationById(orgId);
	};

	// Calculate derived stats
	const derivedStats = useMemo(() => {
		if (!summary) return;

		return {
			averageReposPerOrg:
				totalOrganizations > 0 ? summary.total_repos / totalOrganizations : 0,
			averageSocialsPerOrg:
				totalOrganizations > 0 ? summary.total_socials / totalOrganizations : 0,
			averagePostsPerOrg:
				totalOrganizations > 0 ? summary.total_posts / totalOrganizations : 0,
			publishedPostsPercentage:
				summary.total_posts > 0
					? (summary.published_posts / summary.total_posts) * 100
					: 0,
			activeReposPercentage:
				summary.total_repos > 0
					? (summary.active_repos / summary.total_repos) * 100
					: 0,
			activeSocialsPercentage:
				summary.total_socials > 0
					? (summary.active_socials / summary.total_socials) * 100
					: 0,
		};
	}, [summary, totalOrganizations]);

	return {
		// Data
		summary,
		derivedStats,
		totalOrganizations,
		allOrganizations: organizations,
		organizations: getFilteredOrganizations(),
		selectedOrganizations: getSelectedOrganizations(),

		// Loading states
		isFetchingStats: isFetching,
		isStatsRefreshing: isRefetching,
		isStatsLoading: isLoading || storeIsLoading,

		// Error handling
		statsError: error || storeError,
		isStatsError: isError || hasError,

		// Metadata
		lastFetched,

		// Actions
		clearStats,
		forceRefresh,
		refreshIfStale,
		updateOrganization,
		refetchStats: refetch,

		// Filtering and sorting
		sortBy,
		setSortBy,
		sortOrder,
		setSortOrder,
		toggleSortOrder,
		showDowngradedOnly,
		setShowDowngradedOnly,

		// Selection
		selectAllOrganizations,
		selectedOrganizationIds,
		clearOrganizationSelection,
		toggleOrganizationSelection,

		// Helpers
		getOrganizationById,
		getStatsForOrganization,
	};
};

export default useOrganizationStats;
