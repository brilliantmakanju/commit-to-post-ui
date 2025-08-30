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
	const { isMobile } = useSidebar();
	const logoutStore = useLogoutStore();
	const queryClient = useQueryClient();

	// Local state
	const [createModalOpen, setCreateModalOpen] = useState(false);
	const [isSwitching, setIsSwitching] = useState(false);
	const [lastSwitchedOrgId, setLastSwitchedOrgId] = useState<
		string | undefined
	>();

	// Store state
	const { organization, organizations, setOrganization } =
		useOrganizationStore();

	const orgCount = organizations.length;

	// use workspaces limit, not social accounts
	const workspaceLimitUI = useLimitUI({
		warningThreshold: 80,
		currentCount: orgCount,
		limitType: "workspaces",
		limitId: FEATURE_LIMITS.WORKSPACES,
	});

	// Memoized computed values
	const activeTeam = useMemo(() => {
		if (!isLoading) return organization;

		// If we're currently switching or just switched, prioritize the user's selection
		if (isSwitching || lastSwitchedOrgId) {
			const switchedOrg =
				organizations.find(org => org.id === lastSwitchedOrgId) || organization;
			if (switchedOrg && switchedOrg.id === lastSwitchedOrgId) {
				return switchedOrg;
			}
		}

		// If still loading initial data, show current organization if available
		if (isLoading && organization && organization.name !== "") {
			return organization;
		}

		// If we have a stored organization and it exists in the list, use it
		if (organization && organization.name !== "") {
			const foundOrg = organizations.find(org => org.id === organization.id);
			return foundOrg || organization;
		}

		// Otherwise, use the first available organization
		return organizations.length > 0 ? organizations[0] : undefined;
	}, [isLoading, organization, organizations, isSwitching, lastSwitchedOrgId]);

	const inactiveTeams = useMemo(() => {
		if (!activeTeam) return [];
		// Always return other organizations, even if there's only one total
		return organizations.filter(team => team.id !== activeTeam.id);
	}, [organizations, activeTeam]);

	const componentState = useMemo(() => {
		if (isLoading) return "mounting";
		if (logoutStore.logout) return "logging-out";
		if (isLoading && !activeTeam) return "loading";
		if (isLoading && activeTeam) return "loading-with-org";
		if (!isLoading && organizations.length === 0 && !organization)
			return "no-orgs";
		return "ready";
	}, [
		logoutStore.logout,
		isLoading,
		activeTeam,
		organizations.length,
		organization,
	]);

	// Background refresh function - non-blocking
	const backgroundRefresh = useCallback(async () => {
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

			// Fire and forget - don't await
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
				const successful = results.filter(r => r.status === "fulfilled").length;
				const failed = results.filter(r => r.status === "rejected").length;
				debugLog(
					"BACKGROUND",
					`Background refresh completed: ${successful} successful, ${failed} failed`,
				);
			});
		});
	}, [queryClient]);

	// Team switching handler with proper error handling and loading states
	const handleTeamChange = useCallback(
		async (team: (typeof organizations)[0]) => {
			if (isSwitching || !team) return;

			try {
				setIsSwitching(true);
				setLastSwitchedOrgId(team.id);

				// Update cookies first to ensure persistence
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

				// Then update store
				setOrganization(team);
				backgroundRefresh();

				// Clear the switching flag after a brief delay to prevent race conditions
				setTimeout(() => {
					setLastSwitchedOrgId(undefined);
				}, 1000);
			} catch {
				// Revert on error
				setLastSwitchedOrgId(undefined);
				// You might want to show a toast notification here
			} finally {
				setIsSwitching(false);
			}
		},
		[backgroundRefresh, isSwitching, setOrganization],
	);

	// Helper function to get organization status
	const getOrgStatus = useCallback((org: typeof activeTeam) => {
		if (!org) return { color: "bg-gray-400", text: "Unknown" };

		if (org.is_downgraded) {
			return { color: "bg-orange-500", text: "Downgraded" };
		}

		// Check GitHub installation status
		if (org.github_installation_status === "installed") {
			return { color: "bg-green-500", text: "Active" };
		} else if (org.github_installation_status === "pending") {
			return { color: "bg-yellow-500", text: "Pending" };
		}

		return { color: "bg-green-500", text: "Active" };
	}, []);

	// Helper function to format activity info
	const getActivityInfo = useCallback((org: typeof activeTeam) => {
		if (!org) return;

		if (org.last_activity_at) {
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
		}

		return;
	}, []);

	// Render loading skeleton with consistent avatar size
	const renderSkeleton = useCallback(
		(showOrgInfo = false) => (
			<SidebarMenu>
				<SidebarMenuItem>
					<DropdownMenu>
						<DropdownMenuTrigger disabled asChild>
							<SidebarMenuButton
								size="lg"
								disabled
								className="h-auto p-3 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
							>
								{showOrgInfo && activeTeam ? (
									<div className="flex w-full items-center justify-between">
										<div className="flex items-center space-x-3">
											<div className="relative">
												<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary font-semibold text-sidebar-primary-foreground">
													{activeTeam.name[0]?.toUpperCase() || "?"}
												</div>
												<div
													className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${getOrgStatus(activeTeam).color}`}
												></div>
											</div>
											<div className="flex flex-col items-start">
												<span className="truncate text-base font-bold leading-none">
													{activeTeam.name}
												</span>
												<span className="mt-1 truncate text-xs text-muted-foreground">
													Loading...
												</span>
											</div>
										</div>
									</div>
								) : (
									<div className="flex w-full items-center justify-between">
										<div className="flex items-center space-x-3">
											<Skeleton className="h-8 w-8 rounded-lg" />
											<div className="flex flex-col gap-2">
												<Skeleton className="h-4 w-28" />
												<Skeleton className="h-3 w-20" />
											</div>
										</div>
									</div>
								)}
							</SidebarMenuButton>
						</DropdownMenuTrigger>
					</DropdownMenu>
				</SidebarMenuItem>
			</SidebarMenu>
		),
		[activeTeam, getOrgStatus],
	);

	// Handle different component states
	switch (componentState) {
		case "mounting":
		case "logging-out":
		case "loading": {
			return renderSkeleton();
		}

		case "loading-with-org": {
			return renderSkeleton(true);
		}

		case "no-orgs": {
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
					</SidebarMenuItem>
				</SidebarMenu>
			);
		}

		case "ready": {
			break;
		}

		default: {
			return renderSkeleton();
		}
	}

	if (!activeTeam) {
		return renderSkeleton();
	}
	const isDropdownDisabled = isSwitching;
	const showChevron = !isSwitching;
	const orgStatus = getOrgStatus(activeTeam);
	const activityInfo = getActivityInfo(activeTeam);

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
											{activeTeam.name[0]?.toUpperCase() || "?"}
										</div>
										<div
											className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${orgStatus.color}`}
										></div>
									</div>
									<div className="flex min-w-0 flex-1 flex-col items-start">
										<div className="flex items-center space-x-2">
											<span className="truncate text-base font-bold leading-tight">
												{activeTeam.name}
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
												{organizations.length === 1
													? activityInfo || "Personal workspace"
													: activityInfo ||
														`${organizations.length} total workspaces`}
											</span>
										</div>
									</div>
								</div>
								<div className="ml-2 flex items-center">
									{isSwitching ? (
										<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
									) : showChevron ? (
										<ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
									) : (
										<></>
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
							{organizations.length === 1
								? "Your Workspace"
								: `Switch Organization (${organizations.length})`}
						</DropdownMenuLabel>

						{/* Current active organization - Always show, even if it's the only one */}
						<DropdownMenuItem
							className="mx-2 mb-1 gap-3 rounded-lg bg-sidebar-accent/30 p-3"
							disabled
						>
							<div className="relative flex size-6 items-center justify-center rounded-sm border-2 border-sidebar-primary bg-sidebar-primary font-medium text-sidebar-primary-foreground">
								{activeTeam.name[0]?.toUpperCase() || "?"}
								<div
									className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background ${orgStatus.color}`}
								></div>
							</div>
							<div className="flex min-w-0 flex-1 flex-col">
								<div className="flex items-center space-x-2">
									<span className="font-medium">{activeTeam.name}</span>
									{activeTeam.is_owner && (
										<Crown className="h-3 w-3 text-yellow-500" />
									)}
								</div>
								<span className="text-xs text-muted-foreground">
									{organizations.length === 1
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

						{/* Other organizations - Only show if there are multiple organizations */}
						{inactiveTeams.length > 0 && (
							<>
								<DropdownMenuSeparator className="my-2" />

								{inactiveTeams.map((team, index) => {
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
												{team.name[0]?.toUpperCase() || "?"}
												<div
													className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background ${teamStatus.color}`}
												></div>
											</div>
											<div className="flex min-w-0 flex-1 flex-col">
												<div className="flex items-center space-x-2">
													<span className="truncate font-medium">
														{team.name}
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

						{/* Always show separator before create option */}
						<DropdownMenuSeparator className="my-2" />

						{/* Create organization */}
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
