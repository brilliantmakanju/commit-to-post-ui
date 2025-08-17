"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { createEncryptedCookie } from "@/lib/cookies/create-cookies";
import { initializeFeatureFlags } from "@/lib/utils/feature-flags-init";
import { initializeFeatureLimits } from "@/lib/utils/feature-limits-init";
import {
	OauthResponse,
	socialConnectLinkedinOauth,
	socialConnectTwitterOauth,
} from "@/server-actions/core/repo/social-connect";
import { getOrganizations } from "@/server-actions/organizations/get-organizations";
import useOrganizationStore from "@/zustand/useorganization-store";

type Provider = "linkedin" | "twitter";
type ConnectionState =
	| "initializing"
	| "authenticating"
	| "processing"
	| "success"
	| "error"
	| "timeout";

interface ProviderConfig {
	name: string;
	icon: React.ReactNode;
	terminalTheme: {
		error: string;
		primary: string;
		success: string;
		secondary: string;
		background: string;
	};
	messages: {
		success: string[];
		processing: string[];
		initializing: string[];
		authenticating: string[];
	};
}

interface UseOAuthFlowProps {
	code: string;
	state: string;
	provider: Provider;
	config: ProviderConfig;
	enabled?: boolean; // Add enabled flag
}

type OauthData = NonNullable<OauthResponse["data"]>;

