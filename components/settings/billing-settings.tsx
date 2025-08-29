"use client";

import Link from "next/link";
import { useState } from "react";
import {
	FaCheck,
	FaCrown,
	FaExclamationTriangle,
	FaFilter,
	FaGithub,
	FaHeart,
	FaLightbulb,
	FaPlus,
	FaUsers,
} from "react-icons/fa";

import useRetrieveConnectedRepos from "@/hooks/core/repo/get-repo-hook";
// eslint-disable-next-line import/no-unresolved
import { useBillingPortal } from "@/hooks/settings/use-billing";
import { useLimitUI } from "@/hooks/use-limit-ui";
import { FEATURE_LIMITS } from "@/lib/constants/feature-limits";
import useOrganizationStore from "@/zustand/useorganization-store";
import useUserStore from "@/zustand/useuser-store";

import { pricingData } from "../landing/pricing/data";
import PlanSelector from "../landing/pricing/v4/payment-selector";
import { Button } from "../ui/button";

interface CurrentPlan {
	name: string;
	isPaid: boolean;
	features: string[];
	renewalDate: string;
	planType: "basic" | "pro" | "studio";
	status: "active" | "inactive" | "pending";
	price: {
		monthly: number;
		annual: number;
	};
}

interface UsageStats {
	workspaceLimit: number;
	activeWorkspace: number;
	repositoriesUsed: number;
	repositoriesLimit: number;
}

// Extended dummy billing history data
const dummyBillingHistory = [
	{
		date: "Aug 03, 2025",
		description: "Pro Plan - Monthly",
		amount: "$29.00",
		status: "paid",
	},
	{
		date: "Jul 03, 2025",
		description: "Pro Plan - Monthly",
		amount: "$29.00",
		status: "paid",
	},
	{
		date: "Jun 03, 2025",
		description: "Pro Plan - Monthly",
		amount: "$29.00",
		status: "failed",
	},
	{
		date: "May 03, 2025",
		description: "Pro Plan - Monthly",
		amount: "$29.00",
		status: "paid",
	},
	{
		date: "Apr 03, 2025",
		description: "Pro Plan - Monthly",
		amount: "$29.00",
		status: "paid",
	},
	{
		date: "Mar 03, 2025",
		description: "Pro Plan - Monthly",
		amount: "$29.00",
		status: "paid",
	},
	{
		date: "Feb 03, 2025",
		description: "Pro Plan - Monthly",
		amount: "$29.00",
		status: "failed",
	},
	{
		date: "Jan 03, 2025",
		description: "Pro Plan - Monthly",
		amount: "$29.00",
		status: "paid",
	},
	{
		date: "Dec 03, 2024",
		description: "Pro Plan - Monthly",
		amount: "$29.00",
		status: "paid",
	},
	{
		date: "Nov 03, 2024",
		description: "Pro Plan - Monthly",
		amount: "$29.00",
		status: "paid",
	},
];

