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
	useSidebar,
} from "@/components/ui/sidebar";

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
		title: "Notifications",
		url: "/notifications",
		icon: Bell,
	},
	{
		title: "Billing",
		url: "/billing",
		icon: CreditCard,
	},
	{
		title: "Settings",
		url: "/settings",
		icon: Settings,
		items: [],
	},
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { toggleSidebar } = useSidebar();
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		// Ensure we're on the client side
		setIsClient(true);
		toggleSidebar();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// For SSR compatibility, always render something
	// but use different loading states based on client/server
	const isLoading = !isClient;

	return (
		<Sidebar variant="floating" collapsible="icon" {...props}>
			<SidebarHeader>
				<TeamSwitcher isLoading={isLoading} />
			</SidebarHeader>
			<SidebarContent className="-ml-1">
				<NavMain items={navigationItems} isLoading={isLoading} />
			</SidebarContent>
			<SidebarFooter className="flex lg:hidden">
				<NavUser isLoadingAttachment={isLoading} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
