"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuAction,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	useSidebar,
} from "@/components/ui/sidebar";
import useRetrieveUnreadCount from "@/hooks/notifications/unread-counts";
import { useCheckAccess } from "@/hooks/plans/use-billing";
import { useLifetimeAccess } from "@/hooks/plans/use-ltd";
import { useBillingPortal } from "@/hooks/settings/use-billing";
import useLogoutStore from "@/lib/zustand/logout-store";

import { Skeleton } from "./ui/skeleton";

interface NavItem {
	title: string;
	url: string;
	icon: LucideIcon;
	isActive?: boolean;
	items?: {
		title: string;
		url: string;
	}[];
}

interface NavMainProps {
	items: NavItem[];
	isLoading?: boolean; // Added prop to accept loading state from parent
}

export function NavMain({
	items,
	isLoading: parentLoading = false,
}: NavMainProps) {
	const { status } = useSession();
	const { data: billingUrl } = useBillingPortal();
	const logoutStore = useLogoutStore();
	const sessionLoading = status === "loading";
	const hasAccess = useCheckAccess();
	const { has_unread } = useRetrieveUnreadCount();
	const userHasLifetimeAccess = useLifetimeAccess();
	// Combined loading state from both session and parent
	const isLoading = sessionLoading || parentLoading || logoutStore.logout;

	const isDisabled = (item: NavItem) => {
		if (isLoading) return true;
		if (item.title === "Billing" && !hasAccess) return true;
		return false;
	};

	const getItemUrl = (item: NavItem) => {
		if (item.title === "Billing" && hasAccess) {
			return billingUrl ?? item.url;
		}
		return item.url;
	};

	const { toggleSidebar, isMobile } = useSidebar();

	// Loading skeleton for navigation items
	// if (isLoading) {
	// 	return (
	// 		<SidebarGroup>
	// 			<SidebarMenu>
	// 				{[1, 2, 3, 4, 5].map(index => (
	// 					<SidebarMenuItem key={`skeleton-${index}`}>
	// 						<div className="flex w-full items-center gap-3 px-3 py-2">
	// 							<Skeleton className="h-5 w-9 rounded-md" />
	// 							<Skeleton className="h-5 w-full rounded-md" />
	// 						</div>
	// 					</SidebarMenuItem>
	// 				))}
	// 			</SidebarMenu>
	// 		</SidebarGroup>
	// 	);
	// }

	return (
		<SidebarGroup>
			<SidebarGroupLabel>Navigations</SidebarGroupLabel>
			<SidebarMenu className="gap-2">
				{items
					.filter(item => {
						// Filter out the "Billing" link if the user has lifetime access
						if (userHasLifetimeAccess && item.title === "Billing") {
							return false;
						}
						return true;
					})
					.map(item => (
						<Collapsible key={item.title} asChild defaultOpen={item.isActive}>
							<SidebarMenuItem>
								<SidebarMenuButton
									asChild
									tooltip={item.title}
									disabled={isDisabled(item) || isLoading}
								>
									<Link
										href={`${getItemUrl(item)}`}
										onClick={event => {
											if (isMobile) {
												toggleSidebar();
											}
											if (isDisabled(item)) {
												event.preventDefault();
											}
										}}
										className={
											isDisabled(item) ? "pointer-events-none opacity-50" : ""
										}
									>
										<span className="relative">
											<item.icon />
											{has_unread && item.title === "Notifications" && (
												<span className="absolute right-0.5 top-1 h-2 w-2 rounded-full bg-red-600" />
											)}
										</span>
										<span>{item.title}</span>
									</Link>
								</SidebarMenuButton>
								{item.items?.length ? (
									<>
										<CollapsibleTrigger asChild>
											<SidebarMenuAction
												className="data-[state=open]:rotate-90"
												disabled={isDisabled(item)}
											>
												<ChevronRight />
												<span className="sr-only">Toggle</span>
											</SidebarMenuAction>
										</CollapsibleTrigger>
										<CollapsibleContent>
											<SidebarMenuSub>
												{item.items.map(subItem => (
													<SidebarMenuSubItem key={subItem.title}>
														<SidebarMenuSubButton asChild>
															<Link
																href={`${getItemUrl(item)}`}
																onClick={event => {
																	if (isDisabled(item)) {
																		event.preventDefault();
																	}
																}}
																className={
																	isDisabled(item)
																		? "pointer-events-none opacity-50"
																		: ""
																}
															>
																<span>{subItem.title}</span>
															</Link>
														</SidebarMenuSubButton>
													</SidebarMenuSubItem>
												))}
											</SidebarMenuSub>
										</CollapsibleContent>
									</>
								) : undefined}
							</SidebarMenuItem>
						</Collapsible>
					))}
			</SidebarMenu>
		</SidebarGroup>
	);
}
