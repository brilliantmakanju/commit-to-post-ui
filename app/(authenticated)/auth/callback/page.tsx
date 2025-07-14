"use client";

import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import { useSearchParams } from "next/navigation";
import type React from "react";
import { Suspense, useEffect, useMemo, useState } from "react";
import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";

// eslint-disable-next-line import/no-unresolved
import { ProviderBackground } from "@/components/social_callbacks/provider-background";
// eslint-disable-next-line import/no-unresolved
import { TerminalContent } from "@/components/social_callbacks/terminal-content";
// eslint-disable-next-line import/no-unresolved
import { TerminalHeader } from "@/components/social_callbacks/terminal-header";
// eslint-disable-next-line import/no-unresolved
import { Badge } from "@/components/ui/badge";
// eslint-disable-next-line import/no-unresolved
import { Button } from "@/components/ui/button";
// eslint-disable-next-line import/no-unresolved
import { Card } from "@/components/ui/card";
// eslint-disable-next-line import/no-unresolved
import { AnimatedAIIcon } from "@/components/wrappers/loaders/all-icons";
// eslint-disable-next-line import/no-unresolved
import { useOAuthFlow } from "@/hooks/use-oauth-flow";

type Provider = "github" | "linkedin" | "twitter";

interface ProviderConfig {
	name: string;
	icon: React.ReactNode;
	terminalTheme: {
		primary: string;
		secondary: string;
		success: string;
		error: string;
		background: string;
	};
	messages: {
		initializing: string[];
		authenticating: string[];
		processing: string[];
		success: string[];
	};
}

const PROVIDER_CONFIGS: Record<Provider, ProviderConfig> = {
	github: {
		name: "GitHub",
		icon: <FaGithub className="h-5 w-5" />,
		terminalTheme: {
			primary: "text-green-400",
			secondary: "text-gray-300",
			success: "text-green-300",
			error: "text-red-400",
			background: "bg-black",
		},
		messages: {
			initializing: [
				"→ Booting up GitHub OAuth sequence...",
				"→ Fetching repositories from your account...",
				"→ Setting up commit webhooks...",
				"→ Preparing repo-to-social pipeline...",
				"[INFO] Pulling your most active branches...",
			],
			authenticating: [
				"→ Authenticating via GitHub API...",
				"→ Validating webhook permissions...",
				"→ Linking commits to your workspace...",
				"→ Saving repo config to organization...",
				"[INFO] Scanning commit metadata in real-time...",
				"[INFO] Git hooks successfully attached...",
			],
			processing: [
				"→ Listening for future commits on selected branches...",
				"→ Mapping commit messages to content pipeline...",
				"→ Preparing post generator config...",
				"→ Linking commit triggers to social outputs...",
				"[INFO] Post generation presets active (tone, hashtags)...",
				"[INFO] Commit-to-social automation is now live...",
			],
			success: [
				"✓ GitHub connected successfully",
				"✓ Repo access and webhooks in place",
				"✓ Your commits are now ready to go live",
				"[SUCCESS] Git to post pipeline initialized!",
			],
		},
	},

	linkedin: {
		name: "LinkedIn",
		icon: <FaLinkedin className="h-5 w-5" />,
		terminalTheme: {
			primary: "text-blue-300",
			secondary: "text-gray-300",
			success: "text-blue-200",
			error: "text-red-400",
			background: "bg-slate-900",
		},
		messages: {
			initializing: [
				"→ Kicking off LinkedIn OAuth process...",
				"→ Loading your professional identity...",
				"→ Mapping LinkedIn post capabilities...",
				"[INFO] Preparing to sync posts from commits...",
			],
			authenticating: [
				"→ Authenticating via LinkedIn API...",
				"→ Validating publishing permissions...",
				"→ Linking your profile to workspace...",
				"→ Setting tone and hashtag strategy...",
				"[INFO] Calibrating for technical + career-friendly output...",
			],
			processing: [
				"→ Connecting commit activity to your feed...",
				"→ Formatting posts for professional tone...",
				"→ Embedding commit logs into readable content...",
				"[INFO] Your posts will auto-publish as you build...",
			],
			success: [
				"✓ LinkedIn connected successfully",
				"✓ Posting capabilities enabled",
				"[SUCCESS] You're ready to grow your dev brand while you ship.",
			],
		},
	},

	twitter: {
		name: "Twitter",
		icon: <FaTwitter className="h-5 w-5" />,
		terminalTheme: {
			primary: "text-cyan-300",
			secondary: "text-gray-300",
			success: "text-cyan-200",
			error: "text-red-400",
			background: "bg-gray-900",
		},
		messages: {
			initializing: [
				"→ Initializing Twitter OAuth handshake...",
				"→ Pulling account metadata...",
				"→ Setting up tweet automation...",
				"[INFO] Preparing content templates from your commit logs...",
			],
			authenticating: [
				"→ Authenticating via Twitter API...",
				"→ Verifying post permissions...",
				"→ Linking Twitter to active repos...",
				"[INFO] Establishing commit → thread connection...",
				"[INFO] Ready to build your developer audience...",
			],
			processing: [
				"→ Mapping commit history to tweet format...",
				"→ Optimizing threads for engagement...",
				"→ Scheduling auto-post logic...",
				"[INFO] Hashtag and emoji preferences applied...",
				"[INFO] You're now tweeting while you ship...",
			],
			success: [
				"✓ Twitter connection successful",
				"✓ Tweets now linked to repo commits",
				"[SUCCESS] Welcome to auto-thread mode — devlog style.",
			],
		},
	},
};

