"use client";
import { ArrowUpRight, Calendar, Crown, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import React, { Suspense, useEffect, useState } from "react";
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
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useRetrieveMetrics from "@/hooks/core/metric";
import { useCheckAccess } from "@/hooks/plans/use-billing";
import { useLifetimeAccess } from "@/hooks/plans/use-ltd";
import useUserStore from "@/lib/zustand/useuser-store";

const Page = () => {
	const router = useRouter();
	const userStore = useUserStore();
	const hasAccess = useCheckAccess();
	const { data: userDetails } = useSession();
	const userHasLifetimeAccess = useLifetimeAccess();
	const [postFilter, setPostFilter] = useState("all");
	const [isLoading, setIsLoading] = React.useState(true);
	const { scheduledPostsCount, generatedPostsCount, isMetricsLoading } =
		useRetrieveMetrics();
	const [firstNameFromFull, lastNameFromFull] = userStore.full_name
		? userStore.full_name.split(" ")
		: ["", ""];
	useEffect(() => {
		// Check if document is fully loaded
		if (document.readyState === "complete") {
			setIsLoading(false);
		} else {
			// Add event listener for when everything is loaded
			const handleLoad = () => {
				setIsLoading(false);
			};

			window.addEventListener("load", handleLoad);

			// Alternative approach: Use a timeout to ensure minimum loading time
			// This helps prevent flickering if the page loads very quickly
			const timer = setTimeout(() => {
				setIsLoading(false);
			}, 500);

			// Cleanup
			return () => {
				window.removeEventListener("load", handleLoad);
				clearTimeout(timer);
			};
		}
	}, []);
	// Get first name only for welcome message
	const firstName =
		userDetails?.user?.first_name || userStore.full_name?.split(" ")[0] || "";

	async function subscribePlan() {
		if (hasAccess) {
			toast.info("You already have an active subscription.");
			return;
		}
		router.push("/pricing");
	}

	const userData = userStore.justUpdated
		? {
				firstName: firstNameFromFull || userDetails?.user?.first_name || "",
				lastName: lastNameFromFull || userDetails?.user?.last_name || "",
				email: userStore.email || userDetails?.user?.email || "",
			}
		: status === "loading"
			? {
					firstName: firstNameFromFull || "",
					lastName: lastNameFromFull || "",
					email: userStore.email || "",
				}
			: userDetails?.user?.type === "magic" && status === "authenticated"
				? {
						firstName: userDetails?.user?.first_name || firstNameFromFull || "",
						lastName: userDetails?.user?.last_name || lastNameFromFull || "",
						email: userDetails?.user?.email || userStore.email || "",
					}
				: {
						firstName: firstNameFromFull || userDetails?.user?.first_name || "",
						lastName: lastNameFromFull || userDetails?.user?.last_name || "",
						email: userStore.email || userDetails?.user?.email || "",
					};

	return (
		<section className="flex h-full w-full flex-col space-y-8 bg-[#0A0A0A] p-6">
			{/* Header - Simplified welcome message */}
			<div className="flex flex-col space-y-1">
				<h1 className="text-2xl font-medium text-white">
					{firstName ? `Welcome, ${userData.firstName}` : "Dashboard"}
				</h1>
				<p className="text-zinc-400">
					Your content overview and recent activity
				</p>
			</div>

			{/* Stats Cards */}
			<div className="grid gap-6 sm:grid-cols-3">
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

				<Card className="overflow-hidden border border-[#232323] bg-[#121212] transition-all hover:border-[#2A2A2A] hover:shadow-md">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium text-zinc-300">
							{userHasLifetimeAccess
								? "Lifetime Access"
								: hasAccess
									? "Pro Plan"
									: "Free Plan"}
						</CardTitle>
						{userHasLifetimeAccess ? (
							<div className="flex h-8 w-8 items-center justify-center rounded-md border border-[#232323] bg-[#1A1A1A] text-amber-500">
								<Sparkles className="h-4 w-4" />
							</div>
						) : (
							<div className="flex h-8 w-8 items-center justify-center rounded-md border border-[#232323] bg-[#1A1A1A]">
								<Crown
									className={`h-4 w-4 ${hasAccess ? "text-amber-500" : "text-zinc-500"}`}
								/>
							</div>
						)}
					</CardHeader>
					<CardContent>
						<div className="font-mono text-2xl font-bold text-white">
							{userHasLifetimeAccess
								? "Unlimited"
								: hasAccess
									? "Pro"
									: "Limited"}
						</div>
						<p className="mt-2 text-xs text-zinc-500">
							{userHasLifetimeAccess
								? "Full lifetime access to all features"
								: hasAccess
									? "Full access to all premium features"
									: "Upgrade for more features"}
						</p>
					</CardContent>
					<CardFooter className="pt-0">
						{userHasLifetimeAccess ? (
							<Button
								size="sm"
								disabled
								variant="outline"
								className="w-full border-[#232323] bg-[#1A1A1A] text-zinc-500"
							>
								Lifetime Access
							</Button>
						) : hasAccess ? (
							// <Link href="/pricing" className="w-full">
							<Button
								size="sm"
								disabled
								variant="outline"
								className="w-full border-[#232323] bg-[#1A1A1A] text-zinc-500"
							>
								Active Pro Plan
							</Button>
						) : (
							<Button
								onClick={() => subscribePlan()}
								size="sm"
								disabled={isMetricsLoading || isLoading}
								variant={"secondary"}
								className="w-full"
							>
								<span>Upgrade to Pro</span>
							</Button>
						)}
					</CardFooter>
				</Card>
			</div>

			{/* Functional Filter Tabs */}
			<div className="flex flex-wrap items-center justify-between gap-4">
				<Tabs
					value={postFilter}
					onValueChange={setPostFilter}
					className="w-auto"
				>
					<TabsList className="border border-[#232323] bg-[#1A1A1A]">
						<TabsTrigger
							value="all"
							className="text-zinc-400 data-[state=active]:bg-[#232323] data-[state=active]:text-white"
						>
							All Posts
						</TabsTrigger>
						<TabsTrigger
							value="scheduled"
							className="text-zinc-400 data-[state=active]:bg-[#232323] data-[state=active]:text-white"
						>
							Scheduled
						</TabsTrigger>
						<TabsTrigger
							value="published"
							className="text-zinc-400 data-[state=active]:bg-[#232323] data-[state=active]:text-white"
						>
							Published
						</TabsTrigger>
						<TabsTrigger
							value="drafted"
							className="text-zinc-400 data-[state=active]:bg-[#232323] data-[state=active]:text-white"
						>
							Drafts
						</TabsTrigger>
					</TabsList>
				</Tabs>
			</div>

			{/* Main Content */}
			<div className="grid h-full flex-1 gap-6 pb-[22px] lg:h-[500px] lg:grid-cols-2">
				<Card className="overflow-hidden border border-[#232323] bg-[#121212]">
					<CardHeader className="flex flex-row items-center justify-between">
						<CardTitle className="text-white">
							{postFilter === "all"
								? "Upcoming Posts"
								: postFilter === "scheduled"
									? "Scheduled Posts"
									: postFilter === "published"
										? "Published Posts"
										: "Draft Posts"}
						</CardTitle>

						<Link href={"/posts"}>
							<Button
								variant="ghost"
								size="sm"
								className="text-zinc-400 hover:bg-[#1A1A1A] hover:text-white"
							>
								View All <ArrowUpRight className="ml-1 h-3 w-3" />
							</Button>
						</Link>
					</CardHeader>
					<CardContent className="p-0">
						<Suspense fallback={<UpcomingPostsSkeleton />}>
							<UpcomingPosts filter={postFilter} />
						</Suspense>
					</CardContent>
				</Card>

				<Card className="overflow-hidden border border-[#232323] bg-[#121212]">
					<CardHeader className="flex flex-row items-center justify-between">
						<CardTitle className="text-white">Recent Notifications</CardTitle>
					</CardHeader>
					<CardContent className="p-0">
						<Suspense fallback={<NotificationsSkeleton />}>
							<NotificationsList isPaid={hasAccess} />
						</Suspense>
					</CardContent>
				</Card>
			</div>
		</section>
	);
};

export default Page;
