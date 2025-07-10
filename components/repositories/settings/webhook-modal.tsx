"use client";

import {
	Copy,
	ExternalLink,
	Eye,
	EyeOff,
	Info,
	Loader2,
	Plus,
	Settings,
	Trash2,
	X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { FaDiscord, FaSlack } from "react-icons/fa";

// eslint-disable-next-line import/no-unresolved
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";

// Mock data for demonstration - in real app, this would come from your state management
// const mockWebhooks = {
// 	slack: undefined, // "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX"
// 	discord: undefined, // "https://discord.com/api/webhooks/123456789/abcdefghijklmnopqrstuvwxyz"
// };

interface WebhookModalProps {
	isOpen: boolean;
	onClose: () => void;
	platform: "slack" | "discord";
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
		color: "purple",
		bgColor: "bg-purple-500/10",
		textColor: "text-purple-400",
		borderColor: "border-purple-500/20",
	},
	discord: {
		name: "Discord",
		color: "indigo",
		bgColor: "bg-indigo-500/10",
		textColor: "text-indigo-400",
		borderColor: "border-indigo-500/20",
	},
};

export function WebhookModal({ isOpen, onClose, platform }: WebhookModalProps) {
	const [showUrl, setShowUrl] = useState(false);
	const currentConfig = platformConfig[platform];
	const [webhookUrl, setWebhookUrl] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [mode, setMode] = useState<"create" | "manage">("create");
	const [currentWebhook, setCurrentWebhook] = useState<string | undefined>();

	// Simulate loading existing webhook
	// useEffect(() => {
	// 	if (isOpen) {
	// 		// In real app, fetch from your API/state
	// 		const existing = mockWebhooks[platform];
	// 		setCurrentWebhook(existing);
	// 		setMode(existing ? "manage" : "create");
	// 		setWebhookUrl("");
	// 		setShowUrl(false);
	// 	}
	// }, [isOpen, platform]);

	const handleSave = async () => {
		if (!webhookUrl.trim()) {
			alert("Please enter a webhook URL");
			return;
		}

		// Basic URL validation
		try {
			new URL(webhookUrl);
		} catch {
			alert("Please enter a valid webhook URL");
			return;
		}

		setIsLoading(true);
		try {
			// Simulate API call
			await new Promise(resolve => setTimeout(resolve, 1000));

			// Update mock data
			// mockWebhooks[platform] = webhookUrl;
			setCurrentWebhook(webhookUrl);
			setMode("manage");
			setWebhookUrl("");

			alert(
				`${platformName} webhook ${currentWebhook ? "updated" : "connected"} successfully`,
			);
		} catch {
			alert("Failed to save webhook. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	// const handleDisconnect = async () => {
	// 	if (!currentWebhook) return;

	// 	setIsLoading(true);
	// 	try {
	// 		// Simulate API call
	// 		await new Promise(resolve => setTimeout(resolve, 1000));

	// 		// Update mock data
	// 		setCurrentWebhook(undefined);
	// 		setMode("create");
	// 		setWebhookUrl("");

	// 		alert(`${platformName} webhook disconnected`);
	// 	} catch {
	// 		alert("Failed to disconnect webhook. Please try again.");
	// 	} finally {
	// 		setIsLoading(false);
	// 	}
	// };

	// const copyWebhook = () => {
	// 	if (currentWebhook) {
	// 		navigator.clipboard.writeText(currentWebhook);
	// 		alert("Webhook URL copied to clipboard");
	// 	}
	// };

	const platformName = platform === "slack" ? "Slack" : "Discord";
	const documentsUrl =
		platform === "slack"
			? "https://api.slack.com/messaging/webhooks"
			: "https://support.discord.com/hc/en-us/articles/228383668";

	if (!isOpen) return;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="w-full max-w-lg rounded-2xl border border-gray-800 bg-gray-900 shadow-2xl">
				<div className="absolute right-[10px] top-[10px] z-[99] h-[30px] w-[30px] bg-gray-900" />
				<DialogHeader className="border-b border-gray-800 py-5">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<div
								className={`h-12 w-12 rounded-xl ${currentConfig.bgColor} ${currentConfig.borderColor} flex items-center justify-center border`}
							>
								{platform === "slack" ? (
									<FaSlack className={`h-6 w-6 ${currentConfig.textColor}`} />
								) : (
									<FaDiscord className={`h-6 w-6 ${currentConfig.textColor}`} />
								)}
							</div>
							<div>
								<h2 className="text-xl font-semibold text-white">
									{currentConfig.name}
								</h2>
								<p className="mt-0.5 text-sm text-gray-400">
									{mode === "create" ? "Connect webhook" : "Manage webhook"}
								</p>
							</div>
						</div>
						<button
							onClick={onClose}
							className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
						>
							<X className="h-5 w-5" />
						</button>
					</div>
				</DialogHeader>
				{/* Content */}
				<div className="py-4">
					{mode === "create" ? (
						<div className="space-y-6">
							{/* Setup Instructions */}
							<div className="rounded-xl border border-gray-700 bg-gray-800/50 p-5">
								<div className="flex items-start gap-4">
									<div className="flex-1">
										<h3 className="mb-3 font-semibold text-white">
											Setup Instructions
										</h3>
										<div className="space-y-2">
											<div className="flex items-center gap-3">
												<div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-700 text-xs font-medium text-gray-300">
													1
												</div>
												<span className="text-sm text-gray-300">
													Go to your {currentConfig.name} workspace settings
												</span>
											</div>
											<div className="flex items-center gap-3">
												<div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-700 text-xs font-medium text-gray-300">
													2
												</div>
												<span className="text-sm text-gray-300">
													Create a new webhook integration
												</span>
											</div>
											<div className="flex items-center gap-3">
												<div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-700 text-xs font-medium text-gray-300">
													3
												</div>
												<span className="text-sm text-gray-300">
													Copy the webhook URL and paste it below
												</span>
											</div>
										</div>
									</div>
								</div>
								<div className="mt-4 border-t border-gray-700 pt-4">
									<a
										target="_blank"
										href={documentsUrl}
										rel="noopener noreferrer"
										className={`inline-flex items-center gap-2 text-sm ${currentConfig.textColor} transition-colors hover:text-white`}
									>
										<span>View documentation</span>
										<ExternalLink className="h-3 w-3" />
									</a>
								</div>
							</div>

							{/* Webhook URL Input */}
							<div className="space-y-3">
								<label className="block text-sm font-medium text-gray-300">
									Webhook URL
								</label>
								<div className="relative">
									<input
										type="text"
										placeholder={`https://hooks.${platform}.com/services/...`}
										value={webhookUrl}
										onChange={event_ => setWebhookUrl(event_.target.value)}
										className="w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 font-mono text-sm text-white placeholder-gray-500 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
									/>
								</div>
							</div>
						</div>
					) : (
						<div className="space-y-6">
							{/* Connection Status */}
							<div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-5">
								<div className="mb-4 flex items-center gap-3">
									<div className="h-3 w-3 animate-pulse rounded-full bg-emerald-500"></div>
									<span className="text-sm font-medium text-emerald-400">
										Connected
									</span>
								</div>
								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<span className="text-sm text-gray-400">Webhook URL</span>
										<button
											onClick={() => setShowUrl(!showUrl)}
											className="flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-white"
										>
											{showUrl ? (
												<EyeOff className="h-4 w-4" />
											) : (
												<Eye className="h-4 w-4" />
											)}
											{showUrl ? "Hide" : "Show"}
										</button>
									</div>
									<div className="flex items-center gap-3">
										<code className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 font-mono text-xs text-gray-300">
											{showUrl
												? currentWebhook
												: maskUrl(currentWebhook as string)}
										</code>
										<button className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white">
											<Copy className="h-4 w-4" />
										</button>
									</div>
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="border-t border-gray-800 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							{mode === "manage" && (
								<button className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300">
									<Trash2 className="h-4 w-4" />
									Disconnect
								</button>
							)}

							{/* Platform Toggle */}
							{/* <div className="ml-2 flex items-center gap-1">
								<button
									onClick={() => setPlatform("slack")}
									className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
										platform === "slack"
											? "border border-purple-500/30 bg-purple-500/20 text-purple-400"
											: "text-gray-500 hover:text-gray-400"
									}`}
								>
									Slack
								</button>
								<button
									onClick={() => setPlatform("discord")}
									className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
										platform === "discord"
											? "border border-indigo-500/30 bg-indigo-500/20 text-indigo-400"
											: "text-gray-500 hover:text-gray-400"
									}`}
								>
									Discord
								</button>
							</div> */}
						</div>

						<div className="ml-auto flex items-center gap-2">
							<button
								onClick={onClose}
								disabled={isLoading}
								className="px-4 py-2 text-sm text-gray-400 transition-colors hover:text-white"
							>
								Cancel
							</button>
							<button
								onClick={handleSave}
								disabled={isLoading || !webhookUrl.trim()}
								className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
							>
								{isLoading ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : mode === "create" ? (
									<Plus className="h-4 w-4" />
								) : (
									<Settings className="h-4 w-4" />
								)}
								{isLoading
									? "Saving..."
									: mode === "create"
										? "Connect"
										: "Update"}
							</button>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

// {/* Mode Toggle */}
// 				<div className="mt-4 border-t border-gray-800 pt-4">
// 					<div className="flex items-center justify-center gap-2">
// 						<button
// 							onClick={() => setMode("create")}
// 							className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
// 								mode === "create"
// 									? "bg-gray-700 text-white"
// 									: "text-gray-500 hover:text-gray-400"
// 							}`}
// 						>
// 							Create Mode
// 						</button>
// 						<button
// 							onClick={() => setMode("manage")}
// 							className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
// 								mode === "manage"
// 									? "bg-gray-700 text-white"
// 									: "text-gray-500 hover:text-gray-400"
// 							}`}
// 						>
// 							Manage Mode
// 						</button>
// 					</div>
// 				</div>
