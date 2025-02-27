"use client";

import { Check, Clock, Sparkles, Users, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Heading } from "@/components/general/micro/typography";
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
import { useCheckAccess } from "@/hooks/plans/use-billing";
import { createEncryptedCookie } from "@/lib/cookies/create-cookies";
import { cn } from "@/lib/utils";
import { subscriptionsCreation } from "@/server-actions/auth/subscribe";

import { pricingData } from "./data";

const calculateDiscount = (oldPrice: number, newPrice: number) => {
	const discount = ((oldPrice - newPrice) / oldPrice) * 100;
	return Math.round(discount);
};

const formatPrice = (price: number) => {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(price);
};

const formatTimeLeft = (seconds: number) => {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const secs = seconds % 60;
	return `${hours}h ${minutes}m ${secs}s`;
};

async function proPlanAction({
	plan,
	type,
}: {
	plan: "Free" | "Pro" | "Lifetime Deal" | "Custom";
	type: "monthly" | "annual";
}) {
	// This is a placeholder. Replace with your actual logic.
	const createSubCookie = await createEncryptedCookie("subscribing", {
		plan: plan,
		type: type,
	});
	await new Promise(resolve => setTimeout(resolve, 500)); // Simulate an async operation
	toast.success(`Plan ${plan} activated!`);
}

