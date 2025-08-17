// eslint-disable-next-line import/no-unresolved
import { DEFAULT_FEATURE_FLAGS } from "@/lib/constants/feature-flags";
import useFeatureFlagsStore, {
	FeatureFlag,
	// eslint-disable-next-line import/no-unresolved
} from "@/zustand/feature-flags-store";

export const initializeFeatureFlags = () => {
	const { setFlags } = useFeatureFlagsStore.getState();

	// Always initialize to ensure flags are set
	const now = new Date();
	const initializedFlags: Record<string, FeatureFlag> = {};

	Object.entries(DEFAULT_FEATURE_FLAGS).forEach(([key, flagConfig]) => {
		initializedFlags[key] = {
			...flagConfig,
			createdAt: now,
			updatedAt: now,
		};
	});

	setFlags(initializedFlags);
};

export const resetFeatureFlagsToDefaults = () => {
	const { setFlags } = useFeatureFlagsStore.getState();
	const now = new Date();
	const resetFlags: Record<string, FeatureFlag> = {};

	Object.entries(DEFAULT_FEATURE_FLAGS).forEach(([key, flagConfig]) => {
		resetFlags[key] = {
			...flagConfig,
			createdAt: now,
			updatedAt: now,
		};
	});

	setFlags(resetFlags);
};

export const getFeatureFlagValue = (flagId: string): boolean => {
	const { flags } = useFeatureFlagsStore.getState();
	const flag = flags[flagId];
	return flag?.enabled ?? false;
};

export const setFeatureFlagValue = (flagId: string, enabled: boolean) => {
	const { setFlag, flags } = useFeatureFlagsStore.getState();
	const flag = flags[flagId];

	if (flag) {
		setFlag(flagId, {
			...flag,
			enabled,
			updatedAt: new Date(),
		});
	}
};
