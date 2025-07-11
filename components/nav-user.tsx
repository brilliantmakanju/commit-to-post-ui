"use client";

import { ChevronsUpDown, LogOut, User2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { clearCookies } from "@/lib/cookies/create-cookies";
import useLogoutStore from "@/lib/zustand/logout-store";
import useOrganizationStore from "@/lib/zustand/useorganization-store";
import useUserStore from "@/lib/zustand/useuser-store";
import { logout, signOut } from "@/server-actions/auth/signout";

export function NavUser({
	isLoadingAttachment = false,
}: {
	isLoadingAttachment?: boolean;
}) {
	const router = useRouter();
	const userStore = useUserStore();
	const { isMobile } = useSidebar();
	const logoutStore = useLogoutStore();
	const { data, status } = useSession();
	const organizationStore = useOrganizationStore();
	const [localStatus, setLocalStatus] = useState("loading");

	// useEffect(() => {
	// 	if (status === "unauthenticated") {
	// 		globalThis.window.location.reload();
	// 	}
	// }, [status]);

	const [firstNameFromFull, lastNameFromFull] = userStore.full_name
		? userStore.full_name.split(" ")
		: ["", ""];
	// Use store data while loading, then use session data when available
	const userData = userStore.justUpdated
		? {
				firstName: firstNameFromFull || data?.user?.first_name || "",
				lastName: lastNameFromFull || data?.user?.last_name || "",
				email: userStore.email || data?.user?.email || "",
			}
		: status === "loading"
			? {
					firstName: firstNameFromFull || "",
					lastName: lastNameFromFull || "",
					email: userStore.email || "",
				}
			: data?.user?.type === "magic" && status === "authenticated"
				? {
						firstName: data?.user?.first_name || firstNameFromFull || "",
						lastName: data?.user?.last_name || lastNameFromFull || "",
						email: data?.user?.email || userStore.email || "",
					}
				: {
						firstName: firstNameFromFull || data?.user?.first_name || "",
						lastName: lastNameFromFull || data?.user?.last_name || "",
						email: userStore.email || data?.user?.email || "",
					};

	const logoutClient = async () => {
		logoutStore.setLogout(true);
		userStore.clearUser();

		organizationStore.clearOrganization();
		await clearCookies();

		await logout();
		await signOut({ redirect: false });
		globalThis.location.href = "/";
	};

	if (status === "loading" || isLoadingAttachment) {
		return (
			<SidebarMenu>
				<SidebarMenuItem>
					<DropdownMenu>
						<DropdownMenuTrigger disabled asChild>
							<SidebarMenuButton
								size="lg"
								disabled
								className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
							>
								<Avatar className="h-8 w-8 rounded-lg">
									{/* <AvatarImage src={avatar || "/placeholder.svg"} alt={userData.firstName} /> */}
									<AvatarFallback className="rounded-lg">
										{userData.firstName?.charAt(0)}
										{userData.lastName?.charAt(0)}
									</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold">
										{userData.firstName} {userData.lastName}
									</span>
									<span className="truncate text-xs">
										{isLoadingAttachment
											? "Loading attachment..."
											: userData.email}
									</span>
								</div>
							</SidebarMenuButton>
						</DropdownMenuTrigger>
					</DropdownMenu>
				</SidebarMenuItem>
			</SidebarMenu>
		);
	}

	if (logoutStore.logout) {
		return;
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
							<Avatar className="h-8 w-8 rounded-lg">
								{/* <AvatarImage src={avatar || "/placeholder.svg"} alt={userData.firstName} /> */}
								<AvatarFallback className="rounded-lg">
									{userData.firstName?.charAt(0)}
									{userData.lastName?.charAt(0)}
								</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-semibold">
									{userData.firstName} {userData.lastName}
								</span>
								<span className="truncate text-xs">{userData.email}</span>
							</div>
							<ChevronsUpDown className="ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
						side={isMobile ? "bottom" : "right"}
						align="end"
						sideOffset={4}
					>
						<DropdownMenuLabel className="p-0 font-normal">
							<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								<Avatar className="h-8 w-8 rounded-lg">
									{/* <AvatarImage src={avatar || "/placeholder.svg"} alt={userData.firstName} /> */}
									<AvatarFallback className="rounded-lg">
										{userData.firstName?.charAt(0)}
										{userData.lastName?.charAt(0)}
									</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold">
										{userData.firstName} {userData.lastName}
									</span>
									<span className="truncate text-xs">{userData.email}</span>
								</div>
							</div>
						</DropdownMenuLabel>

						<DropdownMenuSeparator />
						<DropdownMenuItem asChild className="p-0">
							<Link
								href="/settings?tab=profile"
								className="flex w-full items-center gap-2 px-3 py-2"
							>
								<User2 className="h-4 w-4" />
								Profile Settings
							</Link>
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={() => logoutClient()}
							className="flex w-full items-center gap-2 px-3 py-2 text-destructive focus:text-destructive"
						>
							<LogOut className="h-4 w-4" />
							Log out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