const Pricing = () => {
	const [interval, setInterval] = useState<"monthly" | "annual">("monthly");
	const [timeLeft, setTimeLeft] = useState<{ [key: string]: number }>({});
	const router = useRouter();
	const { status } = useSession();
	const hasAccess = useCheckAccess();
	const { plans } = pricingData;

	// Sort plans to ensure popular plan is in the middle
	const sortedPlans = [...plans].sort((a, b) => {
		if (a.popular) return 0;
		if (b.popular) return 1;
		return -1;
	});

	useEffect(() => {
		const timers = new Map<string, number>();

		plans.forEach(plan => {
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
	}, [plans]);

	async function activatePlan({
		plan,
		type,
	}: {
		plan: "Free" | "Pro" | "Lifetime Deal" | "Custom";
		type: "monthly" | "annual";
	}) {
		try {
			if (status === "authenticated") {
				await proPlanAction({ plan, type });

				if (hasAccess) {
					toast.info("You already have access to the Pro plan.");
					router.push("/dashboard");
					return;
				}

				if (plan === "Pro") {
					const response = await subscriptionsCreation();

					if (response?.success && response?.data?.checkout_url) {
						globalThis.window.open(response.data.checkout_url, "_blank");
						return;
					} else {
						toast.error("Something went wrong. Please try again later.");
						return;
					}
				}

				router.push("/dashboard");
			} else {
				await proPlanAction({ plan, type });
				router.push("/auth?view=signup");
			}
		} catch {
			toast.error(
				"An error occurred while processing your request. Please try again.",
			);
		}
	}

	const gridCols =
		plans.length === 1
			? "lg:grid-cols-1"
			: plans.length === 2
				? "lg:grid-cols-2"
				: plans.length === 3
					? "lg:grid-cols-3"
					: "lg:grid-cols-4";

	return (
		<div className="container mx-auto w-full py-12">
			<Heading
				as="h2"
				className="mb-6 text-center text-4xl font-semibold text-gray-800 dark:text-gray-200"
			>
				{pricingData.title}
			</Heading>

			<div className="mb-8 flex justify-center">
				<div className="flex items-center gap-4 rounded-full bg-gray-100/50 p-2 dark:bg-gray-800/50">
					<span
						className={`text-sm ${interval === "monthly" ? "text-gray-900 dark:text-gray-100" : "text-gray-500"}`}
					>
						Monthly
					</span>
					<Switch
						checked={interval === "annual"}
						onCheckedChange={checked =>
							setInterval(checked ? "annual" : "monthly")
						}
					/>
					<span
						className={`text-sm ${interval === "annual" ? "text-gray-900 dark:text-gray-100" : "text-gray-500"}`}
					>
						Annual
					</span>
				</div>
			</div>

			<div
				className={cn(
					"mx-auto grid max-w-7xl gap-8 px-4 md:px-6",
					gridCols,
					plans.length === 3 && "lg:px-8",
				)}
			>
				{sortedPlans.map((plan, index) => (
					<Card
						key={plan.name}
						className={cn(
							"relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 dark:border-gray-800 dark:bg-gray-900",
							plan.popular && "lg:-mt-4 lg:scale-105",
							plans.length === 3 && index === 1 && "lg:col-span-1",
						)}
					>
						{plan.popular && (
							<div className="absolute -top-px left-0 right-0 h-1 bg-gradient-to-r from-violet-600 to-indigo-600" />
						)}
						{plan.popular && (
							<Badge className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-1 text-xs font-medium text-white">
								POPULAR
							</Badge>
						)}
						<CardHeader className="pb-0">
							<Badge
								variant="secondary"
								className={cn(
									"mb-2 w-fit rounded-full",
									plan.popular
										? "bg-gray-900/5 text-gray-900 dark:bg-gray-100/10 dark:text-gray-100"
										: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
								)}
							>
								{plan.badge}
							</Badge>
							<CardTitle className="text-xl font-medium text-gray-900 dark:text-gray-100">
								{plan.name}
							</CardTitle>
						</CardHeader>
						<CardContent className="pt-6">
							<div className="flex items-baseline">
								<span className="text-2xl font-medium text-gray-600 dark:text-gray-400">
									$
								</span>
								<span className="text-5xl font-semibold text-gray-900 dark:text-gray-100">
									{interval === "monthly"
										? plan.price.monthly
										: plan.price.annual}
								</span>
								<span className="ml-1 text-sm text-gray-500">
									/{interval === "monthly" ? "mo" : "yr"}
								</span>
								{plan.price.previous && plan.price.previous[interval] && (
									<span className="ml-2 text-sm text-gray-400 line-through">
										${plan.price.previous[interval]}
									</span>
								)}
							</div>
							{plan.price.previous && plan.price.previous[interval] && (
								<span className="mt-1 block text-sm text-green-600 dark:text-green-400">
									Save{" "}
									{calculateDiscount(
										plan.price.previous[interval]!,
										interval === "monthly"
											? plan.price.monthly
											: plan.price.annual,
									)}
									%
								</span>
							)}

							{plan.lifetime && (
								<div className="mt-4 rounded-lg bg-gray-900 p-4 dark:bg-gray-800">
									<div className="mb-2 flex items-center justify-between">
										<div className="flex items-center gap-2">
											<Sparkles className="h-4 w-4 text-amber-400" />
											<span className="text-sm font-medium text-white">
												Lifetime Access
											</span>
										</div>
										{plan.lifetime.spotsLeft && (
											<Badge
												variant="secondary"
												className="bg-gray-800 text-gray-100 dark:bg-gray-700"
											>
												<Users className="mr-1 h-3 w-3" />
												{plan.lifetime.spotsLeft} spots left
											</Badge>
										)}
									</div>
									<div className="flex items-baseline">
										<span className="text-xl font-semibold text-white">
											{formatPrice(plan.lifetime.price)}
										</span>
										{plan.lifetime.previousPrice && (
											<>
												<span className="ml-2 text-sm text-gray-400 line-through">
													{formatPrice(plan.lifetime.previousPrice)}
												</span>
												<span className="ml-2 text-sm text-green-400">
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
									{timeLeft[plan.name] > 0 && (
										<div className="mt-2 flex items-center text-sm text-gray-300">
											<Clock className="mr-1 h-3 w-3" />
											Ends in {formatTimeLeft(timeLeft[plan.name])}
										</div>
									)}
								</div>
							)}

							<Button
								onClick={() =>
									activatePlan({
										plan: plan.name as
											| "Free"
											| "Pro"
											| "Lifetime Deal"
											| "Custom",
										type: interval === "monthly" ? "monthly" : "annual",
									})
								}
								className={cn(
									"mt-6 w-full rounded-lg",
									plan.popular
										? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700"
										: "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700",
								)}
								variant={plan.popular ? "default" : "outline"}
							>
								{plan.buttonText}
							</Button>

							<ul className="mt-8 space-y-3">
								{plan.features.map(feature => (
									<li
										key={typeof feature === "string" ? feature : feature.name}
										className="flex items-start gap-3"
									>
										{typeof feature === "string" ? (
											<>
												<Check className="h-5 w-5 text-gray-500" />
												<span className="text-sm text-gray-700 dark:text-gray-300">
													{feature}
												</span>
											</>
										) : (
											<>
												{feature.available ? (
													<Check className="h-5 w-5 text-gray-500" />
												) : (
													<X className="h-5 w-5 text-gray-400" />
												)}
												<span
													className={cn(
														"text-sm",
														feature.available
															? "text-gray-700 dark:text-gray-300"
															: "text-gray-400 dark:text-gray-500",
													)}
												>
													{feature.name}
												</span>
											</>
										)}
									</li>
								))}
							</ul>
						</CardContent>
						<CardFooter />
					</Card>
				))}
			</div>
		</div>
	);
};

export default Pricing;
