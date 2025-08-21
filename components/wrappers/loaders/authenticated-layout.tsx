"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import React, { Suspense, useEffect, useState } from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { LogoutModal } from "@/components/auth/modals/logout-modal";
import { RequestInterceptor } from "@/components/interceptor";
import { useSessionManager } from "@/components/tracker/auth-tracker";
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

// Loading component for better UX
const LoadingScreen = ({ message }: { message?: string }) => (
	<div className="flex h-screen w-full items-center justify-center bg-[#0A0A0A]">
		<div className="flex flex-col items-center space-y-4">
			<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
			<p className="text-sm text-gray-400">{message || "Loading..."}</p>
		</div>
	</div>
);

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
	const router = useRouter();
	const userStore = useUserStore();
	const logoutStore = useLogoutStore();
	const { data: session, status } = useSession();
	const organizationStore = useOrganizationStore();
	const [onboardingChecked, setOnboardingChecked] = useState(false);

	// Client-side mounting state
	const [isClient, setIsClient] = useState(false);
	const [cookieValidated, setCookieValidated] = useState(false);

	// Organization fetching
	const {
		hasCurrentOrg,
		isError: orgError,
		shouldShowContent,
		isLoading: isOrgLoading,
	} = useFetchOrganizations();

	// Session management with auto-logout
	const { isSessionValid, SessionUI } = useSessionManager({
		inactivityTimeout: 30, // 30 minutes of inactivity
		warningTime: 5, // Warn 5 minutes before logout
	});

	// Initialize client state
	useEffect(() => {
		setIsClient(true);
	}, []);

	// Cookie validation effect
	useEffect(() => {
		if (!isClient) return;

		let mounted = true;

		const validateCookie = async () => {
			try {
				const cookieState = await getDecryptedCookie("cookie_state");

				if (!mounted) return;

				if (!cookieState) {
					// Force logout if no cookie_state found
					logoutStore.setLogout(true);
					organizationStore.clearOrganization();
					userStore.clearUser();
					await clearCookies();
					await signOut({ redirect: false });
					globalThis.location.href = "/";
					return;
				}

				// We rely on useSessionManager + fetch interceptor to handle invalid cookies
				setCookieValidated(true);
			} catch {
				if (mounted) {
					// Force logout on cookie validation error
					logoutStore.setLogout(true);
					organizationStore.clearOrganization();
					userStore.clearUser();
					await clearCookies();
					await signOut({ redirect: false });
					globalThis.location.href = "/";
				}
			}
		};

		const timeout = setTimeout(validateCookie, 100);

		return () => {
			mounted = false;
			clearTimeout(timeout);
		};
	}, [isClient, logoutStore, organizationStore, router, userStore]);

	// --- New user onboarding guard (client-side) ---
	useEffect(() => {
		const checkNewUser = async () => {
			try {
				const sessionData = await getDecryptedCookie("user_state");
				const isNewUser = sessionData?.new_user || false;

				if (isNewUser) {
					// 🚀 Use hard navigation to prevent dashboard flash
					globalThis.window.location.replace("/start");
					return;
				}
			} catch {
				console.error("Failed to check new user cookie");
			} finally {
				// ✅ Only unlock rendering once decision is made
				setOnboardingChecked(true);
			}
		};

		if (isClient && cookieValidated && session?.user) {
			checkNewUser();
		}
	}, [isClient, cookieValidated, session]);

	// 🔒 Block rendering until onboarding check is done
	if (!onboardingChecked) {
		return <LoadingScreen message="Checking your account..." />;
	}

	// Comprehensive loading state logic
	const isSessionLoading = status === "loading";
	const isInitializing = !isClient || !cookieValidated;
	const isOrganizationLoading = isOrgLoading && !hasCurrentOrg;
	const shouldLogout = logoutStore.logout;

	// Determine what to show
	const showLoading =
		isInitializing || isSessionLoading || isOrganizationLoading;
	// const showContent = !showLoading && !shouldLogout && shouldShowContent;
	const showContent =
		!showLoading && !shouldLogout && shouldShowContent && isSessionValid;

	// Don't render anything on server side to prevent hydration mismatch
	if (!isClient) {
		return <LoadingScreen message="Initializing..." />;
	}

	// Show logout modal when logging out
	if (shouldLogout) {
		return <LogoutModal showByDefault={shouldLogout} />;
	}

	// Show loading states with appropriate messages
	if (showLoading) {
		let loadingMessage = "Loading...";

		if (isSessionLoading) {
			loadingMessage = "Authenticating...";
		} else if (isOrganizationLoading) {
			loadingMessage = "Setting up your organizations...";
		} else if (isInitializing) {
			loadingMessage = "Initializing...";
		}

		return (
			<>
				{/* <LogoutModal showByDefault={true} /> */}
				<LoadingScreen message={loadingMessage} />
			</>
		);
	}

	// Handle organization setup errors
	if (orgError) {
		return (
			<div className="flex h-screen w-full items-center justify-center bg-[#0A0A0A]">
				<div className="flex flex-col items-center space-y-4 text-center">
					<div className="text-red-500">
						<svg
							className="mx-auto h-12 w-12"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					</div>
					<h2 className="text-xl font-semibold text-white">Setup Error</h2>
					<p className="max-w-md text-gray-400">
						There was an issue setting up your organizations. Please refresh the
						page or contact support.
					</p>
					<button
						onClick={() => globalThis.location.reload()}
						className="mt-4 rounded bg-primary px-4 py-2 text-white transition-colors hover:bg-primary/80"
					>
						Retry
					</button>
				</div>
			</div>
		);
	}

	// Only render the main layout when everything is ready
	return (
		<>
			<SessionUI />
			<SidebarProvider className="scrollbar-hide h-screen overflow-hidden md:rounded-[20px]">
				<div className="flex h-screen w-full">
					<AppSidebar />
					<SidebarInset className="scrollbar-hide relative flex-1 overflow-hidden bg-[#0A0A0A] md:rounded-[20px]">
						<main className="scrollbar-hide relative mb-2 h-full w-full overflow-y-auto text-[#EAF6FF] md:mb-0">
							<SidebarTrigger className="absolute left-0 top-0" />
							<Suspense
								fallback={<LoadingScreen message="Loading content..." />}
							>
								{children}
							</Suspense>
							<SubPlanCheckout />
							<RequestInterceptor />
							<Toaster />
						</main>
					</SidebarInset>
					{/* <MaintenanceCornerBanner /> */}
				</div>
			</SidebarProvider>
		</>
	);
}
