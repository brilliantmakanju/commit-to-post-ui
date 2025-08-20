import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface FeatureFlag {
	id: string;
	name: string;
	enabled: boolean;
	createdAt: Date;
	updatedAt: Date;
	description: string;
	requiresAuth: boolean;
	requiresPlan?: "free" | "pro" | "studio";
	category: "stats" | "subscription" | "general" | "experimental";
}

export interface FeatureFlagsState {
	isLoading: boolean;
	lastUpdated: Date | undefined;
	flags: Record<string, FeatureFlag>;
}

export interface FeatureFlagsActions {
	// Core actions
	toggleFlag: (flagId: string) => void;
	enableFlag: (flagId: string) => void;
	disableFlag: (flagId: string) => void;
	setFlag: (flagId: string, flag: FeatureFlag) => void;

	// Batch operations
	clearFlags: () => void;
	setFlags: (flags: Record<string, FeatureFlag>) => void;

	// Utility functions
	getFlagsByCategory: (category: FeatureFlag["category"]) => FeatureFlag[];
	isFeatureEnabled: (
		flagId: string,
		userPlan?: string,
		isAuthenticated?: boolean,
	) => boolean;

	// Loading states
	setLastUpdated: (date: Date) => void;
	setLoading: (loading: boolean) => void;
}

const useFeatureFlagsStore = create<FeatureFlagsState & FeatureFlagsActions>()(
	persist(
		(set, get) => ({
			flags: {},
			isLoading: false,
			lastUpdated: undefined,

			setFlag: (flagId: string, flag: FeatureFlag) =>
				set(state => ({
					flags: {
						...state.flags,
						[flagId]: {
							...flag,
							updatedAt: new Date(),
						},
					},
				})),

			toggleFlag: (flagId: string) =>
				set(state => {
					const flag = state.flags[flagId];
					if (!flag) return state;

					return {
						flags: {
							...state.flags,
							[flagId]: {
								...flag,
								enabled: !flag.enabled,
								updatedAt: new Date(),
							},
						},
					};
				}),

			enableFlag: (flagId: string) =>
				set(state => {
					const flag = state.flags[flagId];
					if (!flag || flag.enabled) return state;

					return {
						flags: {
							...state.flags,
							[flagId]: {
								...flag,
								enabled: true,
								updatedAt: new Date(),
							},
						},
					};
				}),

			disableFlag: (flagId: string) =>
				set(state => {
					const flag = state.flags[flagId];
					if (!flag || !flag.enabled) return state;

					return {
						flags: {
							...state.flags,
							[flagId]: {
								...flag,
								enabled: false,
								updatedAt: new Date(),
							},
						},
					};
				}),

			setFlags: (flags: Record<string, FeatureFlag>) => {
				set({ flags });
			},

			clearFlags: () => set({ flags: {} }),

			isFeatureEnabled: (
				flagId: string,
				userPlan?: string,
				isAuthenticated?: boolean,
			) => {
				const state = get();
				const flag = state.flags[flagId];

				if (!flag) {
					return false;
				}

				if (!flag.enabled) {
					return false;
				}

				// Check authentication requirement
				if (flag.requiresAuth && !isAuthenticated) {
					return false;
				}

				// Check plan requirement
				if (flag.requiresPlan && userPlan) {
					const planHierarchy = { free: 0, pro: 1, studio: 2 };
					const userPlanLevel =
						planHierarchy[
							userPlan.toLowerCase() as keyof typeof planHierarchy
						] ?? -1;
					const requiredPlanLevel = planHierarchy[flag.requiresPlan];

					if (userPlanLevel < requiredPlanLevel) {
						return false;
					}
				}

				return true;
			},

			getFlagsByCategory: (category: FeatureFlag["category"]) => {
				const state = get();
				return Object.values(state.flags).filter(
					flag => flag.category === category,
				);
			},

			setLastUpdated: (date: Date) => set({ lastUpdated: date }),
			setLoading: (loading: boolean) => set({ isLoading: loading }),
		}),
		{
			name: "feature-flags-storage",
		},
	),
);

export default useFeatureFlagsStore;
