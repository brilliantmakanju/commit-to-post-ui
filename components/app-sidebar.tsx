"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BellDot, Bot, Settings2, SquareTerminal } from "lucide-react";
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
import { createEncryptedCookie } from "@/lib/cookies/create-cookies";
import useOrganizationStore from "@/lib/zustand/useorganization-store";
import { getOrganizations } from "@/server-actions/organizations/get-organizations";

import { TeamSwitcher } from "./organization-sidebar";

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

			// If the API call fails, return an empty array
			if (!result.success) {
				return [];
			}

			// Ensure there are organizations before proceeding
			if (result.organizations && result.organizations.length > 0) {
				// Retrieve stored organization domain from cookies
				useorganizationStore.setOrganization(result.organizations[0]);

				// Store the organization in cookies
				await createEncryptedCookie("organization", {
					domain: result.organizations[0].domains[0],
				});
				// Fetch and Invalidate Core Data
				queryClient.fetchQuery({ queryKey: ["organization-ownership"] });
				queryClient.invalidateQueries({
					queryKey: ["organization-ownership"],
				});

				queryClient.fetchQuery({ queryKey: ["retrieving_webhooks"] });
				queryClient.invalidateQueries({ queryKey: ["retrieving_webhooks"] });

				queryClient.fetchQuery({ queryKey: ["retrieving_social_status"] });
				queryClient.invalidateQueries({
					queryKey: ["retrieving_social_status"],
				});

				// Fetch and Invalidate Metrics
				queryClient.fetchQuery({ queryKey: ["dashboard_metrics"] });
				queryClient.invalidateQueries({ queryKey: ["dashboard_metrics"] });

				queryClient.fetchQuery({ queryKey: ["upcoming_posts_metrics"] });
				queryClient.invalidateQueries({
					queryKey: ["upcoming_posts_metrics"],
				});

				// Fetch and Invalidate Posts
				queryClient.fetchQuery({ queryKey: ["posts"] });
				queryClient.invalidateQueries({ queryKey: ["posts"] });

				// Fetch and Invalidate Notifications
				queryClient.fetchQuery({ queryKey: ["notifications"] });
				queryClient.invalidateQueries({ queryKey: ["notifications"] });

				queryClient.fetchQuery({ queryKey: ["recent_notifications"] });
				queryClient.invalidateQueries({ queryKey: ["recent_notifications"] });

				return result.organizations;
			}

			// Return organizations, even if empty
			return result.organizations;
		},
		staleTime: Infinity, // Keep the data fresh indefinitely
		refetchOnMount: false,
		refetchOnWindowFocus: false,
		refetchOnReconnect: true,
	});

	useEffect(() => {
		setMounted(true);
	}, [mounted]);

	return (
		<Sidebar variant="inset" collapsible="icon" {...props}>
			{mounted ? (
				<>
					<SidebarHeader>
						<TeamSwitcher teams={organizations || []} isLoading={isFetching} />
					</SidebarHeader>
					<SidebarContent>
						<NavMain items={navigationItems} isLoading={isFetching} />
					</SidebarContent>
					<SidebarFooter>
						<NavUser isLoadingAttachment={isFetching} />
					</SidebarFooter>
				</>
			) : (
				<>
					<SidebarHeader>
						<TeamSwitcher teams={[]} isLoading={isFetching} />
					</SidebarHeader>
					<SidebarContent>
						<NavMain items={navigationItems} isLoading={isFetching} />
					</SidebarContent>
					<SidebarFooter>
						<NavUser isLoadingAttachment={isFetching} />
					</SidebarFooter>
				</>
			)}
			<SidebarRail />
		</Sidebar>
	);
}
