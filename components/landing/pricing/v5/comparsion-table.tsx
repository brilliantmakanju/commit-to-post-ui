/* eslint-disable import/no-unresolved */
"use client";
import { Check, X } from "lucide-react";

import { Card } from "@/components/ui/card";

import {
	ComparisonTableProps,
	PlanData,
	PRICING_DATA,
	RefillPack,
	TableFeature,
} from "./pricing-data";
import { calculateCostPerCredit } from "./utlis";

export function ComparisonTable({ view }: ComparisonTableProps): JSX.Element {
	const plans =
		view === "subscription"
			? PRICING_DATA.subscriptionPlans
			: PRICING_DATA.unlockPacks;
	const isRefill = view === "refill";

	const allFeatures: TableFeature[] = isRefill
		? [
				{ name: "Credits Included", key: "credits" },
				{ name: "Price per Credit", key: "costPerCredit" },
				{ name: "Credits Never Expire", key: "noExpiry" },
				{ name: "No Commitment", key: "noCommitment" },
			]
		: [
				{ name: "Credits Included", key: "credits" },
				{
					name:
						view === "subscription" ? "Credit Renewal" : "Credits Never Expire",
					key: "renewal",
				},
				{ name: "GitHub Commit Tracking", key: "github" },
				{ name: "Multi-Platform Posting", key: "platforms" },
				{ name: "AI Draft Generation", key: "ai" },
				{ name: "Image Uploads", key: "images" },
				{ name: "Advanced Scheduling", key: "scheduling" },
				{ name: "Multiple Tone Styles", key: "tones" },
				{ name: "Priority Support", key: "support" },
				{ name: "Team Workspaces", key: "team" },
			];

	function getFeatureValue(
		planId: string,
		featureKey: string,
	): string | boolean {
		if (isRefill) {
			const pack = PRICING_DATA.refillPacks.find(
				(refillPack: RefillPack) => refillPack.id === planId,
			);
			if (!pack) {
				return false;
			}
			if (featureKey === "credits") {
				return pack.credits.toLocaleString();
			}
			if (featureKey === "costPerCredit") {
				return `$${calculateCostPerCredit(pack.price, pack.credits)}`;
			}
			if (featureKey === "noExpiry" || featureKey === "noCommitment") {
				return true;
			}
			return false;
		}

		const plan = plans.find(
			(currentPlan: PlanData) => currentPlan.id === planId,
		);
		if (!plan) {
			return false;
		}

		if (featureKey === "credits") {
			return plan.credits.toLocaleString();
		}
		if (featureKey === "renewal") {
			return view === "subscription" ? "Monthly" : true;
		}
		if (
			featureKey === "github" ||
			featureKey === "platforms" ||
			featureKey === "ai"
		) {
			return true;
		}
		if (
			featureKey === "images" ||
			featureKey === "scheduling" ||
			featureKey === "tones"
		) {
			return planId !== "basic";
		}
		if (featureKey === "support" || featureKey === "team") {
			return planId === "studio";
		}
		return false;
	}

	const items: Array<PlanData | RefillPack> = isRefill
		? PRICING_DATA.refillPacks
		: plans;

	return (
		<div className="w-full overflow-x-auto">
			<div className="w-full lg:min-w-[800px]">
				<Card className="border-2 border-gray-200">
					<div className="grid grid-cols-4 border-b-2 border-gray-200 bg-gray-50">
						<div className="px-6 py-5">
							<span className="text-sm font-semibold text-gray-900">
								Features
							</span>
						</div>
						{items.map((item: PlanData | RefillPack) => (
							<div
								key={item.id}
								className="flex items-center justify-center px-6 py-5 text-center"
							>
								<div className="text-lg font-bold text-gray-900">
									{item.name}
								</div>
							</div>
						))}
					</div>

					{allFeatures.map((feature: TableFeature, index: number) => (
						<div
							key={feature.key}
							className={`grid grid-cols-4 ${index === allFeatures.length - 1 ? "" : "border-b border-gray-200"}`}
						>
							<div className="px-6 py-4">
								<span className="text-sm font-medium text-gray-700">
									{feature.name}
								</span>
							</div>
							{items.map((item: PlanData | RefillPack) => {
								const value = getFeatureValue(item.id, feature.key);
								return (
									<div
										key={item.id}
										className="flex items-center justify-center px-6 py-4"
									>
										{typeof value === "boolean" ? (
											value ? (
												<Check
													className="h-5 w-5 text-green-600"
													strokeWidth={2}
												/>
											) : (
												<X className="h-5 w-5 text-gray-300" strokeWidth={2} />
											)
										) : (
											<span className="text-sm font-medium text-gray-900">
												{value}
											</span>
										)}
									</div>
								);
							})}
						</div>
					))}
				</Card>
			</div>
		</div>
	);
}
