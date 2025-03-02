const pulseProPlan = JSON.parse(process.env.NEXT_PULSE_PRO_PLAN || "{}");

export const getPriceId = ({
	planType,
	billingCycle,
}: {
	planType: "Pro" | "Lifetime Deal";
	billingCycle?: "monthly" | "annual";
}) => {
	if (planType === "Lifetime Deal") {
		return pulseProPlan["ltd"];
	}

	// Default to monthly if no billing cycle is provided
	const cycle = billingCycle || "monthly";
	return pulseProPlan[cycle];
};
