/* eslint-disable import/no-unresolved */
import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
	OrganizationStats,
	OrganizationStatsResponse,
	SummaryStats,
} from "@/types/organization-stats";

interface OrganizationStatsState {
	// Data
	totalOrganizations: number;
	summary: SummaryStats | undefined;
	organizations: OrganizationStats[];

	// Loading states
	isLoading: boolean;
	isRefreshing: boolean;

	// Error handling
	hasError: boolean;
	error: string | undefined;

	// Metadata
	hasHydrated: boolean;
	lastFetched: Date | undefined;

	// Filters and sorting
	sortOrder: "asc" | "desc";
	showDowngradedOnly: boolean;
	selectedOrganizationIds: string[];
	sortBy: "name" | "activity_score" | "total_repos" | "total_posts";
}

interface OrganizationStatsActions {
	// Data management
	setStats: (data: OrganizationStatsResponse) => void;
	clearStats: () => void;
	updateOrganization: (
		orgId: string,
		updates: Partial<OrganizationStats>,
	) => void;

	// Loading states
	setLoading: (loading: boolean) => void;
	setRefreshing: (refreshing: boolean) => void;

	// Error handling
	setError: (error: string | undefined) => void;
	clearError: () => void;

	// Filters and sorting
	setSortBy: (sortBy: OrganizationStatsState["sortBy"]) => void;
	setSortOrder: (order: "asc" | "desc") => void;
	toggleSortOrder: () => void;
	setShowDowngradedOnly: (show: boolean) => void;
	toggleOrganizationSelection: (orgId: string) => void;
	selectAllOrganizations: () => void;
	clearOrganizationSelection: () => void;

	// Computed getters
	getFilteredOrganizations: () => OrganizationStats[];
	getSelectedOrganizations: () => OrganizationStats[];
	getOrganizationById: (orgId: string) => OrganizationStats | undefined;
}

const initialState: OrganizationStatsState = {
	sortBy: "name",
	hasError: false,
	isLoading: false,
	error: undefined,
	sortOrder: "asc",
	organizations: [],
	summary: undefined,
	hasHydrated: false,
	isRefreshing: false,
	totalOrganizations: 0,
	lastFetched: undefined,
	showDowngradedOnly: false,
	selectedOrganizationIds: [],
};

export const useOrganizationStatsStore = create<
	OrganizationStatsState & OrganizationStatsActions
>()(
	persist(
		(set, get) => ({
			...initialState,

			// Data management
			setStats: data => {
				set({
					summary: data.summary,
					organizations: data.organizations,
					totalOrganizations: data.total_organizations,
					lastFetched: new Date(),
					error: undefined,
					hasError: false,
					isLoading: false,
					isRefreshing: false,
				});
			},

			clearStats: () => {
				set({
					...initialState,
					hasHydrated: get().hasHydrated,
				});
			},

			updateOrganization: (orgId, updates) => {
				set(state => ({
					organizations: state.organizations.map(org =>
						org.organization_id === orgId ? { ...org, ...updates } : org,
					),
				}));
			},

			// Loading states
			setLoading: loading => set({ isLoading: loading }),
			setRefreshing: refreshing => set({ isRefreshing: refreshing }),

			// Error handling
			setError: error => set({ error, hasError: !!error }),
			clearError: () => set({ error: undefined, hasError: false }),

			// Filters and sorting
			setSortBy: sortBy => set({ sortBy }),
			setSortOrder: sortOrder => set({ sortOrder }),
			toggleSortOrder: () =>
				set(state => ({
					sortOrder: state.sortOrder === "asc" ? "desc" : "asc",
				})),
			setShowDowngradedOnly: showDowngradedOnly => set({ showDowngradedOnly }),

			toggleOrganizationSelection: orgId => {
				set(state => ({
					selectedOrganizationIds: state.selectedOrganizationIds.includes(orgId)
						? state.selectedOrganizationIds.filter(id => id !== orgId)
						: [...state.selectedOrganizationIds, orgId],
				}));
			},

			selectAllOrganizations: () => {
				set(state => ({
					selectedOrganizationIds: state.organizations.map(
						org => org.organization_id,
					),
				}));
			},

			clearOrganizationSelection: () => set({ selectedOrganizationIds: [] }),

			// Computed getters
			getFilteredOrganizations: () => {
				const state = get();
				let filtered = [...state.organizations];

				// Apply downgraded filter
				if (state.showDowngradedOnly) {
					filtered = filtered.filter(org => org.is_downgraded);
				}

				// Apply sorting
				filtered.sort((a, b) => {
					let aValue: any;
					let bValue: any;

					switch (state.sortBy) {
						case "name": {
							aValue = a.organization_name.toLowerCase();
							bValue = b.organization_name.toLowerCase();
							break;
						}
						case "activity_score": {
							aValue = a.activity_score;
							bValue = b.activity_score;
							break;
						}
						case "total_repos": {
							aValue = a.repositories.total_repos;
							bValue = b.repositories.total_repos;
							break;
						}
						case "total_posts": {
							aValue = a.posts.total_posts;
							bValue = b.posts.total_posts;
							break;
						}
						default: {
							return 0;
						}
					}

					if (state.sortOrder === "asc") {
						return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
					} else {
						return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
					}
				});

				return filtered;
			},

			getSelectedOrganizations: () => {
				const state = get();
				return state.organizations.filter(org =>
					state.selectedOrganizationIds.includes(org.organization_id),
				);
			},

			getOrganizationById: orgId => {
				return get().organizations.find(org => org.organization_id === orgId);
			},
		}),
		{
			name: "organization-stats-storage",
			partialize: state => ({
				// Only persist certain fields, not loading states or errors
				summary: state.summary,
				organizations: state.organizations,
				totalOrganizations: state.totalOrganizations,
				lastFetched: state.lastFetched,
				sortBy: state.sortBy,
				sortOrder: state.sortOrder,
				showDowngradedOnly: state.showDowngradedOnly,
				selectedOrganizationIds: state.selectedOrganizationIds,
				hasHydrated: true,
			}),
		},
	),
);
