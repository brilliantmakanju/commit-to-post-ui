"use client";

import { formatDistanceToNow, parseISO } from "date-fns";
import {
	AlertTriangle,
	Check,
	CreditCard,
	Crown,
	ExternalLink,
	Users,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

// eslint-disable-next-line import/no-unresolved
import { Badge } from "@/components/ui/badge";
// eslint-disable-next-line import/no-unresolved
import { Button } from "@/components/ui/button";
// eslint-disable-next-line import/no-unresolved
import { Separator } from "@/components/ui/separator";
import useRetrieveConnectedRepos from "@/hooks/core/repo/get-repo-hook";
// eslint-disable-next-line import/no-unresolved
import { useBillingPortal } from "@/hooks/settings/use-billing";
import { useLimitUI } from "@/hooks/use-limit-ui";
import { FEATURE_LIMITS } from "@/lib/constants/feature-limits";
import useOrganizationStore from "@/zustand/useorganization-store";

import { pricingData } from "../landing/pricing/data";

type FeatureCategory =
	| "Content Creation"
	| "Integrations"
	| "Support"
	| "Other";

interface CurrentPlan {
	name: string;
	isPaid: boolean;
	features: string[];
	renewalDate: string;
	planType: "free" | "pro" | "studio";
	status: "active" | "unactive" | "pending";
}

interface UsageStats {
	activeWorkspace: number;
	workspaceLimit: number;
	repositoriesUsed: number;
	repositoriesLimit: number;
}

const classifyFeature = (featureName: string): FeatureCategory => {
	const lower = featureName.toLowerCase();

	if (
		lower.includes("post") ||
		lower.includes("tone") ||
		lower.includes("writing")
	) {
		return "Content Creation";
	}

	if (
		lower.includes("linkedin") ||
		lower.includes("slack") ||
		lower.includes("discord") ||
		lower.includes("github") ||
		lower.includes("integration")
	) {
		return "Integrations";
	}

	if (
		lower.includes("support") ||
		lower.includes("documentation") ||
		lower.includes("account")
	) {
		return "Support";
	}

	return "Other";
};

export default function BillingSettings() {
	const router = useRouter();
	const { data: session } = useSession();
	const { organizations } = useOrganizationStore();
	const { totalRepositories } = useRetrieveConnectedRepos();

	const user = session?.user;
	const orgCount = organizations.length;
	const { data: billingUrl } = useBillingPortal();

	if (!user) {
		throw new Error("User session is not available.");
	}

	const renewalDate = user.subscription_end_date as unknown as string;

	// Validate all required fields before usage
	const userPlanType = user.plan.toLocaleLowerCase() as unknown as
		| "free"
		| "pro"
		| "studio";
	if (!userPlanType) {
		throw new Error("User plan type is missing.");
	}

	const subscriptionStatus =
		user.subscription_status.toLocaleLowerCase() as unknown as
			| "active"
			| "unactive"
			| "pending";
	if (!subscriptionStatus) {
		throw new Error("Subscription status is missing.");
	}

	const currentPlanData = pricingData.plans.find(
		plan => plan.name.toLocaleLowerCase() === userPlanType,
	);

	if (!currentPlanData) {
		throw new Error(`Plan "${userPlanType}" not found in pricing config.`);
	}

	const currentPlan: CurrentPlan = {
		renewalDate: formatDistanceToNow(parseISO(renewalDate), {
			addSuffix: true,
		}),
		planType: userPlanType,
		status: subscriptionStatus,
		name: `${userPlanType} Plan`,
		isPaid: userPlanType !== "free",
		features: currentPlanData.features.map(f =>
			typeof f === "string" ? f : f.name.toLocaleLowerCase(),
		),
	};

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

	// Usage stats - this would come from your API
	const usageStats: UsageStats = {
		activeWorkspace: orgCount,
		repositoriesLimit: repoLimitUI.limit,
		repositoriesUsed: totalRepositories,
		workspaceLimit: workspaceLimitUI.limit,
	};

	// Get available upgrade/downgrade options
	const availablePlans = pricingData.plans.filter(
		plan => plan.name.toLocaleLowerCase() !== currentPlan.planType,
	);

	const getStatusConfig = (status: CurrentPlan["status"]) => {
		switch (status) {
			case "active": {
				return {
					badge:
						"border border-emerald-600/30 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30",
					icon: <Check className="h-4 w-4" />,
					message: "Your subscription is active and running smoothly",
					color: "text-emerald-400",
				};
			}
			case "unactive": {
				return {
					badge:
						"border border-red-600/30 bg-red-600/20 text-red-400 hover:bg-red-600/30",
					icon: <AlertTriangle className="h-4 w-4" />,
					message:
						"Your subscription has been unactive and will end on " +
						currentPlan.renewalDate,
					color: "text-red-400",
				};
			}
			case "pending": {
				return {
					badge:
						"border border-amber-600/30 bg-amber-600/20 text-amber-400 hover:bg-amber-600/30",
					icon: <Crown className="h-4 w-4" />,
					message: "Your subscription change is being processed",
					color: "text-amber-400",
				};
			}
			default: {
				return {
					badge:
						"border border-zinc-600/30 bg-zinc-600/20 text-zinc-400 hover:bg-zinc-600/30",
					icon: <Check className="h-4 w-4" />,
					message: "Subscription status unknown",
					color: "text-zinc-400",
				};
			}
		}
	};

	const statusConfig = getStatusConfig(currentPlan.status);

	// Helper function to get usage limits from plan features
	const getUsageLimits = () => {
		const limits = {
			workspaces: { used: orgCount, limit: workspaceLimitUI.limit },
			repositories: { used: totalRepositories, limit: repoLimitUI.limit },
		};

		switch (currentPlan.planType) {
			case "free":
			case "pro":
			case "studio": {
				return limits;
			}
			default: {
				return;
			} // or handle unknown plan types gracefully
		}
	};

	const limits = getUsageLimits();

	const categorizedFeatures: Record<FeatureCategory, string[]> = {
		"Content Creation": [],
		Integrations: [],
		Support: [],
		Other: [],
	};

	currentPlanData.features.forEach(f => {
		const name = typeof f === "string" ? f : f.name;
		const category = classifyFeature(name);
		categorizedFeatures[category].push(name);
	});

	return (
		<div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
			<div className="mb-8">
				<h1 className="text-3xl font-light tracking-tight text-zinc-100">
					Billing
				</h1>
				<p className="mt-2 text-base text-zinc-400">
					Manage your subscription and billing details
				</p>
			</div>

			{/* Main Layout - Stack on mobile, side-by-side on desktop */}
			<div className="space-y-6">
				{/* Top Row - Main Plan Card + Sidebar */}
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
					{/* Main Plan Card */}
					<div className="lg:col-span-2">
						<div className="group relative overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-800/90 backdrop-blur-xl transition-all duration-300 hover:border-zinc-700/60 hover:bg-zinc-800/95">
							<div className="absolute inset-0 bg-gradient-to-br from-zinc-700/10 via-transparent to-zinc-900/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

							<div className="relative p-6">
								{/* Header */}
								<div className="mb-6 flex items-center gap-3">
									<div className="rounded-full bg-zinc-700/50 p-2.5">
										<CreditCard className="h-5 w-5 text-zinc-300" />
									</div>
									<div className="flex-1">
										<div className="flex items-center gap-2">
											<h2 className="text-xl font-medium capitalize text-zinc-100">
												{currentPlan.name}
											</h2>
											{currentPlanData?.badge && (
												<Badge className="border border-zinc-600/30 bg-zinc-600/20 text-zinc-300">
													{currentPlanData.badge}
												</Badge>
											)}
										</div>
										<p className="text-sm text-zinc-400">
											{currentPlan.planType === "free"
												? "Free plan"
												: "Active subscription"}
										</p>
									</div>
								</div>

								{/* Status Section */}
								<div className="mb-6 rounded-xl border border-zinc-700/50 bg-zinc-900/50 p-4">
									<div className="mb-3 flex items-center gap-3">
										<Badge className={statusConfig.badge}>
											{statusConfig.icon}
											<span className="ml-1 capitalize">
												{currentPlan.status}
											</span>
										</Badge>
										{currentPlan.isPaid && (
											<span className="text-sm text-zinc-400">
												{currentPlan.status === "unactive" ? "Ends" : "Renews"}{" "}
												- {currentPlan.renewalDate}
											</span>
										)}
									</div>
									<p className={`text-sm ${statusConfig.color}`}>
										{statusConfig.message}
									</p>
								</div>

								{/* Action Buttons */}
								<div>
									<Separator className="mb-4 bg-zinc-700/50" />
									<div className="flex flex-col gap-3 sm:flex-row">
										{currentPlan.isPaid ? (
											<Button
												asChild
												className="flex-1 bg-zinc-100 font-medium text-zinc-900 shadow-sm transition-all duration-200 hover:bg-white"
											>
												<Link href={`${billingUrl}`}>
													<ExternalLink className="mr-2 h-4 w-4" />
													Manage Billing
												</Link>
											</Button>
										) : (
											<Button
												className="w-full bg-zinc-100 font-medium text-zinc-900 shadow-sm transition-all duration-200 hover:bg-white"
												onClick={() => router.push("/pricing")}
											>
												<Crown className="mr-2 h-4 w-4" />
												Upgrade Plan
											</Button>
										)}
									</div>
									{currentPlan.isPaid && (
										<p className="mt-3 text-xs leading-relaxed text-zinc-500">
											Powered by Paddle secure billing
										</p>
									)}
								</div>
							</div>
						</div>
					</div>

					{/* Sidebar - Unified Card */}
					<div className="lg:col-span-1">
						<div className="group relative h-full overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-800/90 backdrop-blur-xl transition-all duration-300 hover:border-zinc-700/60 hover:bg-zinc-800/95">
							<div className="absolute inset-0 bg-gradient-to-br from-zinc-700/10 via-transparent to-zinc-900/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

							<div className="relative flex h-full flex-col p-5">
								{/* Usage Stats Section */}
								<div className="mb-6">
									<div className="mb-4 flex items-center gap-3">
										<div className="rounded-full bg-zinc-700/50 p-2">
											<Users className="h-4 w-4 text-zinc-300" />
										</div>
										<div>
											<h3 className="text-base font-medium text-zinc-100">
												Usage Stats
											</h3>
											<p className="text-xs text-zinc-400">
												Current month usage
											</p>
										</div>
									</div>

									<div className="space-y-4">
										{/* Workspace Usage */}
										<div>
											<div className="mb-2 flex items-center justify-between">
												<span className="text-sm text-zinc-400">
													Workspaces
												</span>
												<span className="text-sm font-medium text-zinc-200">
													{orgCount}/{workspaceLimitUI.limit}
												</span>
											</div>
											{/* {typeof limits?.workspaces?.limit === "number" && (
											)} */}
											<div className="h-1.5 w-full rounded-full bg-zinc-700/50">
												<div
													className="h-1.5 rounded-full bg-zinc-300 transition-all duration-300"
													style={{
														width: `${Math.min(
															(orgCount / workspaceLimitUI.limit) * 100,
															100,
														)}%`,
													}}
												></div>
											</div>
										</div>

										{/* Repositories Usage */}
										<div>
											<div className="mb-2 flex items-center justify-between">
												<span className="text-sm text-zinc-400">
													Repositories
												</span>
												<span className="text-sm font-medium text-zinc-200">
													{totalRepositories}/{repoLimitUI.limit}
												</span>
											</div>
											{/* {typeof limits?.repositories.limit === "number" && (
											)} */}
											<div className="h-1.5 w-full rounded-full bg-zinc-700/50">
												<div
													className="h-1.5 rounded-full bg-zinc-300 transition-all duration-300"
													style={{
														width: `${Math.min((totalRepositories / repoLimitUI.limit) * 100, 100)}%`,
													}}
												></div>
											</div>
										</div>
									</div>
								</div>

								{/* Plan Actions Section - Only show if not studio */}
								{currentPlan.planType !== "studio" && (
									<div className="flex-1">
										<Separator className="mb-4 bg-zinc-700/50" />
										<div className="mb-4 flex items-center gap-3">
											<div className="rounded-full bg-zinc-700/50 p-2">
												<Zap className="h-4 w-4 text-zinc-300" />
											</div>
											<div>
												<h3 className="text-base font-medium text-zinc-100">
													Upgrade Plan
												</h3>
												<p className="text-xs text-zinc-400">
													Switch to higher tier
												</p>
											</div>
										</div>

										<div className="space-y-2">
											{availablePlans.map(plan => {
												const isHigherTier =
													plan.name === "Studio" ||
													(plan.name === "Pro" &&
														currentPlan.planType === "free");

												if (!isHigherTier) return;

												return (
													<Button
														key={plan.name}
														size="sm"
														onClick={() => router.push("/pricing")}
														className="w-full bg-zinc-100 font-medium text-zinc-900 transition-all duration-200 hover:bg-white"
													>
														{plan.name === "Studio" ? (
															<Crown className="mr-2 h-4 w-4" />
														) : (
															<Users className="mr-2 h-4 w-4" />
														)}
														Upgrade to {plan.name}
													</Button>
												);
											})}
										</div>
									</div>
								)}

								{/* Unlimited Plan Badge for Studio */}
								{currentPlan.planType === "studio" && (
									<div className="flex flex-1 items-center justify-center">
										<div className="py-4 text-center">
											<div className="mx-auto mb-3 w-fit rounded-full bg-zinc-700/50 p-3">
												<Check className="h-5 w-5 text-zinc-300" />
											</div>
											<p className="text-sm font-medium text-zinc-200">
												Unlimited Access
											</p>
											<p className="mt-1 text-xs text-zinc-400">
												No usage restrictions
											</p>
										</div>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>

				{/* Bottom Row - Plan Features */}
				<div className="group relative overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-800/90 backdrop-blur-xl transition-all duration-300 hover:border-zinc-700/60 hover:bg-zinc-800/95">
					<div className="absolute inset-0 bg-gradient-to-br from-zinc-700/10 via-transparent to-zinc-900/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

					<div className="relative p-6 lg:p-8">
						<div className="mb-6 flex items-center gap-3">
							<div className="rounded-full bg-zinc-700/50 p-2.5">
								<Check className="h-5 w-5 text-zinc-300" />
							</div>
							<div>
								<h2 className="text-xl font-medium text-zinc-100">
									Plan Features
								</h2>
								<p className="text-sm text-zinc-400">
									What&lsquo;s included in your {currentPlan.name}
								</p>
							</div>
						</div>

						{/* Feature Grid */}
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
							{currentPlan.features.map((feature, index) => (
								<div
									key={index}
									className="group/feature flex items-start gap-3 text-sm"
								>
									<div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-zinc-100 transition-colors duration-200 group-hover/feature:bg-white">
										<Check className="h-3 w-3 text-zinc-900" />
									</div>
									<span className="leading-relaxed text-zinc-300 transition-colors duration-200 group-hover/feature:text-zinc-100">
										{feature}
									</span>
								</div>
							))}
						</div>

						{/* Feature Categories - Only show if categorizedFeatures has content */}
						{Object.keys(categorizedFeatures).some(
							key => categorizedFeatures[key as FeatureCategory]?.length > 0,
						) && (
							<div className="mt-6 border-t border-zinc-700/50 pt-6">
								<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
									{(
										Object.entries(categorizedFeatures) as [
											FeatureCategory,
											string[],
										][]
									).map(
										([category, features]) =>
											features.length > 0 && (
												<div key={category} className="space-y-3">
													<h4 className="flex items-center gap-2 text-sm font-medium text-zinc-200">
														<div className="h-2 w-2 rounded-full bg-zinc-500"></div>
														{category}
													</h4>
													<div className="space-y-1">
														{features.map((feature, index) => (
															<p
																key={index}
																className="text-xs leading-relaxed text-zinc-400"
															>
																• {feature}
															</p>
														))}
													</div>
												</div>
											),
									)}
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