export function useOAuthFlow({
	code,
	state,
	config,
	provider,
	enabled = true, // Default to true for backward compatibility
}: UseOAuthFlowProps) {
	const router = useRouter();
	const [isTyping, setIsTyping] = useState(false);
	const [currentLine, setCurrentLine] = useState("");
	const [terminalLines, setTerminalLines] = useState<string[]>([]);
	const [waitingForBackend, setWaitingForBackend] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | undefined>();
	const [connectionState, setConnectionState] =
		useState<ConnectionState>("initializing");

	// Refs to prevent memory leaks and control flow
	const hasStartedRef = useRef(false);
	const isUnmountedRef = useRef(false);
	const backendCallMadeRef = useRef(false);
	const currentProviderRef = useRef<Provider>(provider);
	const { organization, updateSocials } = useOrganizationStore();
	const typeIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
	const animationTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

	// Update current provider ref when provider changes
	useEffect(() => {
		currentProviderRef.current = provider;
	}, [provider]);

	// Reset flow when provider changes or when becoming enabled
	useEffect(() => {
		if (
			currentProviderRef.current !== provider ||
			(!enabled && hasStartedRef.current)
		) {
			console.log(
				`Provider changed from ${currentProviderRef.current} to ${provider} or enabled changed, resetting flow`,
			);

			// Reset all state
			setConnectionState("initializing");
			setWaitingForBackend(false);
			setErrorMessage(undefined);
			setTerminalLines([]);
			setCurrentLine("");
			setIsTyping(false);

			// Reset refs
			hasStartedRef.current = false;
			backendCallMadeRef.current = false;

			// Clear any pending timeouts
			if (animationTimeoutRef.current) {
				clearTimeout(animationTimeoutRef.current);
				animationTimeoutRef.current = undefined;
			}
			if (typeIntervalRef.current) {
				clearInterval(typeIntervalRef.current);
				typeIntervalRef.current = undefined;
			}
		}
	}, [provider, enabled]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			isUnmountedRef.current = true;
			if (animationTimeoutRef.current) {
				clearTimeout(animationTimeoutRef.current);
			}
			if (typeIntervalRef.current) {
				clearInterval(typeIntervalRef.current);
			}
		};
	}, []);

	// Typing animation with proper cleanup
	const typeMessage = useCallback((message: string, callback?: () => void) => {
		if (isUnmountedRef.current) return;

		setIsTyping(true);
		setCurrentLine("");

		let index = 0;
		typeIntervalRef.current = setInterval(
			() => {
				if (isUnmountedRef.current) {
					if (typeIntervalRef.current) {
						clearInterval(typeIntervalRef.current);
					}
					return;
				}

				if (index < message.length) {
					setCurrentLine(message.slice(0, index + 1));
					index++;
				} else {
					if (typeIntervalRef.current) {
						clearInterval(typeIntervalRef.current);
					}
					setTerminalLines(previous => [...previous, message]);
					setCurrentLine("");
					setIsTyping(false);
					callback?.();
				}
			},
			20 + Math.random() * 15,
		);
	}, []);

	// Server action call - now properly typed and handles each provider
	const callServerAction = useCallback(async (): Promise<OauthResponse> => {
		if (backendCallMadeRef.current) {
			throw new Error("Backend call already made");
		}

		backendCallMadeRef.current = true;
		const currentProvider = currentProviderRef.current;

		try {
			console.log(
				`Calling ${currentProvider} OAuth with code: ${code}, state: ${state}`,
			);

			let result: OauthResponse;

			switch (currentProvider) {
				case "linkedin": {
					result = await socialConnectLinkedinOauth(code, state);
					// console.log("LinkedIn OAuth result:", result);
					break;
				}
				case "twitter": {
					result = await socialConnectTwitterOauth(code, state);
					// console.log("Twitter OAuth result:", result);
					break;
				}
				default: {
					throw new Error(`Unsupported provider: ${currentProvider}`);
				}
			}

			return result;
		} catch (error) {
			// console.error(`OAuth error for ${currentProvider}:`, error);
			throw error;
		}
	}, [code, state]);

	// Enhanced waiting state
	const showWaitingState = useCallback(async () => {
		if (isUnmountedRef.current) return;

		setWaitingForBackend(true);

		const waitingMessages = [
			"→ Finalizing OAuth handshake...",
			"[INFO] Syncing with remote servers...",
			"[INFO] Persisting integration settings...",
			"[INFO] Running final quality checks...",
		];

		for (const message of waitingMessages) {
			if (isUnmountedRef.current) return;

			await new Promise<void>(resolve => {
				typeMessage(message, () => {
					animationTimeoutRef.current = setTimeout(resolve, 1500);
				});
			});
		}

		// If we reach here, show timeout
		if (!isUnmountedRef.current) {
			setConnectionState("timeout");
			typeMessage("⚠ Connection is taking longer than expected");
		}
	}, [typeMessage]);
	// Handle successful authentication
	const handleSuccess = useCallback(
		async (result: OauthData) => {
			if (isUnmountedRef.current) return;

			setConnectionState("success");
			setWaitingForBackend(false);

			// Show success messages sequentially
			for (const message of config.messages.success) {
				if (isUnmountedRef.current) return;

				await new Promise<void>(resolve => {
					typeMessage(message, () => {
						animationTimeoutRef.current = setTimeout(resolve, 500);
					});
				});
			}

			try {
				// Fetch the latest organization data including all socials
				const { success, organizations, message } = await getOrganizations({
					org_id: organization.id,
				});

				if (!success || !organizations || organizations.length === 0) {
					console.error("Failed to fetch updated socials:", message);
				} else {
					// Update the socials in the store with the full, current list

					const updatedSocials = organizations[0].socials ?? [];

					// Re-init limits & flags
					initializeFeatureFlags();
					initializeFeatureLimits();
					updateSocials(organization.id, updatedSocials);
				}
			} catch (error) {
				console.error("Failed to fetch updated socials", error);
			}

			// Redirect after showing success messages
			animationTimeoutRef.current = setTimeout(() => {
				if (!isUnmountedRef.current) {
					router.push(`${result.redirect_uri}`);
				}
			}, 1000);
		},
		[
			config.messages.success,
			typeMessage,
			organization.id,
			updateSocials,
			router,
		],
	);

	// Handle authentication error
	const handleError = useCallback(
		(message: string) => {
			if (isUnmountedRef.current) return;

			setErrorMessage(message);
			setConnectionState("error");
			setWaitingForBackend(false);
			typeMessage(`✗ ${message}`);
		},
		[typeMessage],
	);

	// Main OAuth flow
	const runOAuthFlow = useCallback(async () => {
		// console.log("startting");
		if (isUnmountedRef.current || hasStartedRef.current) return;
		// console.log("ednf")

		hasStartedRef.current = true;
		const currentProvider = currentProviderRef.current;
		// console.log("modiv")

		try {
			console.log(`Starting OAuth flow for ${currentProvider}`);

			// Start backend call immediately but don't await yet
			const backendPromise = callServerAction();

			// Initializing phase
			setConnectionState("initializing");
			await new Promise(resolve => setTimeout(resolve, 600));

			for (const message of config.messages.initializing) {
				if (isUnmountedRef.current) return;

				await new Promise<void>(resolve => {
					typeMessage(message, () => {
						animationTimeoutRef.current = setTimeout(resolve, 800);
					});
				});
			}

			if (isUnmountedRef.current) return;

			// Authenticating phase
			setConnectionState("authenticating");
			await new Promise(resolve => setTimeout(resolve, 300));

			for (const message of config.messages.authenticating) {
				if (isUnmountedRef.current) return;

				await new Promise<void>(resolve => {
					typeMessage(message, () => {
						animationTimeoutRef.current = setTimeout(resolve, 700);
					});
				});
			}

			if (isUnmountedRef.current) return;

			// Processing phase
			setConnectionState("processing");
			await new Promise(resolve => setTimeout(resolve, 300));

			for (const message of config.messages.processing) {
				if (isUnmountedRef.current) return;

				await new Promise<void>(resolve => {
					typeMessage(message, () => {
						animationTimeoutRef.current = setTimeout(resolve, 600);
					});
				});
			}

			// Wait for backend response or show waiting state
			try {
				const result = await Promise.race([
					backendPromise,
					new Promise<never>((_, reject) => {
						setTimeout(() => reject(new Error("Backend timeout")), 15000);
					}),
				]);

				if (isUnmountedRef.current) return;

				// console.log("OAuth flow result:", result);

				if (result.success) {
					await handleSuccess(result.data as OauthData);
				} else {
					handleError(result.message || "Authentication failed");
				}
			} catch (error) {
				if (isUnmountedRef.current) return;

				// console.error("OAuth flow error:", error);

				if (error instanceof Error && error.message === "Backend timeout") {
					await showWaitingState();
				} else {
					handleError("Connection failed. Please try again.");
				}
			}
		} catch {
			// console.error("OAuth flow error:", error);
			if (!isUnmountedRef.current) {
				handleError("An unexpected error occurred. Please try again.");
			}
		}
	}, [
		handleError,
		typeMessage,
		handleSuccess,
		config.messages,
		showWaitingState,
		callServerAction,
	]);

	// Start the OAuth flow - now waits for valid provider and enabled flag
	useEffect(() => {
		if (enabled && code && state && provider && !hasStartedRef.current) {
			// console.log(
			// 	`OAuth flow triggered for ${provider} with code: ${code}, state: ${state}, enabled: ${enabled}`,
			// );
			// Small delay to ensure everything is properly set up
			const startTimeout = setTimeout(() => {
				if (!hasStartedRef.current && enabled) {
					runOAuthFlow();
				}
			}, 100);

			return () => clearTimeout(startTimeout);
		}
	}, [code, state, provider, enabled, runOAuthFlow]);

	// Retry function
	const handleRetry = useCallback(() => {
		// console.log(`Retrying OAuth flow for ${provider}`);

		// Reset all state
		setConnectionState("initializing");
		setWaitingForBackend(false);
		setErrorMessage(undefined);
		setTerminalLines([]);
		setCurrentLine("");

		// Reset refs
		hasStartedRef.current = false;
		backendCallMadeRef.current = false;

		// Clear any pending timeouts
		if (animationTimeoutRef.current) {
			clearTimeout(animationTimeoutRef.current);
			animationTimeoutRef.current = undefined;
		}
		if (typeIntervalRef.current) {
			clearInterval(typeIntervalRef.current);
			typeIntervalRef.current = undefined;
		}

		// Restart the flow
		runOAuthFlow();
	}, [runOAuthFlow]);

	return {
		connectionState,
		terminalLines,
		currentLine,
		isTyping,
		waitingForBackend,
		errorMessage,
		handleRetry,
	};
}
