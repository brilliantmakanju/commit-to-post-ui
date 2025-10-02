import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PlanSelectorState {
	// modal controls
	isOpen: boolean;
	type: "upgrade" | undefined;

	// plan context
	currentPlanId: string | undefined;
}

interface PlanSelectorActions {
	open: (type: "upgrade", planId: string) => void;
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

			// actions
			open: (type, planId) =>
				set({
					type,
					isOpen: true,
					currentPlanId: planId,
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
				}),
		}),
		{
			name: "plan-selector-storage", // unique key
		},
	),
);

export default usePlanSelectorStore;
