"use client";

import {
	Bell,
	CreditCard,
	FolderGit2,
	LayoutDashboard,
	Settings,
} from "lucide-react";
import React, { useEffect, useState } from "react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from "@/components/ui/sidebar";
import useOrganizationStore from "@/zustand/useorganization-store";

import { TeamSwitcher } from "./organization-sidebar";

const navigationItems = [
	{
		title: "Dashboard",
		url: "/dashboard",
		icon: LayoutDashboard,
	},
	{
		title: "Repositories",
		url: "/repositories",
		icon: FolderGit2,
	},
	{
		title: "Billing",
		url: "/billing",
		icon: CreditCard,
	},
	{
		title: "Notifications",
		url: "/notifications",
		icon: Bell,
	},
	{
		title: "Settings",
		url: "/settings",
		icon: Settings,
		items: [],
	},
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const [mounted, setMounted] = useState(false);
	const { organizations } = useOrganizationStore();

	useEffect(() => {
		setMounted(true);
	}, [mounted]);

	return (
		<Sidebar variant="inset" collapsible="icon" {...props}>
			{mounted ? (
				<>
					<SidebarHeader>
						<TeamSwitcher teams={organizations || []} isLoading={false} />
					</SidebarHeader>
					<SidebarContent>
						<NavMain items={navigationItems} isLoading={false} />
					</SidebarContent>
					<SidebarFooter>
						<NavUser isLoadingAttachment={false} />
					</SidebarFooter>
				</>
			) : (
				<>
					<SidebarHeader>
						<TeamSwitcher teams={[]} isLoading={mounted} />
					</SidebarHeader>
					<SidebarContent>
						<NavMain items={navigationItems} isLoading={mounted} />
					</SidebarContent>
					<SidebarFooter>
						<NavUser isLoadingAttachment={mounted} />
					</SidebarFooter>
				</>
			)}
			<SidebarRail />
		</Sidebar>
	);
}
