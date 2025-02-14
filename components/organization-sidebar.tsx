"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ChevronsUpDown, Plus } from "lucide-react";
import * as React from "react";

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
import {
	createEncryptedCookie,
	deleteCookie,
} from "@/lib/cookies/create-cookies";
import useLogoutStore from "@/lib/zustand/logout-store";
import useOrganizationStore from "@/lib/zustand/useorganization-store";

export function TeamSwitcher({
	teams,
	isLoading,
}: {
	teams: {
		id: string;
		name: string;
		domains: string;
		description: string;
	}[];
	isLoading: boolean;
}) {
	const { isMobile } = useSidebar();
	const logoutStore = useLogoutStore();
	const queryClient = useQueryClient();
	const [open, setOpen] = React.useState(false);
	const organizationStore = useOrganizationStore();
	const [mounted, setMounted] = React.useState(false);
	const { organization, setOrganization } = useOrganizationStore();

	React.useEffect(() => {
		setMounted(true);
	}, []);

	const activeTeam =
		mounted && !isLoading && organization && organization.name !== ""
			? organization
			: teams.length > 0
				? teams[0]
				: undefined;

	// Filter out the active team from the dropdown list if we have more than one team
	const inactiveTeams =
		teams.length > 1
			? teams.filter(team => team.name !== activeTeam?.name)
			: [];

	const handleTeamChange = async (team: (typeof teams)[0]) => {
		await deleteCookie("organization");
		await createEncryptedCookie("organization", {
			domain: team.domains[0],
		});
		organizationStore.clearOrganization();
		setOrganization(team);
		queryClient.fetchQuery({ queryKey: ["posts"] });
		queryClient.invalidateQueries({ queryKey: ["posts"] });
		queryClient.fetchQuery({ queryKey: ["retrieving_webhooks"] });
		queryClient.fetchQuery({ queryKey: ["organization-ownership"] });
		queryClient.fetchQuery({ queryKey: ["retrieving_social_status"] });
		queryClient.invalidateQueries({ queryKey: ["retrieving_webhooks"] });
		queryClient.invalidateQueries({ queryKey: ["organization-ownership"] });
		queryClient.invalidateQueries({ queryKey: ["retrieving_social_status"] });
	};

	// Only access store after mounting
	const storedOrg = mounted
		? useOrganizationStore.getState().organization
		: undefined;

	if (!mounted || (teams.length === 0 && !storedOrg) || logoutStore.logout) {
		return (
			<SidebarMenu>
				<SidebarMenuItem>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<SidebarMenuButton
								size="lg"
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
						<DropdownMenuTrigger asChild>
							<SidebarMenuButton
								size="lg"
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
						<DropdownMenuTrigger asChild>
							<SidebarMenuButton
								size="lg"
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
	if (!isLoading && teams.length === 0 && !organization) {
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
					<DropdownMenuTrigger asChild>
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
									{teams.length === 1 ? "Only Organization" : "Active"}
								</span>
							</div>
							{teams.length > 1 && <ChevronsUpDown className="ml-auto" />}
						</SidebarMenuButton>
					</DropdownMenuTrigger>

					{teams.length === 1 && (
						<DropdownMenuContent
							className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
							align="start"
							side={isMobile ? "bottom" : "right"}
							sideOffset={4}
						>
							<DropdownMenuLabel className="text-xs text-muted-foreground">
								Organization
							</DropdownMenuLabel>
							<DropdownMenuItem
								key={activeTeam?.name}
								onClick={() => handleTeamChange(activeTeam as any)}
								className="gap-2 p-2"
							>
								<div className="flex size-6 items-center justify-center rounded-sm border">
									{activeTeam?.name[0].toUpperCase()}
								</div>
								{activeTeam?.name}
								<DropdownMenuShortcut>⌘1</DropdownMenuShortcut>
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								className="gap-2 p-2"
								onClick={() => setOpen(true)}
							>
								<div className="flex size-6 items-center justify-center rounded-md border bg-background">
									<Plus className="size-4" />
								</div>
								<div className="font-medium text-muted-foreground">
									Create Organization
								</div>
							</DropdownMenuItem>
						</DropdownMenuContent>
					)}
					{teams.length > 1 && (
						<DropdownMenuContent
							className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
							align="start"
							side={isMobile ? "bottom" : "right"}
							sideOffset={4}
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
									Create Organization
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
// }
// }
// }
// }
// }
// }
// }
// }
// }
// }
// }
// }
// }
// }
