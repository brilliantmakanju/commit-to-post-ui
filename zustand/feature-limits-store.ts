import { create } from "zustand";
import { persist } from "zustand/middleware";

// Feature Categories
export const FEATURE_CATEGORIES = [
	"ai_tones",
	"workspaces",
	"ai_templates",
	"image_upload",
	"schedule_post",
	"hashtag_automation",
] as const;

export type FeatureCategory = (typeof FEATURE_CATEGORIES)[number];

export interface FeatureLimit {
	id: string;
	name: string;
	createdAt: Date;
	updatedAt: Date;
	description: string;
	requiresAuth: boolean;
	limits: {
		pro: number;
		basic: number;
		studio: number;
	};
	category: FeatureCategory;
}

export interface FeatureLimitsState {
	isLoading: boolean;
	lastUpdated: Date | undefined;
	limits: Record<string, FeatureLimit>;
}

export interface FeatureLimitsActions {
	// Core actions
	clearLimits: () => void;
	setLimit: (limitId: string, limit: FeatureLimit) => void;
	setLimits: (limits: Record<string, FeatureLimit>) => void;

	// Utility functions
	getLimitForPlan: (limitId: string, userPlan?: string) => number;
	getLimitsByCategory: (category: FeatureLimit["category"]) => FeatureLimit[];
	canAddMore: (
		limitId: string,
		currentCount: number,
		userPlan?: string,
	) => boolean;
	getRemainingCount: (
		limitId: string,
		currentCount: number,
		userPlan?: string,
	) => number;

	// Loading states
	setLastUpdated: (date: Date) => void;
	setLoading: (loading: boolean) => void;
}

const useFeatureLimitsStore = create<
	FeatureLimitsState & FeatureLimitsActions
>()(
	persist(
		(set, get) => ({
			limits: {},
			isLoading: false,
			lastUpdated: undefined,

			setLimit: (limitId: string, limit: FeatureLimit) =>
				set(state => ({
					limits: {
						...state.limits,
						[limitId]: {
							...limit,
							updatedAt: new Date(),
						},
					},
				})),

			setLimits: (limits: Record<string, FeatureLimit>) => set({ limits }),

			clearLimits: () => set({ limits: {} }),

			getLimitForPlan: (limitId: string, userPlan?: string) => {
				const state = get();
				const limit = state.limits[limitId];

				if (!limit) return 0;

				const planKey = userPlan?.toLowerCase() as keyof typeof limit.limits;
				return limit.limits[planKey] ?? limit.limits.basic;
			},

			canAddMore: (
				limitId: string,
				currentCount: number,
				userPlan?: string,
			) => {
				const limit = get().getLimitForPlan(limitId, userPlan);
				return currentCount < limit;
			},

			getRemainingCount: (
				limitId: string,
				currentCount: number,
				userPlan?: string,
			) => {
				const limit = get().getLimitForPlan(limitId, userPlan);
				return Math.max(0, limit - currentCount);
			},

			getLimitsByCategory: (category: FeatureLimit["category"]) => {
				const state = get();
				return Object.values(state.limits).filter(
					limit => limit.category === category,
				);
			},

			setLoading: (loading: boolean) => set({ isLoading: loading }),

			setLastUpdated: (date: Date) => set({ lastUpdated: date }),
		}),
		{
			name: "feature-limits-storage",
		},
	),
);

export default useFeatureLimitsStore;
