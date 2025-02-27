"use client";
import { Calendar, Crown, Loader2, Sparkles } from "lucide-react";
import React, { Suspense } from "react";
import { toast } from "sonner";

import {
	NotificationsList,
	NotificationsSkeleton,
} from "@/components/dashboard/notification-card";
import StatsCard from "@/components/dashboard/stats-card";
import StatsCardSkeleton from "@/components/dashboard/stats-card-loader";
import {
	UpcomingPosts,
	UpcomingPostsSkeleton,
} from "@/components/dashboard/upcoming-post";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useRetrieveMetrics from "@/hooks/core/metric";
import { useCheckAccess } from "@/hooks/plans/use-billing";
import { getDecryptedCookie } from "@/lib/cookies/getcookies";
import { subscriptionsCreation } from "@/server-actions/auth/subscribe";

const Page = () => {
	const hasAccess = useCheckAccess();
	const { scheduledPostsCount, generatedPostsCount, isMetricsLoading } =
		useRetrieveMetrics();
	const [isLoading, setIsLoading] = React.useState(false);

	// {
	// 	"plan": "Lifetime Deal",
	// 	"type": "monthly",
	// 	"iat": 1740625472,
	// 	"exp": 1740711872,
	// 	"jti": "vzFlGy_hAziiCDHxQ1X4Y"
	// }

	async function subscribePlan() {
		try {
			const planData = await getDecryptedCookie("subscribing");

			if (hasAccess) {
				toast.info("You already have access to the Pro plan.");
				return;
			}

			setIsLoading(true);
			const toastId = toast.loading("Preparing your checkout...");

			if (planData?.plan === "Pro") {
				const response = await subscriptionsCreation();

				if (response?.success && response?.data?.checkout_url) {
					toast.dismiss(toastId);
					toast.success("Redirecting to checkout...");
					window.open(response.data.checkout_url, "_blank");
				} else {
					toast.error("Something went wrong. Please try again.");
				}
			}
		} catch {
			toast.error("An error occurred. Please try again.");
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<section className="flex h-full w-full flex-col px-3 md:px-6">
			<div className="flex h-full flex-col">
				<header className="mb-8">
					<div className="mb-2 flex items-center justify-between">
						<h1 className="text-2xl font-bold text-zinc-100">
							Welcome to AI Commit
						</h1>
					</div>
					<p className="text-zinc-400">
						Your AI-powered LinkedIn content assistant
					</p>
				</header>

				<div className="mb-6 grid gap-6 sm:grid-cols-3">
					<Suspense fallback={<StatsCardSkeleton />}>
						{isMetricsLoading ? (
							<StatsCardSkeleton />
						) : (
							<StatsCard
								title="Scheduled Posts"
								value={scheduledPostsCount}
								icon={<Calendar className="h-4 w-4" />}
								description="Posts scheduled for this week"
							/>
						)}
					</Suspense>
					{/* 
					<Suspense fallback={<StatsCardSkeleton />}>
						<StatsCard
							title="Writing Style"
							value="Professional"
							icon={<Sparkles className="h-4 w-4" />}
							description="AI-optimized for your audience"
						/>
					</Suspense> */}

					<Suspense fallback={<StatsCardSkeleton />}>
						{isMetricsLoading ? (
							<StatsCardSkeleton />
						) : (
							<StatsCard
								title="AI Generated Posts"
								value={generatedPostsCount}
								icon={<Loader2 className="h-4 w-4" />}
								description="Created in the last 7 days"
							/>
						)}
					</Suspense>

					<Card className="border-zinc-700/50 bg-zinc-800/50 p-1">
						<CardHeader className="p-3">
							<div className="flex items-center justify-between">
								<CardTitle className="text-sm font-medium text-zinc-300">
									{hasAccess ? "Pro Plan" : "Free Plan"}
								</CardTitle>
								<Crown
									className={`h-4 w-4 ${hasAccess ? "text-amber-400" : "text-zinc-400"}`}
								/>
							</div>
						</CardHeader>
						<CardContent className="p-3">
							{hasAccess ? (
								<Button
									size="sm"
									onClick={subscribePlan}
									disabled
									className="w-full bg-zinc-700/50 text-zinc-200 transition-colors hover:bg-zinc-700"
								>
									Active Pro Plan
								</Button>
							) : (
								<Button
									size="sm"
									disabled={isLoading}
									className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-zinc-100 hover:from-violet-700 hover:to-indigo-700"
								>
									Upgrade to Pro
								</Button>
							)}
						</CardContent>
					</Card>
				</div>

				<div className="grid min-h-0 flex-1 gap-6 lg:grid-cols-2">
					<Card className="border-zinc-700/50 bg-zinc-800/50">
						<CardHeader>
							<CardTitle className="text-zinc-100">
								Recent Notifications
							</CardTitle>
						</CardHeader>
						<CardContent className="p-0">
							<Suspense fallback={<NotificationsSkeleton />}>
								<NotificationsList isPaid={hasAccess} />
							</Suspense>
						</CardContent>
					</Card>

					<Card className="border-zinc-700/50 bg-zinc-800/50">
						<CardHeader>
							<CardTitle className="text-zinc-100">Upcoming Posts</CardTitle>
						</CardHeader>
						<CardContent className="p-0">
							<Suspense fallback={<UpcomingPostsSkeleton />}>
								<UpcomingPosts />
							</Suspense>
						</CardContent>
					</Card>
				</div>
			</div>
		</section>
	);
};

export default Page;
