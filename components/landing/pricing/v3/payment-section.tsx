/* eslint-disable import/no-unresolved */
"use client";

import { AlertCircle, Check, Clock, Users, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { type Key, useEffect, useState } from "react";

import SubAuthModal from "@/components/auth/sub-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import useAuthModalStore from "@/lib/zustand/auth/use-auth-modal";

import { pricingData } from "../data";
import PaddleCheckout from "../v4/paddle-overlay";
import { GlobalCountdownTimer } from "./countdown";

const calculateDiscount = (oldPrice: number, newPrice: number) => {
	const discount = ((oldPrice - newPrice) / oldPrice) * 100;
	return Math.round(discount);
};

export default function PricingSection() {
	const { isOpen } = useAuthModalStore();
	const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
		"monthly",
	);
	const [timeLeft, setTimeLeft] = useState<{ [key: string]: number }>({});
	const router = useRouter();

	// Sort plans to ensure popular plan is in the middle
	const sortedPlans = [...pricingData.plans].sort((a, b) => {
		if (a.popular) return 1;
		if (b.popular) return 0;
		return -1;
	});

	useEffect(() => {
		const timers = new Map<string, number>();

		pricingData.plans.forEach((plan: any) => {
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

	// const handlePlanSelection = (planId: string) => {
	// 	if (status === "unauthenticated") {
	// 		router.push("auth");
	// 	} else if (status === "authenticated") {
	// 		router.push(`/payment?plan=${planId}&cycle=${billingCycle}`);
	// 	}
	// };

	// Helper function to get the appropriate product ID based on plan and billing cycle
	const getProductId = (plan: any): string => {
		// For lifetime deals, use the lifetime productId
		if (plan.name === "Lifetime Deal" && plan.lifetime) {
			return plan.lifetime.productId;
		}

		// For regular plans, use the productId for the selected billing cycle
		return plan.price.productIds[billingCycle];
	};

	return (
		<>
			{isOpen && <SubAuthModal />}

			<section id="pricing" className="w-full py-16">
				<div className="container mx-auto px-4">
					<h2 className="mb-6 text-center text-3xl font-medium text-zinc-900 dark:text-zinc-100">
						{pricingData.title}
					</h2>

					{/* Global Countdown Banner */}
					<div className="mb-8 rounded-lg border border-zinc-200 bg-zinc-50 p-6 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
						<div className="mb-3 flex items-center justify-center">
							<Clock className="mr-2 h-5 w-5 text-zinc-800 dark:text-zinc-200" />
							<h3 className="text-lg font-medium text-zinc-800 dark:text-zinc-200">
								Limited Time Offer
							</h3>
						</div>
						<p className="mb-4 text-zinc-600 dark:text-zinc-400">
							All plans are available at a special launch price. Offer ends in:
						</p>
						<div className="inline-flex items-center justify-center rounded-md bg-white px-4 py-3 shadow-sm dark:bg-zinc-800">
							<GlobalCountdownTimer
								showLabels={true}
								showIcon={false}
								className="text-zinc-800 dark:text-zinc-200"
							/>
						</div>
						<div className="mt-4 flex items-center justify-center text-sm text-zinc-500 dark:text-zinc-500">
							<AlertCircle className="mr-1 h-3 w-3" />
							<span>After this period, prices will increase</span>
						</div>
					</div>

					{/* Billing Toggle */}
					<div className="mb-8 flex justify-center">
						<div className="flex items-center gap-4 rounded-full border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900">
							<span
								className={`px-3 py-1 text-sm ${
									billingCycle === "monthly"
										? "rounded-full bg-zinc-100 font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
										: "text-zinc-500"
								}`}
							>
								Monthly
							</span>
							<Switch
								checked={billingCycle === "annual"}
								onCheckedChange={checked =>
									setBillingCycle(checked ? "annual" : "monthly")
								}
							/>
							<span
								className={`px-3 py-1 text-sm ${
									billingCycle === "annual"
										? "rounded-full bg-zinc-100 font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
										: "text-zinc-500"
								}`}
							>
								Annual{" "}
							</span>
						</div>
					</div>

					{/* Pricing Cards */}
					<div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
						{sortedPlans.map(plan => {
							const isLifetimeDeal = plan.name === "Lifetime Deal";
							const isPro = plan.popular;
							const productId = getProductId(plan);

							return (
								<Card
									key={plan.name}
									className={cn(
										"relative border-zinc-200 bg-white transition-all hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900",
										isPro &&
											"border-2 border-zinc-900 hover:shadow-md dark:border-zinc-100",
									)}
								>
									{isPro && (
										<div className="absolute -top-3 left-1/2 -translate-x-1/2 transform">
											<Badge className="border border-zinc-200 bg-zinc-900 px-3 py-1 text-xs font-medium text-white dark:border-zinc-700 dark:bg-zinc-100 dark:text-zinc-900">
												POPULAR
											</Badge>
										</div>
									)}

									<CardHeader className="pb-0 pt-6">
										<Badge
											variant="outline"
											className="mb-2 w-fit border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
										>
											{plan.badge}
										</Badge>
										<CardTitle className="text-xl font-medium text-zinc-900 dark:text-zinc-100">
											{plan.name}
										</CardTitle>
									</CardHeader>

									<CardContent className="pt-6">
										{isLifetimeDeal && plan.lifetime ? (
											<div className="mb-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
												<div className="mb-2 flex items-center justify-between">
													<div className="flex items-center gap-2">
														<span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
															Lifetime Access
														</span>
													</div>
													{plan.lifetime.spotsLeft && (
														<Badge
															variant="outline"
															className="border-zinc-300 bg-white text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
														>
															<Users className="mr-1 h-3 w-3" />
															{plan.lifetime.spotsLeft} spots left
														</Badge>
													)}
												</div>
												<div className="flex items-baseline">
													<span className="text-2xl font-medium text-zinc-700 dark:text-zinc-300">
														$
													</span>
													<span className="text-4xl font-semibold text-zinc-900 dark:text-zinc-100">
														{plan.lifetime.price}
													</span>
													{plan.lifetime.previousPrice && (
														<>
															<span className="ml-2 text-sm text-zinc-400 line-through">
																${plan.lifetime.previousPrice}
															</span>
															<span className="ml-2 text-sm text-zinc-700 dark:text-zinc-300">
																Save{" "}
																{calculateDiscount(
																	plan.lifetime.previousPrice,
																	plan.lifetime.price,
																)}
																%
															</span>
														</>
													)}
												</div>
												{/* Use the global countdown timer instead of the local one */}
												<div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
													<GlobalCountdownTimer compact={true} />
												</div>
											</div>
										) : (
											<div className="flex items-baseline">
												<span className="text-2xl font-medium text-zinc-700 dark:text-zinc-300">
													$
												</span>
												<span className="text-5xl font-semibold text-zinc-900 dark:text-zinc-100">
													{plan.name === "Free"
														? "0"
														: billingCycle === "monthly"
															? plan.price.monthly
															: plan.price.annual}
												</span>
												<span className="ml-1 text-sm text-zinc-500">
													{plan.name === "Free"
														? "forever"
														: `/${billingCycle === "monthly" ? "mo" : "yr"}`}
												</span>
												{plan.price.previous &&
													plan.price.previous[billingCycle] && (
														<span className="ml-2 text-sm text-zinc-400 line-through">
															${plan.price.previous[billingCycle]}
														</span>
													)}
											</div>
										)}

										{plan.price.previous &&
											plan.price.previous[billingCycle] && (
												<span className="mt-1 block text-sm text-zinc-700 dark:text-zinc-300">
													Save{" "}
													{calculateDiscount(
														plan.price.previous[billingCycle]!,
														billingCycle === "monthly"
															? plan.price.monthly
															: plan.price.annual,
													)}
													%
												</span>
											)}

										<PaddleCheckout
											locale="en"
											theme="light"
											displayMode="overlay"
											environment="sandbox"
											productId={productId}
											onClose={() => console.log("Checkout closed")}
											onError={error => console.error("Error:", error)}
											onSuccess={() => console.log("Subscription successful!")}
										>
											<Button
												className={cn(
													"mt-6 w-full",
													isPro
														? "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
														: "border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800",
												)}
												variant={isPro ? "default" : "outline"}
											>
												{plan.buttonText}
											</Button>
										</PaddleCheckout>

										<ul className="mt-6 space-y-3">
											{plan.features.map(
												(feature: any, index: Key | null | undefined) => {
													const featureName =
														typeof feature === "string"
															? feature
															: feature.name;
													const isAvailable =
														typeof feature === "string"
															? true
															: feature.available;

													return (
														<li key={index} className="flex items-start gap-3">
															{isAvailable ? (
																<Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
															) : (
																<X className="h-5 w-5 text-zinc-400 dark:text-zinc-600" />
															)}
															<span
																className={cn(
																	"text-sm",
																	isAvailable
																		? "text-zinc-700 dark:text-zinc-300"
																		: "text-zinc-400 dark:text-zinc-600",
																)}
															>
																{featureName}
															</span>
														</li>
													);
												},
											)}
										</ul>
									</CardContent>
									<CardFooter />
								</Card>
							);
						})}
					</div>
				</div>
			</section>
		</>
	);
}
