"use client";

import { ArrowDown, Check, Crown, RefreshCw, Star, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import { type Key, useEffect, useState } from "react";

// eslint-disable-next-line import/no-unresolved
import { Button } from "@/components/ui/button";
// eslint-disable-next-line import/no-unresolved
import { Card, CardContent } from "@/components/ui/card";
// eslint-disable-next-line import/no-unresolved
import { cn } from "@/lib/utils";
import useAuthModalStore from "@/zustand/auth/use-auth-modal";
import usePlanSelectorStore from "@/zustand/use-plan-selector-store";
import useUserStore from "@/zustand/useuser-store";

import { pricingData } from "./pricing/data";
import PaddleCheckout from "./pricing/v4/paddle-overlay";

const calculateDiscount = (oldPrice: number, newPrice: number): number => {
	const discount = ((oldPrice - newPrice) / oldPrice) * 100;
	return Math.round(discount);
};

interface PlanFeature {
	name: string;
	available: boolean;
}

interface Plan {
	name: string;
	badge: string;
	popular: boolean;
	buttonText: string;
	features: (string | PlanFeature)[];
	price: {
		monthly: number;
		annual: number;
		previous?: {
			monthly?: number;
			annual?: number;
		};
		productIds: {
			monthly: string;
			annual: string;
		};
	};
	lifetime?: {
		endsIn: number;
		productId: string;
	};
}

type PlanType = "free" | "pro" | "studio" | "basic";
type BillingInterval = "monthly" | "annual";

const isFreePlan = (planName: string): boolean => {
	const normalizedName = planName.toLowerCase().trim();
	return (
		normalizedName === "free" ||
		normalizedName === "basic" ||
		normalizedName === "starter"
	);
};

const calculateMonthlyPrice = (annualPrice: number): number => {
	return Math.round((annualPrice / 12) * 100) / 100;
};

const formatPrice = (price: number): { dollars: string; cents: string } => {
	const priceString = price.toFixed(2);
	const [dollars, cents] = priceString.split(".");
	return { dollars, cents };
};

const getPlanTier = (planName: string): number => {
	const planMap: Record<string, number> = {
		free: 0,
		basic: 0,
		starter: 0,
		pro: 1,
		studio: 2,
	};
	return planMap[planName.toLowerCase().trim()] ?? -1;
};

const normalizePlanName = (planName: string): string => {
	const normalized = planName.toLowerCase().trim();
	// Handle plan name variations
	if (normalized === "basic" || normalized === "starter") {
		return "free";
	}
	return normalized;
};

const normalizeBillingInterval = (
	interval: string | undefined,
): BillingInterval => {
	if (!interval) return "monthly";
	const normalized = interval.toLowerCase().trim();
	return normalized === "annual" || normalized === "yearly"
		? "annual"
		: "monthly";
};

// Enhanced relationship detection that considers both plan and billing interval
const getPlanRelationship = (
	currentPlan: PlanType,
	currentBillingInterval: BillingInterval,
	targetPlan: string,
	targetBillingInterval: BillingInterval,
): "current" | "upgrade" | "downgrade" | "switch-interval" => {
	const currentTier = getPlanTier(currentPlan);
	const targetTier = getPlanTier(targetPlan);

	const normalizedCurrentPlan = normalizePlanName(currentPlan);
	const normalizedTargetPlan = normalizePlanName(targetPlan);

	// Same plan and same billing interval = current
	if (
		normalizedCurrentPlan === normalizedTargetPlan &&
		currentBillingInterval === targetBillingInterval
	) {
		return "current";
	}

	// Same plan but different billing interval = switch interval
	if (
		normalizedCurrentPlan === normalizedTargetPlan &&
		currentBillingInterval !== targetBillingInterval
	) {
		return "switch-interval";
	}

	// Different plans
	if (currentTier < targetTier) return "upgrade";
	if (currentTier > targetTier) return "downgrade";

	return "upgrade"; // fallback
};

const getButtonTextAndVariant = (
	plan: Plan,
	userPlanType: PlanType,
	userBillingInterval: BillingInterval,
	currentBillingCycle: BillingInterval,
	relationship:
		| "current"
		| "upgrade"
		| "downgrade"
		| "switch-interval"
		| "unauthenticated",
	hasActiveSubscription: boolean,
	hasSubscriptionId: boolean,
	isAuthenticated: boolean,
): {
	text: string;
	variant: "default" | "outline" | "destructive";
	disabled: boolean;
	icon?: React.ReactNode;
} => {
	const isFree = isFreePlan(plan.name);

	// If user is not authenticated
	if (!isAuthenticated) {
		return {
			text: plan.buttonText,
			variant: "default",
			disabled: false,
		};
	}

	switch (relationship) {
		case "current": {
			return {
				text: "Current Plan",
				variant: "outline",
				disabled: true,
				icon: <Check className="mr-2 h-4 w-4" />,
			};
		}

		case "switch-interval": {
			const intervalText =
				currentBillingCycle === "annual" ? "Yearly" : "Monthly";
			return {
				text: `Switch to ${intervalText}`,
				variant: "outline",
				disabled: false,
				icon: <RefreshCw className="mr-2 h-4 w-4" />,
			};
		}

		case "upgrade": {
			// For free plans, check if user has subscription_id
			if (isFree) {
				return hasSubscriptionId
					? {
							// User has subscription, treat like downgrade to free
							text: `Downgrade to ${plan.name}`,
							variant: "outline",
							disabled: false,
							icon: <ArrowDown className="mr-2 h-4 w-4" />,
						}
					: {
							// No subscription, use paddle checkout
							text: plan.buttonText,
							variant: "outline",
							disabled: false,
						};
			}

			// If user has subscription ID, show upgrade text
			if (hasSubscriptionId) {
				return {
					text: `Upgrade to ${plan.name}`,
					variant: "default",
					disabled: false,
					icon:
						plan.name === "Studio" ? (
							<Crown className="mr-2 h-4 w-4" />
						) : (
							<Users className="mr-2 h-4 w-4" />
						),
				};
			}

			// Authenticated but no subscription ID - use paddle checkout
			return {
				text: plan.buttonText,
				variant: "default",
				disabled: false,
			};
		}

		case "downgrade": {
			// If user has subscription ID, show downgrade text
			if (hasSubscriptionId) {
				return {
					text: `Downgrade to ${plan.name}`,
					variant: "outline",
					disabled: false,
					icon: <ArrowDown className="mr-2 h-4 w-4" />,
				};
			}

			// Authenticated but no subscription ID - use paddle checkout
			return {
				text: plan.buttonText,
				variant: "outline",
				disabled: false,
			};
		}

		default: {
			return {
				text: plan.buttonText,
				variant: "default",
				disabled: false,
			};
		}
	}
};

const getTooltipMessage = (
	relationship: "current" | "upgrade" | "downgrade" | "switch-interval",
	planName: string,
	billingInterval: BillingInterval,
	isFree: boolean,
	hasSubscriptionId: boolean,
	isAuthenticated: boolean,
): string => {
	if (!isAuthenticated) {
		return `Sign up to get started with ${planName}`;
	}

	switch (relationship) {
		case "current": {
			const intervalText = billingInterval === "annual" ? "yearly" : "monthly";
			return `You are currently on the ${planName} plan (${intervalText}).`;
		}

		case "switch-interval": {
			const intervalText = billingInterval === "annual" ? "yearly" : "monthly";
			return `Switch to ${intervalText} billing for the same ${planName} plan.`;
		}

		case "downgrade": {
			if (hasSubscriptionId) {
				return `Downgrade to ${planName} plan. Your current features will be limited.`;
			}
			return `Switch to ${planName} plan to change your features.`;
		}

		case "upgrade": {
			if (isFree) {
				if (hasSubscriptionId) {
					return `Downgrade to ${planName} plan. Your subscription will be cancelled.`;
				}
				return "Free plan is always available. Sign up to get started!";
			}
			if (hasSubscriptionId) {
				return `Upgrade to ${planName} to unlock additional features and capabilities.`;
			}
			return `Get ${planName} to unlock additional features and capabilities.`;
		}

		default: {
			return "";
		}
	}
};

export default function PricingSection() {
	// const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
	// 	"annual",
	// );
	// const userStore = useUserStore();
	// const { open: openPlanSelector } = usePlanSelectorStore();
	// const { openModal } = useAuthModalStore();
	// const { status } = useSession();

	// // Normalize and validate user plan type and billing interval
	// const userPlanType = userStore?.plan?.toLowerCase().trim() as
	// 	| PlanType
	// 	| undefined;

	// const userBillingInterval = normalizeBillingInterval(
	// 	userStore?.billing_interval,
	// );

	// const [timeLeft, setTimeLeft] = useState<{ [key: string]: number }>({});

	// // Check if user is authenticated
	// const isAuthenticated = Boolean(
	// 	userStore?.email && status === "authenticated",
	// );

	// // Check if user has active subscription (Paddle or Stripe)
	// const hasActiveSubscription = Boolean(
	// 	userStore?.paddle_subscription_id ||
	// 		userStore?.stripe_subscription_id ||
	// 		userStore?.has_active_subscription ||
	// 		userStore?.subscription_status === "active",
	// );

	// // Check if user has subscription ID (either Paddle or Stripe)
	// const hasSubscriptionId = Boolean(
	// 	userStore?.paddle_subscription_id || userStore?.stripe_subscription_id,
	// );

	// // Sort plans to ensure popular plan is in the middle
	// const sortedPlans: Plan[] = [...pricingData.plans].sort((planA, planB) => {
	// 	// Free plan first
	// 	if (isFreePlan(planA.name)) return -1;
	// 	if (isFreePlan(planB.name)) return 1;
	// 	// Popular plan in the middle (second position)
	// 	if (planA.popular && !planB.popular) return 0;
	// 	if (!planA.popular && planB.popular) return 1;
	// 	return 0;
	// });

	// useEffect(() => {
	// 	const timers = new Map<string, NodeJS.Timeout>();

	// 	pricingData.plans.forEach((plan: Plan) => {
	// 		if (plan.lifetime?.endsIn) {
	// 			setTimeLeft(previousTimeLeft => ({
	// 				...previousTimeLeft,
	// 				[plan.name]: plan.lifetime!.endsIn * 60 * 60,
	// 			}));

	// 			const timerId = setInterval(() => {
	// 				setTimeLeft(previousTimeLeft => ({
	// 					...previousTimeLeft,
	// 					[plan.name]: Math.max(0, (previousTimeLeft[plan.name] || 0) - 1),
	// 				}));
	// 			}, 1000);

	// 			timers.set(plan.name, timerId);
	// 		}
	// 	});

	// 	return () => {
	// 		timers.forEach(timerId => clearInterval(timerId));
	// 	};
	// }, []);

	// const getProductId = (plan: Plan): string => {
	// 	if (plan.name === "Lifetime Deal" && plan.lifetime) {
	// 		return plan.lifetime.productId;
	// 	}
	// 	return plan.price.productIds[billingCycle];
	// };

	// const handlePlanAction = (
	// 	plan: Plan,
	// 	relationship: "current" | "upgrade" | "downgrade" | "switch-interval",
	// ) => {
	// 	const isFree = isFreePlan(plan.name);

	// 	if (!isAuthenticated) {
	// 		openModal("signup");
	// 	}

	// 	// Don't do anything for current plan
	// 	if (relationship === "current") {
	// 		return;
	// 	}

	// 	// If user has subscription ID, use plan selector for upgrades/downgrades/switches
	// 	// This now includes free plans when user has subscription_id
	// 	if (hasSubscriptionId && userStore?.plan && isAuthenticated) {
	// 		const currentBillingInterval = userBillingInterval;

	// 		switch (relationship) {
	// 			case "upgrade": {
	// 				// For free plans with subscription_id, this is actually a downgrade
	// 				if (isFree) {
	// 					openPlanSelector(
	// 						"downgrade",
	// 						userStore.plan.toLowerCase(),
	// 						currentBillingInterval,
	// 					);
	// 				} else {
	// 					openPlanSelector(
	// 						"upgrade",
	// 						userStore.plan.toLowerCase(),
	// 						currentBillingInterval,
	// 					);
	// 				}
	// 				break;
	// 			}
	// 			case "downgrade": {
	// 				openPlanSelector(
	// 					"downgrade",
	// 					userStore.plan.toLowerCase(),
	// 					currentBillingInterval,
	// 				);
	// 				break;
	// 			}
	// 			case "switch-interval": {
	// 				openPlanSelector(
	// 					"switch-interval" as any, // Type assertion if needed
	// 					userStore.plan.toLowerCase(),
	// 					billingCycle, // Target billing cycle
	// 				);
	// 				break;
	// 			}
	// 			// No default
	// 		}
	// 		return;
	// 	}

	// 	// For authenticated users without subscription IDs, or unauthenticated users
	// 	// Use Paddle checkout (handled by PaddleCheckout component)
	// };

	return (
		<section className="mb-[100px] w-full py-10">
			<div className="container mx-auto w-full px-2 lg:px-24">
				{/* Header */}
				<div className="mb-8 text-center">
					<div className="mb-4">
						<span className="text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
							PRICING
						</span>
					</div>
					<h2 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 dark:text-white md:text-5xl">
						{pricingData.title}
					</h2>
				</div>
			</div>
		</section>
	);
}

// {/* Billing Toggle */}
// <div className="mb-16 flex justify-center">
// 	<div className="relative inline-flex items-center rounded-full border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-900">
// 		<button
// 			onClick={() => setBillingCycle("monthly")}
// 			className={cn(
// 				"relative rounded-full px-6 py-2 text-sm font-medium transition-all duration-200",
// 				billingCycle === "monthly"
// 					? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
// 					: "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white",
// 			)}
// 		>
// 			Monthly
// 		</button>
// 		<button
// 			onClick={() => setBillingCycle("annual")}
// 			className={cn(
// 				"relative flex items-center gap-2 rounded-full px-6 py-2 text-sm font-medium transition-all duration-200",
// 				billingCycle === "annual"
// 					? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
// 					: "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white",
// 			)}
// 		>
// 			Yearly
// 		</button>
// 	</div>
// </div>

// {/* Pricing Cards */}
// <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
// 	{sortedPlans.map((plan: Plan, index: number) => {
// 		const isPro = plan.popular;
// 		const productId = getProductId(plan);
// 		const isFree = isFreePlan(plan.name);
// 		const currentPrice =
// 			billingCycle === "monthly"
// 				? plan.price.monthly
// 				: plan.price.annual;
// 		const previousPrice = plan.price.previous?.[billingCycle];
// 		const displayPrice =
// 			billingCycle === "annual" && !isFree
// 				? calculateMonthlyPrice(currentPrice)
// 				: currentPrice;
// 		const billedPrice =
// 			billingCycle === "annual" && !isFree ? currentPrice : 0;
// 		const { dollars, cents } = formatPrice(isFree ? 0 : displayPrice);

// 		// Enhanced relationship detection considering billing interval
// 		const relationship = userPlanType
// 			? getPlanRelationship(
// 					userPlanType,
// 					userBillingInterval,
// 					plan.name.toLowerCase(),
// 					billingCycle,
// 				)
// 			: "upgrade";

// 		// Get button configuration based on relationship
// 		const buttonConfig = getButtonTextAndVariant(
// 			plan,
// 			userPlanType || "basic",
// 			userBillingInterval,
// 			billingCycle,
// 			isAuthenticated ? relationship : "unauthenticated",
// 			hasActiveSubscription,
// 			hasSubscriptionId,
// 			isAuthenticated,
// 		);

// 		// Get tooltip message
// 		const tooltipMessage = getTooltipMessage(
// 			relationship,
// 			plan.name,
// 			billingCycle,
// 			isFree,
// 			hasSubscriptionId,
// 			isAuthenticated,
// 		);

// 		// FIXED: Determine if we should use plan selector vs paddle checkout
// 		// Now includes free plans when user has subscription_id
// 		const shouldUsePlanSelector =
// 			isAuthenticated &&
// 			hasSubscriptionId &&
// 			relationship !== "current";

// 		// Enhanced current plan badge logic
// 		const isCurrentPlanAndInterval =
// 			relationship === "current" &&
// 			isAuthenticated &&
// 			userPlanType &&
// 			normalizePlanName(userPlanType) ===
// 				normalizePlanName(plan.name) &&
// 			userBillingInterval === billingCycle;

// 		return (
// 			<Card
// 				key={plan.name}
// 				className={cn(
// 					"relative border-0 border-none bg-transparent shadow-none transition-all duration-300",
// 					isPro && "lg:scale-105",
// 				)}
// 			>
// 				{/* Popular Badge */}
// 				{isPro && (
// 					<div className="absolute -top-4 left-1/2 z-10 -translate-x-1/2 transform">
// 						<div className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black">
// 							<Star className="h-4 w-4 fill-current" />
// 							Most Popular
// 						</div>
// 					</div>
// 				)}

// 				<CardContent
// 					className={cn(
// 						"rounded-2xl border p-8 transition-all duration-300",
// 						isPro
// 							? "border-black bg-gray-50 shadow-lg dark:border-white dark:bg-gray-900"
// 							: "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-800 dark:bg-black dark:hover:border-gray-700",
// 					)}
// 				>
// 					{/* Plan Header */}
// 					<div className="mb-4">
// 						<div className="mb-3 flex items-center gap-3">
// 							<h3 className="text-2xl font-medium text-black dark:text-white">
// 								{plan.name === "Basic" ? "Starter" : plan.name}
// 							</h3>
// 							{previousPrice && (
// 								<span className="rounded-full bg-gray-200 px-2 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
// 									Save {calculateDiscount(previousPrice, currentPrice)}%
// 								</span>
// 							)}
// 							{isCurrentPlanAndInterval && (
// 								<span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
// 									Current
// 								</span>
// 							)}
// 							{relationship === "switch-interval" &&
// 								isAuthenticated && (
// 									<span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
// 										Switch Billing
// 									</span>
// 								)}
// 						</div>
// 						<p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
// 							{plan.badge}
// 						</p>
// 					</div>

// 					{/* Pricing */}
// 					<div className="mb-5">
// 						<div className="mb-2 flex items-baseline gap-2">
// 							<div className="flex items-baseline">
// 								<span className="text-5xl font-light text-black dark:text-white">
// 									${dollars}
// 								</span>
// 								<span className="text-2xl font-light text-gray-600 dark:text-gray-400">
// 									.{cents}
// 								</span>
// 							</div>
// 							{previousPrice && (
// 								<span className="text-xl font-light text-gray-400 line-through dark:text-gray-600">
// 									${previousPrice.toFixed(2)}
// 								</span>
// 							)}
// 							<span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
// 								/month
// 							</span>
// 						</div>

// 						{billedPrice > 0 && (
// 							<p className="text-sm text-gray-500 dark:text-gray-400">
// 								Billed as ${billedPrice.toFixed(2)}/year
// 							</p>
// 						)}

// 						{billingCycle === "annual" && !isFree && (
// 							<p className="text-sm font-medium text-green-600 dark:text-green-400">
// 								Save $
// 								{(
// 									((plan.price.monthly * 12 - currentPrice) * 100) /
// 									100
// 								).toFixed(2)}{" "}
// 								with yearly pricing
// 							</p>
// 						)}

// 						<p className="text-sm text-gray-500 dark:text-gray-400">
// 							{isFree ? "Forever free" : "Taxes calculated at checkout"}
// 						</p>
// 					</div>

// 					{/* CTA Button */}
// 					{shouldUsePlanSelector ? (
// 						// <PaddleCheckout
// 						// 	locale="en"
// 						// 	theme="light"
// 						// 	displayMode="overlay"
// 						// 	environment={
// 						// 		process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT as
// 						// 			| "sandbox"
// 						// 			| "production"
// 						// 	}
// 						// 	productId={productId}
// 						// 	tooltipMessage={tooltipMessage}
// 						// 	forceDisabled={buttonConfig.disabled}
// 						// 	disabledReason={
// 						// 		relationship === "current" ? "current-plan" : undefined
// 						// 	}
// 						// >
// 						// 	<Button
// 						// 		variant={buttonConfig.variant}
// 						// 		className={cn(
// 						// 			"mb-8 w-full py-3",
// 						// 			buttonConfig.variant === "outline"
// 						// 				? "border-gray-300 bg-transparent text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-900"
// 						// 				: "",
// 						// 		)}
// 						// 		disabled={buttonConfig.disabled}
// 						// 	>
// 						// 		{buttonConfig.icon}
// 						// 		{buttonConfig.text}
// 						// 	</Button>
// 						// </PaddleCheckout>
// 						<>d</>
// 					) : (
// 						<>
// 							{isAuthenticated ? (
// 								<PaddleCheckout
// 									locale="en"
// 									theme="light"
// 									displayMode="overlay"
// 									environment={
// 										process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT as
// 											| "sandbox"
// 											| "production"
// 									}
// 									productId={productId}
// 									tooltipMessage={tooltipMessage}
// 									forceDisabled={buttonConfig.disabled}
// 									disabledReason={
// 										relationship === "current"
// 											? "current-plan"
// 											: undefined
// 									}
// 								>
// 									<Button
// 										variant={buttonConfig.variant}
// 										className={cn(
// 											"mb-8 w-full py-3",
// 											buttonConfig.variant === "outline"
// 												? "border-gray-300 bg-transparent text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-900"
// 												: "",
// 										)}
// 										disabled={buttonConfig.disabled}
// 									>
// 										{buttonConfig.icon}
// 										{buttonConfig.text}
// 									</Button>
// 								</PaddleCheckout>
// 							) : (
// 								<Button
// 									variant={buttonConfig.variant}
// 									className={cn(
// 										"mb-8 w-full py-3",
// 										buttonConfig.variant === "outline"
// 											? "border-gray-300 bg-transparent text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-900"
// 											: "",
// 									)}
// 									onClick={() => handlePlanAction(plan, relationship)}
// 								>
// 									{buttonConfig.icon}
// 									{buttonConfig.text}
// 								</Button>
// 							)}
// 						</>
// 					)}

// 					{/* Features */}
// 					<div className="-mt-2 space-y-4">
// 						{plan.features.map(
// 							(feature: string | PlanFeature, featureIndex: Key) => {
// 								const featureName =
// 									typeof feature === "string" ? feature : feature.name;
// 								const isAvailable =
// 									typeof feature === "string"
// 										? true
// 										: feature.available;

// 								if (!isAvailable) return;

// 								return (
// 									<div
// 										key={featureIndex}
// 										className="flex items-start gap-3"
// 									>
// 										<div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-black dark:bg-white">
// 											<Check className="h-3 w-3 text-white dark:text-black" />
// 										</div>
// 										<span className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
// 											{featureName}
// 										</span>
// 									</div>
// 								);
// 							},
// 						)}
// 					</div>
// 				</CardContent>
// 			</Card>
// 		);
// 	})}
// </div>
