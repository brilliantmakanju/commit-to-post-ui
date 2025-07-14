"use client";

import { UUID } from "node:crypto";

import { useQueryClient } from "@tanstack/react-query";
import {
	AlertCircle,
	Code,
	ExternalLink,
	Loader2,
	Plus,
	Trash2,
	X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import {
	disconnectSlackAndDiscord,
	getConnectLinkedinOauth,
} from "@/server-actions/core/repo/social-connect";

interface SocialConnection {
	connected: boolean;
	connected_by: string | null;
	connected_at: string | null;
	details: {
		webhook_url?: string;
	} | null;
}

interface OAuthModalProps {
	repo_id: UUID;
	isOpen: boolean;
	onClose: () => void;
	platform: "twitter" | "linkedin" | "github";
	existingConnection?: SocialConnection;
}

type OAuthStep = "initializing" | "fetching" | "redirecting" | "complete";
type ModalMode = "create" | "manage";

const platformConfig = {
	github: {
		name: "GitHub",
		icon: FaGithub,
		color: "text-zinc-400",
	},
	twitter: {
		name: "Twitter",
		icon: FaTwitter,
		color: "text-zinc-400",
	},
	linkedin: {
		name: "LinkedIn",
		icon: FaLinkedin,
		color: "text-zinc-400",
	},
};

// Custom toast styling for dark minimalist theme
const toastStyles = {
	backgroundColor: "#18181b",
	border: "1px solid #3f3f46",
	color: "#f4f4f5",
	fontSize: "14px",
	borderRadius: "8px",
};

export function OAuthModal({
	repo_id,
	isOpen,
	onClose,
	platform,
	existingConnection,
}: OAuthModalProps) {
	const queryClient = useQueryClient();
	const [currentStep, setCurrentStep] = useState<OAuthStep>("initializing");
	const [isLoading, setIsLoading] = useState(false);
	const [mode, setMode] = useState<ModalMode>("create");

	const config = platformConfig[platform];
	const PlatformIcon = config?.icon;

	// Initialize state based on existing connection
	useEffect(() => {
		if (existingConnection?.connected) {
			setMode("manage");
		} else {
			setMode("create");
		}
	}, [existingConnection]);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const showToast = {
		error: (message: string) => toast.error(message, { style: toastStyles }),
		success: (message: string) =>
			toast.success(message, { style: toastStyles }),
		info: (message: string) => toast.info(message, { style: toastStyles }),
	};

	const initiateOAuth = useCallback(async () => {
		setIsLoading(true);

		try {
			setCurrentStep("initializing");
			showToast.info("Initializing OAuth flow...");

			let result;
			if (platform === "linkedin") {
				result = await getConnectLinkedinOauth(repo_id);
			} else {
				showToast.error("OAuth not yet implemented for this platform");
				return;
			}

			setCurrentStep("fetching");
			showToast.info(`Fetching ${config.name} OAuth URL...`);

			if (result?.success && result?.data?.authorization_url) {
				setCurrentStep("redirecting");
				showToast.info("Redirecting to authorization page...");

				setTimeout(() => {
					window.open(result?.data?.authorization_url);
					setCurrentStep("complete");
					showToast.success("Authorization window opened");
				}, 1200);
			} else {
				showToast.error(`Could not connect to ${config.name}`);
				setCurrentStep("initializing");
			}
		} catch {
			showToast.error("Failed to initialize OAuth flow");
			setCurrentStep("initializing");
		} finally {
			setIsLoading(false);
		}
	}, [showToast, platform, config.name, repo_id]);

	const handleDisconnect = async () => {
		setIsLoading(true);

		try {
			const response = await disconnectSlackAndDiscord(
				repo_id,
				platform as "linkedin" | "slack" | "discord",
			);

			if (!response.success) {
				showToast.error(response.message);
				return;
			}

			// Update local state
			setMode("create");
			setCurrentStep("initializing");

			// Invalidate the repo details cache
			await queryClient.invalidateQueries({
				queryKey: ["repo_super_details", repo_id],
			});
			await queryClient.invalidateQueries({
				queryKey: ["repo_details", repo_id],
			});

			showToast.success(response.message);
		} catch {
			showToast.error("Failed to disconnect. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	// UI helpers
	const getStatusIcon = () => {
		if (["redirecting", "complete"].includes(currentStep))
			return <ExternalLink className="h-6 w-6 text-zinc-300" />;
		if (isLoading)
			return <Loader2 className="h-6 w-6 animate-spin text-zinc-300" />;
		return <Code className="h-6 w-6 text-zinc-300" />;
	};

	const getStatusText = () => {
		switch (currentStep) {
			case "redirecting": {
				return `Redirecting to ${config.name}`;
			}
			case "fetching": {
				return "Fetching OAuth URL";
			}
			case "complete": {
				return `Opening ${config.name}`;
			}
			default: {
				return `Connecting to ${config.name}`;
			}
		}
	};

	const getStatusSubtext = () => {
		switch (currentStep) {
			case "redirecting": {
				return "Opening authorization page...";
			}
			case "fetching": {
				return "Getting secure OAuth URL...";
			}
			case "complete": {
				return "Authorization window opened";
			}
			default: {
				return "Initializing secure connection...";
			}
		}
	};

	const getStepNumber = () => {
		switch (currentStep) {
			case "initializing": {
				return 1;
			}
			case "fetching": {
				return 2;
			}
			case "redirecting":
			case "complete": {
				return 3;
			}
			default: {
				return 1;
			}
		}
	};

	if (!isOpen) return;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl transition-all duration-300 animate-in fade-in-0 zoom-in-95">
				{/* Header */}
				<DialogHeader className="border-b border-zinc-800 pb-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 transition-all duration-200 hover:bg-zinc-700">
								<PlatformIcon className="h-5 w-5 text-zinc-300 transition-colors duration-200" />
							</div>
							<div className="space-y-1">
								<h2 className="text-lg font-semibold text-white">
									{config.name}
								</h2>
								<p className="text-sm text-zinc-400 transition-colors duration-200">
									{mode === "create" ? "Connect OAuth" : "Manage connection"}
								</p>
								{existingConnection?.connected &&
									existingConnection.connected_by && (
										<p className="text-xs text-zinc-500 duration-300 animate-in fade-in-50">
											Connected by {existingConnection.connected_by}
										</p>
									)}
							</div>
						</div>
						<button
							onClick={onClose}
							className="rounded-lg p-1.5 text-zinc-400 transition-all duration-200 hover:scale-105 hover:bg-zinc-800 hover:text-white active:scale-95"
						>
							<X className="h-4 w-4" />
						</button>
					</div>
				</DialogHeader>

				{/* Content */}
				<div className="py-4">
					{mode === "create" ? (
						<div className="space-y-6 duration-500 animate-in fade-in-50">
							{/* OAuth Flow Status */}
							<div className="flex flex-col items-center justify-center space-y-6">
								{/* Status Icon */}
								<div className="relative">
									<div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-700/50 bg-zinc-800/50 transition-all duration-300 hover:border-zinc-600/50 hover:bg-zinc-700/50">
										{getStatusIcon()}
									</div>
									<div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-lg border-2 border-zinc-900 bg-zinc-700 transition-all duration-200 hover:bg-zinc-600">
										<PlatformIcon className="h-3 w-3 text-zinc-300" />
									</div>
								</div>

								{/* Text content */}
								<div className="space-y-2 text-center">
									<h3 className="text-lg font-medium text-white transition-all duration-300">
										{getStatusText()}
									</h3>
									<p className="max-w-sm text-sm text-zinc-400 transition-colors duration-300">
										{getStatusSubtext()}
									</p>
								</div>

								{/* Progress Steps */}
								{isLoading && (
									<div className="w-full max-w-xs space-y-3 duration-300 animate-in fade-in-50">
										<div className="flex items-center justify-between text-xs text-zinc-500">
											<span className="transition-colors duration-200">
												Step {getStepNumber()}/3
											</span>
											<span className="font-mono transition-colors duration-200">
												{repo_id.slice(0, 8)}...
											</span>
										</div>
										<div className="flex gap-1">
											{[1, 2, 3].map(step => (
												<div
													key={step}
													className={`h-1 flex-1 rounded-full transition-all duration-500 ${
														step <= getStepNumber()
															? "bg-white shadow-sm"
															: "bg-zinc-800"
													}`}
													style={{
														transitionDelay: `${step * 100}ms`,
													}}
												/>
											))}
										</div>
									</div>
								)}
							</div>

							{/* Setup Instructions */}
							<div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4 transition-all duration-200 hover:border-zinc-600 hover:bg-zinc-800/70">
								<h3 className="mb-3 font-medium text-white">
									What happens next
								</h3>
								<div className="space-y-2">
									{[
										`You'll be redirected to ${config.name}`,
										"Authorize our application",
										"Return here to complete setup",
									].map((text, index) => (
										<div
											key={index}
											className="flex items-center gap-3 duration-300 animate-in fade-in-50"
											style={{ animationDelay: `${index * 100}ms` }}
										>
											<div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-700 text-xs font-medium text-zinc-300 transition-all duration-200 hover:bg-zinc-600">
												{index + 1}
											</div>
											<span className="text-sm text-zinc-300 transition-colors duration-200">
												{text}
											</span>
										</div>
									))}
								</div>
							</div>
						</div>
					) : (
						<div className="space-y-6 duration-500 animate-in fade-in-50">
							{/* Connection Status */}
							<div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4 transition-all duration-200 hover:border-zinc-600 hover:bg-zinc-800/70">
								<div className="mb-4 flex items-center gap-3">
									<div className="h-2 w-2 animate-pulse rounded-full bg-green-400"></div>
									<span className="text-sm font-medium text-white">
										Connected
									</span>
									{existingConnection?.connected_at && (
										<span className="text-xs text-zinc-400 duration-300 animate-in fade-in-50">
											since{" "}
											{new Date(
												existingConnection.connected_at,
											).toLocaleDateString()}
										</span>
									)}
								</div>
								<div className="space-y-3">
									<div className="flex items-center gap-3">
										<span className="text-sm text-zinc-400">Platform:</span>
										<div className="flex items-center gap-2">
											<PlatformIcon className="h-4 w-4 text-zinc-300" />
											<code className="rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-300 transition-all duration-200 hover:bg-zinc-700">
												{config.name}
											</code>
										</div>
									</div>
									<div className="flex items-center gap-3">
										<span className="text-sm text-zinc-400">Status:</span>
										<span className="text-sm font-medium text-green-400">
											Active
										</span>
									</div>
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="border-t border-zinc-800 pt-4">
					<div className="flex items-center justify-between">
						<div>
							{mode === "manage" && (
								<button
									onClick={handleDisconnect}
									disabled={isLoading}
									className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-zinc-400 transition-all duration-200 hover:scale-105 hover:bg-zinc-800 hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
								>
									{isLoading ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<Trash2 className="h-4 w-4" />
									)}
									{isLoading ? "Disconnecting..." : "Disconnect"}
								</button>
							)}
						</div>

						<div className="flex items-center gap-2">
							<button
								onClick={onClose}
								disabled={isLoading}
								className="px-4 py-2 text-sm text-zinc-400 transition-all duration-200 hover:scale-105 hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
							>
								{mode === "create" && currentStep === "complete"
									? "Done"
									: "Cancel"}
							</button>
							{mode === "create" && currentStep === "initializing" && (
								<button
									onClick={initiateOAuth}
									disabled={isLoading}
									className="flex items-center gap-2 rounded-lg bg-white px-6 py-2 text-sm font-medium text-black transition-all duration-200 hover:scale-105 hover:bg-zinc-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
								>
									{isLoading ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<Plus className="h-4 w-4" />
									)}
									{isLoading ? "Connecting..." : "Connect"}
								</button>
							)}
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
