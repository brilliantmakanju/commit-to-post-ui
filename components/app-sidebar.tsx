"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
	BellDot,
	BellDotIcon,
	Bot,
	Settings2,
	SquareTerminal,
	WalletMinimal,
} from "lucide-react";
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
import { getDecryptedCookie } from "@/lib/cookies/getcookies";
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
		{
			title: "Notifications",
			url: "/notifications",
			icon: BellDotIcon,
			items: [],
		},
		{
			title: "Billing",
			url: "#",
			icon: WalletMinimal,
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
				// {
				// 	title: "General",
				// 	url: "settings?tab=general",
				// },
				// {
				// 	title: "Billing",
				// 	url: "settings?tab=billing",
				// },
				// {
				// 	title: "Profile",
				// 	url: "settings?tab=profile",
				// },
			],
		},
	],
};

const navigationItems = [
	{
		title: "Dashboard",
		url: "/dashboard",
		icon: SquareTerminal,
		isActive: true,
	},
	{
		title: "Post",
		url: "/posts",
		icon: Bot,
	},
	{
		title: "Notifications",
		url: "/notifications",
		icon: BellDot,
	},
	{
		title: "Billing",
		url: "#",
		icon: WalletMinimal,
	},
	{
		title: "Settings",
		url: "/settings",
		icon: Settings2,
		items: [],
	},
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const queryClient = useQueryClient();
	const [mounted, setMounted] = useState(false);
	const useorganizationStore = useOrganizationStore();
	const { data: organizations, isFetching } = useQuery({
		queryKey: ["organizations"],
		queryFn: async () => {
			const result = await getOrganizations();

			// Log the result for debugging
			console.log("Fetched organizations:", result);

			// If the API call fails, return an empty array
			if (!result.success) {
				console.warn("Failed to fetch organizations");
				return [];
			}

			// Ensure there are organizations before proceeding
			if (result.organizations && result.organizations.length > 0) {
				// Retrieve stored organization domain from cookies
				const domain = await getDecryptedCookie("organization");
				// If there's no stored organization, set the first available one
				if (domain?.domain === undefined) {
					useorganizationStore.setOrganization(result.organizations[0]);

					// Store the organization in cookies
					await createEncryptedCookie("organization", {
						domain: result.organizations[0].domains[0],
					});
					const domains = await getDecryptedCookie("organization");
					console.log(domains, "Domains");
					queryClient.fetchQuery({ queryKey: ["posts"] });
					queryClient.invalidateQueries({ queryKey: ["posts"] });
					queryClient.fetchQuery({ queryKey: ["retrieving_webhooks"] });
					queryClient.fetchQuery({ queryKey: ["organization-ownership"] });
					queryClient.fetchQuery({ queryKey: ["retrieving_social_status"] });
					queryClient.invalidateQueries({ queryKey: ["retrieving_webhooks"] });
					queryClient.invalidateQueries({
						queryKey: ["organization-ownership"],
					});
					queryClient.invalidateQueries({
						queryKey: ["retrieving_social_status"],
					});

					return result.organizations;
				} else {
					console.info(
						"Organization already set, returning fetched organizations.",
					);
					return result.organizations;
				}
			}

			// Return organizations, even if empty
			console.info("No organizations found.");
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
						<NavMain items={navigationItems} />
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
