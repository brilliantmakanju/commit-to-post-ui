"use client";

import { useSearchParams } from "next/navigation";
import type React from "react";
import { Suspense, useEffect, useMemo, useState } from "react";
import { FaGithub, FaLinkedin, FaTimes, FaTwitter } from "react-icons/fa";
import { MdCheckCircle, MdError, MdRefresh } from "react-icons/md";

// eslint-disable-next-line import/no-unresolved
import { useOAuthFlow } from "@/hooks/use-oauth-flow";

type Provider = "linkedin" | "twitter" | "github";
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

const XIcon: React.FC<{ className?: string }> = ({ className }) => (
	<svg viewBox="0 0 24 24" className={className} fill="currentColor">
		<path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932L18.901 1.153ZM17.61 20.644h2.039L6.486 3.24H4.298L17.61 20.644Z" />
	</svg>
);

const PROVIDER_CONFIGS: Record<Provider, ProviderConfig> = {
	linkedin: {
		name: "LinkedIn",
		icon: <FaLinkedin className="h-6 w-6" />,
		messages: {
			initializing: ["Connecting to LinkedIn..."],
			authenticating: [
				"Verifying LinkedIn permissions...",
				"Finalizing secure connection...",
			],
			processing: ["Setting up LinkedIn connection..."],
			success: ["LinkedIn account connected!"],
		},
	},

	twitter: {
		name: "Twitter",
		icon: <XIcon className="h-6 w-6" />,
		messages: {
			initializing: ["Connecting to Twitter..."],
			authenticating: [
				"Verifying Twitter permissions...",
				"Finalizing secure connection...",
			],
			processing: ["Setting up Twitter connection..."],
			success: ["Twitter account connected!"],
		},
	},

	github: {
		name: "GitHub",
		icon: <FaGithub className="h-6 w-6" />,
		messages: {
			initializing: ["Connecting to GitHub..."],
			authenticating: ["Verifying GitHub app installation..."],
			processing: ["Setting up GitHub connection..."],
			success: ["GitHub connected!"],
		},
	},
};

// Animated Provider Icon
const LoadingProviderIcon = ({ icon }: { icon: React.ReactNode }) => (
	<div className="relative">
		<div className="flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-gray-100">
			<div
				className="animate-spin text-black"
				style={{ animationDuration: "2s" }}
			>
				{icon}
			</div>
		</div>
		<div className="absolute -inset-1 animate-spin rounded-full border-2 border-black border-t-transparent"></div>
	</div>
);

// Missing Parameters Component
const MissingParams = ({ provider }: { provider?: Provider }) => (
	<div className="rounded-3xl border border-gray-100 bg-gray-50 p-16">
		<div className="space-y-8 text-center">
			<div className="flex justify-center">
				<div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
					<MdError className="h-8 w-8 text-black" />
				</div>
			</div>

			<div className="space-y-4">
				<h2 className="text-2xl font-bold text-black">
					Connection Setup Issue
				</h2>
				<p className="text-lg leading-relaxed text-gray-600">
					Missing required parameters for {provider || "unknown"} connection.
					This usually happens when:
				</p>
				<div className="mx-auto max-w-md space-y-2 text-left text-gray-600">
					<p>• The connection was interrupted</p>
					<p>• Required permissions weren&apos;t granted</p>
					<p>• The connection link expired</p>
				</div>
				<p className="text-sm text-gray-500">
					Please go back and try connecting again
				</p>
			</div>
		</div>
	</div>
);

