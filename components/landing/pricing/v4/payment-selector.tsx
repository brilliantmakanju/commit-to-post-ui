/* eslint-disable import/no-unresolved */
"use client";

import { AlertTriangle, Check } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFetchOrganizations } from "@/hooks/core/repo/use-organization-hook";
import { initializeFeatureFlags } from "@/lib/utils/feature-flags-init";
import { initializeFeatureLimits } from "@/lib/utils/feature-limits-init";
import {
	changeSubscriptionPlan,
	PlanChangeResponse,
} from "@/server-actions/core/plan-selection";
import useUserStore from "@/zustand/useuser-store";

import { pricingData } from "../data";
import PaddleCheckout from "../v4/paddle-overlay";

interface PlanSelectorProps {
	open: boolean;
	currentPlanId?: string; // Now accepts plan names: "basic" | "pro" | "studio"
	currentInterval?: "monthly" | "annual";
	onOpenChange: (open: boolean) => void;
	type?: "upgrade" | "downgrade" | "all";
}

const getPlanOrder = (planName: string): number => {
	const planOrder = {
		basic: 0,
		pro: 1,
		studio: 2,
	};
	return planOrder[planName.toLowerCase() as keyof typeof planOrder] || 0;
};

const handlePaddleRedirect = (redirectUrl: string) => {
	// Open Paddle management URL in new window/tab
	window.open(redirectUrl, "_blank", "noopener,noreferrer");
};

