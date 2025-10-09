/* eslint-disable import/no-unresolved */
"use client";
import PricingTable from "@/components/landing/pricing";

export default function PricingPage() {
	return (
		<>
			<PricingTable />
			{/* <PlanSelector
				open={selector}
				type={type || "upgrade"}
				currentPlanId={currentPlanId || ""}
				onOpenChange={open => {
					if (!open) close();
				}}
				currentInterval={currentInterval}
			/> */}
		</>
	);
}
