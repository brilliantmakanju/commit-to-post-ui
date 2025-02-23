/* eslint-disable import/no-unresolved */
import { Check } from "lucide-react";
import React from "react";

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

import { pricingData } from "./data";

const Pricing = () => {
	const { plans } = pricingData;

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
