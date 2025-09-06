"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
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
import PlanSelector from "@/components/landing/pricing/v4/payment-selector";
import { useSessionManager } from "@/components/tracker/auth-tracker";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { useFetchOrganizations } from "@/hooks/core/repo/use-organization-hook";
import { getDecryptedCookie } from "@/lib/cookies/getcookies";
import useLogoutStore from "@/zustand/logout-store";
import usePlanSelectorStore from "@/zustand/use-plan-selector-store";
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

// Helper function to sync user data with proper date parsing
const parseDate = (dateString: string | undefined) => {
	if (!dateString) return;
	return new Date(dateString);
};

export const syncUserData = (userData: any) => {
	return {
		// Existing fields
		plan: userData.plan || "basic",
		subscription_status: userData.subscription_status || "inactive",
		subscription_end_date: parseDate(userData.subscription_end_date),
		email: userData.email || "",
		first_name: userData.first_name || "",
		last_name: userData.last_name || "",
		bio: userData.bio || "",
		github_connected: userData.github_connected || false,
		google_connected: userData.google_connected || false,
		stripe_subscription_id: userData.stripe_subscription_id || "",
		preferences: userData.preferences || {},
		hasHydratedUser: true,

		// NEW SUBSCRIPTION FIELDS
		subscription_start_date: parseDate(userData.subscription_start_date),
		paddle_subscription_id: userData.paddle_subscription_id || undefined,
		billing_interval: userData.billing_interval || undefined,
		current_price_id: userData.current_price_id || undefined,
		pending_plan_change: userData.pending_plan_change || undefined,
		pending_plan_effective_date: parseDate(
			userData.pending_plan_effective_date,
		),
		payment_grace_period_end: parseDate(userData.payment_grace_period_end),
		last_successful_payment: parseDate(userData.last_successful_payment),
		payment_retry_count: userData.payment_retry_count || 0,

		// HELPER FLAGS
		has_active_subscription: userData.has_active_subscription || false,
		is_in_grace_period: userData.is_in_grace_period || false,
		current_billing_type: userData.current_billing_type || undefined,
	};
};

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
	const hasSyncedRef = useRef(false);
	const logoutStore = useLogoutStore();
	const { data: session, status } = useSession();
	const { setUser, hasHydratedUser } = useUserStore();
	const [onboardingChecked, setOnboardingChecked] = useState(false);
	const [initializationComplete, setInitializationComplete] = useState(false);
	const [forceShowContent, setForceShowContent] = useState(false);

	const { isOpen, close, type, currentPlanId, currentInterval } =
		usePlanSelectorStore();

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
		inactivityTimeout: 30, // 30 minutes of inactivity
		warningTime: 5, // Warn 5 minutes before logout
	});

	// Memoized sync function to prevent recreations
	const syncUserStoreData = useCallback(
		(userData: any) => {
			if (hasSyncedRef.current) return; // Prevent multiple syncs

			try {
				const syncedData = syncUserData(userData);
				setUser(syncedData);
				hasSyncedRef.current = true;
			} catch {
				console.error("Failed to sync user data:");
			}
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
			console.warn("⚠️ Emergency timeout triggered - forcing content display");
			setForceShowContent(true);
			setInitializationComplete(true);
			setOnboardingChecked(true);
			setCookieValidated(true);
		}, 20000); // 20 second emergency timeout

		return () => clearTimeout(emergencyTimeout);
	}, [isClient]);

	// Cookie validation effect - simplified
	useEffect(() => {
		if (!isClient || cookieValidated) return;

		let mounted = true;

		const validateCookie = async () => {
			try {
				const cookieState = await getDecryptedCookie("cookie_state");

				if (!mounted) return;

				if (!cookieState) {
					// Force logout if no cookie_state found
					await logout();
					return;
				}

				setCookieValidated(true);
			} catch {
				console.error("Cookie validation failed:");
				if (mounted) {
					// Don't force logout on cookie validation error - might be temporary
					await logout();
				}
			}
		};

		// Reduce timeout and add fallback
		const timeout = setTimeout(() => {
			if (mounted) {
				validateCookie();
			}
		}, 200);

		// Fallback timeout
		const fallbackTimeout = setTimeout(() => {
			if (mounted && !cookieValidated) {
				console.warn("Cookie validation timeout - proceeding anyway");
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

	// Simplified onboarding check
	useEffect(() => {
		if (!isClient || !cookieValidated || onboardingChecked) return;

		const checkNewUser = async () => {
			try {
				const sessionData = await getDecryptedCookie("user_state");
				const isNewUser = sessionData?.new_user || false;

				if (isNewUser) {
					globalThis.window.location.replace("/start");
					return;
				}
			} catch {
				console.error("Failed to check new user cookie:");
			} finally {
				setOnboardingChecked(true);
			}
		};

		// Add timeout for onboarding check
		const timeout = setTimeout(checkNewUser, 100);
		const fallbackTimeout = setTimeout(() => {
			if (!onboardingChecked) {
				console.warn("Onboarding check timeout - proceeding");
				setOnboardingChecked(true);
			}
		}, 2000);

		return () => {
			clearTimeout(timeout);
			clearTimeout(fallbackTimeout);
		};
	}, [isClient, cookieValidated, onboardingChecked]);

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
	const showContent =
		(shouldShowContent && isSessionValid && initializationComplete) ||
		forceShowContent;

	// Show loading states with timeouts
	if (showLoading && !forceShowContent) {
		let loadingMessage = "Loading...";

		if (isSessionLoading) {
			loadingMessage = "Authenticating...";
		} else if (isOrganizationLoading) {
			loadingMessage = "Setting up your organizations...";
		} else if (isInitializing) {
			loadingMessage = "Initializing...";
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
						There was an issue setting up your organizations. Please refresh the
						page or contact support.
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
				</div>
			</SidebarProvider>

			<PlanSelector
				type={type || "upgrade"}
				open={isOpen}
				currentPlanId={currentPlanId || ""}
				onOpenChange={open => {
					if (!open) close();
				}}
				currentInterval={currentInterval}
			/>
		</>
	);
}
