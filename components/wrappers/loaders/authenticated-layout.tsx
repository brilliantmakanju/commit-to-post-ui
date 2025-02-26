"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import type React from "react";
import { useEffect, useState } from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { LogoutModal } from "@/components/auth/modals/logout-modal";
import TopNavigation from "@/components/dashboard/nav-top";
import { RequestInterceptor } from "@/components/interceptor";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { clearCookies } from "@/lib/cookies/create-cookies";
import { getDecryptedCookie } from "@/lib/cookies/getcookies";
import useLogoutStore from "@/lib/zustand/logout-store";
import useOrganizationStore from "@/lib/zustand/useorganization-store";
import useUserStore from "@/lib/zustand/useuser-store";
import { signOut } from "@/server-actions/auth/signout";

export function AuthenticatedLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const router = useRouter();
	const { status } = useSession();
	const userStore = useUserStore();
	const logoutStore = useLogoutStore();
	const [isClient, setIsClient] = useState(false);
	const organizationStore = useOrganizationStore();

	useEffect(() => {
		if (!isClient) setIsClient(true);
	}, [isClient]);

	useEffect(() => {
		let mounted = true;

		const validateCookie = async () => {
			try {
				const token = await getDecryptedCookie("cookie_state");

				if (!mounted) return;

				if (!token) {
					logoutStore.setLogout(true);
					await clearCookies();
					userStore.clearUser();
					organizationStore.clearOrganization();
					await signOut();
					router.push("/auth");
				}
			} catch {
				return;
			}
		};

		if (typeof globalThis !== "undefined") {
			validateCookie();
		}

		return () => {
			mounted = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [logoutStore, router, organizationStore, userStore]);

	return (
		<SidebarProvider className="h-screen overflow-hidden md:rounded-[20px]">
			<LogoutModal />

			{(!isClient || status === "loading") && (
				<LogoutModal showByDefault={!isClient || status === "loading"} />
			)}

			<div className="flex h-screen w-full">
				<AppSidebar />

				<SidebarInset className="relative flex-1 overflow-hidden bg-[#1A1C20] md:rounded-[20px]">
					<main
						className={`relative h-full w-full py-3 ${
							status === "loading" || !isClient || logoutStore.logout
								? "flex items-center justify-center"
								: "overflow-y-auto text-[#EAF6FF]"
						}`}
					>
						<TopNavigation>
							<SidebarTrigger />
						</TopNavigation>
						{children}
						<RequestInterceptor />
						<Toaster />
					</main>
				</SidebarInset>
			</div>
		</SidebarProvider>
	);
}
