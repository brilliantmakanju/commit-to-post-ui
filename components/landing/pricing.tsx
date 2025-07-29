"use client";

import { Check, Star } from "lucide-react";
import { type Key, useEffect, useState } from "react";

// eslint-disable-next-line import/no-unresolved
import SubAuthModal from "@/components/auth/sub-modal";
// eslint-disable-next-line import/no-unresolved
import { Button } from "@/components/ui/button";
// eslint-disable-next-line import/no-unresolved
import { Card, CardContent } from "@/components/ui/card";
// eslint-disable-next-line import/no-unresolved
import { cn } from "@/lib/utils";
// eslint-disable-next-line import/no-unresolved
import useAuthModalStore from "@/zustand/auth/use-auth-modal";

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

const isFreePlan = (planName: string): boolean => {
	return planName.toLowerCase() === "free";
};

export default function PricingSection() {
	const { isOpen } = useAuthModalStore();
	const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
		"annual",
	);
	const [timeLeft, setTimeLeft] = useState<{ [key: string]: number }>({});

	// Sort plans to ensure popular plan is in the middle
	const sortedPlans: Plan[] = [...pricingData.plans].sort((a, b) => {
		// Free plan first
		if (isFreePlan(a.name)) return -1;
		if (isFreePlan(b.name)) return 1;
		// Popular plan in the middle (second position)
		if (a.popular && !b.popular) return 0;
		if (!a.popular && b.popular) return 1;
		return 0;
	});

	useEffect(() => {
		const timers = new Map<string, number>();

		pricingData.plans.forEach((plan: Plan) => {
			if (plan.lifetime?.endsIn) {
				setTimeLeft(previous => ({
					...previous,
					[plan.name]: plan.lifetime!.endsIn * 60 * 60,
				}));

				const timerId = globalThis.setInterval(() => {
					setTimeLeft(previous => ({
						...previous,
						[plan.name]: Math.max(0, (previous[plan.name] || 0) - 1),
					}));
				}, 1000);

				timers.set(plan.name, timerId as unknown as number);
			}
		});

		return () => {
			timers.forEach(timerId => clearInterval(timerId));
		};
	}, []);

	const getProductId = (plan: Plan): string => {
		if (plan.name === "Lifetime Deal" && plan.lifetime) {
			return plan.lifetime.productId;
		}
		return plan.price.productIds[billingCycle];
	};

	return (
		<>
			<section id="pricing" className="w-full py-20 dark:bg-black">
				<div className="container mx-auto max-w-7xl px-6">
					{/* Header */}
					<div className="mb-16 text-center">
						<h2 className="mb-4 text-4xl font-light tracking-tight text-black dark:text-white md:text-5xl">
							{pricingData.title}
						</h2>
					</div>

					{/* Billing Toggle */}
					<div className="mb-16 flex justify-center">
						<div className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 p-1 dark:border-gray-800 dark:bg-gray-900">
							<button
								onClick={() => setBillingCycle("monthly")}
								className={cn(
									"rounded-full px-6 py-3 text-sm font-medium transition-all duration-200",
									billingCycle === "monthly"
										? "border border-gray-200 bg-white text-black shadow-sm dark:border-gray-700 dark:bg-black dark:text-white"
										: "text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white",
								)}
							>
								Monthly
							</button>
							<button
								onClick={() => setBillingCycle("annual")}
								className={cn(
									"flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all duration-200",
									billingCycle === "annual"
										? "border border-gray-200 bg-white text-black shadow-sm dark:border-gray-700 dark:bg-black dark:text-white"
										: "text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white",
								)}
							>
								Annual
								{/* <span className="rounded-full bg-gray-200 px-2 py-1 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300">
									Save 50%
								</span> */}
							</button>
						</div>
					</div>

					{/* Pricing Cards */}
					<div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
						{sortedPlans.map((plan: Plan, index: number) => {
							const isPro = plan.popular;
							const productId = getProductId(plan);
							const isFree = isFreePlan(plan.name);
							const currentPrice =
								billingCycle === "monthly"
									? plan.price.monthly
									: plan.price.annual;
							const previousPrice = plan.price.previous?.[billingCycle];

							return (
								<Card
									key={plan.name}
									className={cn(
										"relative border-0 border-none bg-transparent shadow-none transition-all duration-300 hover:scale-[1.02]",
										isPro && "lg:scale-105",
									)}
								>
									{/* Popular Badge */}
									{isPro && (
										<div className="absolute -top-4 left-1/2 z-10 -translate-x-1/2 transform">
											<div className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black">
												<Star className="h-4 w-4 fill-current" />
												Most Popular
											</div>
										</div>
									)}

									<CardContent
										className={cn(
											"rounded-2xl border p-8 transition-all duration-300",
											isPro
												? "border-black bg-gray-50 shadow-lg dark:border-white dark:bg-gray-900"
												: "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-800 dark:bg-black dark:hover:border-gray-700",
										)}
									>
										{/* Plan Header */}
										<div className="mb-8">
											<div className="mb-3 flex items-center gap-3">
												<h3 className="text-2xl font-medium text-black dark:text-white">
													{plan.name}
												</h3>
												{previousPrice && (
													<span className="rounded-full bg-gray-200 px-2 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
														Save{" "}
														{calculateDiscount(previousPrice, currentPrice)}%
													</span>
												)}
											</div>
											<p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
												{plan.badge}
											</p>
										</div>

										{/* Pricing */}
										<div className="mb-8">
											<div className="mb-2 flex items-baseline gap-2">
												<span className="text-5xl font-light text-black dark:text-white">
													${isFree ? "0" : currentPrice}
												</span>
												{previousPrice && (
													<span className="text-xl font-light text-gray-400 line-through dark:text-gray-600">
														${previousPrice}
													</span>
												)}
											</div>
											<p className="text-sm text-gray-500 dark:text-gray-400">
												{isFree
													? "Forever free"
													: `Per agent, per ${billingCycle === "monthly" ? "month" : "year"}`}
											</p>
										</div>

										{/* CTA Button */}
										{isFree ? (
											<Button
												variant="outline"
												className="mb-8 w-full border-gray-300 bg-transparent py-3 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-900"
												disabled
											>
												Current Plan
											</Button>
										) : (
											<PaddleCheckout
												locale="en"
												theme="light"
												displayMode="overlay"
												environment={
													process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT as
														| "sandbox"
														| "production"
												}
												productId={productId}
											>
												<Button
													className={cn(
														"mb-8 w-full py-3 font-medium transition-all duration-200",
														isPro
															? "bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
															: "bg-gray-900 text-white hover:bg-black dark:bg-gray-100 dark:text-black dark:hover:bg-white",
													)}
												>
													{plan.buttonText}
												</Button>
											</PaddleCheckout>
										)}

										{/* Features */}
										<div className="space-y-4">
											{plan.features.map(
												(feature: string | PlanFeature, featureIndex: Key) => {
													const featureName =
														typeof feature === "string"
															? feature
															: feature.name;
													const isAvailable =
														typeof feature === "string"
															? true
															: feature.available;

													if (!isAvailable) return;

													return (
														<div
															key={featureIndex}
															className="flex items-start gap-3"
														>
															<div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-black dark:bg-white">
																<Check className="h-3 w-3 text-white dark:text-black" />
															</div>
															<span className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
																{featureName}
															</span>
														</div>
													);
												},
											)}
										</div>
									</CardContent>
								</Card>
							);
						})}
					</div>
				</div>
			</section>
		</>
	);
}
