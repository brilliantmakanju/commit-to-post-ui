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
	SidebarMenu,
	SidebarMenuAction,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import useRetrieveUnreadCount from "@/hooks/notifications/unread-counts";
import { useCheckAccess } from "@/hooks/plans/use-billing";
import { useBillingPortal } from "@/hooks/settings/use-billing";
import useLogoutStore from "@/lib/zustand/logout-store";

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
}

export function NavMain({ items }: NavMainProps) {
	const { status } = useSession();
	const { data: billingUrl } = useBillingPortal();
	const logoutStore = useLogoutStore();
	const isLoading = status === "loading";
	const hasAccess = useCheckAccess();
	const { has_unread } = useRetrieveUnreadCount();

	const isDisabled = (item: NavItem) => {
		if (isLoading || logoutStore.logout) return true;
		if (item.title === "Billing" && !hasAccess) return true;
		return false;
	};

	const getItemUrl = (item: NavItem) => {
		if (item.title === "Billing" && hasAccess) {
			return billingUrl ?? item.url;
		}
		return item.url;
	};

	return (
		<SidebarGroup>
			<SidebarMenu>
				{items.map(item => (
					<Collapsible key={item.title} asChild defaultOpen={item.isActive}>
						<SidebarMenuItem>
							<SidebarMenuButton
								asChild
								tooltip={item.title}
								disabled={isDisabled(item)}
							>
								<Link
									href={`${getItemUrl(item)}`}
									onClick={event => {
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
