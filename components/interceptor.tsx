"use client";

import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";

import { getDecryptedCookie } from "@/lib/cookies/getcookies";

// Type definitions for better type safety
interface ThrottledCookieData {
	waitTime?: string;
	errorMessage?: string;
	timestamp?: number;
}

// Time unit conversion utility
const formatWaitTime = (seconds: number): string => {
	if (seconds < 60) {
		return `${seconds} second${seconds === 1 ? "" : "s"}`;
	}

	if (seconds < 3600) {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		if (remainingSeconds === 0) {
			return `${minutes} minute${minutes === 1 ? "" : "s"}`;
		}
		return `${minutes} minute${minutes === 1 ? "" : "s"} and ${remainingSeconds} second${remainingSeconds === 1 ? "" : "s"}`;
	}

	if (seconds < 86400) {
		const hours = Math.floor(seconds / 3600);
		const remainingMinutes = Math.floor((seconds % 3600) / 60);
		if (remainingMinutes === 0) {
			return `${hours} hour${hours === 1 ? "" : "s"}`;
		}
		return `${hours} hour${hours === 1 ? "" : "s"} and ${remainingMinutes} minute${remainingMinutes === 1 ? "" : "s"}`;
	}

	if (seconds < 604800) {
		const days = Math.floor(seconds / 86400);
		const remainingHours = Math.floor((seconds % 86400) / 3600);
		if (remainingHours === 0) {
			return `${days} day${days === 1 ? "" : "s"}`;
		}
		return `${days} day${days === 1 ? "" : "s"} and ${remainingHours} hour${remainingHours === 1 ? "" : "s"}`;
	}

	const weeks = Math.floor(seconds / 604800);
	const remainingDays = Math.floor((seconds % 604800) / 86400);
	if (remainingDays === 0) {
		return `${weeks} week${weeks === 1 ? "" : "s"}`;
	}
	return `${weeks} week${weeks === 1 ? "" : "s"} and ${remainingDays} day${remainingDays === 1 ? "" : "s"}`;
};

interface RequestInterceptorConfig {
	pollInterval?: number;
	enablePolling?: boolean;
	showToastOnMount?: boolean;
}

interface RequestInterceptorProps {
	config?: RequestInterceptorConfig;
}

// Default configuration
const DEFAULT_CONFIG: Required<RequestInterceptorConfig> = {
	pollInterval: 10000, // 10 seconds
	enablePolling: true,
	showToastOnMount: true,
};

// Custom hook for throttled cookie management
const useThrottledCookieMonitor = (
	config: Required<RequestInterceptorConfig>,
) => {
	const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
	const lastToastRef = useRef<string | undefined>(undefined);
	const isProcessingRef = useRef<boolean>(false);

	const checkThrottledCookie = useCallback(async (): Promise<void> => {
		// Prevent concurrent executions
		if (isProcessingRef.current) {
			return;
		}

		isProcessingRef.current = true;

		try {
			const throttled = (await getDecryptedCookie("throttled")) as
				| ThrottledCookieData
				| undefined;

			if (!throttled?.errorMessage) {
				return;
			}

			// Prevent duplicate toasts for the same message
			if (lastToastRef.current === throttled.errorMessage) {
				return;
			}

			// Check if we're in a browser environment
			if (typeof globalThis !== "undefined" && globalThis.window) {
				// Show toast with enhanced styling and options
				// throttled.errorMessage,
				toast.info("", {
					duration: throttled.waitTime
						? Math.min(Number.parseInt(throttled.waitTime) * 1000, 30000)
						: 5000,
					description: throttled.waitTime
						? `Please wait ${formatWaitTime(throttled.waitTime as unknown as number)} seconds before retrying.`
						: "Please wait before making another request.",
					action: throttled.waitTime
						? {
								label: "Dismiss",
								onClick: () => {
									lastToastRef.current = undefined;
								},
							}
						: undefined,
				});

				// Update last toast reference
				lastToastRef.current = throttled.errorMessage;

				// Optional: Clear the reference after the toast duration
				const clearTimeout = setTimeout(
					() => {
						lastToastRef.current = undefined;
					},
					throttled.waitTime
						? Number.parseInt(throttled.waitTime) * 1000
						: 5000,
				);

				// Store timeout reference for cleanup
				if (globalThis.window) {
					(globalThis.window as any).__throttleToastTimeout = clearTimeout;
				}
			}
		} catch (error) {
			// Silently handle errors to avoid disrupting the user experience
			if (process.env.NODE_ENV === "development") {
				console.warn(
					"RequestInterceptor: Error checking throttled cookie:",
					error,
				);
			}
		} finally {
			isProcessingRef.current = false;
		}
	}, []);

	const startPolling = useCallback((): void => {
		if (!config.enablePolling) {
			return;
		}

		// Clear any existing interval
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
		}

		// Set up new interval
		intervalRef.current = setInterval(
			checkThrottledCookie,
			config.pollInterval,
		);
	}, [checkThrottledCookie, config.enablePolling, config.pollInterval]);

	const stopPolling = useCallback((): void => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = undefined;
		}
	}, []);

	const cleanup = useCallback((): void => {
		stopPolling();

		// Clear any pending toast timeout
		if (typeof globalThis !== "undefined" && globalThis.window) {
			const timeoutId = (globalThis.window as any).__throttleToastTimeout;
			if (timeoutId) {
				clearTimeout(timeoutId);
				delete (globalThis.window as any).__throttleToastTimeout;
			}
		}

		// Reset refs
		lastToastRef.current = undefined;
		isProcessingRef.current = false;
	}, [stopPolling]);

	return {
		checkThrottledCookie,
		startPolling,
		stopPolling,
		cleanup,
	};
};