export default function BillingSettings() {
	const useStore = useUserStore();
	const { organizations } = useOrganizationStore();
	const { totalRepositories } = useRetrieveConnectedRepos();
	const [selectedAction, setSelectedAction] = useState<
		"upgrade" | "downgrade" | "all" | undefined
	>("upgrade");
	const [historyFilter, setHistoryFilter] = useState("all");
	const [visibleHistoryItems, setVisibleHistoryItems] = useState(5);
	const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

	const orgCount = organizations.length;
	const { data: billingUrl } = useBillingPortal();

	const workspaceLimitUI = useLimitUI({
		warningThreshold: 80,
		currentCount: orgCount,
		limitType: "workspaces",
		limitId: FEATURE_LIMITS.WORKSPACES,
	});

	const repoLimitUI = useLimitUI({
		warningThreshold: 80,
		limitType: "repositories",
		currentCount: totalRepositories,
		limitId: FEATURE_LIMITS.REPOSITORIES,
	});

	// Validate all required fields before usage
	const userPlanType = useStore.plan.toLowerCase();
	const subscriptionStatus = useStore.subscription_status.toLowerCase();

	const currentPlanData = pricingData.plans.find(
		plan => plan.name.toLowerCase() === userPlanType,
	);

	if (!currentPlanData) {
		return (
			<div className="min-h-screen bg-zinc-950 p-4">
				<div className="mx-auto w-full max-w-none">
					<div className="w-full rounded-2xl border border-zinc-800/50 bg-zinc-900/30 px-6 py-8 text-zinc-100 backdrop-blur-xl">
						<div className="text-center">
							<FaExclamationTriangle className="mx-auto mb-4 h-12 w-12 text-zinc-400" />
							<p className="text-lg font-medium">
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
		planType: userPlanType as "basic" | "pro" | "studio",
		status: subscriptionStatus as "active" | "inactive" | "pending",
		isPaid: userPlanType !== "basic",
		renewalDate: "in 2 months",
		features: currentPlanData.features.map(feature =>
			typeof feature === "string" ? feature : feature.name,
		),
		price: currentPlanData.price,
	};

	const usageStats: UsageStats = {
		repositoriesUsed: totalRepositories,
		repositoriesLimit: repoLimitUI.limit,
		activeWorkspace: organizations.length,
		workspaceLimit: workspaceLimitUI.limit,
	};

	// Get status configuration
	const getStatusConfig = (status: string) => {
		switch (status) {
			case "active": {
				return {
					badge: "bg-zinc-800/50 text-zinc-300 border-zinc-700/50",
					icon: <FaCheck className="h-3 w-3" />,
					message: "Your subscription is active and running smoothly",
					color: "text-zinc-300",
				};
			}
			case "inactive": {
				return {
					badge: "bg-zinc-800/50 text-zinc-300 border-zinc-700/50",
					icon: <FaExclamationTriangle className="h-3 w-3" />,
					message: `Your subscription is inactive and will end ${currentPlan.renewalDate}`,
					color: "text-zinc-400",
				};
			}
			case "pending": {
				return {
					badge: "bg-zinc-800/50 text-zinc-300 border-zinc-700/50",
					icon: <FaCrown className="h-3 w-3" />,
					message: "Your subscription change is being processed",
					color: "text-zinc-300",
				};
			}
			default: {
				return {
					badge: "bg-zinc-800/50 text-zinc-400 border-zinc-700/50",
					icon: <FaCheck className="h-3 w-3" />,
					message: "Subscription status unknown",
					color: "text-zinc-400",
				};
			}
		}
	};

	const statusConfig = getStatusConfig(currentPlan.status);

	const canUpgrade = currentPlan.planType !== "studio";
	const canDowngrade = currentPlan.planType !== "basic";

	const handleUpgrade = () => {
		setSelectedAction("upgrade");
		setIsUpgradeModalOpen(true);
	};

	const handleDowngrade = () => {
		setSelectedAction("downgrade");
		setIsUpgradeModalOpen(true);
	};

	// Calculate usage percentages
	const workspacePercentage =
		usageStats.workspaceLimit === -1
			? 0
			: Math.min(
					(usageStats.activeWorkspace / usageStats.workspaceLimit) * 100,
					100,
				);
	const repoPercentage =
		usageStats.repositoriesLimit === -1
			? 0
			: Math.min(
					(usageStats.repositoriesUsed / usageStats.repositoriesLimit) * 100,
					100,
				);

	const formatRenewalDate = () => {
		if (useStore.pending_plan_effective_date) {
			return new Date(useStore.pending_plan_effective_date).toLocaleDateString(
				"en-US",
				{
					month: "short",
					day: "numeric",
					year: "numeric",
				},
			);
		}
		return "Oct 26, 2024";
	};

	const getPlanIcon = (planType: string) => {
		switch (planType) {
			case "basic": {
				return <FaHeart className="h-5 w-5 text-zinc-400" />;
			}
			case "pro": {
				return <FaLightbulb className="h-5 w-5 text-zinc-300" />;
			}
			case "studio": {
				return <FaCrown className="h-5 w-5 text-zinc-200" />;
			}
			default: {
				return <FaHeart className="h-5 w-5 text-zinc-400" />;
			}
		}
	};

	const filteredHistory = dummyBillingHistory.filter(
		item => historyFilter === "all" || item.status === historyFilter,
	);

	const loadMoreHistory = () => {
		setVisibleHistoryItems(previous =>
			Math.min(previous + 5, filteredHistory.length),
		);
	};

	const hasMoreHistory = visibleHistoryItems < filteredHistory.length;

	return (
		<div className="min-h-screen">
			<div className="mx-auto w-full max-w-none space-y-6">
				{/* Header */}
				<div className="space-y-1">
					<h1 className="text-2xl font-bold tracking-tight text-zinc-100">
						Billing
					</h1>
					<p className="text-sm text-zinc-400">
						Manage your subscription, view usage all in one place.
					</p>
				</div>

				{/* Subscription Overview */}
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
										<div className="mt-0.5 flex items-center gap-2">
											<p className="text-sm text-zinc-400">
												{useStore.billing_interval === "annual"
													? "Annual"
													: "Monthly"}{" "}
												plan
											</p>
											<span
												className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${statusConfig.badge}`}
											>
												{statusConfig.icon}
												<span className="capitalize">{currentPlan.status}</span>
											</span>
										</div>
									</div>
								</div>

								<div className="flex flex-col gap-2">
									{canUpgrade && (
										<Button
											onClick={handleUpgrade}
											className="flex items-center justify-center gap-2 rounded-lg border border-zinc-700/50 bg-zinc-800/30 px-4 py-2 text-sm font-medium text-zinc-100 transition-all duration-200 hover:border-zinc-600/70 hover:bg-zinc-700/40"
										>
											Upgrade Plan
										</Button>
									)}
									{canDowngrade && (
										<Button
											onClick={handleDowngrade}
											className="rounded-lg border border-zinc-700/50 bg-zinc-800/30 px-4 py-2 text-sm font-medium text-zinc-400 transition-all duration-200 hover:border-zinc-600/70 hover:bg-zinc-700/40 hover:text-zinc-300"
										>
											Downgrade Plan
										</Button>
									)}
								</div>
							</div>

							<div className="mt-auto grid place-items-end gap-4 sm:grid-cols-2">
								<div className="w-full space-y-1">
									<p className="text-xl font-bold text-zinc-100">
										{currentPlan.name}
									</p>
									<div className="text-2xl font-bold text-zinc-100">
										{currentPlan.isPaid ? (
											<>
												$
												{useStore.billing_interval === "annual"
													? currentPlan.price.annual
													: currentPlan.price.monthly}
												<span className="text-base font-normal text-zinc-400">
													/
													{useStore.billing_interval === "annual"
														? "year"
														: "month"}
												</span>
											</>
										) : (
											<>
												$0
												<span className="text-base font-normal text-zinc-400">
													/month
												</span>
											</>
										)}
									</div>
									{currentPlan.isPaid && (
										<p className="text-xs text-zinc-500">
											Renews {formatRenewalDate()}
										</p>
									)}
								</div>
								{currentPlan.isPaid && (
									<Button asChild variant={"secondary"} className="rounded-lg">
										<Link href={`${billingUrl}`}>Manage subscription</Link>
									</Button>
								)}
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
										{usageStats.activeWorkspace} /{" "}
										{usageStats.workspaceLimit === -1
											? "∞"
											: usageStats.workspaceLimit}
									</span>
								</div>
								{usageStats.workspaceLimit !== -1 && (
									<div className="h-1.5 w-full rounded-full bg-zinc-800">
										<div
											className="h-1.5 rounded-full bg-zinc-400 transition-all duration-300"
											style={{
												width: `${Math.min(workspacePercentage, 100)}%`,
											}}
										></div>
									</div>
								)}
							</div>

							{/* Repositories */}
							<div className="mb-4 w-full">
								<div className="mb-1.5 flex items-center justify-between">
									<div className="flex items-center gap-2">
										<FaGithub className="h-3.5 w-3.5 text-zinc-400" />
										<span className="text-sm font-medium">Repositories</span>
									</div>
									<span className="text-xs text-zinc-400">
										{usageStats.repositoriesUsed} /{" "}
										{usageStats.repositoriesLimit === -1
											? "∞"
											: usageStats.repositoriesLimit}
									</span>
								</div>
								{usageStats.repositoriesLimit !== -1 && (
									<div className="h-1.5 w-full rounded-full bg-zinc-800">
										<div
											className="h-1.5 rounded-full bg-zinc-300 transition-all duration-300"
											style={{ width: `${Math.min(repoPercentage, 100)}%` }}
										></div>
									</div>
								)}
							</div>

							<div className="mb-4 w-full">
								<div className="mb-1.5 flex items-center justify-between">
									<div className="flex items-center gap-2">
										<FaGithub className="h-3.5 w-3.5 text-zinc-400" />
										<span className="text-sm font-medium">Repositories</span>
									</div>
									<span className="text-xs text-zinc-400">
										{usageStats.repositoriesUsed} /{" "}
										{usageStats.repositoriesLimit === -1
											? "∞"
											: usageStats.repositoriesLimit}
									</span>
								</div>
								{usageStats.repositoriesLimit !== -1 && (
									<div className="h-1.5 w-full rounded-full bg-zinc-800">
										<div
											className="h-1.5 rounded-full bg-zinc-300 transition-all duration-300"
											style={{ width: `${Math.min(repoPercentage, 100)}%` }}
										></div>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>

				{/* Features List */}
				<div className="w-full rounded-2xl border border-zinc-800/50 bg-zinc-900/30 px-5 py-4 text-zinc-100 backdrop-blur-xl transition-all duration-300 hover:border-zinc-700/50 hover:bg-zinc-800/40">
					<h3 className="mb-3 text-lg font-semibold">Plan Features</h3>
					<div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{currentPlan.features.slice(0, 12).map((feature, index) => (
							<div key={index} className="flex items-start gap-2.5">
								<div className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border border-zinc-700/50 bg-zinc-800/50">
									<FaCheck className="h-2.5 w-2.5 text-zinc-400" />
								</div>
								<span className="text-sm leading-relaxed text-zinc-300">
									{feature}
								</span>
							</div>
						))}
					</div>
				</div>

				{/* Billing History */}
				<div className="w-full rounded-2xl border border-zinc-800/50 bg-zinc-900/30 px-5 py-4 text-zinc-100 backdrop-blur-xl transition-all duration-300 hover:border-zinc-700/50 hover:bg-zinc-800/40">
					<div className="mb-4 flex items-center justify-between">
						<h3 className="text-lg font-semibold">Billing History</h3>
						<div className="flex items-center gap-2">
							<FaFilter className="h-3.5 w-3.5 text-zinc-400" />
							<select
								value={historyFilter}
								onChange={event_ => setHistoryFilter(event_.target.value)}
								className="rounded-lg border border-zinc-700/50 bg-zinc-800/50 px-3 py-1 text-sm text-zinc-100 focus:border-zinc-600/70 focus:outline-none"
							>
								<option value="all">All</option>
								<option value="paid">Paid</option>
								<option value="failed">Failed</option>
							</select>
						</div>
					</div>

					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="border-b border-zinc-800/50">
									<th className="px-2 py-2 text-left text-sm font-medium text-zinc-400">
										Date
									</th>
									<th className="px-2 py-2 text-left text-sm font-medium text-zinc-400">
										Description
									</th>
									<th className="px-2 py-2 text-left text-sm font-medium text-zinc-400">
										Amount
									</th>
									<th className="px-2 py-2 text-left text-sm font-medium text-zinc-400">
										Status
									</th>
								</tr>
							</thead>
							<tbody>
								{filteredHistory
									.slice(0, visibleHistoryItems)
									.map((item, index) => (
										<tr key={index} className="border-b border-zinc-800/30">
											<td className="px-2 py-2.5 text-sm text-zinc-300">
												{item.date}
											</td>
											<td className="px-2 py-2.5 text-sm text-zinc-300">
												{item.description}
											</td>
											<td className="px-2 py-2.5 text-sm text-zinc-300">
												{item.amount}
											</td>
											<td className="px-2 py-2.5">
												<span
													className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
														item.status === "paid"
															? "border border-zinc-700/50 bg-zinc-800/50 text-zinc-300"
															: "border border-zinc-700/50 bg-zinc-800/50 text-zinc-400"
													}`}
												>
													{item.status === "paid" ? (
														<FaCheck className="h-2.5 w-2.5" />
													) : (
														<FaExclamationTriangle className="h-2.5 w-2.5" />
													)}
													{item.status === "paid" ? "Paid" : "Failed"}
												</span>
											</td>
										</tr>
									))}
							</tbody>
						</table>
					</div>

					{hasMoreHistory && (
						<div className="mt-4 text-center">
							<Button
								onClick={loadMoreHistory}
								className="mx-auto flex items-center gap-2 rounded-lg border border-zinc-700/50 bg-zinc-800/30 px-4 py-2 text-sm font-medium text-zinc-100 transition-all duration-200 hover:border-zinc-600/70 hover:bg-zinc-700/40"
							>
								<FaPlus className="h-3 w-3" />
								Load More ({filteredHistory.length - visibleHistoryItems}{" "}
								remaining)
							</Button>
						</div>
					)}
				</div>

				{/* Plan Selector Modal */}
				<PlanSelector
					type={selectedAction}
					open={isUpgradeModalOpen}
					currentPlanId={userPlanType}
					onOpenChange={setIsUpgradeModalOpen}
					currentInterval={useStore.billing_interval as "monthly" | "annual"}
				/>
			</div>
		</div>
	);
}
