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
} from "@/components/ui/sidebar";
import useLogoutStore from "@/lib/zustand/logout-store";

export function NavMain({
	items,
}: {
	items: {
		title: string;
		url: string;
		icon: LucideIcon;
		isActive?: boolean;
		items?: {
			title: string;
			url: string;
		}[];
	}[];
}) {
	const { status } = useSession();
	const isLoading = status === "loading";
	const logoutStore = useLogoutStore();

	return (
		<SidebarGroup>
			<SidebarMenu>
				{items.map(item => (
					<Collapsible key={item.title} asChild defaultOpen={item.isActive}>
						<SidebarMenuItem>
							<SidebarMenuButton
								asChild
								tooltip={item.title}
								disabled={isLoading || logoutStore.logout}
							>
								<Link
									prefetch={false}
									href={item.url}
									onClick={event_ => {
										if (isLoading || logoutStore.logout) {
											event_.preventDefault();
										}
									}}
									className={
										isLoading || logoutStore.logout
											? "pointer-events-none opacity-50"
											: ""
									}
								>
									<item.icon />
									<span>{item.title}</span>
								</Link>
							</SidebarMenuButton>
							{item.items?.length ? (
								<>
									<CollapsibleTrigger asChild>
										<SidebarMenuAction
											className="data-[state=open]:rotate-90"
											disabled={isLoading || logoutStore.logout}
										>
											<ChevronRight />
											<span className="sr-only">Toggle</span>
										</SidebarMenuAction>
									</CollapsibleTrigger>
									<CollapsibleContent>
										<SidebarMenuSub>
											{item.items?.map(subItem => (
												<SidebarMenuSubItem key={subItem.title}>
													<SidebarMenuSubButton asChild>
														<Link
															href={subItem.url}
															prefetch={false}
															onClick={event_ => {
																if (isLoading || logoutStore.logout) {
																	event_.preventDefault();
																}
															}}
															className={
																isLoading || logoutStore.logout
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
