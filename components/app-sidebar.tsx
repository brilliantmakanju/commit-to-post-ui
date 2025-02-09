"use client";

import { useQuery } from "@tanstack/react-query";
import { Bot, Settings2, SquareTerminal } from "lucide-react";
import React, { useEffect, useState } from "react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
} from "@/components/ui/sidebar";
import { createEncryptedCookie } from "@/lib/cookies/create-cookies";
import useOrganizationStore from "@/lib/zustand/useorganization-store";
import { getOrganizations } from "@/server-actions/organizations/get-organizations";

import { TeamSwitcher } from "./organization-sidebar";

const data = {
	navMain: [
		{
			title: "Dashboard",
			url: "/dashboard",
			icon: SquareTerminal,
			isActive: true,
			items: [],
		},
		{
			title: "Post",
			url: "/posts",
			icon: Bot,
			items: [],
		},
		// {
		// 	title: "Resources",
		// 	url: "#",
		// 	icon: BookOpen,
		// 	items: [
		// 		{
		// 			title: "FAQs",
		// 			url: "#",
		// 		},
		// 		{
		// 			title: "How-To Guides",
		// 			url: "#",
		// 		},
		// 	],
		// },
		{
			title: "Settings",
			url: "/settings",
			icon: Settings2,
			items: [
				{
					title: "General",
					url: "settings?tab=general",
				},
				{
					title: "Billing",
					url: "settings?tab=billing",
				},
				{
					title: "Profile",
					url: "settings?tab=profile",
				},
			],
		},
	],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const [mounted, setMounted] = useState(false);
	const useorganizationStore = useOrganizationStore();

	const { data: organizations, isFetching } = useQuery({
		queryKey: ["organizations"],
		queryFn: async () => {
			const result = await getOrganizations();

			if (!result.success) {
				return [];
			}

			if (result.organizations && result.organizations.length > 0) {
				// Only set organization if it's not already set
				const currentOrg = useOrganizationStore.getState().organization;
				if (currentOrg.name === "") {
					useorganizationStore.clearOrganization();
					useorganizationStore.setOrganization(result.organizations[0]);
					await createEncryptedCookie("organization", {
						domain: result.organizations[0].domains[0],
					});
				} else {
					useorganizationStore.clearOrganization();
					useorganizationStore.setOrganization(result.organizations[0]);
					await createEncryptedCookie("organization", {
						domain: result.organizations[0].domains[0],
					});
				}
			}

			return result.organizations;
		},
		staleTime: Infinity, // Keep the data fresh indefinitely
		refetchOnMount: false,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
	});

	useEffect(() => {
		setMounted(true);
	}, [mounted]);

	return (
		<Sidebar variant="inset" {...props}>
			{mounted ? (
				<>
					<SidebarHeader>
						<TeamSwitcher teams={organizations || []} isLoading={isFetching} />
					</SidebarHeader>
					<SidebarContent>
						<NavMain items={data.navMain} />
					</SidebarContent>
					<SidebarFooter>
						<NavUser />
					</SidebarFooter>
				</>
			) : (
				<>
					<SidebarHeader>
						<TeamSwitcher teams={[]} isLoading={isFetching} />
					</SidebarHeader>
					<SidebarContent>
						<NavMain items={data.navMain} />
					</SidebarContent>
				</>
			)}
		</Sidebar>
	);
}
