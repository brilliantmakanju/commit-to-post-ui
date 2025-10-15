/* eslint-disable import/no-unresolved */
"use client";
import { Check, Info } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

import PaddleCheckout from "../v4/paddle-overlay";
import { Feature, PlanCardProps } from "./pricing-data";
import {
	getButtonClassName,
	getButtonText,
	getShadowClassName,
	getTooltipMessage,
} from "./utlis";

export function PlanCard({
	plan,
	isActive,
	isAuthenticated,
	userPlan,
	billingType,
	hasActiveSubscription,
	isSubscriptionView,
}: PlanCardProps): JSX.Element {
	const isDark = plan.theme === "dark";
	const shadowClass = getShadowClassName(plan.id);
	const buttonClass = getButtonClassName(plan, isActive);
	const priceClass = isDark ? "text-white" : "text-black";
	const backgroundClass = isDark ? "bg-black" : "bg-white";
	const textClass = isDark ? "text-white" : "text-gray-900";
	const subTextClass = isDark ? "text-gray-400" : "text-gray-600";
	const featureTextClass = isDark ? "text-white" : "text-gray-700";

	const buttonText = getButtonText(
		plan,
		isActive,
		hasActiveSubscription,
		isSubscriptionView,
	);

	const tooltipMessage = getTooltipMessage(
		isActive,
		hasActiveSubscription,
		isSubscriptionView,
	);

	const getDisabledReason = ():
		| "current-plan"
		| "has-access"
		| "not-initialized"
		| "loading"
		| undefined => {
		if (isActive) {
			return "current-plan";
		}
		if (!plan.productId || plan.productId.length === 0) {
			return "not-initialized";
		}
		return undefined;
	};

	const disabledReason = getDisabledReason();

	// Only show active badge if user is authenticated
	const showActiveBadge = isActive && isAuthenticated;

	return (
		<Card
			className={`relative w-full lg:w-[23.8rem] ${backgroundClass} border-2 ${plan.borderStyle} ${shadowClass} transition-shadow ${showActiveBadge ? "ring-2 ring-blue-500 ring-offset-2" : ""}`}
		>
			{showActiveBadge && (
				<Badge className="absolute right-5 top-5 bg-blue-600 text-white hover:bg-blue-700">
					ACTIVE
				</Badge>
			)}

			<CardHeader className="space-y-3">
				<CardTitle className={`text-xl ${textClass}`}>{plan.name}</CardTitle>
				<CardDescription className={`text-sm ${subTextClass}`}>
					{plan.description}
				</CardDescription>
			</CardHeader>

			<CardContent className="space-y-6">
				<div className="space-y-2">
					<div className={`text-5xl font-bold ${priceClass}`}>
						${plan.price}
					</div>
					<div className={`text-sm font-medium ${subTextClass}`}>
						{plan.priceLabel}
					</div>
				</div>

				{plan.productId && plan.productId.length > 0 ? (
					<PaddleCheckout
						credits={plan.credits}
						forceDisabled={isAuthenticated && isActive}
						productId={plan.productId}
						disabledReason={isAuthenticated ? disabledReason : undefined}
						tooltipMessage={isAuthenticated ? tooltipMessage : ""}
						locale="en"
						theme="dark"
						displayMode="overlay"
						environment={
							process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT as
								| "sandbox"
								| "production"
						}
					>
						<Button
							disabled={(isAuthenticated && isActive) || plan.id !== "basic"}
							className={buttonClass}
						>
							{isAuthenticated ? buttonText : plan.buttonText}
						</Button>
					</PaddleCheckout>
				) : (
					<Button disabled={true} className={buttonClass}>
						{isAuthenticated ? buttonText : plan.buttonText}
					</Button>
				)}

				<div className="space-y-3 pt-4">
					{plan.features.map((feature: Feature) => (
						<div key={feature.text} className="flex items-center gap-3">
							<Check
								className={`h-4 w-4 flex-shrink-0 ${isDark ? "text-white" : "text-gray-600"}`}
								strokeWidth={1.5}
							/>
							<span className={`flex-1 text-sm ${featureTextClass}`}>
								{feature.text}
							</span>
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<Info
											className={`h-4 w-4 cursor-help opacity-40 hover:opacity-60 ${isDark ? "text-white" : "text-gray-700"}`}
										/>
									</TooltipTrigger>
									<TooltipContent>
										<p>{feature.tooltip}</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
