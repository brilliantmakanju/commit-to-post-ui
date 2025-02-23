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
		if (!isClient) setIsClient(true);
	}, [isClient]);

	return (
		<SidebarProvider className="h-screen overflow-hidden md:rounded-[20px]">
			<div className="flex h-screen w-full">
				<AppSidebar />

				<SidebarInset className="relative flex-1 overflow-hidden bg-[#1A1C20] md:rounded-[20px]">
					<main
						className={`relative h-full w-full ${
							status === "loading" || !isClient || logout
								? "flex items-center justify-center"
								: "overflow-y-auto text-[#EAF6FF]"
						}`}
					>
						<LogoutModal />
						{logout ? (
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
