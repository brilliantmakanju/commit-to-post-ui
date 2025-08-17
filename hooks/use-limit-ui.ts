/* eslint-disable import/no-unresolved */
import { useState } from "react";

import { useFeatureLimit } from "@/hooks/use-feature-limits";
import { FeatureCategory } from "@/zustand/feature-limits-store";

interface UseLimitUIProps {
	limitId: string;
	currentCount: number;
	limitType: FeatureCategory;
	warningThreshold?: number; // Percentage to show warning (default: 80)
}

export const useLimitUI = ({
	limitId,
	limitType,
	currentCount,
	warningThreshold = 80,
}: UseLimitUIProps) => {
	const [warningOpen, setWarningOpen] = useState(false);
	const [reachedOpen, setReachedOpen] = useState(false);

	const { limit, canAdd, remaining, userPlan, isAuthenticated } =
		useFeatureLimit(limitId, currentCount);

	const percentage = limit > 0 ? Math.round((currentCount / limit) * 100) : 0;
	const isNearLimit = percentage >= warningThreshold;
	const isAtLimit = !canAdd;

	// Show warning when approaching limit
	const showWarning = () => {
		if (isNearLimit && !isAtLimit) {
			setWarningOpen(true);
		}
	};

	// Show limit reached modal
	const showLimitReached = () => {
		if (isAtLimit) {
			setReachedOpen(true);
		}
	};

	// Check if action should trigger warning or limit reached
	const checkLimit = (action: () => void) => {
		if (isAtLimit) {
			showLimitReached();
			return false;
		}

		if (isNearLimit) {
			showWarning();
		}

		action();
		return true;
	};

	return {
		// Limit data
		limit,
		canAdd,
		userPlan,
		remaining,
		isAtLimit,
		percentage,
		isNearLimit,
		isAuthenticated,

		// Modal states
		warningOpen,
		reachedOpen,
		setWarningOpen,
		setReachedOpen,

		// Actions
		showWarning,
		checkLimit,
		showLimitReached,

		// Modal props
		warningProps: {
			limitType,
			maxLimit: limit,
			isOpen: warningOpen,
			currentUsage: currentCount,
			onClose: () => setWarningOpen(false),
		},
		reachedProps: {
			limitType,
			maxLimit: limit,
			isOpen: reachedOpen,
			onClose: () => setReachedOpen(false),
		},
	};
};
