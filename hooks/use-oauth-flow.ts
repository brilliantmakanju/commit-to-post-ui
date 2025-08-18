"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { z } from "zod";

import { getDecryptedCookie } from "@/lib/cookies/getcookies";
import { initializeFeatureFlags } from "@/lib/utils/feature-flags-init";
import { initializeFeatureLimits } from "@/lib/utils/feature-limits-init";
import { connectAccountSchema } from "@/resolvers/organizations/organization-schema";
import {
	OauthResponse,
	socialConnectLinkedinOauth,
	socialConnectTwitterOauth,
} from "@/server-actions/core/repo/social-connect";
import { getOrganizations } from "@/server-actions/organizations/get-organizations";
import { connectGithub } from "@/server-actions/user-actions/connect-github";
import useOrganizationStore from "@/zustand/useorganization-store";

type Provider = "linkedin" | "twitter" | "github";
type ConnectionState =
	| "initializing"
	| "authenticating"
	| "processing"
	| "success"
	| "error";

interface ProviderConfig {
	name: string;
	icon: React.ReactNode;
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
	enabled?: boolean;
	provider: Provider;
	installationId: string;
	config: ProviderConfig;
}

type OauthData = NonNullable<OauthResponse["data"]>;

export function useOAuthFlow({
	code,
	state,
	provider,
	installationId,
	enabled = true,
}: UseOAuthFlowProps) {
	const router = useRouter();
	const [errorMessage, setErrorMessage] = useState<string | undefined>();
	const [connectionState, setConnectionState] =
		useState<ConnectionState>("initializing");

	const hasStartedRef = useRef(false);
	const isUnmountedRef = useRef(false);
	const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

	const { organization, updateSocials, updateInstallationStatus } =
		useOrganizationStore();

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			isUnmountedRef.current = true;
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	// Server action call
	const callServerAction = useCallback(async (): Promise<OauthResponse> => {
		try {
			let result: OauthResponse;

			switch (provider) {
				case "linkedin": {
					result = await socialConnectLinkedinOauth(code, state);
					break;
				}
				case "twitter": {
					result = await socialConnectTwitterOauth(code, state);
					break;
				}
				case "github": {
					result = await connectGithub({ code: installationId } as z.infer<
						typeof connectAccountSchema
					>);
					break;
				}
				default: {
					throw new Error(`Unsupported provider: ${provider}`);
				}
			}

			return result;
		} catch (error) {
			throw error;
		}
	}, [code, installationId, state, provider]);

	// Handle successful authentication
	const handleSuccess = useCallback(
		async (result: OauthData) => {
			if (isUnmountedRef.current) return;

			setConnectionState("success");
			const orgId = organization.id;
			if (provider === "github") {
				if (result.installation_id) {
					updateInstallationStatus(
						orgId,
						"active",
						`${result.installation_id}`,
					);
				}
			} else {
				try {
					const { success, organizations } = await getOrganizations({
						org_id: orgId,
					});
					if (success && organizations && organizations.length > 0) {
						const updatedSocials = organizations[0].socials ?? [];
						updateSocials(organization.id, updatedSocials);
					}
				} catch {}
			}

			initializeFeatureLimits();
			initializeFeatureFlags();
			const decryptedURL = await getDecryptedCookie("redirect_url");

			timeoutRef.current = setTimeout(() => {
				if (!isUnmountedRef.current) {
					if (decryptedURL && typeof decryptedURL.path === "string") {
						router.push(decryptedURL.path);
					} else if (result?.redirect_uri) {
						router.push(result.redirect_uri);
					}
				}
			}, 800);
		},
		[
			organization.id,
			provider,
			updateInstallationStatus,
			updateSocials,
			router,
		],
	);

	// Handle authentication error
	const handleError = useCallback((message: string) => {
		if (isUnmountedRef.current) return;

		setErrorMessage(message);
		setConnectionState("error");
	}, []);

	// Main OAuth flow
	const runOAuthFlow = useCallback(async () => {
		if (isUnmountedRef.current || hasStartedRef.current) return;

		hasStartedRef.current = true;

		try {
			// Initializing phase
			setConnectionState("initializing");
			await new Promise(resolve => setTimeout(resolve, 400));
			if (isUnmountedRef.current) return;

			// Authenticating phase
			setConnectionState("authenticating");
			await new Promise(resolve => setTimeout(resolve, 200));
			if (isUnmountedRef.current) return;

			// Processing phase
			setConnectionState("processing");

			const result = await callServerAction();

			if (isUnmountedRef.current) return;
			if (result.success) {
				const payload: OauthData = result.data ?? {
					installation_id: result.installation_id,
				};
				await handleSuccess(payload);
			} else {
				handleError(result.message || "Connection failed. Please try again.");
			}
		} catch {
			if (!isUnmountedRef.current) {
				handleError(
					"Setup failed. Please check your connection and try again.",
				);
			}
		}
	}, [handleError, callServerAction, handleSuccess]);

	// Start the OAuth flow
	useEffect(() => {
		// Different validation for different providers
		const isValidForProvider = () =>
			provider === "github"
				? installationId // GitHub only needs installation_id
				: code && state; // LinkedIn/Twitter need both code and state

		if (enabled && provider && isValidForProvider() && !hasStartedRef.current) {
			const startTimeout = setTimeout(() => {
				if (!hasStartedRef.current && enabled) {
					runOAuthFlow();
				}
			}, 100);

			return () => clearTimeout(startTimeout);
		}
	}, [code, state, provider, installationId, enabled, runOAuthFlow]);

	// Retry function
	const handleRetry = useCallback(() => {
		setConnectionState("initializing");
		setErrorMessage(undefined);
		hasStartedRef.current = false;

		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = undefined;
		}

		runOAuthFlow();
	}, [runOAuthFlow]);

	return {
		connectionState,
		errorMessage,
		handleRetry,
	};
}
