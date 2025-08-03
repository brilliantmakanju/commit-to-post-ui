/* eslint-disable import/no-unresolved */
"use client";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { clearCookies } from "@/lib/cookies/create-cookies";
import { getDecryptedCookie } from "@/lib/cookies/getcookies";
import { signOut } from "@/server-actions/auth/signout";
import useLogoutStore from "@/zustand/logout-store";
import useOrganizationStore from "@/zustand/useorganization-store";
import useUserStore from "@/zustand/useuser-store";

import { SessionWarningModal } from "./session-expiry-modal";

interface UseSessionManagerOptions {
	inactivityTimeout?: number; // in minutes, default 30
	warningTime?: number; // in minutes before logout, default 5
}

export const useSessionManager = ({
	inactivityTimeout = 30,
	warningTime = 5,
}: UseSessionManagerOptions = {}) => {
	const { status } = useSession();
	const { clearUser } = useUserStore();
	const { setLogout } = useLogoutStore();
	const { clearOrganization } = useOrganizationStore();

	// UI state for the warning modal
	const [showWarningModal, setShowWarningModal] = useState(false);
	const [timeRemaining, setTimeRemaining] = useState("");

	// Use refs to prevent re-renders and infinite loops
	const inactivityTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);
	const warningTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);
	const countdownTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);
	const lastActivityRef = useRef<number>(Date.now());
	const isLoggingOutRef = useRef<boolean>(false);
	const warningShownRef = useRef<boolean>(false);

	// Convert minutes to milliseconds
	const INACTIVITY_TIME = inactivityTimeout * 60 * 1000;
	const WARNING_TIME = warningTime * 60 * 1000;

	// Format time remaining for display
	const formatTimeRemaining = useCallback((seconds: number) => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
	}, []);

	// Start countdown timer for the modal
	const startCountdown = useCallback(() => {
		let remainingSeconds = warningTime * 60;
		setTimeRemaining(formatTimeRemaining(remainingSeconds));

		countdownTimerRef.current = setInterval(() => {
			remainingSeconds -= 1;
			setTimeRemaining(formatTimeRemaining(remainingSeconds));

			if (remainingSeconds <= 0 && countdownTimerRef.current) {
				clearInterval(countdownTimerRef.current);
				countdownTimerRef.current = undefined;
			}
		}, 1000);
	}, [warningTime, formatTimeRemaining]);

	// Centralized logout function
	const performLogout = useCallback(async () => {
		if (isLoggingOutRef.current) return;

		isLoggingOutRef.current = true;

		try {
			// Clear all timers
			if (inactivityTimerRef.current) {
				clearTimeout(inactivityTimerRef.current);
				inactivityTimerRef.current = undefined;
			}
			if (warningTimerRef.current) {
				clearTimeout(warningTimerRef.current);
				warningTimerRef.current = undefined;
			}
			if (countdownTimerRef.current) {
				clearInterval(countdownTimerRef.current);
				countdownTimerRef.current = undefined;
			}

			// Hide modal and clear UI state
			setShowWarningModal(false);

			// Clear stores
			setLogout(true);
			clearUser();
			clearOrganization();
			// Clear cookies and sign out
			await clearCookies();
			await signOut({ redirect: false });

			// Redirect
			globalThis.location.href = "/";
		} catch {
			// Force redirect even if logout fails
			globalThis.location.href = "/";
		}
	}, [clearOrganization, clearUser, setLogout]);

	// Check if session is still valid
	const validateSession = useCallback(async () => {
		if (isLoggingOutRef.current) return true;

		try {
			// Check if cookie still exists
			const cookieState = await getDecryptedCookie("cookie_state");
			if (!cookieState) {
				await performLogout();
				return false;
			}

			// Check NextAuth session
			if (status === "unauthenticated") {
				await performLogout();
				return false;
			}

			return true;
		} catch {
			await performLogout();
			return false;
		}
	}, [status, performLogout]);

	// Handle extending session from modal
	const handleExtendSession = useCallback(() => {
		// Reset activity and warning
		warningShownRef.current = false;
		lastActivityRef.current = Date.now();
		setShowWarningModal(false);

		// Clear countdown timer
		if (countdownTimerRef.current) {
			clearInterval(countdownTimerRef.current);
			countdownTimerRef.current = undefined;
		}

		// Restart inactivity timer
		startInactivityTimer();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Handle logout from modal
	const handleLogoutFromModal = useCallback(async () => {
		setShowWarningModal(false);
		await performLogout();
	}, [performLogout]);

	// Show warning before logout
	const showLogoutWarning = useCallback(() => {
		if (warningShownRef.current || isLoggingOutRef.current) return;

		warningShownRef.current = true;
		setShowWarningModal(true);
		startCountdown();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [warningTime, startCountdown]);

	// Start inactivity timer
	const startInactivityTimer = useCallback(() => {
		if (isLoggingOutRef.current) return;

		// Clear existing timers
		if (inactivityTimerRef.current) {
			clearTimeout(inactivityTimerRef.current);
		}
		if (warningTimerRef.current) {
			clearTimeout(warningTimerRef.current);
		}

		// Set warning timer
		warningTimerRef.current = setTimeout(() => {
			showLogoutWarning();
		}, INACTIVITY_TIME - WARNING_TIME);

		// Set logout timer
		inactivityTimerRef.current = setTimeout(async () => {
			if (!warningShownRef.current) {
				await performLogout();
			}
		}, INACTIVITY_TIME);
	}, [INACTIVITY_TIME, WARNING_TIME, showLogoutWarning, performLogout]);

	// Track user activity
	const trackActivity = useCallback(() => {
		if (isLoggingOutRef.current || status !== "authenticated") return;

		const now = Date.now();
		const timeSinceLastActivity = now - lastActivityRef.current;

		// Only reset if it's been more than 1 second since last activity
		// This prevents excessive timer resets
		if (timeSinceLastActivity > 1000) {
			lastActivityRef.current = now;
			warningShownRef.current = false;

			// Hide modal if it's showing and user is active
			if (showWarningModal) {
				setShowWarningModal(false);
				if (countdownTimerRef.current) {
					clearInterval(countdownTimerRef.current);
					countdownTimerRef.current = undefined;
				}
			}

			startInactivityTimer();
		}
	}, [status, startInactivityTimer, showWarningModal]);

	// Set up activity listeners
	useEffect(() => {
		if (status !== "authenticated" || isLoggingOutRef.current) return;

		const events = [
			"mousedown",
			"mousemove",
			"keypress",
			"scroll",
			"touchstart",
			"click",
		];

		// Add throttling to prevent excessive calls
		const throttledTrackActivity = (() => {
			let timeout: NodeJS.Timeout | undefined;
			return () => {
				if (timeout) return;
				timeout = setTimeout(() => {
					trackActivity();
					timeout = undefined;
				}, 1000); // Throttle to once per second
			};
		})();

		events.forEach(event => {
			document.addEventListener(event, throttledTrackActivity, true);
		});

		// Start initial timer
		startInactivityTimer();

		return () => {
			events.forEach(event => {
				document.removeEventListener(event, throttledTrackActivity, true);
			});
		};
	}, [status, trackActivity, startInactivityTimer]);

	// Validate session periodically (every 2 minutes)
	useEffect(() => {
		if (status !== "authenticated" || isLoggingOutRef.current) return;

		const interval = setInterval(
			() => {
				validateSession();
			},
			2 * 60 * 1000,
		); // Check every 2 minutes

		return () => clearInterval(interval);
	}, [status, validateSession]);

	// Handle session status changes
	useEffect(() => {
		if (status === "unauthenticated" && !isLoggingOutRef.current) {
			performLogout();
		}
	}, [status, performLogout]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (inactivityTimerRef.current) {
				clearTimeout(inactivityTimerRef.current);
			}
			if (warningTimerRef.current) {
				clearTimeout(warningTimerRef.current);
			}
			if (countdownTimerRef.current) {
				clearInterval(countdownTimerRef.current);
			}
		};
	}, []);

	// API request interceptor for 401/403 errors
	useEffect(() => {
		if (typeof globalThis === "undefined") return;

		const originalFetch = globalThis.fetch;

		globalThis.fetch = async (...arguments_) => {
			try {
				const response = await originalFetch(...arguments_);

				// Check for auth errors
				if (
					(response.status === 401 || response.status === 403) &&
					!isLoggingOutRef.current
				) {
					await performLogout();
				}

				return response;
			} catch (error) {
				throw error;
			}
		};

		return () => {
			globalThis.fetch = originalFetch;
		};
	}, [performLogout]);

	return {
		isSessionValid: status === "authenticated" && !isLoggingOutRef.current,
		logout: performLogout,
		validateSession,
		// UI Component to render
		SessionUI: () => (
			<SessionWarningModal
				isOpen={showWarningModal}
				timeRemaining={timeRemaining}
				onLogout={handleLogoutFromModal}
				onExtendSession={handleExtendSession}
			/>
		),
	};
};
