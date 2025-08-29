"use client";

import { Check, Clock, Users, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
import {
	createEncryptedCookie,
	deleteCookie,
} from "@/lib/cookies/create-cookies";
import { cn } from "@/lib/utils";

import { pricingData } from "./data";

const calculateDiscount = (oldPrice: number, newPrice: number) => {
	const discount = ((oldPrice - newPrice) / oldPrice) * 100;
	return Math.round(discount);
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
	plan: "Basic" | "Pro" | "Lifetime Deal" | "Custom";
	type: "monthly" | "annual";
}) {
	await deleteCookie("subscribing");
	await createEncryptedCookie("subscribing", {
		plan: plan,
		type: type,
	});
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
		plan: "Basic" | "Pro" | "Lifetime Deal" | "Custom";
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

				router.push("/dashboard");
			} else {
				await proPlanAction({ plan, type });
				router.push("/");
				// router.push("/auth?view=signup");
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
		<section
			id="pricing"
			className="w-full bg-gray-50 dark:bg-gray-900 lg:pt-32"
		>
			<div className="container mx-auto px-4">
				<h2 className="mb-6 text-center text-3xl font-medium text-zinc-900 dark:text-zinc-100">
					{pricingData.title}
				</h2>

				<div className="mb-8 flex justify-center">
					<div className="flex items-center gap-4 rounded-full border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900">
						<span
							className={`px-3 py-1 text-sm ${interval === "monthly" ? "rounded-full bg-zinc-100 font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100" : "text-zinc-500"}`}
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
							className={`px-3 py-1 text-sm ${interval === "annual" ? "rounded-full bg-zinc-100 font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100" : "text-zinc-500"}`}
						>
							Annual
						</span>
					</div>
				</div>

				<div className="mx-auto grid max-w-6xl gap-6 px-4 md:grid-cols-3 md:px-0">
					{sortedPlans.map(plan => (
						<Card
							key={plan.name}
							className={cn(
								"relative border-zinc-200 bg-white transition-all dark:border-zinc-800 dark:bg-zinc-900",
								plan.popular && "border-2 border-zinc-900 dark:border-zinc-100",
							)}
						>
							{plan.popular && (
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
								{/* {plan.name === "Lifetime Deal" ? (
									<div className="mb-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
										<div className="mb-2 flex items-center justify-between">
											<div className="flex items-center gap-2">
												<span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
													Lifetime Access
												</span>
											</div>
											{plan.lifetime?.spotsLeft && (
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
												{plan.lifetime?.price}
											</span>
											{plan.lifetime?.previousPrice && (
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
										{timeLeft[plan.name] > 0 && (
											<div className="mt-2 flex items-center text-sm text-zinc-600 dark:text-zinc-400">
												<Clock className="mr-1 h-3 w-3" />
												Ends in {formatTimeLeft(timeLeft[plan.name])}
											</div>
										)}
									</div>
								) : (
									<div className="flex items-baseline">
										<span className="text-2xl font-medium text-zinc-700 dark:text-zinc-300">
											$
										</span>
										<span className="text-5xl font-semibold text-zinc-900 dark:text-zinc-100">
											{interval === "monthly"
												? plan.price.monthly
												: plan.price.annual}
										</span>
										<span className="ml-1 text-sm text-zinc-500">
											{plan.price.monthly > 0 &&
												`/${interval === "monthly" ? "mo" : "yr"}`}
										</span>
										{plan.price.previous && plan.price.previous[interval] && (
											<span className="ml-2 text-sm text-zinc-400 line-through">
												${plan.price.previous[interval]}
											</span>
										)}
									</div>
								)} */}

								{plan.price.previous && plan.price.previous[interval] && (
									<span className="mt-1 block text-sm text-zinc-700 dark:text-zinc-300">
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

								<Button
									onClick={() =>
										activatePlan({
											plan: plan.name as
												| "Basic"
												| "Pro"
												| "Lifetime Deal"
												| "Custom",
											type: interval === "monthly" ? "monthly" : "annual",
										})
									}
									className={cn(
										"mt-6 w-full",
										plan.popular
											? "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
											: "border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800",
									)}
									variant={plan.popular ? "default" : "outline"}
								>
									{plan.buttonText}
								</Button>

								<ul className="mt-6 space-y-3">
									{plan.features.map(feature => (
										<li
											key={typeof feature === "string" ? feature : feature.name}
											className="flex items-start gap-3"
										>
											{typeof feature === "string" ? (
												<>
													<Check className="h-5 w-5 text-zinc-700 dark:text-zinc-400" />
													<span className="text-sm text-zinc-700 dark:text-zinc-300">
														{feature}
													</span>
												</>
											) : (
												<>
													{feature.available ? (
														<Check className="h-5 w-5 text-zinc-700 dark:text-zinc-400" />
													) : (
														<X className="h-5 w-5 text-zinc-400 dark:text-zinc-600" />
													)}
													<span
														className={cn(
															"text-sm",
															feature.available
																? "text-zinc-700 dark:text-zinc-300"
																: "text-zinc-400 dark:text-zinc-600",
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
		</section>
	);
};

export default Pricing;
