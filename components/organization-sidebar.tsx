"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ChevronsUpDown, Crown, Loader2, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { CreateOrganizationModal } from "@/components/organization/create-organization";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { debugGroup, debugLog } from "@/hooks/core/repo/use-organization-hook";
import { useLimitUI } from "@/hooks/use-limit-ui";
import { FEATURE_LIMITS } from "@/lib/constants/feature-limits";
import {
	createEncryptedCookie,
	deleteCookie,
} from "@/lib/cookies/create-cookies";
import useLogoutStore from "@/zustand/logout-store";
import useOrganizationStore from "@/zustand/useorganization-store";

import FeatureLimitWrapper from "./feature-flag/feature-limit-wrapper";
import LimitTooltip from "./feature-flag/limit-tooltip";
import { Badge } from "./ui/badge";

interface TeamSwitcherProps {
	isLoading: boolean;
}

export function TeamSwitcher({ isLoading }: TeamSwitcherProps) {
	// Force client-side only rendering to avoid hydration mismatches
	const [isClient, setIsClient] = useState(false);
	const [createModalOpen, setCreateModalOpen] = useState(false);
	const [isSwitching, setIsSwitching] = useState(false);
	const [lastSwitchedOrgId, setLastSwitchedOrgId] = useState<
		string | undefined
	>();

	const { isMobile } = useSidebar();
	const queryClient = useQueryClient();

	// Store state with fallbacks
	const { organization, organizations, setOrganization } =
		useOrganizationStore();

	// Safe fallbacks for organization data - memoized to prevent dependency issues
	const safeOrganizations = useMemo(() => {
		return Array.isArray(organizations) ? organizations : [];
	}, [organizations]);

	const orgCount = safeOrganizations.length;

	// Ensure client-side rendering
	useEffect(() => {
		setIsClient(true);
	}, []);

	// Workspace limit UI
	const workspaceLimitUI = useLimitUI({
		warningThreshold: 80,
		currentCount: orgCount,
		limitType: "workspaces",
		limitId: FEATURE_LIMITS.WORKSPACES,
	});

	// Determine active team with better fallback logic
	const activeTeam = useMemo(() => {
		// If we're switching, prioritize the switched organization
		if (isSwitching && lastSwitchedOrgId) {
			const switchedOrg = safeOrganizations.find(
				org => org?.id === lastSwitchedOrgId,
			);
			if (switchedOrg) return switchedOrg;
		}

		// If we have a current organization, verify it exists in the list
		if (organization?.id && organization?.name) {
			const foundOrg = safeOrganizations.find(
				org => org?.id === organization.id,
			);
			if (foundOrg) return foundOrg;
			// If current org is not in list but is valid, still use it
			if (organization.name.trim()) return organization;
		}

		// Fallback to first organization if available
		if (safeOrganizations.length > 0 && safeOrganizations[0]?.id) {
			return safeOrganizations[0];
		}

		return;
	}, [organization, safeOrganizations, isSwitching, lastSwitchedOrgId]);

	// Get inactive teams
	const inactiveTeams = useMemo(() => {
		if (!activeTeam?.id) return safeOrganizations;
		return safeOrganizations.filter(
			team => team?.id && team.id !== activeTeam.id,
		);
	}, [safeOrganizations, activeTeam]);

	// Activity info helper
	const getActivityInfo = useCallback((org: NonNullable<typeof activeTeam>) => {
		if (!org?.last_activity_at) return;

		try {
			const lastActivity = new Date(org.last_activity_at);
			const now = new Date();
			const diffInDays = Math.floor(
				(now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24),
			);

			if (diffInDays === 0) return "Active today";
			if (diffInDays === 1) return "Last active yesterday";
			if (diffInDays < 7) return `Last active ${diffInDays} days ago`;
			if (diffInDays < 30)
				return `Last active ${Math.floor(diffInDays / 7)} weeks ago`;
			return `Last active ${Math.floor(diffInDays / 30)} months ago`;
		} catch {
			return;
		}
	}, []);

	// Organization status helper
	const getOrgStatus = useCallback((org: NonNullable<typeof activeTeam>) => {
		if (!org) return { color: "bg-gray-400", text: "Unknown" };

		if (org.is_downgraded) {
			return { color: "bg-orange-500", text: "Downgraded" };
		}

		if (org.github_installation_status === "installed") {
			return { color: "bg-green-500", text: "Active" };
		} else if (org.github_installation_status === "pending") {
			return { color: "bg-yellow-500", text: "Pending" };
		}

		return { color: "bg-green-500", text: "Active" };
	}, []);

	// Loading skeleton component
	const LoadingSkeleton = useCallback(
		() => (
			<SidebarMenu>
				<SidebarMenuItem>
					<SidebarMenuButton size="lg" disabled className="h-auto p-3">
						<div className="flex w-full items-center justify-between">
							<div className="flex items-center space-x-3">
								<Skeleton className="h-8 w-8 rounded-lg" />
								<div className="flex flex-col gap-2">
									<Skeleton className="h-4 w-28" />
									<Skeleton className="h-3 w-20" />
								</div>
							</div>
						</div>
					</SidebarMenuButton>
				</SidebarMenuItem>
			</SidebarMenu>
		),
		[],
	);

	// Background refresh function
	const backgroundRefresh = useCallback(async () => {
		if (typeof globalThis === "undefined") return; // Skip on server-side

		try {
			debugGroup("BACKGROUND_REFRESH", () => {
				debugLog("BACKGROUND", "Starting background refresh of cached queries");

				const keys = [
					"posts",
					"gitRepos",
					"repo_details",
					"notifications",
					"connected_repos",
					"top_repo_metrics",
					"dashboard_metrics",
					"repo_webhook_ping",
					"repo_super_details",
					"retrieving_webhooks",
					"recent_notifications",
					"dashboard_heatmap_data",
					"upcoming_posts_metrics",
					"dashboard_channel_data",
					"organization-ownership",
					"upcoming_posts_metrics",
					"dashboard_webhook_errors",
					"retrieving_social_status",
					"retrieving_billing_portal",
					"unread_notification_counts",
				];

				Promise.allSettled(
					keys.map(key => {
						debugLog("BACKGROUND", `Fetching query: ${key}`);
						return queryClient
							.fetchQuery({ queryKey: [key] })
							.then(() => {
								debugLog("BACKGROUND", `✅ Successfully refreshed: ${key}`);
								return queryClient.invalidateQueries({ queryKey: [key] });
							})
							.catch(error => {
								debugLog("BACKGROUND", `❌ Failed to refresh: ${key}`, error);
							});
					}),
				).then(results => {
					const successful = results.filter(
						r => r.status === "fulfilled",
					).length;
					const failed = results.filter(r => r.status === "rejected").length;
					debugLog(
						"BACKGROUND",
						`Background refresh completed: ${successful} successful, ${failed} failed`,
					);
				});
			});
		} catch (error) {
			console.warn("Background refresh failed:", error);
		}
	}, [queryClient]);

	// Team switching handler
	const handleTeamChange = useCallback(
		async (team: NonNullable<typeof activeTeam>) => {
			if (isSwitching || !team?.id) return;

			try {
				setIsSwitching(true);
				setLastSwitchedOrgId(team.id);

				// Update cookies
				await deleteCookie("organization");
				await createEncryptedCookie("organization", {
					id: team.id,
					name: team.name,
					domain: team.domains[0],
					is_owner: team.is_owner,
					description: team.description,
					github_installation_id: team.github_installation_id,
					github_installation_status: team.github_installation_status,
				});

				// Update store
				setOrganization(team);

				// Background refresh
				setTimeout(() => {
					backgroundRefresh();
				}, 100);

				// Clear switching state
				setTimeout(() => {
					setLastSwitchedOrgId(undefined);
				}, 1000);
			} catch (error) {
				console.error("Team switch failed:", error);
				setLastSwitchedOrgId(undefined);
			} finally {
				setIsSwitching(false);
			}
		},
		[backgroundRefresh, isSwitching, setOrganization],
	);

	// Early return for server-side rendering
	if (!isClient) {
		return (
			<SidebarMenu>
				<SidebarMenuItem>
					<div className="h-16 w-full animate-pulse rounded-lg bg-muted"></div>
				</SidebarMenuItem>
			</SidebarMenu>
		);
	}

	// Determine component state
	const shouldShowLoading = isLoading || !activeTeam || orgCount === 0;

	// Show loading state
	if (shouldShowLoading) {
		return <LoadingSkeleton />;
	}

	// No organizations fallback
	if (orgCount === 0) {
		return (
			<SidebarMenu>
				<SidebarMenuItem>
					<div className="p-4 text-center">
						<div className="flex flex-col items-center space-y-2">
							<div className="text-sm font-medium text-red-500">
								No organizations found
							</div>
							<button
								onClick={() => setCreateModalOpen(true)}
								className="text-xs text-muted-foreground transition-colors hover:text-foreground"
							>
								Create your first organization
							</button>
						</div>
					</div>
					<CreateOrganizationModal
						open={createModalOpen}
						onOpenChange={setCreateModalOpen}
					/>
				</SidebarMenuItem>
			</SidebarMenu>
		);
	}

	// Main component render
	if (!activeTeam) {
		return <LoadingSkeleton />;
	}

	const orgStatus = getOrgStatus(activeTeam);
	const activityInfo = getActivityInfo(activeTeam);
	const isDropdownDisabled = isSwitching;

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger disabled={isDropdownDisabled} asChild>
						<SidebarMenuButton
							size="lg"
							className="h-auto p-3 transition-colors hover:bg-sidebar-accent/50 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<div className="flex w-full items-center justify-between">
								<div className="flex items-center space-x-3">
									<div className="relative">
										<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary font-semibold text-sidebar-primary-foreground shadow-sm">
											{(activeTeam.name?.[0] || "?").toUpperCase()}
										</div>
										<div
											className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${orgStatus.color}`}
										></div>
									</div>
									<div className="flex min-w-0 flex-1 flex-col items-start">
										<div className="flex items-center space-x-2">
											<span className="truncate text-base font-bold leading-tight">
												{activeTeam.name || "Unknown Organization"}
											</span>
											{activeTeam.is_owner && (
												<Crown className="h-3 w-3 flex-shrink-0 text-yellow-500" />
											)}
											{activeTeam.is_downgraded && (
												<Badge
													variant="outline"
													className="h-4 px-1 py-0 text-xs"
												>
													Downgraded
												</Badge>
											)}
										</div>
										<div className="mt-0.5 flex items-center">
											<span className="truncate text-xs text-muted-foreground">
												{orgCount === 1
													? activityInfo || "Personal workspace"
													: activityInfo || `${orgCount} total workspaces`}
											</span>
										</div>
									</div>
								</div>
								<div className="ml-2 flex items-center">
									{isSwitching ? (
										<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
									) : (
										<ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
									)}
								</div>
							</div>
						</SidebarMenuButton>
					</DropdownMenuTrigger>

					<DropdownMenuContent
						align="start"
						sideOffset={4}
						side={isMobile ? "bottom" : "right"}
						className="w-[--radix-dropdown-menu-trigger-width] min-w-72 rounded-xl shadow-lg"
					>
						<DropdownMenuLabel className="px-3 py-2 text-xs text-muted-foreground">
							{orgCount === 1
								? "Your Workspace"
								: `Switch Organization (${orgCount})`}
						</DropdownMenuLabel>

						{/* Current active organization */}
						<DropdownMenuItem
							className="mx-2 mb-1 gap-3 rounded-lg bg-sidebar-accent/30 p-3"
							disabled
						>
							<div className="relative flex size-6 items-center justify-center rounded-sm border-2 border-sidebar-primary bg-sidebar-primary font-medium text-sidebar-primary-foreground">
								{(activeTeam.name?.[0] || "?").toUpperCase()}
								<div
									className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background ${orgStatus.color}`}
								></div>
							</div>
							<div className="flex min-w-0 flex-1 flex-col">
								<div className="flex items-center space-x-2">
									<span className="font-medium">
										{activeTeam.name || "Unknown"}
									</span>
									{activeTeam.is_owner && (
										<Crown className="h-3 w-3 text-yellow-500" />
									)}
								</div>
								<span className="text-xs text-muted-foreground">
									{orgCount === 1
										? `Current workspace • ${orgStatus.text}`
										: `Current • ${orgStatus.text}`}
									{activeTeam.is_downgraded &&
										activeTeam.downgrade_reason &&
										` • ${activeTeam.downgrade_reason}`}
								</span>
							</div>
							<DropdownMenuShortcut className="ml-auto">
								⌘1
							</DropdownMenuShortcut>
						</DropdownMenuItem>

						{/* Other organizations */}
						{inactiveTeams.length > 0 && (
							<>
								<DropdownMenuSeparator className="my-2" />
								{inactiveTeams.map((team, index) => {
									if (!team?.id) return;

									const teamStatus = getOrgStatus(team);
									const teamActivity = getActivityInfo(team);

									return (
										<DropdownMenuItem
											key={team.id}
											disabled={isSwitching}
											onClick={() => handleTeamChange(team)}
											className="mx-2 mb-1 cursor-pointer gap-3 rounded-lg p-3 transition-colors hover:bg-sidebar-accent"
										>
											<div className="relative flex size-6 items-center justify-center rounded-sm border bg-muted font-medium">
												{(team.name?.[0] || "?").toUpperCase()}
												<div
													className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background ${teamStatus.color}`}
												></div>
											</div>
											<div className="flex min-w-0 flex-1 flex-col">
												<div className="flex items-center space-x-2">
													<span className="truncate font-medium">
														{team.name || "Unknown"}
													</span>
													{team.is_owner && (
														<Crown className="h-3 w-3 text-yellow-500" />
													)}
													{team.is_downgraded && (
														<Badge
															variant="outline"
															className="h-4 px-1 py-0 text-xs"
														>
															Downgraded
														</Badge>
													)}
												</div>
												<span className="text-xs text-muted-foreground">
													{teamActivity || teamStatus.text}
												</span>
											</div>
											<DropdownMenuShortcut>⌘{index + 2}</DropdownMenuShortcut>
										</DropdownMenuItem>
									);
								})}
							</>
						)}

						{/* Create organization option */}
						<DropdownMenuSeparator className="my-2" />
						<FeatureLimitWrapper
							limitId={FEATURE_LIMITS.WORKSPACES}
							currentCount={orgCount}
							fallback={
								<LimitTooltip
									maxLimit={workspaceLimitUI.limit}
									currentUsage={orgCount}
									limitType="workspaces"
									position="bottom"
								>
									<div className="inline-block cursor-not-allowed">
										<DropdownMenuItem
											className="mx-2 mb-2 gap-3 rounded-lg bg-muted/30 p-3 opacity-50"
											disabled
										>
											<div className="flex size-6 items-center justify-center rounded-md border-2 border-dashed border-muted-foreground bg-background">
												<Plus className="size-4 text-muted-foreground" />
											</div>
											<div className="flex flex-col">
												<span className="font-medium text-muted-foreground">
													Create Organization
												</span>
												<span className="text-xs text-muted-foreground">
													Limit reached ({orgCount}/{workspaceLimitUI.limit})
												</span>
											</div>
										</DropdownMenuItem>
									</div>
								</LimitTooltip>
							}
						>
							<DropdownMenuItem
								disabled={isSwitching}
								onClick={() => setCreateModalOpen(true)}
								className="mx-2 mb-2 cursor-pointer gap-3 rounded-lg bg-muted/30 p-3 transition-colors hover:bg-muted/50"
							>
								<div className="flex size-6 items-center justify-center rounded-md border-2 border-dashed border-muted-foreground bg-background">
									<Plus className="size-4 text-muted-foreground" />
								</div>
								<div className="flex flex-col">
									<span className="font-medium text-muted-foreground">
										Create Organization
									</span>
									<span className="text-xs text-muted-foreground">
										Add new workspace ({orgCount}/{workspaceLimitUI.limit})
									</span>
								</div>
							</DropdownMenuItem>
						</FeatureLimitWrapper>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
			<CreateOrganizationModal
				open={createModalOpen}
				onOpenChange={setCreateModalOpen}
			/>
		</SidebarMenu>
	);
}
