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
import {
	createEncryptedCookie,
	deleteCookie,
} from "@/lib/cookies/create-cookies";
import useLogoutStore from "@/zustand/logout-store";
import useOrganizationStore from "@/zustand/useorganization-store";

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

	// Render loading skeleton
	const renderSkeleton = useCallback(
		(showOrgInfo = false) => (
			<SidebarMenu>
				<SidebarMenuItem>
					<DropdownMenu>
						<DropdownMenuTrigger disabled asChild>
							<SidebarMenuButton
								size="lg"
								disabled
								className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
							>
								{showOrgInfo && activeTeam ? (
									<>
										<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
											{activeTeam.name[0].toUpperCase()}
										</div>
										<div className="grid flex-1 text-left text-sm leading-tight">
											<span className="truncate font-semibold">
												{activeTeam.name}
											</span>
											<span className="truncate text-xs">Active</span>
										</div>
									</>
								) : (
									<>
										<Skeleton className="h-8 w-8 rounded-lg" />
										<div className="grid flex-1 gap-1 text-left text-sm leading-tight">
											<Skeleton className="h-4 w-24" />
											<Skeleton className="h-3 w-16" />
										</div>
									</>
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
						<div className="text-sm text-red-500">No organization found</div>
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

	const isDropdownDisabled = isSwitching || organizations.length <= 1;
	const showChevron = organizations.length > 1 && !isSwitching;

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger disabled={isDropdownDisabled} asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
								{activeTeam.name[0].toUpperCase()}
							</div>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-semibold">
									{activeTeam.name}
								</span>
								<span className="truncate text-xs">
									{organizations.length === 1 ? "Only Organization" : "Active"}
								</span>
							</div>
							{isSwitching ? (
								<Loader2 className="ml-auto h-4 w-4 animate-spin" />
							) : showChevron ? (
								<ChevronsUpDown className="ml-auto h-4 w-4" />
							) : (
								<></>
							)}
						</SidebarMenuButton>
					</DropdownMenuTrigger>

					<DropdownMenuContent
						align="start"
						sideOffset={4}
						side={isMobile ? "bottom" : "right"}
						className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
					>
						<DropdownMenuLabel className="text-xs text-muted-foreground">
							{organizations.length === 1 ? "Organization" : "Organizations"}
						</DropdownMenuLabel>

						{/* Show current org if only one organization */}
						{organizations.length === 1 && (
							<DropdownMenuItem
								className="gap-2 p-2"
								onClick={() => handleTeamChange(activeTeam)}
								disabled={isSwitching}
							>
								<div className="flex size-6 items-center justify-center rounded-sm border">
									{activeTeam.name[0].toUpperCase()}
								</div>
								{activeTeam.name}
								<DropdownMenuShortcut>⌘1</DropdownMenuShortcut>
							</DropdownMenuItem>
						)}

						{/* Show other organizations if multiple */}
						{inactiveTeams.map((team, index) => (
							<DropdownMenuItem
								key={team.id}
								onClick={() => handleTeamChange(team)}
								className="gap-2 p-2"
								disabled={isSwitching}
							>
								<div className="flex size-6 items-center justify-center rounded-sm border">
									{team.name[0].toUpperCase()}
								</div>
								{team.name}
								<DropdownMenuShortcut>⌘{index + 2}</DropdownMenuShortcut>
							</DropdownMenuItem>
						))}

						<DropdownMenuSeparator />

						<DropdownMenuItem
							onClick={() => setCreateModalOpen(true)}
							className="gap-2 p-2"
							disabled={isSwitching}
						>
							<div className="flex size-6 items-center justify-center rounded-md border bg-background">
								<Plus className="size-4" />
							</div>
							<div className="font-medium text-muted-foreground">
								{hasAccess
									? "Create Organization"
									: "Upgrade to Create Organization"}
							</div>
						</DropdownMenuItem>
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
