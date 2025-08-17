/* eslint-disable import/no-unresolved */
"use client";

import { UUID } from "node:crypto";

import { ExternalLink, Loader2, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import { FaDiscord, FaLinkedin, FaSlack } from "react-icons/fa";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	getConnectLinkedinOauth,
	getConnectTwitterOauth,
} from "@/server-actions/core/repo/social-connect";

type Platform = "linkedin" | "slack" | "discord" | "x";

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

	const initiateOAuth = useCallback(async () => {
		setIsLoading(true);
		setCurrentStep("initializing");

		try {
			let result;
			if (platform === "linkedin") {
				result = await getConnectLinkedinOauth(path);
			} else if (platform === "x") {
				result = await getConnectTwitterOauth(path);
			} else {
				toast.error("OAuth not yet implemented for this platform");
				return;
			}

			setCurrentStep("fetching");

			if (result?.success && result?.data?.authorization_url) {
				setCurrentStep("redirecting");

				setTimeout(() => {
					window.open(result?.data?.authorization_url);
					setCurrentStep("complete");
				}, 800);
			} else {
				toast.error(`Could not connect to ${config.name}`);
				setCurrentStep("initializing");
			}
		} catch {
			toast.error("Failed to initialize OAuth flow");
			setCurrentStep("initializing");
		} finally {
			setIsLoading(false);
		}
	}, [platform, path, config.name]);

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
			<DialogContent className="flex max-h-[80vh] flex-col border border-gray-600 bg-arch-white px-0 shadow-lg sm:max-w-md">
				{/* Header */}
				<div className="hidden flex-shrink-0 border-b border-gray-600 px-6 py-4">
					<DialogHeader>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="flex h-8 w-8 items-center justify-center rounded border border-gray-600 bg-arch-white p-1">
									<PlatformIcon className="h-5 w-5 text-gray-600" />
								</div>
								<h2 className="text-xl font-normal text-arch-black"></h2>
							</div>
						</div>
					</DialogHeader>
				</div>
				<DialogTitle className="hidden">Connect {config.name}</DialogTitle>
				<div className="absolute right-[15px] top-[14px] z-[1] h-5 w-5 bg-white"></div>

				{/* Content */}
				<div className="flex flex-1 flex-col overflow-hidden">
					<div className="flex-1 space-y-6 p-6">
						{/* Status */}
						<div className="text-center">
							<div className="mb-4 flex justify-center">
								<div className="flex h-16 w-16 items-center justify-center rounded border border-gray-600 bg-arch-white">
									{isLoading ? (
										<Loader2 className="h-8 w-8 animate-spin text-arch-black" />
									) : currentStep === "complete" ? (
										<ExternalLink className="h-8 w-8 text-arch-black" />
									) : (
										<PlatformIcon className="h-8 w-8 text-arch-black" />
									)}
								</div>
							</div>
							<h3 className="text-lg font-normal text-arch-black">
								{getStatusText()}
							</h3>
						</div>

						{/* Instructions */}
						{currentStep === "initializing" && (
							<div className="space-y-3 rounded border border-gray-600 bg-arch-white p-4">
								<h4 className="text-sm font-medium uppercase tracking-wide text-gray-600">
									What happens next
								</h4>
								<div className="space-y-2">
									{[
										`You'll be redirected to ${config.name}`,
										"Authorize the connection",
										"Return here to complete setup",
									].map((text, index) => (
										<div key={index} className="flex items-center gap-3">
											<div className="flex h-5 w-5 items-center justify-center rounded-full border border-gray-600 bg-arch-white text-xs font-medium text-gray-600">
												{index + 1}
											</div>
											<span className="text-sm text-arch-black">{text}</span>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Loading Progress */}
						{isLoading && (
							<div className="space-y-2">
								<div className="flex items-center justify-between text-xs text-gray-600">
									<span>Connecting...</span>
								</div>
								<div className="h-1 rounded-full bg-gray-600/20">
									<div className="h-1 animate-pulse rounded-full bg-arch-black"></div>
								</div>
							</div>
						)}
					</div>

					{/* Footer */}
					<div className="flex-shrink-0 border-t border-gray-600 px-6 pt-4">
						<div className="flex justify-end gap-3">
							<Button
								type="button"
								variant="ghost"
								onClick={onClose}
								disabled={isLoading}
								className="flex items-center space-x-2 text-base text-gray-600 hover:text-arch-black disabled:cursor-not-allowed disabled:opacity-50"
							>
								{currentStep === "complete" ? "Done" : "Cancel"}
							</Button>
							{currentStep === "initializing" && (
								<Button
									onClick={initiateOAuth}
									disabled={isLoading}
									className="flex items-center space-x-2 border border-arch-black bg-arch-black px-6 py-3 text-white hover:bg-arch-dark focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
									// className="flex items-center gap-2 rounded border border-arch-black bg-arch-black px-6 py-2 text-sm text-arch-white hover:border-arch-black hover:bg-arch-white hover:text-arch-black disabled:opacity-50"
								>
									{isLoading ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<></>
									)}
									Connect
								</Button>
							)}
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
