"use client";

import { UUID } from "node:crypto";

import { useQueryClient } from "@tanstack/react-query";
import {
	Copy,
	ExternalLink,
	Eye,
	EyeOff,
	Loader2,
	Plus,
	Trash2,
	X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { FaDiscord, FaSlack } from "react-icons/fa";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import {
	disconnectSlackAndDiscord,
	socialConnectSlackAndDiscord,
} from "@/server-actions/core/repo/social-connect";

interface SocialConnection {
	connected: boolean;
	connected_by: string | null;
	connected_at: string | null;
	details: {
		webhook_url?: string;
	} | null;
}

interface WebhookModalProps {
	repo_id: UUID;
	isOpen: boolean;
	onClose: () => void;
	platform: "slack" | "discord";
	existingConnection?: SocialConnection;
}

const maskUrl = (url: string) => {
	if (!url) return "";
	const parts = url.split("/");
	if (parts.length > 3) {
		return parts.slice(0, 3).join("/") + "/***/" + parts.slice(-1);
	}
	return url;
};

const platformConfig = {
	slack: {
		name: "Slack",
		icon: FaSlack,
	},
	discord: {
		name: "Discord",
		icon: FaDiscord,
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

export function WebhookModal({
	repo_id,
	isOpen,
	onClose,
	platform,
	existingConnection,
}: WebhookModalProps) {
	const queryClient = useQueryClient();
	const [showUrl, setShowUrl] = useState(false);
	const [webhookUrl, setWebhookUrl] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [mode, setMode] = useState<"create" | "manage">("create");
	const [currentWebhook, setCurrentWebhook] = useState<string | undefined>();

	const currentConfig = platformConfig[platform];
	const IconComponent = currentConfig.icon;

	// Initialize state based on existing connection
	useEffect(() => {
		if (
			existingConnection?.connected &&
			existingConnection.details?.webhook_url
		) {
			setCurrentWebhook(existingConnection.details.webhook_url);
			setMode("manage");
		} else {
			setCurrentWebhook(undefined);
			setMode("create");
		}
	}, [existingConnection]);

	const showToast = {
		error: (message: any) => toast.error(message, { style: toastStyles }),
		success: (message: any) => toast.success(message, { style: toastStyles }),
	};

	const handleSave = async () => {
		if (!webhookUrl.trim()) {
			showToast.error("Please enter a webhook URL");
			return;
		}

		try {
			new URL(webhookUrl);
		} catch {
			showToast.error("Please enter a valid webhook URL");
			return;
		}

		setIsLoading(true);

		try {
			const response = await socialConnectSlackAndDiscord(
				repo_id,
				webhookUrl,
				platform,
			);

			if (!response.success) {
				showToast.error(response.message);
				return;
			}

			showToast.success(response.message);

			// Update local state (optimistic UI)
			setCurrentWebhook(webhookUrl);
			setWebhookUrl("");
			setMode("manage");

			// Invalidate the repo settings so the new connection is fetched
			await queryClient.invalidateQueries({
				queryKey: ["repo_super_details", repo_id],
			});
		} catch {
			showToast.error("Something went wrong while saving settings.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleDisconnect = async () => {
		if (!currentWebhook) return;

		setIsLoading(true);

		try {
			const response = await disconnectSlackAndDiscord(repo_id, platform);

			if (!response.success) {
				showToast.error(response.message);
				return;
			}

			// Clear local state
			setCurrentWebhook(undefined);
			setMode("create");
			setWebhookUrl("");

			// Invalidate the repo details cache
			await queryClient.invalidateQueries({
				queryKey: ["repo_super_details", repo_id],
			});

			showToast.success(response.message);
		} catch {
			showToast.error("Failed to disconnect webhook. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const copyWebhook = () => {
		if (currentWebhook) {
			navigator.clipboard.writeText(currentWebhook);
			showToast.success("Webhook URL copied to clipboard");
		}
	};

	const documentsUrl =
		platform === "slack"
			? "https://api.slack.com/messaging/webhooks"
			: "https://support.discord.com/hc/en-us/articles/228383668";

	if (!isOpen) return;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl">
				{/* Header */}
				<DialogHeader className="border-b border-zinc-800 pb-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800">
								<IconComponent className="h-5 w-5 text-zinc-300" />
							</div>
							<div>
								<h2 className="text-lg font-semibold text-white">
									{currentConfig.name}
								</h2>
								<p className="text-sm text-zinc-400">
									{mode === "create" ? "Connect webhook" : "Manage webhook"}
								</p>
								{existingConnection?.connected &&
									existingConnection.connected_by && (
										<p className="text-xs text-zinc-500">
											Connected by {existingConnection.connected_by}
										</p>
									)}
							</div>
						</div>
						<button
							onClick={onClose}
							className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
						>
							<X className="h-4 w-4" />
						</button>
					</div>
				</DialogHeader>

				{/* Content */}
				<div className="py-4">
					{mode === "create" ? (
						<div className="space-y-6">
							{/* Setup Instructions */}
							<div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
								<h3 className="mb-3 font-medium text-white">
									Setup Instructions
								</h3>
								<div className="space-y-2">
									<div className="flex items-center gap-3">
										<div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-700 text-xs font-medium text-zinc-300">
											1
										</div>
										<span className="text-sm text-zinc-300">
											Go to your {currentConfig.name} workspace settings
										</span>
									</div>
									<div className="flex items-center gap-3">
										<div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-700 text-xs font-medium text-zinc-300">
											2
										</div>
										<span className="text-sm text-zinc-300">
											Create a new webhook integration
										</span>
									</div>
									<div className="flex items-center gap-3">
										<div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-700 text-xs font-medium text-zinc-300">
											3
										</div>
										<span className="text-sm text-zinc-300">
											Copy the webhook URL and paste it below
										</span>
									</div>
								</div>
								<div className="mt-4 border-t border-zinc-700 pt-3">
									<a
										target="_blank"
										href={documentsUrl}
										rel="noopener noreferrer"
										className="inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
									>
										<span>View documentation</span>
										<ExternalLink className="h-3 w-3" />
									</a>
								</div>
							</div>

							{/* Webhook URL Input */}
							<div className="space-y-3">
								<label className="block text-sm font-medium text-zinc-300">
									Webhook URL
								</label>
								<input
									type="text"
									value={webhookUrl}
									onChange={event_ => setWebhookUrl(event_.target.value)}
									placeholder={`https://hooks.${platform}.com/services/...`}
									className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 font-mono text-sm text-white placeholder-zinc-500 transition-colors focus:border-white focus:outline-none focus:ring-1 focus:ring-white/20"
								/>
							</div>
						</div>
					) : (
						<div className="space-y-6">
							{/* Connection Status */}
							<div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
								<div className="mb-4 flex items-center gap-3">
									<div className="h-2 w-2 rounded-full bg-green-400"></div>
									<span className="text-sm font-medium text-white">
										Connected
									</span>
									{existingConnection?.connected_at && (
										<span className="text-xs text-zinc-400">
											since{" "}
											{new Date(
												existingConnection.connected_at,
											).toLocaleDateString()}
										</span>
									)}
								</div>
								<div className="space-y-3">
									{/* <div className="flex items-center justify-between">
										<span className="text-sm text-zinc-400">Webhook URL</span>
										<button
											onClick={() => setShowUrl(!showUrl)}
											className="flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-white"
										>
											{showUrl ? (
												<EyeOff className="h-4 w-4" />
											) : (
												<Eye className="h-4 w-4" />
											)}
											{showUrl ? "Hide" : "Show"}
										</button>
									</div> */}
									<div className="flex items-center gap-3">
										<code className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 font-mono text-xs text-zinc-300">
											{showUrl
												? currentWebhook
												: maskUrl(currentWebhook as string)}
										</code>
										{/* <button
											onClick={copyWebhook}
											className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
										>
											<Copy className="h-4 w-4" />
										</button> */}
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
									className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
								>
									<Trash2 className="h-4 w-4" />
									Disconnect
								</button>
							)}
						</div>

						<div className="flex items-center gap-2">
							<button
								onClick={onClose}
								disabled={isLoading}
								className="px-4 py-2 text-sm text-zinc-400 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
							>
								Cancel
							</button>
							{mode === "create" && (
								<button
									onClick={handleSave}
									disabled={isLoading || !webhookUrl.trim()}
									className="flex items-center gap-2 rounded-lg bg-white px-6 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
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
