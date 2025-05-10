"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import React, { useEffect } from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { LogoutModal } from "@/components/auth/modals/logout-modal";
import TopNavigation from "@/components/dashboard/nav-top";
import { RequestInterceptor } from "@/components/interceptor";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { clearCookies } from "@/lib/cookies/create-cookies";
import { getDecryptedCookie } from "@/lib/cookies/getcookies";
import useLogoutStore from "@/lib/zustand/logout-store";
import useOrganizationStore from "@/lib/zustand/useorganization-store";
import useUserStore from "@/lib/zustand/useuser-store";
import { signOut } from "@/server-actions/auth/signout";

// Dynamically import non-critical components
const SubPlanCheckout = dynamic(
	() => import("@/components/auth/subscription/sub-plan-checkout"),
	{ ssr: false },
);
const Toaster = dynamic(
	() => import("@/components/ui/sonner").then(module_ => module_.Toaster),
	{ ssr: false },
);

interface AuthenticatedLayoutProps {
	children: React.ReactNode;
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
	const router = useRouter();
	const { status } = useSession();

	const logoutStore = useLogoutStore();
	const userStore = useUserStore();
	const organizationStore = useOrganizationStore();

	const isClient = typeof globalThis !== "undefined";

	useEffect(() => {
		let mounted = true;

		const validateCookie = async () => {
			try {
				const token = await getDecryptedCookie("cookie_state");

				if (!mounted) return;

				if (!token) {
					logoutStore.setLogout(true);
					organizationStore.clearOrganization();
					userStore.clearUser();
					await clearCookies();
					await signOut();
					router.push("/");
				}
			} catch {
				// Optionally log or handle cookie error
			}
		};

		if (isClient) {
			const timeout = setTimeout(() => {
				void validateCookie();
			}, 100);

			return () => {
				mounted = false;
				clearTimeout(timeout);
			};
		}
	}, [isClient, logoutStore, organizationStore, router, userStore]);

	const showLoadingModal = !isClient || status === "loading";
	const showMainContent =
		status !== "loading" && isClient && !logoutStore.logout;

	return (
		<SidebarProvider className="h-screen overflow-hidden md:rounded-[20px]">
			<LogoutModal showByDefault={showLoadingModal} />

			<div className="flex h-screen w-full">
				<AppSidebar />

				<SidebarInset className="relative flex-1 overflow-hidden bg-[#0A0A0A] md:rounded-[20px]">
					<main
						className={`relative mb-2 h-full w-full md:mb-0 ${
							showMainContent
								? "overflow-y-auto text-[#EAF6FF]"
								: "flex items-center justify-center"
						}`}
					>
						{/* <TopNavigation>
						</TopNavigation> */}

						<SidebarTrigger className="absolute left-0 top-0" />
						{children}

						<SubPlanCheckout />
						<RequestInterceptor />
						<Toaster />
					</main>
				</SidebarInset>
			</div>
		</SidebarProvider>
	);
}
