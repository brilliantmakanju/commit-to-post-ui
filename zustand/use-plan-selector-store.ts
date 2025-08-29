import { create } from "zustand";
import { persist } from "zustand/middleware";

type IntervalType = "monthly" | "annual";

interface PlanSelectorState {
	// modal controls
	isOpen: boolean;
	type: "upgrade" | "downgrade" | undefined;

	// plan context
	currentPlanId: string | undefined;
	currentInterval: IntervalType;
}

interface PlanSelectorActions {
	open: (
		type: "upgrade" | "downgrade",
		planId: string,
		interval: IntervalType,
	) => void;
	close: () => void;
	setPlanSelector: (partial: Partial<PlanSelectorState>) => void;
	clear: () => void;
}

const usePlanSelectorStore = create<PlanSelectorState & PlanSelectorActions>()(
	persist(
		set => ({
			// defaults
			isOpen: false,
			type: undefined,
			currentPlanId: undefined,
			currentInterval: "monthly",

			// actions
			open: (type, planId, interval) =>
				set({
					type,
					isOpen: true,
					currentPlanId: planId,
					currentInterval: interval,
				}),
			close: () =>
				set({
					isOpen: false,
					type: undefined,
					currentPlanId: undefined,
				}),
			setPlanSelector: partial => set(state => ({ ...state, ...partial })),
			clear: () =>
				set({
					isOpen: false,
					type: undefined,
					currentPlanId: undefined,
					currentInterval: "monthly",
				}),
		}),
		{
			name: "plan-selector-storage", // unique key
		},
	),
);

export default usePlanSelectorStore;