// Enhanced Request Interceptor component
export const RequestInterceptor = ({
	config = {},
}: RequestInterceptorProps) => {
	const mergedConfig = { ...DEFAULT_CONFIG, ...config };
	const { checkThrottledCookie, startPolling, cleanup } =
		useThrottledCookieMonitor(mergedConfig);

	useEffect(() => {
		// Initial check on mount if enabled
		if (mergedConfig.showToastOnMount) {
			checkThrottledCookie();
		}

		// Start polling
		startPolling();

		// Cleanup on unmount
		return cleanup;
	}, [
		checkThrottledCookie,
		startPolling,
		cleanup,
		mergedConfig.showToastOnMount,
	]);

	// Handle visibility change to pause/resume polling when tab is not active
	useEffect(() => {
		if (
			!mergedConfig.enablePolling ||
			typeof globalThis === "undefined" ||
			!globalThis.document
		) {
			return;
		}

		const handleVisibilityChange = (): void => {
			if (globalThis.document.hidden) {
				// Tab is hidden, we could optionally pause polling
				// For now, we'll keep it running for consistency
			} else {
				// Tab is visible, ensure polling is active
				startPolling();
			}
		};

		globalThis.document.addEventListener(
			"visibilitychange",
			handleVisibilityChange,
		);

		return () => {
			globalThis.document.removeEventListener(
				"visibilitychange",
				handleVisibilityChange,
			);
		};
	}, [mergedConfig.enablePolling, startPolling]);

	// Handle window focus/blur events for better UX
	useEffect(() => {
		if (
			!mergedConfig.enablePolling ||
			typeof globalThis === "undefined" ||
			!globalThis.window
		) {
			return;
		}

		const handleFocus = (): void => {
			// When window gains focus, do an immediate check
			checkThrottledCookie();
		};

		globalThis.window.addEventListener("focus", handleFocus);

		return () => {
			globalThis.window.removeEventListener("focus", handleFocus);
		};
	}, [checkThrottledCookie, mergedConfig.enablePolling]);

	return <></>;
};

// Export types for external use
export type {
	RequestInterceptorConfig,
	RequestInterceptorProps,
	ThrottledCookieData,
};

// Export default configuration for reference
export { DEFAULT_CONFIG as RequestInterceptorDefaults };
// "use client";
// import { useEffect } from "react";
// import { toast } from "sonner";

// // eslint-disable-next-line import/no-unresolved
// import { getDecryptedCookie } from "@/lib/cookies/getcookies";

// export const RequestInterceptor = () => {
// 	useEffect(() => {
// 		const checkThrottledCookie = async () => {
// 			try {
// 				const throttled = await getDecryptedCookie("throttled");
// 				if (throttled?.errorMessage) {
// 					toast.info(`${throttled.errorMessage}`);
// 					// Optionally clear the cookie after showing the toast
// 					// await clearCookie("throttled");
// 				}
// 			} catch {
// 				return;
// 			}
// 		};

// 		// Run the check once on mount and then every 10 seconds
// 		checkThrottledCookie();
// 		const intervalId = setInterval(() => {
// 			checkThrottledCookie();
// 		}, 10000); // Poll every 10 seconds

// 		return () => {
// 			clearInterval(intervalId);
// 		};
// 	}, []);

// 	return <></>;
// };
