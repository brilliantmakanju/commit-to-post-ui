"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import React, { Suspense, useEffect } from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { LogoutModal } from "@/components/auth/modals/logout-modal";
import { MaintenanceCornerBanner } from "@/components/general/micro/maintenance/maintenance-corner-banner";
import { RequestInterceptor } from "@/components/interceptor";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { useFetchOrganizations } from "@/hooks/core/repo/use-organization-hook";
import { clearCookies } from "@/lib/cookies/create-cookies";
import { getDecryptedCookie } from "@/lib/cookies/getcookies";
import { logout, signOut } from "@/server-actions/auth/signout";
import useLogoutStore from "@/zustand/logout-store";
import useOrganizationStore from "@/zustand/useorganization-store";
import useUserStore from "@/zustand/useuser-store";

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
	const userStore = useUserStore();
	const logoutStore = useLogoutStore();
	const { data: session, status } = useSession();
	const organizationStore = useOrganizationStore();
	const isClient = typeof globalThis !== "undefined";

	useEffect(() => {
		if (
			status === "authenticated" &&
			session?.user &&
			userStore.hasHydratedUser === false
		) {
			userStore.setUser({
				github_connected: session.user.github_connected,
				hasHydratedUser: true,
			});
		}
	}, [session, status, userStore]);

	useEffect(() => {
		let mounted = true;

		const validateCookie = async () => {
			try {
				const token = await getDecryptedCookie("cookie_state");

				if (!mounted) return;

				if (!token) {
					logoutStore.setLogout(true);
					organizationStore.clearOrganization();

					logout();
					await clearCookies();
					await signOut({ redirect: false });
					globalThis.location.href = "/";
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
	const { isLoading } = useFetchOrganizations();

	const showLoadingModal = !isClient || status === "loading" || isLoading;
	const showMainContent =
		status !== "loading" && isClient && !logoutStore.logout && !isLoading;

	return (
		<SidebarProvider className="scrollbar-hide h-screen overflow-hidden md:rounded-[20px]">
			<LogoutModal showByDefault={showLoadingModal} />

			<div className="flex h-screen w-full">
				<AppSidebar />

				<SidebarInset className="scrollbar-hide relative flex-1 overflow-hidden bg-[#0A0A0A] md:rounded-[20px]">
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
						<Suspense>{children}</Suspense>

						<SubPlanCheckout />
						<RequestInterceptor />
						<Toaster />
					</main>
				</SidebarInset>
				<MaintenanceCornerBanner />
			</div>
		</SidebarProvider>
	);
}

// "use client";
// import dynamic from "next/dynamic";
// import { useRouter } from "next/navigation";
// import { useSession } from "next-auth/react";
// import React, { Suspense, useEffect, useState } from "react";

// import { AppSidebar } from "@/components/app-sidebar";
// import { LogoutModal } from "@/components/auth/modals/logout-modal";
// import { MaintenanceCornerBanner } from "@/components/general/micro/maintenance/maintenance-corner-banner";
// import { RequestInterceptor } from "@/components/interceptor";
// import {
// 	SidebarInset,
// 	SidebarProvider,
// 	SidebarTrigger,
// } from "@/components/ui/sidebar";
// import { useFetchOrganizations } from "@/hooks/core/repo/use-organization-hook";
// import { clearCookies } from "@/lib/cookies/create-cookies";
// import { getDecryptedCookie } from "@/lib/cookies/getcookies";
// import { logout, signOut } from "@/server-actions/auth/signout";
// import useLogoutStore from "@/zustand/logout-store";
// import useOrganizationStore from "@/zustand/useorganization-store";
// import useUserStore from "@/zustand/useuser-store";

// // Dynamically import non-critical components
// const SubPlanCheckout = dynamic(
// 	() => import("@/components/auth/subscription/sub-plan-checkout"),
// 	{ ssr: false },
// );
// const Toaster = dynamic(
// 	() => import("@/components/ui/sonner").then(module => module.Toaster),
// 	{ ssr: false },
// );

// interface AuthenticatedLayoutProps {
// 	children: React.ReactNode;
// }

// export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
// 	const router = useRouter();
// 	const userStore = useUserStore();
// 	const logoutStore = useLogoutStore();
// 	const { data: session, status } = useSession();
// 	const organizationStore = useOrganizationStore();
// 	const [isClient, setIsClient] = useState(false);
// 	const [cookieValidated, setCookieValidated] = useState(false);

// 	// Client-side hydration check
// 	useEffect(() => {
// 		setIsClient(true);
// 	}, []);

// 	// Optimized user hydration
// 	useEffect(() => {
// 		if (
// 			status === "authenticated" &&
// 			session?.user &&
// 			!userStore.hasHydratedUser
// 		) {
// 			userStore.setUser({
// 				github_connected: session.user.github_connected,
// 				hasHydratedUser: true,
// 			});
// 		}
// 	}, [session, status, userStore]);

// 	// Optimized cookie validation - run once on mount
// 	useEffect(() => {
// 		if (!isClient) return;

// 		let mounted = true;

// 		const validateCookie = async () => {
// 			try {
// 				const token = await getDecryptedCookie("cookie_state");

// 				if (!mounted) return;

// 				if (!token) {
// 					logoutStore.setLogout(true);
// 					organizationStore.clearOrganization();

// 					// Perform logout actions
// 					logout();
// 					await clearCookies();
// 					await signOut({ redirect: false });
// 					globalThis.location.href = "/";
// 					return;
// 				}

// 				setCookieValidated(true);
// 			} catch (error) {
// 				console.warn("Cookie validation failed:", error);
// 				if (mounted) {
// 					setCookieValidated(true); // Allow to proceed even if cookie check fails
// 				}
// 			}
// 		};

// 		// Validate immediately, no timeout needed
// 		validateCookie();

// 		return () => {
// 			mounted = false;
// 		};
// 	}, [isClient, logoutStore, organizationStore]);

// 	const { isLoading, shouldShowContent, hasCurrentOrg } =
// 		useFetchOrganizations();

// 	// More intelligent loading state management
// 	const isSessionLoading = status === "loading";
// 	const isAppLoading = !cookieValidated || (isLoading && !hasCurrentOrg);
// 	const isLoggedOut = logoutStore.logout;

// 	// Show loading modal only when necessary
// 	const showLoadingModal =
// 		!isClient || isSessionLoading || isAppLoading || isLoggedOut;

// 	// Show main content as soon as we can
// 	const showMainContent =
// 		isClient &&
// 		cookieValidated &&
// 		status !== "loading" &&
// 		!isLoggedOut &&
// 		(shouldShowContent || hasCurrentOrg);

// 	return (
// 		<SidebarProvider className="h-screen overflow-hidden md:rounded-[20px]">
// 			<LogoutModal showByDefault={showLoadingModal} />
// 			<div className="flex h-screen w-full">
// 				<AppSidebar />
// 				<SidebarInset className="relative flex-1 overflow-hidden bg-[#0A0A0A] md:rounded-[20px]">
// 					<main
// 						className={`relative mb-2 h-full w-full md:mb-0 ${
// 							showMainContent
// 								? "overflow-y-auto text-[#EAF6FF]"
// 								: "flex items-center justify-center"
// 						}`}
// 					>
// 						<SidebarTrigger className="absolute left-0 top-0" />

// 						{showMainContent ? (
// 							<Suspense
// 								fallback={
// 									<div className="flex h-full items-center justify-center">
// 										<div className="h-8 w-8 animate-spin rounded-full border-b-2 border-white"></div>
// 									</div>
// 								}
// 							>
// 								{children}
// 							</Suspense>
// 						) : (
// 							<></>
// 						)}

// 						<SubPlanCheckout />
// 						<RequestInterceptor />
// 						<Toaster />
// 					</main>
// 				</SidebarInset>
// 				<MaintenanceCornerBanner />
// 			</div>
// 		</SidebarProvider>
// 	);
// }