export default function PlanSelector({
	open,
	onOpenChange,
	type = "all",
	currentPlanId = "pro", // Fallback only
	currentInterval = "monthly", // Fallback only
}: PlanSelectorProps) {
	// Get user data from Zustand store

	// const userStore = useUserStore();
	// const { refetchOrganizations } = useFetchOrganizations();

	// const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">(
	// 	() => {
	// 		const interval = userStore?.billing_interval?.toLowerCase() as
	// 			| "monthly"
	// 			| "annual"
	// 			| undefined;
	// 		return interval && (interval === "monthly" || interval === "annual")
	// 			? interval
	// 			: currentInterval;
	// 	},
	// );
	// const [selectedPlanName, setSelectedPlanName] = useState<string>("pro");
	// const [isLoading, setIsLoading] = useState(false);

	// // Check if user has subscription ID
	// const hasSubscriptionId = Boolean(
	// 	userStore?.paddle_subscription_id || userStore?.stripe_subscription_id,
	// );

	// // Get current plan from user store with fallback to props
	// const getCurrentPlan = () => {
	// 	// Priority: user store data > props > defaults
	// 	const planName =
	// 		userStore?.plan?.toLowerCase() || currentPlanId?.toLowerCase() || "basic";
	// 	const interval = userStore?.billing_interval?.toLowerCase() as
	// 		| "monthly"
	// 		| "annual"
	// 		| undefined;
	// 	const safeInterval =
	// 		interval && (interval === "monthly" || interval === "annual")
	// 			? interval
	// 			: currentInterval || "monthly";

	// 	const plan = pricingData.plans.find(
	// 		p => p.name.toLowerCase() === planName.toLowerCase(),
	// 	);

	// 	if (plan) {
	// 		return {
	// 			name: plan.name, // Keep original case from pricingData
	// 			interval: safeInterval,
	// 		};
	// 	}
	// 	return { name: "Basic", interval: "monthly" as const };
	// };

	// const currentPlan = getCurrentPlan();

	// // Update billing period when user data changes
	// useEffect(() => {
	// 	const interval = userStore?.billing_interval?.toLowerCase() as
	// 		| "monthly"
	// 		| "annual"
	// 		| undefined;
	// 	if (interval && (interval === "monthly" || interval === "annual")) {
	// 		setBillingPeriod(interval);
	// 	}
	// }, [userStore?.billing_interval]);

	// const getActionType = (
	// 	targetPlanName: string,
	// ): "upgrade" | "downgrade" | "same" => {
	// 	const currentOrder = getPlanOrder(currentPlan.name);
	// 	const targetOrder = getPlanOrder(targetPlanName);

	// 	if (targetOrder > currentOrder) return "upgrade";
	// 	if (targetOrder < currentOrder) return "downgrade";
	// 	return "same";
	// };

	// const getFilteredPlans = () => {
	// 	const currentOrder = getPlanOrder(currentPlan.name);
	// 	const currentPlanFromData = pricingData.plans.find(
	// 		p => p.name.toLowerCase() === currentPlan.name.toLowerCase(),
	// 	);

	// 	if (type === "upgrade") {
	// 		// Include current plan + higher tier plans
	// 		const higherTierPlans = pricingData.plans.filter(
	// 			plan => getPlanOrder(plan.name) > currentOrder,
	// 		);

	// 		// Always include current plan so users can switch billing intervals
	// 		const plansToShow = currentPlanFromData
	// 			? [currentPlanFromData, ...higherTierPlans]
	// 			: higherTierPlans;

	// 		// Remove duplicates by plan name (in case current plan is already in higher tier plans)
	// 		return plansToShow.filter(
	// 			(plan, index, self) =>
	// 				index ===
	// 				self.findIndex(p => p.name.toLowerCase() === plan.name.toLowerCase()),
	// 		);
	// 	} else if (type === "downgrade") {
	// 		// Include current plan + lower tier plans
	// 		const lowerTierPlans = pricingData.plans.filter(
	// 			plan => getPlanOrder(plan.name) < currentOrder,
	// 		);

	// 		// Always include current plan so users can switch billing intervals
	// 		const plansToShow = currentPlanFromData
	// 			? [currentPlanFromData, ...lowerTierPlans]
	// 			: lowerTierPlans;

	// 		// Remove duplicates by plan name
	// 		return plansToShow.filter(
	// 			(plan, index, self) =>
	// 				index ===
	// 				self.findIndex(p => p.name.toLowerCase() === plan.name.toLowerCase()),
	// 		);
	// 	}

	// 	return pricingData.plans;
	// };

	// const filteredPlans = getFilteredPlans();

	// const handlePlanChangeResponse = (response: PlanChangeResponse) => {
	// 	// Check if we need to redirect to Paddle management URLs
	// 	if (response.requires_payment_update && response.redirect_url) {
	// 		toast.info("Redirecting to update payment method...", {
	// 			description:
	// 				response.message || "Please complete the payment update to proceed.",
	// 		});

	// 		// Close the modal first
	// 		onOpenChange(false);

	// 		// Redirect after a short delay
	// 		setTimeout(() => {
	// 			handlePaddleRedirect(response.redirect_url!);
	// 		}, 1000);

	// 		return;
	// 	}

	// 	// Handle other management URLs if needed
	// 	if (response.management_urls?.update_payment_method) {
	// 		toast.info("Payment method update available", {
	// 			description: "A payment update may be required.",
	// 			action: {
	// 				label: "Update Payment",
	// 				onClick: () =>
	// 					handlePaddleRedirect(
	// 						response.management_urls!.update_payment_method!,
	// 					),
	// 			},
	// 		});
	// 	}

	// 	// Show success/error messages
	// 	if (response.success) {
	// 		toast.success(response.message || "Plan changed successfully");
	// 	} else {
	// 		toast.error(response.error || "Failed to change plan");
	// 	}

	// 	// Close modal on success
	// 	if (response.success) {
	// 		onOpenChange(false);
	// 	}
	// };

	// const handlePlanChange = async (planName: string) => {
	// 	const selectedPlan = filteredPlans.find(
	// 		p => p.name.toLowerCase() === planName.toLowerCase(),
	// 	);
	// 	if (!selectedPlan) return;

	// 	const isSamePlan =
	// 		planName.toLowerCase() === currentPlan.name.toLowerCase() &&
	// 		billingPeriod.toLowerCase() === currentPlan.interval.toLowerCase();
	// 	if (isSamePlan) return;

	// 	setIsLoading(true);

	// 	try {
	// 		// If user doesn't have subscription ID, close modal and trigger paddle checkout
	// 		if (!hasSubscriptionId) {
	// 			// Close the plan selector modal first
	// 			onOpenChange(false);

	// 			toast.info("Redirecting to payment...", {
	// 				description: `Setting up your ${planName} plan`,
	// 			});

	// 			setIsLoading(false);
	// 			return;
	// 		}

	// 		// User has subscription ID - use the normal plan change flow
	// 		// Dynamically pick productId based on billingPeriod state
	// 		const priceId = selectedPlan.price.productIds[billingPeriod];

	// 		const response = await changeSubscriptionPlan({
	// 			new_price_id: priceId,
	// 		});

	// 		// Handle the response which might include management URLs
	// 		handlePlanChangeResponse(response);

	// 		// Update Zustand user store on success (if no redirect required)
	// 		if (response.success && !response.requires_payment_update) {
	// 			useUserStore.getState().setUser({
	// 				plan: response.new_plan || planName.toLowerCase(),
	// 				billing_interval: billingPeriod,
	// 				current_price_id: priceId,
	// 				pending_plan_change: response.new_plan,
	// 				pending_plan_effective_date: response.effective_date
	// 					? new Date(response.effective_date)
	// 					: undefined,
	// 				subscription_status: "active",
	// 				has_active_subscription: true,
	// 			});

	// 			initializeFeatureLimits();
	// 			initializeFeatureFlags();
	// 			await refetchOrganizations();
	// 		}
	// 	} catch {
	// 		toast.error("Error changing plan");
	// 	} finally {
	// 		setIsLoading(false);
	// 	}
	// };

	// const getSavings = () => {
	// 	const selectedPlan = filteredPlans.find(
	// 		p => p.name.toLowerCase() === selectedPlanName.toLowerCase(),
	// 	);
	// 	if (!selectedPlan || selectedPlan.price.monthly === 0) return 0;

	// 	const monthlyTotal = selectedPlan.price.monthly * 12;
	// 	const annualPrice = selectedPlan.price.annual;
	// 	return Math.round(((monthlyTotal - annualPrice) / monthlyTotal) * 100);
	// };

	// const isCurrent = (planName: string) => {
	// 	return (
	// 		planName.toLowerCase() === currentPlan.name.toLowerCase() &&
	// 		billingPeriod.toLowerCase() === currentPlan.interval.toLowerCase()
	// 	);
	// };

	// const isCurrentPlanDifferentBilling = (planName: string) => {
	// 	return (
	// 		planName.toLowerCase() === currentPlan.name.toLowerCase() &&
	// 		billingPeriod.toLowerCase() !== currentPlan.interval.toLowerCase()
	// 	);
	// };

	// // Handle card selection - this updates both selected plan and features
	// const handleCardSelect = (planName: string) => {
	// 	setSelectedPlanName(planName);
	// };

	// const handleOpenChange = (newOpen: boolean) => {
	// 	if (!isLoading) {
	// 		onOpenChange(newOpen);
	// 	}
	// };

	// // Get selected plan details for features display
	// const getSelectedPlanDetails = () => {
	// 	return filteredPlans.find(
	// 		p => p.name.toLowerCase() === selectedPlanName.toLowerCase(),
	// 	);
	// };

	// // Set initial selected plan - Updated to handle card selection properly
	// useEffect(() => {
	// 	if (filteredPlans.length > 0) {
	// 		const currentPlanInFiltered = filteredPlans.find(
	// 			p => p.name.toLowerCase() === currentPlan.name.toLowerCase(),
	// 		);

	// 		if (currentPlanInFiltered) {
	// 			setSelectedPlanName(currentPlanInFiltered.name); // Keep original case
	// 		} else {
	// 			setSelectedPlanName(filteredPlans[0].name); // Keep original case
	// 		}
	// 	}
	// 	// eslint-disable-next-line react-hooks/exhaustive-deps
	// }, []);
	// // For plans without subscription ID, render Paddle button instead
	// const renderPlanButton = (
	// 	plan: any,
	// 	isCurrentPlan: boolean,
	// 	isCurrentPlanDiffBilling: boolean,
	// 	actionType: string,
	// ) => {
	// 	// If user doesn't have subscription ID and it's not the current plan, show Paddle checkout
	// 	if (hasSubscriptionId) {
	// 		const productId = plan.price.productIds[billingPeriod];

	// 		return (
	// 			<PaddleCheckout
	// 				locale="en"
	// 				theme="light"
	// 				displayMode="overlay"
	// 				environment={
	// 					process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT as
	// 						| "sandbox"
	// 						| "production"
	// 				}
	// 				productId={productId}
	// 			>
	// 				<Button
	// 					size="sm"
	// 					className={`ml-[-30px] h-8 text-xs font-semibold uppercase tracking-wide transition-all ${
	// 						actionType === "upgrade"
	// 							? "bg-black text-white shadow-sm hover:bg-gray-800"
	// 							: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
	// 					}`}
	// 				>
	// 					{actionType === "upgrade" ? "GET PLAN" : "SWITCH PLAN"}
	// 				</Button>
	// 			</PaddleCheckout>
	// 		);
	// 	}

	// 	// Regular button logic for users with subscription IDs
	// 	if (isCurrentPlan) {
	// 		return (
	// 			<div className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-blue-600">
	// 				ACTIVE
	// 			</div>
	// 		);
	// 	}

	// 	if (isCurrentPlanDiffBilling) {
	// 		return (
	// 			<Button
	// 				size="sm"
	// 				onClick={event => {
	// 					event.stopPropagation();
	// 					handlePlanChange(plan.name);
	// 				}}
	// 				disabled={isLoading}
	// 				className="h-8 bg-blue-600 px-4 text-xs font-semibold uppercase tracking-wide text-white transition-all hover:bg-blue-700 disabled:opacity-50"
	// 			>
	// 				{isLoading &&
	// 				selectedPlanName.toLowerCase() === plan.name.toLowerCase()
	// 					? "..."
	// 					: "SWITCH"}
	// 			</Button>
	// 		);
	// 	}

	// 	return (
	// 		<Button
	// 			size="sm"
	// 			onClick={event => {
	// 				event.stopPropagation();
	// 				handlePlanChange(plan.name);
	// 			}}
	// 			disabled={isLoading}
	// 			className={`h-8 px-4 text-xs font-semibold uppercase tracking-wide transition-all ${
	// 				actionType === "upgrade"
	// 					? "bg-black text-white shadow-sm hover:bg-gray-800"
	// 					: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
	// 			} disabled:opacity-50`}
	// 		>
	// 			{isLoading && selectedPlanName.toLowerCase() === plan.name.toLowerCase()
	// 				? "..."
	// 				: actionType === "upgrade"
	// 					? "UPGRADE"
	// 					: "DOWNGRADE"}
	// 		</Button>
	// 	);
	// };

	if (!open) return;

	// const selectedPlanDetails = getSelectedPlanDetails();

	return (
		// <Dialog open={open} onOpenChange={handleOpenChange}>
		// 	<DialogContent className="max-h-[85vh] max-w-4xl overflow-hidden border-0 bg-white p-0 shadow-2xl">
		// 		<div className="flex h-full flex-col lg:flex-row">
		// 			{/* Left side - Plan selection */}
		// 			<div className="flex max-h-[85vh] w-full flex-col p-4 lg:max-h-full lg:w-1/2 lg:p-6">
		// 				<DialogHeader className="mb-4 flex-shrink-0 space-y-1 text-left">
		// 					<DialogTitle className="text-lg font-medium text-black">
		// 						{type === "upgrade"
		// 							? "UPGRADE PLAN"
		// 							: type === "downgrade"
		// 								? "DOWNGRADE PLAN"
		// 								: "SELECT PLAN"}
		// 					</DialogTitle>
		// 					<DialogDescription className="text-sm text-gray-500">
		// 						{type === "upgrade"
		// 							? "Choose a higher tier plan or switch billing"
		// 							: type === "downgrade"
		// 								? "Select a lower tier plan or switch billing"
		// 								: "Simple and flexible per-user pricing"}
		// 					</DialogDescription>
		// 					{/* Show current plan info */}
		// 					<div className="mt-2 text-xs text-gray-400">
		// 						Current: {currentPlan.name} ({currentPlan.interval})
		// 						{!hasSubscriptionId && (
		// 							<span className="ml-2 text-orange-500">
		// 								• No active subscription
		// 							</span>
		// 						)}
		// 					</div>
		// 				</DialogHeader>

		// 				{/* Billing Period Tabs */}
		// 				<Tabs
		// 					value={billingPeriod}
		// 					onValueChange={value =>
		// 						setBillingPeriod(value as "monthly" | "annual")
		// 					}
		// 					className="mb-4 flex-shrink-0"
		// 				>
		// 					<TabsList className="grid h-9 w-full grid-cols-2 bg-gray-100 p-1">
		// 						<TabsTrigger
		// 							value="monthly"
		// 							className="text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm"
		// 						>
		// 							MONTHLY
		// 						</TabsTrigger>
		// 						<TabsTrigger
		// 							value="annual"
		// 							className="text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm"
		// 						>
		// 							ANNUAL {getSavings() > 0 && `(SAVE ${getSavings()}%)`}
		// 						</TabsTrigger>
		// 					</TabsList>

		// 					<TabsContent
		// 						value={billingPeriod}
		// 						className="mt-4 flex-1 overflow-y-hidden"
		// 					>
		// 						<div className="items- flex flex-col justify-between gap-2 space-y-3">
		// 							{filteredPlans.map(plan => {
		// 								const isSelected =
		// 									selectedPlanName.toLowerCase() ===
		// 									plan.name.toLowerCase();
		// 								const isCurrentPlan = isCurrent(plan.name.toLowerCase());
		// 								const isCurrentPlanDiffBilling =
		// 									isCurrentPlanDifferentBilling(plan.name.toLowerCase());
		// 								const price =
		// 									billingPeriod === "monthly"
		// 										? plan.price.monthly
		// 										: plan.price.annual;
		// 								const actionType = getActionType(plan.name.toLowerCase());

		// 								return (
		// 									<div
		// 										key={plan.name.toLowerCase()}
		// 										onClick={() => handleCardSelect(plan.name)}
		// 										className={`relative cursor-pointer rounded-lg border p-4 transition-all ${
		// 											isCurrentPlan
		// 												? "border-blue-300 bg-blue-50"
		// 												: isCurrentPlanDiffBilling
		// 													? "bg-blue-25 border-blue-200 hover:border-blue-300"
		// 													: isSelected
		// 														? "border-black bg-gray-50 ring-1 ring-black/20"
		// 														: "border-gray-200 hover:border-gray-300"
		// 										}`}
		// 									>
		// 										{plan.popular &&
		// 											!isCurrentPlan &&
		// 											!isCurrentPlanDiffBilling && (
		// 												<Badge className="absolute -top-2 right-1 bg-black px-2 py-0.5 text-xs text-white hover:bg-black">
		// 													POPULAR
		// 												</Badge>
		// 											)}

		// 										<div className="grid w-full grid-cols-5 items-center gap-3">
		// 											<div className="col-span-4">
		// 												<div className="mb-1 flex flex-wrap items-center gap-2">
		// 													<h4 className="text-sm font-semibold uppercase tracking-wide text-black">
		// 														{plan.name}
		// 													</h4>
		// 													{isCurrentPlan && (
		// 														<Badge className="bg-blue-600 px-2 py-0.5 text-xs text-white hover:bg-blue-600">
		// 															CURRENT
		// 														</Badge>
		// 													)}
		// 													{isCurrentPlanDiffBilling && (
		// 														<Badge className="bg-blue-100 px-2 py-0.5 text-xs text-blue-700 hover:bg-blue-100">
		// 															SWITCH BILLING
		// 														</Badge>
		// 													)}
		// 												</div>
		// 												<div className="mb-1 flex items-baseline">
		// 													<span className="text-xl font-light text-black">
		// 														${price.toFixed(2)}
		// 													</span>
		// 													<span className="ml-1 text-xs uppercase tracking-wide text-gray-500">
		// 														/{billingPeriod === "monthly" ? "MO" : "YR"}
		// 													</span>
		// 												</div>
		// 												<p className="line-clamp-2 text-xs text-gray-600">
		// 													{plan.badge}
		// 												</p>
		// 												{isCurrentPlanDiffBilling && (
		// 													<p className="mt-1 text-xs text-blue-600">
		// 														Switch to {billingPeriod} billing
		// 													</p>
		// 												)}
		// 											</div>

		// 											<div className="col-span-1 flex justify-end">
		// 												{renderPlanButton(
		// 													plan,
		// 													isCurrentPlan,
		// 													isCurrentPlanDiffBilling,
		// 													actionType,
		// 												)}
		// 											</div>
		// 										</div>
		// 									</div>
		// 								);
		// 							})}

		// 							{/* Compare Plans Link */}
		// 							<div className="w-full flex-shrink-0 items-start justify-end text-left">
		// 								<Link
		// 									href="/pricing"
		// 									className="text-xs uppercase tracking-wide text-gray-500 transition-colors hover:text-black"
		// 								>
		// 									COMPARE PRICING →
		// 								</Link>
		// 							</div>
		// 						</div>
		// 					</TabsContent>
		// 				</Tabs>

		// 				{/* No Subscription ID Warning */}
		// 				{!hasSubscriptionId && (
		// 					<div className="mb-3 flex-shrink-0 rounded-lg border border-blue-200 bg-blue-50 p-3">
		// 						<div className="flex items-start gap-2">
		// 							<div className="mt-0.5 h-4 w-4 flex-shrink-0 rounded-full bg-blue-500" />
		// 							<div>
		// 								<p className="text-xs font-medium uppercase tracking-wide text-blue-800">
		// 									NEW SUBSCRIPTION
		// 								</p>
		// 								<p className="mt-1 text-xs text-blue-700">
		// 									You&apos;ll be redirected to complete your payment and
		// 									activate your subscription.
		// 								</p>
		// 							</div>
		// 						</div>
		// 					</div>
		// 				)}
		// 			</div>

		// 			{/* Right side - Features display */}
		// 			<div className="flex max-h-[40vh] w-full flex-col items-start justify-between overflow-y-auto border-t border-gray-100 bg-gray-50 p-4 lg:max-h-full lg:w-1/2 lg:border-l lg:border-t-0 lg:p-6">
		// 				{selectedPlanDetails && (
		// 					<div className="flex w-full flex-col items-start justify-start gap-2">
		// 						<div className="mb-6">
		// 							<div className="mb-3 flex flex-wrap items-center gap-2">
		// 								<h3 className="text-lg font-semibold text-black">
		// 									{selectedPlanDetails.name} Plan
		// 								</h3>
		// 								{selectedPlanDetails.popular && (
		// 									<Badge className="bg-black px-2 py-0.5 text-xs text-white hover:bg-black">
		// 										POPULAR
		// 									</Badge>
		// 								)}
		// 							</div>
		// 							<p className="text-sm text-gray-600">
		// 								{selectedPlanDetails.badge}
		// 							</p>
		// 						</div>

		// 						<div className="mb-6">
		// 							<h4 className="mb-4 text-sm font-medium uppercase tracking-wide text-gray-800">
		// 								What&apos;s Included
		// 							</h4>
		// 							<div className="space-y-3">
		// 								{selectedPlanDetails.features.map((feature, index) => (
		// 									<div key={index} className="flex items-start gap-3">
		// 										<div className="mt-0.5 flex-shrink-0">
		// 											<Check className="h-4 w-4 text-green-600" />
		// 										</div>
		// 										<span className="text-sm text-gray-700">
		// 											{feature.name}
		// 										</span>
		// 									</div>
		// 								))}
		// 							</div>
		// 						</div>

		// 						{/* Plan comparison hint */}
		// 						{selectedPlanName.toLowerCase() !==
		// 							currentPlan.name.toLowerCase() && (
		// 							<div className="w-full rounded-lg border border-gray-200 bg-white p-4">
		// 								<h5 className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-800">
		// 									{getActionType(selectedPlanName) === "upgrade"
		// 										? "Upgrading From"
		// 										: "Downgrading From"}
		// 								</h5>
		// 								<p className="mb-3 text-sm text-gray-600">
		// 									{currentPlan.name} ({currentPlan.interval})
		// 								</p>
		// 								{getActionType(selectedPlanName) === "upgrade" && (
		// 									<p className="rounded bg-green-50 p-2 text-xs text-green-700">
		// 										✓ You&apos;ll gain access to all{" "}
		// 										{selectedPlanDetails.name} features
		// 									</p>
		// 								)}
		// 								{getActionType(selectedPlanName) === "downgrade" && (
		// 									<p className="rounded bg-orange-50 p-2 text-xs text-orange-700">
		// 										Downgrading will limit your access to premium features
		// 										and may affect existing usage.
		// 									</p>
		// 								)}
		// 							</div>
		// 						)}
		// 					</div>
		// 				)}
		// 			</div>
		// 		</div>
		// 	</DialogContent>
		// </Dialog>
		<>d</>
	);
}