export default function Component() {
	const searchParams = useSearchParams();
	const [showCursor, setShowCursor] = useState(true);
	const [provider, setProvider] = useState<Provider>("github");

	// Memoize search params to prevent unnecessary re-renders
	const { code, state, providerParam } = useMemo(
		() => ({
			code: searchParams.get("code"),
			state: searchParams.get("state"),
			providerParam:
				searchParams.get("provider") ||
				searchParams.get("oauth") ||
				searchParams.get("social"),
		}),
		[searchParams],
	);

	// Detect provider from URL with optimization
	useEffect(() => {
		if (providerParam) {
			const lowerParameter = providerParam.toLowerCase();
			if (lowerParameter.includes("github")) {
				setProvider("github");
			} else if (lowerParameter.includes("linkedin")) {
				setProvider("linkedin");
			} else if (lowerParameter.includes("twitter")) {
				setProvider("twitter");
			}
		}
	}, [providerParam]);

	// Memoize config to prevent unnecessary re-renders
	const config = useMemo(() => PROVIDER_CONFIGS[provider], [provider]);
	console.log(config, "Config");

	// OAuth flow hook
	const {
		connectionState,
		terminalLines,
		currentLine,
		isTyping,
		waitingForBackend,
		errorMessage,
		handleRetry,
	} = useOAuthFlow({
		provider: "linkedin",
		config: PROVIDER_CONFIGS["linkedin"],
		code: code || "",
		state: state || "",
	});

	// Cursor animation with cleanup
	useEffect(() => {
		const cursorInterval = setInterval(() => {
			setShowCursor(previous => !previous);
		}, 500);
		return () => clearInterval(cursorInterval);
	}, []);

	// Memoize status icon to prevent unnecessary re-renders
	const statusIcon = useMemo(() => {
		switch (connectionState) {
			case "initializing":
			case "authenticating":
			case "processing": {
				return <RefreshCw className="h-4 w-4 animate-spin" />;
			}
			case "success": {
				return <CheckCircle className="h-4 w-4 text-green-400" />;
			}
			case "error":
			case "timeout": {
				return <AlertCircle className="h-4 w-4 text-red-400" />;
			}
			default: {
				return;
			}
		}
	}, [connectionState]);

	// Memoize status text to prevent unnecessary re-renders
	const statusText = useMemo(() => {
		switch (connectionState) {
			case "initializing": {
				return "Starting secure handshake...";
			}
			case "authenticating": {
				return "Authenticating with provider...";
			}
			case "processing": {
				return "Wiring up your commit-to-post pipeline...";
			}
			case "success": {
				return "All set — integration complete!";
			}
			case "error": {
				return errorMessage || "Something broke — try again?";
			}
			case "timeout": {
				return "Still working... might take a bit longer.";
			}
			default: {
				return "Initializing...";
			}
		}
	}, [connectionState, errorMessage]);

	// Memoize description text to prevent unnecessary re-renders
	const descriptionText = useMemo(() => {
		switch (connectionState) {
			case "success": {
				return `✓ ${config.name} is connected. Every commit you push will now auto-generate social-ready posts — hands off, you're live.`;
			}
			case "timeout": {
				return "This is taking longer than expected — sometimes the provider stalls. Sit tight, we're still wiring things up.";
			}
			case "error": {
				return `Connection failed. ${errorMessage || "Please try again or contact support if the issue persists."}`;
			}
			default: {
				return `Connecting to ${config.name}... Once we're done, your commit messages will start flowing directly into shareable posts.`;
			}
		}
	}, [connectionState, config.name, errorMessage]);

	// Show error if missing required params
	if (!code || !state) {
		return (
			<section className="relative flex min-h-screen items-center justify-center bg-white p-4 dark:bg-black">
				<div className="text-center">
					<AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-400" />
					<h1 className="mb-2 font-mono text-2xl font-bold text-gray-900 dark:text-gray-100">
						Invalid OAuth Request
					</h1>
					<p className="text-gray-600 dark:text-gray-400">
						Missing required authentication parameters. Please try the OAuth
						flow again.
					</p>
				</div>
			</section>
		);
	}

	return (
		<Suspense>
			<section className="relative flex min-h-screen items-center justify-center bg-white p-4 dark:bg-black">
				<ProviderBackground provider={provider} />

				<div className="relative z-10 mx-auto w-full max-w-6xl">
					{/* Header */}
					<div className="mb-8 text-center">
						<div className="mb-4 flex items-center justify-center gap-3">
							<AnimatedAIIcon color={"#1f2937"} size={36} />
							<h1 className="font-mono text-3xl font-bold text-gray-900 dark:text-gray-100">
								Push to Post
							</h1>
							<Badge
								variant="outline"
								className={`${config.terminalTheme.primary} border-current bg-transparent`}
							>
								<span className="mr-2">{config.icon}</span>
								{config.name}
							</Badge>
						</div>
						<div className="mb-3 flex items-center justify-center gap-2">
							{statusIcon}
							<p className="font-mono text-sm text-gray-600 dark:text-gray-400">
								{statusText}
							</p>
						</div>
						<p className="mx-auto max-w-2xl text-sm leading-relaxed text-gray-500 dark:text-gray-500">
							{descriptionText}
						</p>
					</div>

					<div className="flex w-full items-start justify-center">
						{/* Terminal Window */}
						<div className="lg:col-span-2">
							<Card
								className={`${config.terminalTheme.background} border-gray-700 shadow-2xl dark:border-gray-800`}
							>
								<TerminalHeader
									provider={provider}
									connectionState={connectionState}
									waitingForBackend={waitingForBackend}
								/>
								<TerminalContent
									provider={provider}
									isTyping={isTyping}
									showCursor={showCursor}
									currentLine={currentLine}
									providerIcon={config.icon}
									terminalLines={terminalLines}
									connectionState={connectionState}
									terminalTheme={config.terminalTheme}
								/>
							</Card>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="mt-8 flex justify-center gap-4">
						{(connectionState === "error" || connectionState === "timeout") && (
							<Button
								onClick={handleRetry}
								variant="outline"
								className="border-gray-300 bg-transparent font-mono hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
							>
								<RefreshCw className="mr-2 h-4 w-4" />
								Retry Integration
							</Button>
						)}
					</div>

					{/* Footer */}
					<div className="mt-12 text-center">
						<p className="font-mono text-xs text-gray-400">
							OAuth secured • Automated posting enabled • Made for developers
						</p>
						<p className="mt-1 font-mono text-xs text-gray-500">
							Code. Commit. Share. Automatically.
						</p>
					</div>
				</div>
			</section>
		</Suspense>
	);
}
