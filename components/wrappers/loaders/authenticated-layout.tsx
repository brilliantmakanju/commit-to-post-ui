"use client";

import { useRouter } from "next/navigation";
import router from "next/router";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { LogoutModal } from "@/components/auth/modals/logout-modal";
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

import LoadingScreen from "./logo-loading";

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
	const cookietoken = getDecryptedCookie("cookie_state");

	useEffect(() => {
		if (!isClient) setIsClient(true);
	}, [isClient]);

	useEffect(() => {
		// Define an async function to handle sign-out logic.
		const checkCookieToken = async () => {
			// If there's a valid token, do nothing.
			if (await cookietoken) return;
			// Otherwise, clear state and sign out.
			logoutStore.setLogout(true);
			await clearCookies(); // Clear all cookies
			userStore.clearUser(); // Clear user data from Zustand
			organizationStore.clearOrganization();
			await signOut();
			router.push("/auth");
		};

		// Ensure this runs only on the client.
		if (typeof globalThis !== "undefined") {
			checkCookieToken();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [cookietoken, router]);

	return (
		<SidebarProvider className="h-screen overflow-hidden md:rounded-[20px]">
			<div className="flex h-screen w-full">
				<AppSidebar />

				<SidebarInset className="relative flex-1 overflow-hidden bg-[#1A1C20] md:rounded-[20px]">
					<main
						className={`relative h-full w-full ${
							status === "loading" || !isClient || logoutStore.logout
								? "flex items-center justify-center"
								: "overflow-y-auto text-[#EAF6FF]"
						}`}
					>
						<LogoutModal />
						{logoutStore.logout ? (
							<></>
						) : status === "loading" || !isClient ? (
							<LoadingScreen
								backgroundColor="#0A0E17"
								iconColor="#4FD1C5"
								splashColor="rgba(79, 209, 197, 0.3)"
								bubbleColor="rgba(79, 209, 197, 0.2)"
								iconSize={80}
								bounceHeight={40}
								bounceDuration={1.8}
								splashDuration={1}
							/>
						) : (
							<>
								<SidebarTrigger />
								{children}
							</>
						)}

						<Toaster />
					</main>
				</SidebarInset>
			</div>
		</SidebarProvider>
	);
}