export default function Component() {
	const searchParams = useSearchParams();
	const [progress, setProgress] = useState(0);
	const [isProviderReady, setIsProviderReady] = useState(false);
	const [provider, setProvider] = useState<Provider | undefined>();

	// Memoize search params to prevent unnecessary re-renders
	const { code, state, providerParam, installationId } = useMemo(
		() => ({
			code: searchParams.get("code"),
			state: searchParams.get("state"),
			providerParam: searchParams.get("provider"),
			installationId: searchParams.get("installation_id"),
		}),
		[searchParams],
	);

	// Detect provider from URL with initialization delay
	useEffect(() => {
		const initializeProvider = async () => {
			await new Promise(resolve => setTimeout(resolve, 800));

			if (providerParam) {
				const lowerParameter = providerParam.toLowerCase();
				let detectedProvider: Provider;

				if (lowerParameter.includes("linkedin")) {
					detectedProvider = "linkedin";
				} else if (lowerParameter.includes("twitter")) {
					detectedProvider = "twitter";
				} else if (lowerParameter.includes("github")) {
					detectedProvider = "github";
				} else {
					detectedProvider = "linkedin";
				}

				setProvider(detectedProvider);
			} else {
				setProvider("linkedin");
			}

			await new Promise(resolve => setTimeout(resolve, 150));
			setIsProviderReady(true);
		};

		initializeProvider();
	}, [providerParam]);

	// Memoize config to prevent unnecessary re-renders
	const config = useMemo(() => {
		return provider ? PROVIDER_CONFIGS[provider] : PROVIDER_CONFIGS.linkedin;
	}, [provider]);

	// Check if we have the required parameters for the detected provider
	const hasRequiredParams = useMemo(() => {
		if (!provider) return false;

		return provider === "github" ? !!installationId : !!(code && state);
	}, [provider, code, state, installationId]);

	// OAuth flow hook
	const { handleRetry, errorMessage, connectionState } = useOAuthFlow({
		config: config,
		code: code || "",
		state: state || "",
		provider: provider || "linkedin",
		installationId: installationId || "",
		enabled: isProviderReady && provider !== null && hasRequiredParams,
	});

	// Simulate progress for visual feedback
	useEffect(() => {
		if (
			connectionState === "initializing" ||
			connectionState === "authenticating" ||
			connectionState === "processing"
		) {
			const interval = setInterval(() => {
				setProgress(previous => {
					if (previous >= 95) return previous;
					return previous + Math.random() * 8 + 3;
				});
			}, 650);
			return () => clearInterval(interval);
		} else if (connectionState === "success") {
			setProgress(100);
		}
	}, [connectionState]);

	const getConnectionContent = () => {
		if (!provider || !isProviderReady) return;

		switch (connectionState) {
			case "initializing":
			case "authenticating":
			case "processing": {
				return (
					<div className="w-full space-y-8 text-center">
						<div className="flex justify-center">
							<LoadingProviderIcon icon={config.icon} />
						</div>

						<div className="space-y-4">
							<h2 className="text-2xl font-bold text-black">
								Connecting to {config.name}
							</h2>
							<p className="text-lg text-gray-600">
								{connectionState === "initializing" &&
									"Starting secure connection..."}
								{connectionState === "authenticating" &&
									"Verifying account permissions..."}
								{connectionState === "processing" &&
									"Finalizing connection setup..."}
							</p>
							<p className="text-sm text-gray-500">
								Once connected, you&apos;ll be able to choose which repositories
								to link for posting.
							</p>
						</div>

						<div className="mx-auto max-w-md space-y-3">
							<div className="flex justify-between text-sm text-gray-600">
								<span>Setup Progress</span>
								<span>{Math.round(progress)}%</span>
							</div>
							<div className="h-2 overflow-hidden rounded-full bg-gray-100">
								<div
									className="h-full bg-black transition-all duration-500 ease-out"
									style={{ width: `${progress}%` }}
								/>
							</div>
						</div>
					</div>
				);
			}

			case "success": {
				return (
					<div className="w-full space-y-8 text-center">
						<div className="flex justify-center">
							<div className="flex h-16 w-16 items-center justify-center rounded-full bg-black">
								<MdCheckCircle className="h-8 w-8 text-white" />
							</div>
						</div>

						<div className="space-y-4">
							<h2 className="text-2xl font-bold text-black">
								{config.name} Connected!
							</h2>
							<p className="text-lg text-gray-600">
								Your {config.name} account is now securely linked.
							</p>
							<p className="text-sm text-gray-500">
								Next step: connect specific repositories to start sharing
								updates.
							</p>
						</div>
					</div>
				);
			}

			case "error": {
				return (
					<div className="w-full space-y-8 text-center">
						<div className="flex justify-center">
							<div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
								<MdError className="h-8 w-8 text-black" />
							</div>
						</div>

						<div className="space-y-4">
							<h2 className="text-2xl font-bold text-black">
								Connection Failed
							</h2>
							<p className="text-lg text-gray-600">
								We couldn&apos;t complete the connection to {config.name}.
							</p>
							{errorMessage && (
								<div className="mx-auto max-w-md rounded-lg border border-gray-200 bg-gray-50 p-4">
									<p className="text-sm leading-relaxed text-gray-700">
										{errorMessage.includes("Permission")
											? "Please ensure you granted the required permissions when authorizing your account."
											: errorMessage.includes("timeout") ||
												  errorMessage.includes("busy")
												? "The provider is experiencing delays. Please try again shortly."
												: "This may be due to a network issue or temporary provider downtime."}
									</p>
								</div>
							)}
						</div>

						<div className="flex justify-center gap-4">
							<button
								onClick={handleRetry}
								className="rounded-lg bg-black px-8 py-3 font-medium text-white transition-colors hover:bg-gray-800"
							>
								Try Again
							</button>
						</div>
					</div>
				);
			}

			default: {
				return;
			}
		}
	};

	// Don't render anything until provider is determined
	if (!isProviderReady || !provider) {
		return (
			<Suspense>
				<div className="flex min-h-screen w-full items-center justify-center bg-white p-8">
					<div className="text-center">
						<MdRefresh className="mx-auto mb-4 h-12 w-12 animate-spin text-black" />
						<h1 className="mb-2 text-2xl font-bold text-black">
							Setting Up Connection
						</h1>
						<p className="text-gray-600">
							Preparing your automated posting setup...
						</p>
					</div>
				</div>
			</Suspense>
		);
	}

	// Show error if missing required params for the specific provider
	if (!hasRequiredParams) {
		console.log(`Missing required params for ${provider}:`, {
			code,
			state,
			installationId,
		});
		return (
			<Suspense>
				<div className="flex min-h-screen w-full items-center justify-center bg-white p-8">
					<div className="w-full max-w-2xl">
						<MissingParams provider={provider} />
					</div>
				</div>
			</Suspense>
		);
	}

	return (
		<Suspense>
			<div className="flex min-h-screen w-full items-center justify-center bg-white p-8">
				<div className="w-full max-w-2xl">
					<div className="rounded-3xl border border-gray-100 bg-gray-50 p-16">
						{getConnectionContent()}
					</div>

					{/* Footer */}
					<div className="mt-12 text-center text-sm text-gray-400">
						<p>
							Secure OAuth • Automated social posting • Built for developers
						</p>
						<p className="mt-1">
							Ship code, share progress, grow your dev brand
						</p>
					</div>
				</div>
			</div>
		</Suspense>
	);
}
