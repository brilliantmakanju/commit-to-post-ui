/* eslint-disable unicorn/consistent-function-scoping */
"use client";

import Link from "next/link";
import React, { useState } from "react";
import {
	FaCalendarAlt,
	FaCheckCircle,
	FaClock,
	FaCrown,
	FaExclamationTriangle,
	FaFileAlt,
	FaGithub,
	FaHeart,
	FaInfinity,
	FaLightbulb,
	FaShare,
	FaUsers,
} from "react-icons/fa";

import useOrganizationStats from "@/hooks/core/stats/use-organization-stats";
import { useCreditBalance } from "@/hooks/plans/use-credit-balance";

import { pricingData } from "../landing/pricing/data";
import { Button } from "../ui/button";
import BillingHistory from "./billing-history";

interface CurrentPlan {
	name: string;
	features: string[];
	planType: "basic" | "pro" | "studio";
}

interface UsageStats {
	activeWorkspace: number;
	repositoriesUsed: number;
	socialsUsed: number;
	postsUsed: number;
}

export default function BillingSettings() {
	const {
		credits,
		userPlan,
		billingType,
		billingInterval,
		subscriptionStatus,
		subscriptionEndDate,
		hasActiveSubscription,
	} = useCreditBalance({
		syncWithStore: true,
		refetchInterval: 5 * 60 * 1000,
		showNotifications: false,
	});
	const { summary, isStatsLoading, isStatsError } = useOrganizationStats();

	// Get stats from the organization stats hook
	const totalPosts = summary?.total_posts || 0;
	const totalSocials = summary?.total_socials || 0;
	const totalRepositories = summary?.total_repos || 0;
	const totalWorkspaces = summary?.total_organizations || 0;

	// Validate all required fields before usage
	const userPlanType = userPlan.toLowerCase();

	const currentPlanData = pricingData.plans.find(
		plan => plan.name.toLocaleLowerCase() === userPlanType,
	);

	// Show loading state
	if (isStatsLoading) {
		return (
			<div className="min-h-screen p-6">
				<div className="mx-auto w-full max-w-7xl">
					<div className="w-full rounded-2xl border border-white/10 bg-white/5 px-8 py-12 backdrop-blur-xl">
						<div className="text-center">
							<div className="border-3 mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-white/20 border-t-white"></div>
							<p className="text-lg font-medium text-white">
								Loading billing information...
							</p>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Show error state
	if (isStatsError) {
		return (
			<div className="min-h-screen p-6">
				<div className="mx-auto w-full max-w-7xl">
					<div className="w-full rounded-2xl border border-white/10 bg-white/5 px-8 py-12 backdrop-blur-xl">
						<div className="text-center">
							<FaExclamationTriangle className="mx-auto mb-4 h-14 w-14 text-white/40" />
							<p className="text-xl font-semibold text-white">
								Error loading billing data
							</p>
							<p className="mt-2 text-sm text-white/60">
								Please refresh the page
							</p>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (!currentPlanData) {
		return (
			<div className="min-h-screen p-6">
				<div className="mx-auto w-full max-w-7xl">
					<div className="w-full rounded-2xl border border-white/10 bg-white/5 px-8 py-12 backdrop-blur-xl">
						<div className="text-center">
							<FaExclamationTriangle className="mx-auto mb-4 h-14 w-14 text-white/40" />
							<p className="text-xl font-semibold text-white">
								Error: Plan &quot;{userPlanType}&quot; not found
							</p>
						</div>
					</div>
				</div>
			</div>
		);
	}

	const currentPlan: CurrentPlan = {
		name: currentPlanData.name,
		planType: userPlanType.toLocaleLowerCase() as "basic" | "pro" | "studio",
		features: currentPlanData.features.map(feature =>
			typeof feature === "string" ? feature : feature.name,
		),
	};

	const usageStats: UsageStats = {
		postsUsed: totalPosts,
		socialsUsed: totalSocials,
		activeWorkspace: totalWorkspaces,
		repositoriesUsed: totalRepositories,
	};

	const canUpgrade = currentPlan.planType !== "studio";
	const isOneTimePurchase =
		billingType?.toLocaleLowerCase() === "one_time" ||
		billingType?.toLocaleLowerCase() === "credits";
	const isSubscription = billingType?.toLocaleLowerCase() === "subscription";
	const isLifetime =
		billingInterval?.toLocaleLowerCase() === "lifetime" ||
		billingInterval?.toLocaleLowerCase() === "one_time";

	const getPlanIcon = (planType: string) => {
		switch (planType) {
			case "basic": {
				return <FaHeart className="h-6 w-6 text-white/60" />;
			}
			case "pro": {
				return <FaLightbulb className="h-6 w-6 text-white/70" />;
			}
			case "studio": {
				return <FaCrown className="h-6 w-6 text-white/90" />;
			}
			default: {
				return <FaHeart className="h-6 w-6 text-white/60" />;
			}
		}
	};

	const getBillingBadge = () => {
		if (
			isOneTimePurchase ||
			billingInterval?.toLocaleLowerCase() === "lifetime" ||
			billingInterval?.toLocaleLowerCase() === "one_time"
		) {
			return (
				<div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white">
					<FaInfinity className="h-3 w-3" />
					Lifetime Access
				</div>
			);
		}

		if (
			isSubscription &&
			(billingInterval === "monthly" || billingInterval === "annual")
		) {
			const isYearly =
				billingInterval.toLocaleLowerCase() === "yearly" ||
				billingInterval.toLocaleLowerCase() === "annual";

			return (
				<div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white">
					<FaCalendarAlt className="h-3 w-3" />
					{isYearly ? "Annual Billing" : "Monthly Billing"}
				</div>
			);
		}

		return;
	};

	const getStatusBadge = () => {
		if (
			!hasActiveSubscription &&
			billingInterval?.toLocaleLowerCase() != "one_time"
		) {
			return (
				<div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/60">
					<FaClock className="h-3 w-3" />
					Inactive
				</div>
			);
		}

		if (subscriptionStatus?.toLocaleLowerCase() === "active") {
			return (
				<div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400">
					<FaCheckCircle className="h-3 w-3" />
					Active
				</div>
			);
		}

		return (
			<div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/60">
				<FaClock className="h-3 w-3" />
				{subscriptionStatus}
			</div>
		);
	};

	const formatDate = (dateString: string | undefined) => {
		if (!dateString) return "N/A";
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	return (
		<div className="min-h-screen p-4 sm:p-4 lg:p-5">
			<div className="mx-auto w-full max-w-none space-y-3">
				{/* Subscription Overview */}
				<div className="grid auto-rows-fr gap-4 lg:grid-cols-4">
					{/* Current Plan */}
					<div className="flex flex-col lg:col-span-3">
						<div className="flex w-full flex-1 flex-col justify-between rounded-2xl border border-zinc-800/50 bg-zinc-900/30 px-5 py-4 text-zinc-100 backdrop-blur-xl transition-all duration-300 hover:border-zinc-700/50 hover:bg-zinc-800/40">
							<div className="mb-4 flex items-start justify-between">
								<div className="flex items-center gap-3">
									<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800/50">
										{getPlanIcon(currentPlan.planType)}
									</div>
									<div>
										<h3 className="text-lg font-semibold">Current Plan</h3>
										<div className="mt-1 flex items-center gap-2">
											{getBillingBadge()}
											{getStatusBadge()}
										</div>
									</div>
								</div>

								<div className="flex flex-col gap-2">
									{canUpgrade && (
										<Button
											asChild
											className="flex items-center justify-center gap-2 rounded-lg border border-zinc-700/50 bg-zinc-800/30 px-4 py-2 text-sm font-medium text-zinc-100 transition-all duration-200 hover:border-zinc-600/70 hover:bg-zinc-700/40"
										>
											<Link href={"/pricing"}>Upgrade Plan</Link>
										</Button>
									)}
								</div>
							</div>

							<div className="mt-auto space-y-4">
								<div className="space-y-1">
									<p className="text-2xl font-bold text-zinc-100">
										{currentPlan.name}
									</p>
									{isLifetime && (
										<p className="text-sm text-zinc-400">
											You have lifetime access to this plan
										</p>
									)}
									{isSubscription && (
										<p className="text-sm text-zinc-400">
											Your subscription is active and will renew automatically
										</p>
									)}
								</div>

								{/* Subscription Details */}
								{hasActiveSubscription && !isLifetime && (
									<div className="grid gap-3 border-t border-zinc-800/50 pt-3 sm:grid-cols-2">
										{billingInterval && (
											<div className="space-y-1">
												<p className="text-xs uppercase tracking-wide text-zinc-500">
													Billing Cycle
												</p>
												<p className="text-sm font-medium capitalize text-zinc-300">
													{billingInterval === "monthly"
														? "Monthly"
														: billingInterval === "annual"
															? "Yearly"
															: billingInterval}
												</p>
											</div>
										)}
										{subscriptionEndDate && (
											<div className="space-y-1">
												<p className="text-xs uppercase tracking-wide text-zinc-500">
													{subscriptionStatus === "active"
														? "Renews On"
														: "Expires On"}
												</p>
												<p className="text-sm font-medium text-zinc-300">
													{formatDate(subscriptionEndDate)}
												</p>
											</div>
										)}
									</div>
								)}

								{/* Credits Display */}
								<div className="border-t border-zinc-800/50 pt-3">
									<div className="flex items-center justify-between">
										<div className="space-y-1">
											<p className="text-xs uppercase tracking-wide text-zinc-500">
												Available Credits
											</p>
											<p className="text-lg font-semibold text-zinc-100">
												{credits || 0} credits
											</p>
										</div>
										<Button
											className="flex items-center justify-center gap-2 rounded-lg border border-purple-700/50 bg-purple-800/20 px-3 py-1.5 text-xs font-medium text-purple-300 transition-all duration-200 hover:border-purple-600/70 hover:bg-purple-700/30"
											asChild
										>
											<Link href={"/pricing"}>Top Up Credits</Link>
										</Button>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Usage Summary */}
					<div className="flex w-full flex-col">
						<div className="flex flex-1 flex-col justify-between rounded-2xl border border-zinc-800/50 bg-zinc-900/30 px-5 py-4 text-zinc-100 backdrop-blur-xl transition-all duration-300 hover:border-zinc-700/50 hover:bg-zinc-800/40">
							<h3 className="mb-4 text-lg font-semibold">Usage Summary</h3>

							{/* Workspaces */}
							<div className="mb-4 w-full">
								<div className="mb-1.5 flex items-center justify-between">
									<div className="flex items-center gap-2">
										<FaUsers className="h-3.5 w-3.5 text-zinc-400" />
										<span className="text-sm font-medium">Workspaces</span>
									</div>
									<span className="text-xs text-zinc-400">
										{usageStats.activeWorkspace}
									</span>
								</div>
							</div>

							{/* Repositories */}
							<div className="mb-4 w-full">
								<div className="mb-1.5 flex items-center justify-between">
									<div className="flex items-center gap-2">
										<FaGithub className="h-3.5 w-3.5 text-zinc-400" />
										<span className="text-sm font-medium">Repositories</span>
									</div>
									<span className="text-xs text-zinc-400">
										{usageStats.repositoriesUsed}
									</span>
								</div>
							</div>

							{/* Social Integrations */}
							<div className="mb-4 w-full">
								<div className="mb-1.5 flex items-center justify-between">
									<div className="flex items-center gap-2">
										<FaShare className="h-3.5 w-3.5 text-zinc-400" />
										<span className="text-sm font-medium">Social Accounts</span>
									</div>
									<span className="text-xs text-zinc-400">
										{usageStats.socialsUsed}
									</span>
								</div>
							</div>

							{/* Posts */}
							<div className="mb-4 w-full">
								<div className="mb-1.5 flex items-center justify-between">
									<div className="flex items-center gap-2">
										<FaFileAlt className="h-3.5 w-3.5 text-zinc-400" />
										<span className="text-sm font-medium">Posts</span>
									</div>
									<span className="text-xs text-zinc-400">
										{usageStats.postsUsed}
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Billing History */}
				<div className="flex w-full flex-1 flex-col justify-between rounded-2xl border border-zinc-800/50 bg-zinc-900/30 px-5 py-4 text-zinc-100 backdrop-blur-xl transition-all duration-300 hover:border-zinc-700/50 hover:bg-zinc-800/40">
					<BillingHistory />
				</div>
			</div>
		</div>
	);
}
