/* eslint-disable import/named */
"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreditBalance } from "@/hooks/plans/use-credit-balance";

import { ComparisonTable } from "../../pricing/v5/comparsion-table";
import { PlanCard } from "../../pricing/v5/plan-card";
import {
	CREDIT_EXPLANATIONS,
	CreditExplanation,
	PlanData,
	PRICING_DATA,
	PricingSectionProps,
	PricingView,
	RefillPack,
} from "../../pricing/v5/pricing-data";
import { RefillPackCard } from "../../pricing/v5/refill-pack-card";
import { determineIfPlanIsActive } from "../../pricing/v5/utlis";

// ============================================
// MAIN COMPONENT
// ============================================
export default function PricingSection({
	tables = true,
}: PricingSectionProps): JSX.Element {
	const { status } = useSession();
	const isAuthenticated = status === "authenticated";
	const [view, setView] = useState<PricingView>("one-time");

	const {
		credits,
		userPlan,
		billingType,
		lifetimeCredits,
		hasActiveSubscription,
	} = useCreditBalance({
		syncWithStore: true,
		refetchInterval: 5 * 60 * 1000,
		showNotifications: false,
	});

	useEffect(() => {
		if (isAuthenticated) {
			if (billingType === "subscription" && hasActiveSubscription) {
				setView("subscription");
			} else if (billingType === "credits") {
				setView("one-time");
			}
		}
	}, [billingType, hasActiveSubscription, isAuthenticated]);

	const currentPlans: PlanData[] =
		view === "subscription"
			? PRICING_DATA.subscriptionPlans
			: PRICING_DATA.unlockPacks;
	const isRefillView: boolean = view === "refill";

	function handleViewChange(newView: string): void {
		setView(newView as PricingView);
	}

	function getViewTitle(): string {
		if (isRefillView) {
			return "Refill Packs";
		}
		return view === "one-time" ? "Unlock Packs" : "Subscription Plans";
	}

	function getViewDescription(): string {
		if (isRefillView) {
			return "Top up credits anytime with volume discounts";
		}
		return view === "one-time"
			? "Get permanent access to premium features + bonus credits"
			: "Monthly plans with recurring credits and features";
	}

	const currentStatusText = (): string => {
		if (hasActiveSubscription) {
			return `Active ${userPlan} subscription • ${credits.toLocaleString()} credits available`;
		}
		if (billingType === "credits") {
			return `${userPlan} plan • ${credits.toLocaleString()} credits • ${lifetimeCredits.toLocaleString()} lifetime credits`;
		}
		return `${credits.toLocaleString()} credits available`;
	};

	return (
		<div className="min-h-screen bg-white">
			<header className="flex items-center justify-center border-b border-gray-200 px-6 py-16 md:px-24">
				<div className="flex w-full max-w-[720px] flex-col items-center gap-5 px-6 py-5">
					<h1 className="text-center text-4xl font-bold leading-tight tracking-tight text-gray-900 md:text-6xl md:leading-[72px]">
						Fair & Predictable Pricing
					</h1>
					<p className="text-center text-base font-normal leading-7 text-gray-600 md:text-lg">
						Buy once, control your budget. No subscriptions. No surprises.
						<br />
						Credits never expire—use them at your own pace.
					</p>
					{isAuthenticated && userPlan && userPlan !== "basic" && (
						<Badge
							variant="secondary"
							className="mt-2 bg-blue-50 text-blue-700 hover:bg-blue-100"
						>
							{currentStatusText()}
						</Badge>
					)}
				</div>
			</header>

			<div className="border-b border-gray-200 bg-gray-50 py-10 md:px-16">
				<div className="mx-auto flex w-full flex-col gap-12 lg:max-w-[1100px]">
					<h2 className="text-center text-3xl font-bold text-black">
						How Credits Work
					</h2>
					<div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
						{CREDIT_EXPLANATIONS.map((card: CreditExplanation) => {
							const IconComponent = card.icon;
							return (
								<div
									key={card.title}
									className="flex flex-col items-center gap-5 text-center"
								>
									<div className="flex h-24 w-24 items-center justify-center rounded-3xl border-2 border-gray-200 bg-white shadow-sm">
										<IconComponent
											className="h-12 w-12 text-black"
											strokeWidth={1.5}
										/>
									</div>
									<div className="flex flex-col gap-2">
										<p className="text-lg font-semibold text-black">
											{card.title}
										</p>
										<p className="text-sm text-gray-600">{card.subtitle}</p>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</div>

			<div
				id={"pricing"}
				className="border-b border-gray-200 bg-white py-16 lg:px-6"
			>
				<div className="mx-auto flex w-full max-w-[1400px] flex-col gap-12">
					<div className="flex flex-col items-center gap-6">
						<div className="text-center">
							<h2 className="mb-3 text-3xl font-bold text-black">
								{getViewTitle()}
							</h2>
							<p className="text-base text-gray-600">{getViewDescription()}</p>
						</div>

						<Tabs
							value={view}
							className="w-auto"
							onValueChange={handleViewChange}
						>
							<TabsList className="bg-gray-100">
								<TabsTrigger
									value="one-time"
									className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
								>
									One-Time
								</TabsTrigger>
								<TabsTrigger
									value="subscription"
									className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
								>
									Subscription
								</TabsTrigger>
								<TabsTrigger
									value="refill"
									className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
								>
									Refill Packs
								</TabsTrigger>
							</TabsList>
						</Tabs>
					</div>

					<div className="grid gap-8 lg:grid-cols-3">
						{isRefillView
							? PRICING_DATA.refillPacks.map((pack: RefillPack) => (
									<RefillPackCard pack={pack} key={pack.id} />
								))
							: currentPlans.map((plan: PlanData) => {
									const isActive = determineIfPlanIsActive(
										plan.id,
										userPlan,
										billingType,
										hasActiveSubscription,
										view === "subscription",
									);
									return (
										<PlanCard
											key={plan.id}
											plan={plan}
											isActive={isActive}
											userPlan={userPlan}
											billingType={billingType}
											isAuthenticated={isAuthenticated}
											hasActiveSubscription={hasActiveSubscription}
											isSubscriptionView={view === "subscription"}
										/>
									);
								})}
					</div>
				</div>
			</div>

			{tables && (
				<div className="border-b border-gray-200 bg-gray-50 px-6 py-16">
					<div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8">
						<div className="text-center">
							<h2 className="mb-3 text-3xl font-bold text-black">
								Compare Plans
							</h2>
							<p className="text-base text-gray-600">
								See what&apos;s included in each plan at a glance
							</p>
						</div>

						<ComparisonTable view={view} />
					</div>
				</div>
			)}
		</div>
	);
}
