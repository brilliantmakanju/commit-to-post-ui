// ============================================
// UTILITY FUNCTIONS

import { PlanData } from "./pricing-data";

// ============================================
export function calculateCostPerCredit(price: number, credits: number): string {
	return (price / credits).toFixed(3);
}

export function getButtonClassName(plan: PlanData, isActive: boolean): string {
	if (isActive) {
		return "w-full cursor-not-allowed opacity-60 border-2 border-gray-300 bg-gray-100 text-gray-600 hover:bg-gray-100";
	}

	if (plan.id === "basic") {
		return "w-full border-2 border-black bg-white text-black hover:bg-gray-50";
	}

	if (plan.buttonVariant === "secondary") {
		return "w-full bg-white text-black shadow-md hover:bg-gray-100";
	}

	return "w-full bg-black text-white shadow-md hover:bg-gray-800";
}

export function getShadowClassName(planId: string): string {
	if (planId === "pro") {
		return "shadow-md hover:shadow-lg";
	}
	if (planId === "studio") {
		return "shadow-lg hover:shadow-xl";
	}
	return "shadow-sm hover:shadow-md";
}

export function determineIfPlanIsActive(
	planId: string,
	userPlan: string,
	billingType: string,
	hasActiveSubscription: boolean,
	isSubscriptionView: boolean,
): boolean {
	if (isSubscriptionView) {
		return hasActiveSubscription && userPlan === planId;
	}
	return billingType === "credits" && userPlan === planId;
}

export function getButtonText(
	plan: PlanData,
	isActive: boolean,
	hasActiveSubscription: boolean,
	isSubscriptionView: boolean,
): string {
	if (isActive) {
		if (isSubscriptionView && hasActiveSubscription) {
			return "Current Subscription";
		}
		return "Current Plan";
	}
	return plan.buttonText;
}

export function getTooltipMessage(
	isActive: boolean,
	hasActiveSubscription: boolean,
	isSubscriptionView: boolean,
): string {
	if (isActive) {
		if (isSubscriptionView && hasActiveSubscription) {
			return "This is your current active subscription.";
		}
		return "This is your current plan.";
	}
	return "";
}
