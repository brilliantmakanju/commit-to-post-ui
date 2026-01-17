"use client";

import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import React, {
	Suspense,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { LogoutModal } from "@/components/auth/modals/logout-modal";
import { RequestInterceptor } from "@/components/interceptor";
import { TopNav } from "@/components/top-nav";
import { useSessionManager } from "@/components/tracker/auth-tracker";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useFetchOrganizations } from "@/hooks/core/repo/use-organization-hook";
import { getDecryptedCookie } from "@/lib/cookies/getcookies";
// Import sync utilities
import {
	clearUserData,
	hasCompletedOnboarding,
	hasUserDataChanged,
	syncUserData,
	validateUserData,
} from "@/lib/sync-user-data";
import useLogoutStore from "@/zustand/logout-store";
import useUserStore from "@/zustand/useuser-store";

// Dynamically import non-critical components
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
	const hasSyncedRef = useRef(false);
	const logoutStore = useLogoutStore();
	const { data: session, status } = useSession();
	const lastSyncedDataRef = useRef<any>(undefined);
	const { setUser, hasHydratedUser, clearUser } = useUserStore();
	const [forceShowContent, setForceShowContent] = useState(false);
	const [onboardingChecked, setOnboardingChecked] = useState(false);
	const [initializationComplete, setInitializationComplete] = useState(false);

	// Client-side mounting state
	const [isClient, setIsClient] = useState(false);
	const [cookieValidated, setCookieValidated] = useState(false);

	// Organization fetching with timeout handling
	const {
		isError: orgError,
		shouldShowContent,
		isLoading: isOrgLoading,
	} = useFetchOrganizations();

	// Session management with auto-logout
	const { isSessionValid, SessionUI, logout } = useSessionManager({
		inactivityTimeout: 50, // 50 minutes of inactivity
		warningTime: 10, // Warn 10 minutes before logout
	});

	// Memoized sync function to prevent recreations
	const syncUserStoreData = useCallback(
		(userData: any) => {
			if (
				hasSyncedRef.current && // Only re-sync if data has actually changed
				!hasUserDataChanged(lastSyncedDataRef.current, userData)
			) {
				return;
			}

			try {
				// Validate user data before syncing
				if (!validateUserData(userData)) {
					return;
				}

				const syncedData = syncUserData(userData);
				setUser(syncedData);

				hasSyncedRef.current = true;
				lastSyncedDataRef.current = userData;
			} catch {}
		},
		[setUser],
	);

	// Initialize client state
	useEffect(() => {
		setIsClient(true);
	}, []);

	// Emergency timeout to prevent infinite loading
	useEffect(() => {
		if (!isClient) return;

		const emergencyTimeout = setTimeout(() => {
			setCookieValidated(true);
			setForceShowContent(true);
			setOnboardingChecked(true);
			setInitializationComplete(true);
		}, 8000); // 8 second emergency timeout

		return () => clearTimeout(emergencyTimeout);
	}, [isClient]);

	// Cookie validation effect
	useEffect(() => {
		if (!isClient || cookieValidated) return;

		let mounted = true;

		const validateCookie = async () => {
			try {
				const cookieState = await getDecryptedCookie("cookie_state");

				if (!mounted) return;

				if (!cookieState) {
					await logout();
					return;
				}

				// Validate cookie hasn't expired
				if (cookieState.created_at) {
					const createdAt = new Date(`${cookieState.created_at}`);
					const now = new Date();
					const hoursSinceCreation =
						(now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

					// If cookie is older than 30 days, force re-authentication
					if (hoursSinceCreation > 20) {
						console.warn("⚠️ Cookie expired - forcing logout");
						await logout();
						return;
					}
				}

				setCookieValidated(true);
			} catch {
				if (mounted) {
					await logout();
				}
			}
		};

		const timeout = setTimeout(() => {
			if (mounted) {
				validateCookie();
			}
		}, 200);

		// Fallback timeout
		const fallbackTimeout = setTimeout(() => {
			if (mounted && !cookieValidated) {
				console.warn("⚠️ proceeding anyway");
				setCookieValidated(true);
			}
		}, 3000);

		return () => {
			mounted = false;
			clearTimeout(timeout);
			clearTimeout(fallbackTimeout);
		};
	}, [isClient, cookieValidated, logout]);

	// Single effect to handle user store synchronization
	useEffect(() => {
		if (
			status === "authenticated" &&
			session?.user &&
			!hasHydratedUser &&
			!hasSyncedRef.current
		) {
			syncUserStoreData(session.user);
		}
	}, [status, session?.user, hasHydratedUser, syncUserStoreData]);

	// Re-sync on session updates (if user data changed server-side)
	useEffect(() => {
		if (
			status === "authenticated" &&
			session?.user &&
			hasHydratedUser &&
			hasSyncedRef.current && // Only re-sync if significant changes detected
			hasUserDataChanged(lastSyncedDataRef.current, session.user)
		) {
			hasSyncedRef.current = false; // Allow re-sync
			syncUserStoreData(session.user);
		}
	}, [status, session?.user, hasHydratedUser, syncUserStoreData]);

	// Onboarding check
	useEffect(() => {
		if (!isClient || !cookieValidated || onboardingChecked) return;

		const checkNewUser = async () => {
			try {
				const sessionData = await getDecryptedCookie("user_state");
				const userData = session?.user;

				// Check both cookie and session data
				const isNewUser = sessionData?.new_user || userData?.new_user || false;
				const needsOnboarding = !hasCompletedOnboarding(userData);

				if (isNewUser || needsOnboarding) {
					globalThis.window.location.replace("/start");
					return;
				}
			} catch {
			} finally {
				setOnboardingChecked(true);
			}
		};

		const timeout = setTimeout(checkNewUser, 100);
		const fallbackTimeout = setTimeout(() => {
			if (!onboardingChecked) {
				setOnboardingChecked(true);
			}
		}, 2000);

		return () => {
			clearTimeout(timeout);
			clearTimeout(fallbackTimeout);
		};
	}, [isClient, cookieValidated, onboardingChecked, session?.user]);

	// Track when initialization is complete
	useEffect(() => {
		if (
			isClient &&
			cookieValidated &&
			onboardingChecked &&
			!initializationComplete
		) {
			setInitializationComplete(true);
		}
	}, [isClient, cookieValidated, onboardingChecked, initializationComplete]);

	// Cleanup on logout
	useEffect(() => {
		if (logoutStore.logout) {
			clearUserData();
			clearUser();
			hasSyncedRef.current = false;
			lastSyncedDataRef.current = undefined;
		}
	}, [logoutStore.logout, clearUser]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (status === "unauthenticated") {
				clearUserData();
				clearUser();
			}
		};
	}, [status, clearUser]);

	// Early returns for loading states
	if (!isClient) {
		return <LoadingScreen message="Initializing..." />;
	}

	if (!onboardingChecked && !forceShowContent) {
		return <LoadingScreen message="Checking your account..." />;
	}

	if (logoutStore.logout) {
		return <LogoutModal showByDefault={logoutStore.logout} />;
	}

	// Determine loading and content states
	const isSessionLoading = status === "loading";
	const isInitializing = !initializationComplete && !forceShowContent;
	const isOrganizationLoading = isOrgLoading && !forceShowContent;

	const showLoading =
		isInitializing ||
		isSessionLoading ||
		(isOrganizationLoading && !shouldShowContent);
	// const showContent =
	// 	(shouldShowContent && isSessionValid && initializationComplete) ||
	// 	forceShowContent;

	// Show loading states with timeouts
	if (showLoading && !forceShowContent) {
		let loadingMessage = "Loading...";

		if (isSessionLoading) {
			loadingMessage = "Authenticating...";
		} else if (isOrganizationLoading) {
			loadingMessage = "Setting up your workspace...";
		} else if (isInitializing) {
			loadingMessage = "Initializing your account...";
		}

		return <LoadingScreen message={loadingMessage} />;
	}

	// Handle organization setup errors
	if (orgError && !forceShowContent) {
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
						There was an issue setting up your workspace. Please refresh the
						page or contact support if the problem persists.
					</p>
					<div className="space-x-4">
						<button
							onClick={() => globalThis.location.reload()}
							className="mt-4 rounded bg-primary px-4 py-2 text-white transition-colors hover:bg-primary/80"
						>
							Retry
						</button>
					</div>
				</div>
			</div>
		);
	}

	// Render the main layout
	return (
		<>
			<SessionUI />
			<SidebarProvider className="scrollbar-hide h-screen overflow-hidden bg-[#0A0A0A] md:rounded-[20px]">
				<div className="relative flex h-screen w-full">
					<AppSidebar />
					<SidebarInset className="scrollbar-hide relative flex-1 overflow-hidden bg-[#0A0A0A] md:rounded-[20px]">
						<TopNav isLoadingAttachment={false} />

						<main className="scrollbar-hide relative mb-2 h-full w-full overflow-y-auto text-[#EAF6FF] md:mb-0">
							<Suspense
								fallback={<LoadingScreen message="Loading content..." />}
							>
								{children}
							</Suspense>
							<RequestInterceptor />
							<Toaster />
						</main>
					</SidebarInset>
				</div>
			</SidebarProvider>
		</>
	);
}
