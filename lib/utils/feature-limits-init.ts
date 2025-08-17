/* eslint-disable import/no-unresolved */
import { DEFAULT_FEATURE_LIMITS } from "@/lib/constants/feature-limits";
import useFeatureLimitsStore, {
	FeatureLimit,
} from "@/zustand/feature-limits-store";

export const initializeFeatureLimits = () => {
	const { setLimits, limits } = useFeatureLimitsStore.getState();

	// Always initialize to ensure limits are set
	const now = new Date();
	const initializedLimits: Record<string, FeatureLimit> = {};

	Object.entries(DEFAULT_FEATURE_LIMITS).forEach(([key, limitConfig]) => {
		initializedLimits[key] = {
			...limitConfig,
			createdAt: now,
			updatedAt: now,
		};
	});

	setLimits(initializedLimits);
};

export const resetFeatureLimitsToDefaults = () => {
	const { setLimits } = useFeatureLimitsStore.getState();
	const now = new Date();
	const resetLimits: Record<string, FeatureLimit> = {};

	Object.entries(DEFAULT_FEATURE_LIMITS).forEach(([key, limitConfig]) => {
		resetLimits[key] = {
			...limitConfig,
			createdAt: now,
			updatedAt: now,
		};
	});

	setLimits(resetLimits);
};

export const getFeatureLimit = (limitId: string, userPlan?: string): number => {
	const { getLimitForPlan } = useFeatureLimitsStore.getState();
	return getLimitForPlan(limitId, userPlan);
};

export const canAddMore = (
	limitId: string,
	currentCount: number,
	userPlan?: string,
): boolean => {
	const { canAddMore: canAdd } = useFeatureLimitsStore.getState();
	return canAdd(limitId, currentCount, userPlan);
};

export const getRemainingCount = (
	limitId: string,
	currentCount: number,
	userPlan?: string,
): number => {
	const { getRemainingCount } = useFeatureLimitsStore.getState();
	return getRemainingCount(limitId, currentCount, userPlan);
};
