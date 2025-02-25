"use client";
/* eslint-disable import/no-unresolved */

import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import React from "react";
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
import { useCheckAccess } from "@/hooks/plans/use-billing";
import { createEncryptedCookie } from "@/lib/cookies/create-cookies";
import { subscriptionsCreation } from "@/server-actions/auth/subscribe";

import { pricingData } from "./data";

const proPlanAction = async ({ plan }: { plan: "Pro" | "Free" }) => {
	await createEncryptedCookie("subscribing", {
		plan: plan,
	});
};

const Pricing = () => {
	const { plans } = pricingData;
	const router = useRouter();
	const { status } = useSession();
	const hasAccess = useCheckAccess();

	async function activatePlan({ plan }: { plan: "Pro" | "Free" }) {
		try {
			if (status === "authenticated") {
				console.log(plan);
				await proPlanAction({ plan });

				// Check if user already has access
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
						console.error("Error: Checkout URL not found in response.");
						toast.error("Something went wrong. Please try again later.");
						return;
					}
				}

				// Redirect to dashboard after handling subscription
				router.push("/dashboard");
			} else {
				// If the user is not authenticated, follow the existing flow
				await proPlanAction({ plan });
				router.push("/auth?view=signup");
			}
		} catch (error) {
			console.error("Error in activatePlan:", error);
			toast.error(
				"An error occurred while processing your request. Please try again.",
			);
		}
	}

	return (
		<div className="container mx-auto w-full">
			<Heading
				as="h2"
				className="mb-12 text-center text-4xl font-semibold text-gray-800 dark:text-gray-200"
			>
				Start Your Journey Today
			</Heading>

			<div className="mx-auto mt-12 grid max-w-5xl gap-8 px-4 md:px-0 lg:grid-cols-2">
				{plans.map(plan => (
					<Card
						key={plan.name}
						className={`relative overflow-hidden rounded-2xl shadow-sm ${
							plan.popular ? "bg-gray-100" : "bg-white"
						} border border-gray-200`}
					>
						{plan.popular && (
							<Badge className="absolute right-4 top-4 rounded-full bg-gray-800 px-3 py-1 text-xs font-medium text-white">
								POPULAR
							</Badge>
						)}
						<CardHeader className="pb-0">
							<Badge
								variant="secondary"
								className={`mb-2 w-fit rounded-full ${plan.popular ? "bg-gray-200 text-gray-800" : "bg-gray-100 text-gray-600"}`}
							>
								{plan.badge}
							</Badge>
							<CardTitle className="text-xl font-medium text-gray-900">
								{plan.name}
							</CardTitle>
						</CardHeader>
						<CardContent className="pt-6">
							<div className="flex items-baseline">
								<span className="text-2xl font-medium text-gray-600">$</span>
								<span className="text-5xl font-semibold text-gray-900">
									{plan.price}
								</span>
								<span className="ml-1 text-sm text-gray-500">/mo</span>
							</div>
							<Button
								onClick={() =>
									activatePlan({ plan: plan.name as "Pro" | "Free" })
								}
								className={`mt-6 w-full rounded-lg ${
									plan.popular
										? "bg-gray-900 text-white hover:bg-gray-800"
										: "bg-gray-100 text-gray-800 hover:bg-gray-200"
								}`}
								variant={plan.popular ? "default" : "outline"}
							>
								{plan.buttonText}
							</Button>
							<ul className="mt-8 space-y-3">
								{plan.features.map(feature => (
									<li key={feature} className="flex items-center gap-3">
										<Check className="h-5 w-5 text-gray-500" />
										<span className="text-sm text-gray-700">{feature}</span>
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
