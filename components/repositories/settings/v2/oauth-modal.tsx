/* eslint-disable import/no-unresolved */
"use client";
import { ExternalLink, Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import { FaDiscord, FaLinkedin, FaSlack } from "react-icons/fa";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
	getConnectLinkedinOauth,
	getConnectTwitterOauth,
} from "@/server-actions/core/repo/social-connect";

type Platform = "linkedin" | "slack" | "discord" | "x" | "twitter";

interface OAuthModalProps {
	org_id: string;
	isOpen: boolean;
	platform: Platform;
	onClose: () => void;
}

type OAuthStep = "initializing" | "fetching" | "redirecting" | "complete";

const XIcon: React.FC<{ className?: string }> = ({ className }) => (
	<svg viewBox="0 0 24 24" className={className} fill="currentColor">
		<path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932L18.901 1.153ZM17.61 20.644h2.039L6.486 3.24H4.298L17.61 20.644Z" />
	</svg>
);

const platformConfig = {
	discord: {
		name: "Discord",
		icon: FaDiscord,
	},
	slack: {
		name: "Slack",
		icon: FaSlack,
	},
	x: {
		name: "X (Twitter)",
		icon: XIcon,
	},
	twitter: {
		name: "X (Twitter)",
		icon: XIcon,
	},
	linkedin: {
		name: "LinkedIn",
		icon: FaLinkedin,
	},
};

export function OAuthModalV2({
	isOpen,
	org_id,
	onClose,
	platform,
}: OAuthModalProps) {
	const path = usePathname();
	const [isLoading, setIsLoading] = useState(false);
	const [currentStep, setCurrentStep] = useState<OAuthStep>("initializing");

	const config = platformConfig[platform];
	const PlatformIcon = config?.icon;

	// Check if we're on /settings or /settings?something
	const isSettingsPage = path === "/settings" || path.startsWith("/settings?");

	// Reusable theme classes
	const containerClass = isSettingsPage
		? "flex max-h-[80vh] flex-col border border-zinc-700/60 bg-zinc-900 px-0 shadow-xl sm:max-w-md"
		: "flex max-h-[80vh] flex-col border border-gray-300 bg-white px-0 shadow-lg sm:max-w-md";

	const sectionBorder = isSettingsPage
		? "border-zinc-700/60"
		: "border-gray-300";

	const textPrimary = isSettingsPage ? "text-zinc-100" : "text-arch-black";
	const textSecondary = isSettingsPage ? "text-zinc-400" : "text-gray-600";

	const iconContainer = isSettingsPage
		? "flex h-16 w-16 items-center justify-center rounded border border-zinc-700/60 bg-zinc-800/50"
		: "flex h-16 w-16 items-center justify-center rounded border border-gray-300 bg-white";

	const stepBox = isSettingsPage
		? "space-y-3 rounded border border-zinc-700/60 bg-zinc-800/30 p-4"
		: "space-y-3 rounded border border-gray-300 bg-white p-4";

	const stepCircle = isSettingsPage
		? "flex h-5 w-5 items-center justify-center rounded-full border border-zinc-600 bg-zinc-800 text-xs font-medium text-zinc-300"
		: "flex h-5 w-5 items-center justify-center rounded-full border border-gray-300 bg-white text-xs font-medium text-gray-600";

	const progressBg = isSettingsPage ? "bg-zinc-700/30" : "bg-gray-200";
	const progressBar = isSettingsPage ? "bg-zinc-100" : "bg-arch-black";
	const initiateOAuth = useCallback(async () => {
		setIsLoading(true);
		setCurrentStep("initializing");

		try {
			let result;
			if (platform === "linkedin") {
				result = await getConnectLinkedinOauth(path);
			} else if (platform === "x" || platform === "twitter") {
				result = await getConnectTwitterOauth(path);
			} else {
				toast.error("OAuth not yet implemented for this platform");
				return;
			}

			setCurrentStep("fetching");

			if (result?.success && result?.data?.authorization_url) {
				setCurrentStep("redirecting");
				setTimeout(() => {
					// Redirect the current page
					globalThis.location.href = `${result?.data?.authorization_url}`;

					// Optional: update your UI step after redirect
					setCurrentStep("complete");
				}, 800);
			} else {
				toast.error(`${result.message}`);
				setCurrentStep("initializing");
			}
		} catch {
			toast.error("Failed to initialize OAuth flow");
			setCurrentStep("initializing");
		} finally {
			setIsLoading(false);
		}
	}, [platform, path]);

	const getStatusText = () => {
		switch (currentStep) {
			case "fetching": {
				return "Connecting...";
			}
			case "redirecting": {
				return "Opening authorization...";
			}
			case "complete": {
				return "Authorization opened";
			}
			default: {
				return `Connect to ${config.name}`;
			}
		}
	};

	if (!isOpen) return;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className={containerClass}>
				{/* Hidden title for accessibility */}
				<DialogTitle className="hidden">Connect {config.name}</DialogTitle>

				{/* Content */}
				<div className="flex flex-1 flex-col overflow-hidden">
					<div className="flex-1 space-y-6 p-6">
						{/* Status */}
						<div className="text-center">
							<div className="mb-4 flex justify-center">
								<div className={iconContainer}>
									{isLoading ? (
										<Loader2 className="h-8 w-8 animate-spin text-primary" />
									) : currentStep === "complete" ? (
										<ExternalLink className="h-8 w-8 text-primary" />
									) : (
										<PlatformIcon
											className={`h-8 w-8 ${
												isSettingsPage ? "text-zinc-100" : "text-arch-black"
											}`}
										/>
									)}
								</div>
							</div>
							<h3 className={`text-lg font-normal ${textPrimary}`}>
								{getStatusText()}
							</h3>
						</div>

						{/* Instructions */}
						{currentStep === "initializing" && (
							<div className={stepBox}>
								<h4
									className={`text-sm font-medium uppercase tracking-wide ${textSecondary}`}
								>
									What happens next
								</h4>
								<div className="space-y-2">
									{[
										`You'll be redirected to ${config.name}`,
										"Authorize the connection",
										"Return here to complete setup",
									].map((text, index) => (
										<div key={index} className="flex items-center gap-3">
											<div className={stepCircle}>{index + 1}</div>
											<span className={`text-sm ${textPrimary}`}>{text}</span>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Loading Progress */}
						{isLoading && (
							<div className="space-y-2">
								<div
									className={`flex items-center justify-between text-xs ${textSecondary}`}
								>
									<span>Connecting...</span>
								</div>
								<div className={`h-1 rounded-full ${progressBg}`}>
									<div
										className={`h-1 animate-pulse rounded-full ${progressBar}`}
									/>
								</div>
							</div>
						)}
					</div>

					{/* Footer */}
					<div className={`flex-shrink-0 border-t ${sectionBorder} px-6 pt-4`}>
						<div className="flex justify-end gap-3">
							<Button
								type="button"
								variant="ghost"
								onClick={onClose}
								disabled={isLoading}
								className="flex items-center space-x-2 text-base text-gray-600 hover:text-arch-black disabled:cursor-not-allowed disabled:opacity-50"
							>
								{" "}
								{currentStep === "complete" ? "Done" : "Cancel"}{" "}
							</Button>

							{currentStep === "initializing" && (
								<Button
									onClick={initiateOAuth}
									disabled={isLoading}
									className="flex items-center space-x-2 border border-arch-black bg-arch-black px-6 py-3 text-white hover:bg-arch-dark focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
								>
									{" "}
									{isLoading ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<></>
									)}{" "}
									Connect{" "}
								</Button>
							)}
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
