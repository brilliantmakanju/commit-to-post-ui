"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { socialConnectLinkedinOauth } from "@/server-actions/core/repo/social-connect";

type Provider = "github" | "linkedin" | "twitter";
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
	config: ProviderConfig;
	code: string;
	state: string;
	provider: Provider;
}

interface OAuthResponse {
	success: boolean;
	message?: string;
	data?: {
		repo_id: string;
	};
}

// LinkedIn OAuth Response type to match your server action
interface LinkedInOauthResponse {
	success: boolean;
	message?: string;
	data?: {
		repo_id: string;
	};
}

// Mock server actions for GitHub and Twitter - replace with actual implementations
const mockGitHubOAuth = async (
	code: string,
	state: string,
): Promise<OAuthResponse> => {
	await new Promise(resolve =>
		setTimeout(resolve, 2000 + Math.random() * 3000),
	);
	const isSuccess = Math.random() > 0.12;

	return isSuccess
		? {
				success: true,
				data: { repo_id: "github_repo_123456" },
				message: "GitHub connection successful. Redirecting...",
			}
		: {
				success: false,
				message: "GitHub authentication failed. Please try again.",
			};
};

const mockTwitterOAuth = async (
	code: string,
	state: string,
): Promise<OAuthResponse> => {
	await new Promise(resolve =>
		setTimeout(resolve, 2000 + Math.random() * 3000),
	);
	const isSuccess = Math.random() > 0.12;

	return isSuccess
		? {
				success: true,
				data: { repo_id: "twitter_repo_123456" },
				message: "Twitter connection successful. Redirecting...",
			}
		: {
				success: false,
				message: "Twitter authentication failed. Please try again.",
			};
};

export function useOAuthFlow({
	provider,
	config,
	code,
	state,
}: UseOAuthFlowProps) {
	const router = useRouter();
	const [isTyping, setIsTyping] = useState(false);
	const [currentLine, setCurrentLine] = useState("");
	const [waitingForBackend, setWaitingForBackend] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | undefined>();
	const [terminalLines, setTerminalLines] = useState<string[]>([]);
	const [connectionState, setConnectionState] =
		useState<ConnectionState>("initializing");

	// Refs to prevent memory leaks and control flow
	const hasStartedRef = useRef(false);
	const isUnmountedRef = useRef(false);
	const backendCallMadeRef = useRef(false);
	const typeIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
	const animationTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

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
	const callServerAction = useCallback(async (): Promise<OAuthResponse> => {
		if (backendCallMadeRef.current) {
			throw new Error("Backend call already made");
		}

		backendCallMadeRef.current = true;

		try {
			console.log(
				`Calling ${provider} OAuth with code: ${code}, state: ${state}`,
			);

			let result: OAuthResponse;

			switch (provider) {
				case "linkedin": {
					// This is the actual LinkedIn OAuth call
					result = await socialConnectLinkedinOauth(code, state);
					console.log("LinkedIn OAuth result:", result);
					break;
				}
				case "github": {
					// Replace with actual GitHub OAuth function when available
					result = await mockGitHubOAuth(code, state);
					console.log("GitHub OAuth result:", result);
					break;
				}
				case "twitter": {
					// Replace with actual Twitter OAuth function when available
					result = await mockTwitterOAuth(code, state);
					console.log("Twitter OAuth result:", result);
					break;
				}
				default: {
					throw new Error(`Unsupported provider: ${provider}`);
				}
			}

			return result;
		} catch (error) {
			console.error(`OAuth error for ${provider}:`, error);
			throw error;
		}
	}, [provider, code, state]);

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
		async (repoId: string) => {
			if (isUnmountedRef.current) return;

			setConnectionState("success");
			setWaitingForBackend(false);

			// Show success messages
			for (const message of config.messages.success) {
				if (isUnmountedRef.current) return;

				await new Promise<void>(resolve => {
					typeMessage(message, () => {
						animationTimeoutRef.current = setTimeout(resolve, 500);
					});
				});
			}

			// Redirect after showing success messages
			animationTimeoutRef.current = setTimeout(() => {
				if (!isUnmountedRef.current) {
					router.push(`/repositories/${repoId}`);
				}
			}, 1000);
		},
		[config.messages.success, typeMessage, router],
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
		if (isUnmountedRef.current || hasStartedRef.current) return;

		hasStartedRef.current = true;

		try {
			console.log(`Starting OAuth flow for ${provider}`);

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

				console.log("OAuth flow result:", result);

				if (result.success && result.data?.repo_id) {
					await handleSuccess(result.data.repo_id);
				} else {
					handleError(result.message || "Authentication failed");
				}
			} catch (error) {
				if (isUnmountedRef.current) return;

				console.error("OAuth flow error:", error);

				if (error instanceof Error && error.message === "Backend timeout") {
					await showWaitingState();
				} else {
					handleError("Connection failed. Please try again.");
				}
			}
		} catch (error) {
			console.error("OAuth flow error:", error);
			if (!isUnmountedRef.current) {
				handleError("An unexpected error occurred. Please try again.");
			}
		}
	}, [
		provider,
		handleError,
		typeMessage,
		handleSuccess,
		config.messages,
		showWaitingState,
		callServerAction,
	]);

	// Start the OAuth flow
	useEffect(() => {
		if (code && state && !hasStartedRef.current) {
			console.log(
				`OAuth flow triggered for ${provider} with code: ${code}, state: ${state}`,
			);
			runOAuthFlow();
		}
	}, [code, state, provider, runOAuthFlow]);

	// Retry function
	const handleRetry = useCallback(() => {
		console.log(`Retrying OAuth flow for ${provider}`);

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
	}, [provider, runOAuthFlow]);

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
