/* eslint-disable import/no-unresolved */
"use client";

import { Coins, LogOut, User2 } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import React, { useMemo } from "react";

import { useSessionManager } from "@/components/tracker/auth-tracker";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useCreditBalance } from "@/hooks/plans/use-credit-balance";
import { getCreditDisplayText, getCreditStatus } from "@/utils/credit-utils";
import useLogoutStore from "@/zustand/logout-store";
import useUserStore from "@/zustand/useuser-store";

import { LogoOnly } from "./navigation/top_navigation/logo";

interface TopNavProps {
	isLoadingAttachment?: boolean;
}

export function TopNav({ isLoadingAttachment = false }: TopNavProps) {
	const userStore = useUserStore();
	const logoutStore = useLogoutStore();
	const { data, status } = useSession();
	const { logout: performLogout } = useSessionManager();

	// Use the hook with minimal options to prevent infinite loops
	const { credits: apiCredits, isLoading: creditsLoading } = useCreditBalance({
		syncWithStore: true,
		refetchInterval: 5 * 60 * 1000,
		showNotifications: false, // Don't show notifications in nav
	});

	// Memoize user data parsing to prevent unnecessary recalculations
	const userData = useMemo(() => {
		const [firstNameFromFull, lastNameFromFull] = userStore.full_name
			? userStore.full_name.split(" ")
			: ["", ""];

		// Use store data while loading, then use session data when available
		return userStore.justUpdated
			? {
					firstName: firstNameFromFull || data?.user?.first_name || "",
					lastName: lastNameFromFull || data?.user?.last_name || "",
					email: userStore.email || data?.user?.email || "",
				}
			: status === "loading"
				? {
						firstName: firstNameFromFull || "",
						lastName: lastNameFromFull || "",
						email: userStore.email || "",
					}
				: data?.user?.type === "magic" && status === "authenticated"
					? {
							firstName: data?.user?.first_name || firstNameFromFull || "",
							lastName: data?.user?.last_name || lastNameFromFull || "",
							email: data?.user?.email || userStore.email || "",
						}
					: {
							firstName: firstNameFromFull || data?.user?.first_name || "",
							lastName: lastNameFromFull || data?.user?.last_name || "",
							email: userStore.email || data?.user?.email || "",
						};
	}, [
		userStore.full_name,
		userStore.justUpdated,
		userStore.email,
		data,
		status,
	]);

	// Memoize credit calculations
	const creditInfo = useMemo(() => {
		// Prefer API data, fall back to store data
		const credits = apiCredits ?? userStore.credits_balance ?? 0;
		const status = getCreditStatus(credits);

		return {
			status,
			credits,
			isLow: credits < 100,
			isCritical: credits < 10,
			displayText: getCreditDisplayText(credits, "full"),
			badgeDisplayText: getCreditDisplayText(credits, "badge"),
			mobileDisplayText: getCreditDisplayText(credits, "mobile"),
		};
	}, [apiCredits, userStore.credits_balance]);

	const logoutClient = async () => {
		await performLogout();
	};

	const isLoading =
		status === "loading" || isLoadingAttachment || creditsLoading;

	// Don't render anything if logout is in progress
	if (logoutStore.logout) {
		return;
	}

	return (
		<header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black backdrop-blur-md">
			<div className="w-full px-4 lg:px-2">
				<div className="flex h-14 items-center justify-between">
					{/* Left Section - Sidebar + Logo */}
					<div className="flex items-center gap-2">
						<SidebarTrigger className="rounded-md p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white" />
						<LogoOnly />
					</div>

					{/* Right Section - Credits + Profile */}
					<div className="flex items-center gap-3">
						{/* Credits Display */}
						{!isLoading && (
							<div className="hidden items-center sm:flex">
								<Badge
									variant="outline"
									className={`border-white/20 bg-white/5 px-3 py-1 text-sm text-white/80 transition-colors hover:bg-white/10 ${
										creditInfo.isCritical
											? "border-red-500/30 bg-red-500/10 text-red-200"
											: creditInfo.isLow
												? "border-yellow-500/30 bg-yellow-500/10 text-yellow-200"
												: ""
									}`}
								>
									<Coins className="mr-1.5 h-4 w-4" />
									<span className="hidden md:inline">
										{creditInfo.displayText} credits
									</span>
									<span className="md:hidden">
										{creditInfo.mobileDisplayText}
									</span>
								</Badge>
							</div>
						)}

						{/* Profile Avatar */}
						{isLoading ? (
							<div className="h-8 w-8 animate-pulse rounded-full bg-white/10"></div>
						) : (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										className="relative h-8 w-8 rounded-full p-0 hover:bg-white/10"
									>
										<Avatar className="h-8 w-8 border border-white/20">
											<AvatarFallback className="bg-white/10 text-sm font-medium text-white">
												{userData.firstName?.charAt(0)?.toUpperCase() || "U"}
												{userData.lastName?.charAt(0)?.toUpperCase() || ""}
											</AvatarFallback>
										</Avatar>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									className="w-72 rounded-lg border-white/10 bg-black/95 shadow-xl"
									align="end"
									sideOffset={8}
								>
									{/* User Info */}
									<DropdownMenuLabel className="p-0 font-normal">
										<div className="flex items-center gap-3 border-b border-white/10 p-3">
											<Avatar className="h-10 w-10 border border-white/20">
												<AvatarFallback className="bg-white/10 font-medium text-white">
													{userData.firstName?.charAt(0)?.toUpperCase() || "U"}
													{userData.lastName?.charAt(0)?.toUpperCase() || ""}
												</AvatarFallback>
											</Avatar>
											<div className="min-w-0 flex-1">
												<p className="truncate text-sm font-medium text-white">
													{userData.firstName} {userData.lastName}
												</p>
												<p className="truncate text-xs text-white/60">
													{userData.email}
												</p>
												<div className="mt-1 flex items-center gap-2">
													<Badge
														className={`border-0 bg-white/10 px-2 py-0.5 text-xs text-white/80 ${
															creditInfo.isCritical
																? "bg-red-500/20 text-red-200"
																: creditInfo.isLow
																	? "bg-yellow-500/20 text-yellow-200"
																	: ""
														}`}
													>
														<Coins className="mr-1 h-3 w-3" />
														{creditInfo.badgeDisplayText}
													</Badge>
													{userStore.plan && (
														<span className="text-xs capitalize text-white/40">
															{userStore.plan}
														</span>
													)}
													{creditInfo.isLow && (
														<span className="text-xs text-white/50">
															{creditInfo.isCritical ? "Critical" : "Low"}
														</span>
													)}
												</div>
											</div>
										</div>
									</DropdownMenuLabel>

									{/* Menu Items */}
									<div className="py-1">
										<DropdownMenuItem asChild className="cursor-pointer">
											<Link
												href="/pricing"
												className="flex items-center gap-3 px-3 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white"
											>
												<Coins className="h-4 w-4" />
												Buy Credits
												{creditInfo.isLow && (
													<span
														className={`ml-auto text-xs ${
															creditInfo.isCritical
																? "text-red-400"
																: "text-yellow-400"
														}`}
													>
														{creditInfo.isCritical ? "Critical" : "Low"}
													</span>
												)}
											</Link>
										</DropdownMenuItem>

										<DropdownMenuItem asChild className="cursor-pointer">
											<Link
												href="/billing"
												className="flex items-center gap-3 px-3 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white"
											>
												<Coins className="h-4 w-4" />
												Billing & Usage
											</Link>
										</DropdownMenuItem>

										<DropdownMenuSeparator className="bg-white/10" />

										<DropdownMenuItem asChild className="cursor-pointer">
											<Link
												href="/settings?tab=profile"
												className="flex items-center gap-3 px-3 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white"
											>
												<User2 className="h-4 w-4" />
												Profile Settings
											</Link>
										</DropdownMenuItem>

										<DropdownMenuSeparator className="bg-white/10" />

										<DropdownMenuItem
											onClick={logoutClient}
											className="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm text-white/60 hover:bg-white/5 hover:text-white/80"
										>
											<LogOut className="h-4 w-4" />
											Log out
										</DropdownMenuItem>
									</div>
								</DropdownMenuContent>
							</DropdownMenu>
						)}
					</div>
				</div>
			</div>
		</header>
	);
}
