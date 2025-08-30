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

import { TeamSwitcher } from "./organization-sidebar";

const navigationItems = [
	{
		title: "Dashboard",
		url: "/dashboard",
		icon: LayoutDashboard, // dashboard overview
	},
	{
		title: "Repositories",
		url: "/repositories",
		icon: FolderGit2, // repos / projects
	},
	{
		title: "Notifications",
		url: "/notifications",
		icon: Bell, // notifications
	},
	{
		title: "Billing",
		url: "/billing",
		icon: CreditCard, // billing / payments
	},
	{
		title: "Settings",
		url: "/settings",
		icon: Settings, // account / app settings
		items: [], // if you want nested sub-settings later
	},
];
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, [mounted]);

	return (
		<Sidebar variant="inset" collapsible="icon" {...props}>
			{mounted ? (
				<>
					<SidebarHeader>
						<TeamSwitcher isLoading={false} />
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
						<TeamSwitcher isLoading={mounted} />
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
