/* eslint-disable unicorn/consistent-function-scoping */
"use client";

import Link from "next/link";
import {
	FaCrown,
	FaExclamationTriangle,
	FaFileAlt,
	FaGithub,
	FaHeart,
	FaLightbulb,
	FaShare,
	FaUsers,
} from "react-icons/fa";

import useOrganizationStats from "@/hooks/core/stats/use-organization-stats";
import useUserStore from "@/zustand/useuser-store";

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
	const useStore = useUserStore();
	const { summary, isStatsLoading, isStatsError } = useOrganizationStats();

	// Get stats from the organization stats hook
	const totalPosts = summary?.total_posts || 0;
	const totalSocials = summary?.total_socials || 0;
	const totalRepositories = summary?.total_repos || 0;
	const totalWorkspaces = summary?.total_organizations || 0;

	// Validate all required fields before usage
	const userPlanType = useStore.plan.toLowerCase();

	const currentPlanData = pricingData.plans.find(
		plan => plan.name.toLowerCase() === userPlanType,
	);

	// Show loading state
	if (isStatsLoading) {
		return (
			<div className="min-h-screen bg-zinc-950 p-4">
				<div className="mx-auto w-full max-w-none">
					<div className="w-full rounded-2xl border border-zinc-800/50 bg-zinc-900/30 px-6 py-8 text-zinc-100 backdrop-blur-xl">
						<div className="text-center">
							<div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-zinc-300"></div>
							<p className="text-lg font-medium">
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
			<div className="min-h-screen bg-zinc-950 p-4">
				<div className="mx-auto w-full max-w-none">
					<div className="w-full rounded-2xl border border-zinc-800/50 bg-zinc-900/30 px-6 py-8 text-zinc-100 backdrop-blur-xl">
						<div className="text-center">
							<FaExclamationTriangle className="mx-auto mb-4 h-12 w-12 text-zinc-400" />
							<p className="text-lg font-medium">Error loading billing data</p>
							<p className="mt-2 text-sm text-zinc-400">{"Unknown error"}</p>
						</div>
					</div>
				</div>
			</div>
		);
	}

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

	return (
		<div className="min-h-screen p-4 sm:p-6 lg:p-8">
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
										<div className="mt-0.5 flex items-center gap-2"></div>
									</div>
								</div>

								<div className="flex flex-col gap-2">
									{canUpgrade && (
										<Link href={"/pricing"}>
											<Button
												asChild
												className="flex items-center justify-center gap-2 rounded-lg border border-zinc-700/50 bg-zinc-800/30 px-4 py-2 text-sm font-medium text-zinc-100 transition-all duration-200 hover:border-zinc-600/70 hover:bg-zinc-700/40"
											>
												Upgrade Plan
											</Button>
										</Link>
									)}
								</div>
							</div>

							<div className="mt-auto grid place-items-end gap-4 sm:grid-cols-2">
								<div className="w-full space-y-1">
									<p className="text-xl font-bold text-zinc-100">
										{currentPlan.name}
									</p>
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

				{/* Features List */}
				{/* <div className="w-full rounded-2xl border border-zinc-800/50 bg-zinc-900/30 px-5 py-4 text-zinc-100 backdrop-blur-xl transition-all duration-300 hover:border-zinc-700/50 hover:bg-zinc-800/40">
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
				</div> */}

				{/* Billing History */}
				<BillingHistory />

				{/* Plan Selector Modal */}
				{/* <PlanSelector
					type={selectedAction}
					open={isUpgradeModalOpen}
					currentPlanId={userPlanType}
					onOpenChange={setIsUpgradeModalOpen}
					currentInterval={useStore.billing_interval as "monthly" | "annual"}
				/> */}
			</div>
		</div>
	);
}
