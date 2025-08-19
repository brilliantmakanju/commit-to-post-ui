"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ChevronsUpDown, Loader2, Plus } from "lucide-react";
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
import { useCheckAccess } from "@/hooks/plans/use-billing";
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

interface TeamSwitcherProps {
	isLoading: boolean;
}

export function TeamSwitcher({ isLoading }: TeamSwitcherProps) {
	const { isMobile } = useSidebar();
	const hasAccess = useCheckAccess();
	const logoutStore = useLogoutStore();
	const queryClient = useQueryClient();

	// Local state
	const [mounted, setMounted] = useState(false);
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

	// Mount effect
	useEffect(() => {
		setMounted(true);
	}, []);

	// Memoized computed values
	const activeTeam = useMemo(() => {
		if (!mounted) return organization;

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
	}, [
		mounted,
		isLoading,
		organization,
		organizations,
		isSwitching,
		lastSwitchedOrgId,
	]);

	const inactiveTeams = useMemo(() => {
		if (!activeTeam || organizations.length <= 1) return [];
		return organizations.filter(team => team.id !== activeTeam.id);
	}, [organizations, activeTeam]);

	const componentState = useMemo(() => {
		if (!mounted) return "mounting";
		if (logoutStore.logout) return "logging-out";
		if (isLoading && !activeTeam) return "loading";
		if (isLoading && activeTeam) return "loading-with-org";
		if (!isLoading && organizations.length === 0 && !organization)
			return "no-orgs";
		return "ready";
	}, [
		mounted,
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
											<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary font-semibold text-sidebar-primary-foreground">
												{activeTeam.name[0].toUpperCase()}
											</div>
											<div className="flex flex-col items-start">
												<span className="truncate text-base font-bold leading-none">
													{activeTeam.name}
												</span>
												<span className="mt-1 truncate text-xs text-muted-foreground">
													Active Organization
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
		[activeTeam],
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
							<div className="text-sm font-medium text-red-500">
								No organization found
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

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger disabled={isDropdownDisabled} asChild>
						<SidebarMenuButton
							size="lg"
							className="h-auto p-4 transition-colors hover:bg-sidebar-accent/50 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<div className="flex w-full items-center justify-between">
								<div className="flex items-center space-x-3">
									<div className="relative">
										<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary font-semibold text-sidebar-primary-foreground shadow-sm">
											{activeTeam.name[0].toUpperCase()}
										</div>
										{organizations.length > 1 && (
											<div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-green-500"></div>
										)}
									</div>
									<div className="flex min-w-0 flex-1 flex-col items-start">
										<span className="truncate text-base font-bold leading-tight">
											{activeTeam.name}
										</span>
										<div className="mt-0.5 flex items-center">
											<span className="truncate text-xs text-muted-foreground">
												{organizations.length === 1
													? "Personal workspace"
													: `Active • ${organizations.length} total`}
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
						className="w-[--radix-dropdown-menu-trigger-width] min-w-64 rounded-xl shadow-lg"
					>
						<DropdownMenuLabel className="px-3 py-2 text-xs text-muted-foreground">
							{organizations.length === 1
								? "Your Workspace"
								: "Switch Organization"}
						</DropdownMenuLabel>

						{/* Show current org if only one organization */}
						{organizations.length === 1 && (
							<DropdownMenuItem
								className="mx-2 mb-1 gap-3 rounded-lg p-3"
								onClick={() => handleTeamChange(activeTeam)}
								disabled={isSwitching}
							>
								<div className="flex size-6 items-center justify-center rounded-sm border-2 border-sidebar-primary bg-sidebar-primary font-medium text-sidebar-primary-foreground">
									{activeTeam.name[0].toUpperCase()}
								</div>
								<div className="flex flex-col">
									<span className="font-medium">{activeTeam.name}</span>
									<span className="text-xs text-muted-foreground">
										Current workspace
									</span>
								</div>
								<DropdownMenuShortcut className="ml-auto">
									⌘1
								</DropdownMenuShortcut>
							</DropdownMenuItem>
						)}

						{/* Show other organizations if multiple */}
						{inactiveTeams.map((team, index) => (
							<DropdownMenuItem
								key={team.id}
								onClick={() => handleTeamChange(team)}
								className="mx-2 mb-1 gap-3 rounded-lg p-3 hover:bg-sidebar-accent"
								disabled={isSwitching}
							>
								<div className="flex size-6 items-center justify-center rounded-sm border bg-muted font-medium">
									{team.name[0].toUpperCase()}
								</div>
								<div className="flex min-w-0 flex-1 flex-col">
									<span className="truncate font-medium">{team.name}</span>
									<span className="text-xs text-muted-foreground">
										Switch to this org
									</span>
								</div>
								<DropdownMenuShortcut>⌘{index + 2}</DropdownMenuShortcut>
							</DropdownMenuItem>
						))}

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
									<div className="inline-block cursor-pointer">
										<DropdownMenuItem
											className="mx-2 mb-2 gap-3 rounded-lg bg-muted/30 p-3 hover:bg-muted/50"
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
													Add new workspace
												</span>
											</div>
										</DropdownMenuItem>
									</div>
								</LimitTooltip>
							}
						>
							<LimitTooltip
								maxLimit={workspaceLimitUI.limit}
								currentUsage={orgCount}
								limitType="workspaces"
								position="bottom"
							>
								<DropdownMenuItem
									disabled={isSwitching}
									onClick={() => setCreateModalOpen(true)}
									className="mx-2 mb-2 cursor-pointer gap-3 rounded-lg bg-muted/30 p-3 hover:bg-muted/50"
								>
									<div className="flex size-6 items-center justify-center rounded-md border-2 border-dashed border-muted-foreground bg-background">
										<Plus className="size-4 text-muted-foreground" />
									</div>
									<div className="flex flex-col">
										<span className="font-medium text-muted-foreground">
											Create Organization
										</span>
										<span className="text-xs text-muted-foreground">
											Add new workspace
										</span>
									</div>
								</DropdownMenuItem>
							</LimitTooltip>
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
