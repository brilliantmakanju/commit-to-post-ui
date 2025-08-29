/* eslint-disable import/no-unresolved */
"use client";
import PricingTable from "@/components/landing/pricing";
import PlanSelector from "@/components/landing/pricing/v4/payment-selector";
import usePlanSelectorStore from "@/zustand/use-plan-selector-store";

export default function PricingPage() {
	const {
		isOpen: selector,
		close,
		type,
		currentPlanId,
		currentInterval,
	} = usePlanSelectorStore();

	return (
		<>
			<PricingTable />
			<PlanSelector
				open={selector}
				type={type || "upgrade"}
				currentPlanId={currentPlanId || ""}
				onOpenChange={open => {
					if (!open) close();
				}}
				currentInterval={currentInterval}
			/>
		</>
	);
}
