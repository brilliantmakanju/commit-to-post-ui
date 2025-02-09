"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { LogoutModal } from "@/components/auth/modals/logout-modal";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
// import { deleteCookie } from "@/lib/cookies/create-cookies";
// import { getDecryptedCookie } from "@/lib/cookies/getcookies";
import useLogoutStore from "@/lib/zustand/logout-store";

import LoadingScreen from "./logo-loading";

export function AuthenticatedLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { status } = useSession();
	const [isClient, setIsClient] = useState(false);
	const { logout } = useLogoutStore();

	useEffect(() => {
		setIsClient(true);
	}, [isClient]);

	// useEffect(() => {
	// 	const checkFirstLogin = async () => {
	// 		const firstLoginValue = await getDecryptedCookie("firstLogin");
	// 		if (firstLoginValue) {
	// 			await deleteCookie("firstLogin");
	// 			globalThis.location.reload();
	// 		}
	// 	};
	// 	checkFirstLogin();
	// }, []);
	return (
		<SidebarProvider className="h-screen overflow-hidden md:rounded-[30px]">
			<AppSidebar />
			<SidebarInset className="overflow-hidden bg-transparent md:rounded-[30px]">
				<main
					className={`relative h-auto w-full overflow-hidden ${
						status === "loading" || !isClient || logout
							? ""
							: "overflow-y-auto bg-[#232528] px-7 text-[#EAF6FF]"
					}`}
				>
					<LogoutModal />
					{status === "loading" || !isClient ? (
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
					<AppSidebar />
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
