"use client";

import { ChevronsUpDown, Plus } from "lucide-react";
import { useEffect, useState } from "react";

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
import { useCheckAccess } from "@/hooks/plans/use-billing";
import {
	createEncryptedCookie,
	deleteCookie,
} from "@/lib/cookies/create-cookies";
import useLogoutStore from "@/zustand/logout-store";
import useOrganizationStore from "@/zustand/useorganization-store";

export function TeamSwitcher({ isLoading }: { isLoading: boolean }) {
	const { isMobile } = useSidebar();
	const hasAccess = useCheckAccess();
	const logoutStore = useLogoutStore();
	const [open, setOpen] = useState(false);
	const [mounted, setMounted] = useState(false);
	const { organization, organizations, setOrganization } =
		useOrganizationStore();

	useEffect(() => {
		setMounted(true);
	}, []);

	const activeTeam =
		mounted && !isLoading && organization && organization.name !== ""
			? organization
			: organizations.length > 0
				? organizations[0]
				: undefined;

	// Filter out the active team from the dropdown list if we have more than one team
	const inactiveTeams =
		organizations.length > 1
			? organizations.filter(team => team.name !== activeTeam?.name)
			: [];

	const handleTeamChange = async (team: (typeof organizations)[0]) => {
		await deleteCookie("organization");
		await createEncryptedCookie("organization", {
			id: team.id,
			name: team.name,
			domain: team.domains[0],
			is_owner: team.is_owner,
			description: team.description,
		});
		setOrganization(team);
		globalThis.window.location.reload();
	};

	// Only access store after mounting
	const storedOrg = mounted ? organization : undefined;

	const isDropdownDisabled =
		!mounted ||
		(organizations.length === 0 && !storedOrg) ||
		logoutStore.logout ||
		(isLoading && (!storedOrg || storedOrg.name === "")) ||
		(!isLoading && organizations.length === 0 && !organization);

	if (
		!mounted ||
		(organizations.length === 0 && !storedOrg) ||
		logoutStore.logout
	) {
		return (
			<SidebarMenu>
				<SidebarMenuItem>
					<DropdownMenu>
						<DropdownMenuTrigger disabled asChild>
							<SidebarMenuButton
								size="lg"
								disabled
								className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
							>
								<Skeleton className="h-8 w-8 rounded-lg" />
							</SidebarMenuButton>
						</DropdownMenuTrigger>
					</DropdownMenu>
				</SidebarMenuItem>
			</SidebarMenu>
		);
	}

	if (isLoading && storedOrg && storedOrg.name !== "") {
		return (
			<SidebarMenu>
				<SidebarMenuItem>
					<DropdownMenu>
						<DropdownMenuTrigger disabled asChild>
							<SidebarMenuButton
								size="lg"
								disabled
								className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
							>
								<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
									{storedOrg?.name[0].toUpperCase()}
								</div>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold">
										{storedOrg?.name}
									</span>
									<span className="truncate text-xs">Active</span>
								</div>
							</SidebarMenuButton>
						</DropdownMenuTrigger>
					</DropdownMenu>
				</SidebarMenuItem>
			</SidebarMenu>
		);
	}

	if (isLoading && (!storedOrg || storedOrg.name === ""))
		return (
			<SidebarMenu>
				<SidebarMenuItem>
					<DropdownMenu>
						<DropdownMenuTrigger disabled asChild>
							<SidebarMenuButton
								size="lg"
								disabled
								className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
							>
								<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
									<Skeleton className="h-8 w-8 rounded-lg" />
								</div>
								<div className="grid flex-1 gap-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold">
										<Skeleton className="h-4 w-24" />
									</span>
									<span className="truncate text-xs">
										<Skeleton className="h-4 w-24" />
									</span>
								</div>
							</SidebarMenuButton>
						</DropdownMenuTrigger>
					</DropdownMenu>
				</SidebarMenuItem>
			</SidebarMenu>
		);

	// If no teams and no organization after loading, show error state
	if (!isLoading && organizations.length === 0 && !organization) {
		return (
			<SidebarMenu>
				<SidebarMenuItem>
					<div className="text-sm text-red-500">No organization found</div>
				</SidebarMenuItem>
			</SidebarMenu>
		);
	}

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
								{activeTeam?.name ? activeTeam.name[0].toUpperCase() : ""}
							</div>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-semibold">
									{activeTeam?.name}
								</span>
								<span className="truncate text-xs">
									{organizations.length === 1 ? "Only Organization" : "Active"}
								</span>
							</div>
							{organizations.length > 1 && (
								<ChevronsUpDown className="ml-auto" />
							)}
						</SidebarMenuButton>
					</DropdownMenuTrigger>

					{organizations.length === 1 && (
						<DropdownMenuContent
							align="start"
							sideOffset={4}
							side={isMobile ? "bottom" : "right"}
							className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
						>
							<DropdownMenuLabel className="text-xs text-muted-foreground">
								Organization
							</DropdownMenuLabel>
							<DropdownMenuItem
								className="gap-2 p-2"
								key={activeTeam?.name}
								onClick={() => handleTeamChange(activeTeam as any)}
							>
								<div className="flex size-6 items-center justify-center rounded-sm border">
									{activeTeam?.name[0].toUpperCase()}
								</div>
								{activeTeam?.name}
								<DropdownMenuShortcut>⌘1</DropdownMenuShortcut>
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								onClick={() => setOpen(true)}
								className="flex w-full items-center justify-center gap-2 p-2"
							>
								<div className="flex size-6 items-center justify-center rounded-md border bg-background">
									<Plus className="size-4" />
								</div>
								<div className="text-center font-medium text-muted-foreground">
									{hasAccess
										? "Create Organization"
										: "Upgrade to Create Organization"}
								</div>
							</DropdownMenuItem>
						</DropdownMenuContent>
					)}
					{organizations.length > 1 && (
						<DropdownMenuContent
							align="start"
							sideOffset={4}
							side={isMobile ? "bottom" : "right"}
							className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
						>
							<DropdownMenuLabel className="text-xs text-muted-foreground">
								Organizations
							</DropdownMenuLabel>
							{inactiveTeams.map((team, index) => (
								<DropdownMenuItem
									key={team.name}
									onClick={() => handleTeamChange(team)}
									className="gap-2 p-2"
								>
									<div className="flex size-6 items-center justify-center rounded-sm border">
										{team.name[0].toUpperCase()}
									</div>
									{team.name}
									<DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
								</DropdownMenuItem>
							))}
							<DropdownMenuSeparator />
							<DropdownMenuItem
								className="gap-2 p-2"
								onClick={() => setOpen(true)}
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
					)}
				</DropdownMenu>
			</SidebarMenuItem>
			<CreateOrganizationModal open={open} onOpenChange={setOpen} />
		</SidebarMenu>
	);
}
