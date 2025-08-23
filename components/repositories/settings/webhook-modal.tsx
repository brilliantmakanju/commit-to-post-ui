"use client";

import { UUID } from "node:crypto";

import { ExternalLink, Loader2, Plus, X } from "lucide-react";
import { useState } from "react";
import { FaDiscord } from "react-icons/fa";
import { toast } from "sonner";

import FeatureLimitWrapper from "@/components/feature-flag/feature-limit-wrapper";
import LimitTooltip from "@/components/feature-flag/limit-tooltip";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { useLimitUI } from "@/hooks/use-limit-ui";
import { FEATURE_LIMITS } from "@/lib/constants/feature-limits";
import { socialConnectDiscord } from "@/server-actions/core/repo/social-connect";
import { getOrganizations } from "@/server-actions/organizations/get-organizations";
import useOrganizationStore from "@/zustand/useorganization-store";

interface WebhookModalProps {
	org_id: UUID;
	isOpen: boolean;
	onClose: () => void;
	platform: "discord";
}

const platformConfig = {
	discord: {
		name: "Discord",
		icon: FaDiscord,
	},
};

// Custom toast styling for dark minimalist theme
const toastStyles = {
	color: "#f4f4f5",
	fontSize: "14px",
	borderRadius: "8px",
	backgroundColor: "#18181b",
	border: "1px solid #3f3f46",
};

export function WebhookModal({
	org_id,
	isOpen,
	onClose,
	platform,
}: WebhookModalProps) {
	const [webhookUrl, setWebhookUrl] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const { organization, updateSocials } = useOrganizationStore();
	const socialCount = (organization?.socials ?? []).length;

	const currentConfig = platformConfig[platform];
	const IconComponent = currentConfig.icon;

	const showToast = {
		error: (message: any) => toast.error(message, { style: toastStyles }),
		success: (message: any) => toast.success(message, { style: toastStyles }),
	};

	const socialLimitUI = useLimitUI({
		warningThreshold: 80,
		currentCount: socialCount,
		limitType: "social_integrations",
		limitId: FEATURE_LIMITS.SOCIAL_ACCOUNTS,
	});

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
			const response = await socialConnectDiscord(webhookUrl);

			if (!response.success) {
				showToast.error(response.message);
				return;
			}
			try {
				const { success, organizations } = await getOrganizations({
					org_id: organization.id,
				});
				if (success && organizations && organizations.length > 0) {
					const updatedSocials = organizations[0].socials ?? [];
					updateSocials(organization.id, updatedSocials);
				}
			} catch {}

			showToast.success(response.message);
			setWebhookUrl("");
		} catch {
			showToast.error("Something went wrong while saving settings.");
		} finally {
			setIsLoading(false);
		}
	};

	const documentsUrl =
		"https://support.discord.com/hc/en-us/articles/228383668";

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
									{/* {mode === "create" ?  */}
									Connect webhook
									{/* : "Manage webhook"} */}
								</p>
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
				</div>

				{/* Footer */}
				<div className="border-t border-zinc-800 pt-4">
					<div className="flex items-center justify-between">
						{/* <div>
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
						</div> */}

						<div className="flex items-center gap-2 pb-2">
							<button
								onClick={onClose}
								disabled={isLoading}
								className="px-4 py-2 text-sm text-zinc-400 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
							>
								Cancel
							</button>
							<FeatureLimitWrapper
								limitId={FEATURE_LIMITS.SOCIAL_ACCOUNTS}
								currentCount={socialCount}
								fallback={
									<LimitTooltip
										limitType="social_integrations"
										maxLimit={socialLimitUI.limit}
										currentUsage={socialCount}
										position="bottom"
									>
										<div className="inline-block cursor-not-allowed">
											<button
												disabled
												className="flex items-center gap-2 rounded-lg bg-white px-6 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
											>
												{isLoading ? (
													<Loader2 className="h-4 w-4 animate-spin" />
												) : (
													<Plus className="h-4 w-4" />
												)}
												{isLoading ? "Connecting..." : "Connect"}
											</button>
										</div>
									</LimitTooltip>
								}
							>
								<LimitTooltip
									limitType="social_integrations"
									maxLimit={socialLimitUI.limit}
									currentUsage={socialCount}
									position="bottom"
								>
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
								</LimitTooltip>
							</FeatureLimitWrapper>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

// 									{mode === "create" && (
// 									)}

// {mode === "create" ? (
// 					) : (
// 						<div className="space-y-6">
// 							{/* Connection Status */}
// 							<div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
// 								<div className="mb-4 flex items-center gap-3">
// 									<div className="h-2 w-2 rounded-full bg-green-400"></div>
// 									<span className="text-sm font-medium text-white">
// 										Connected
// 									</span>
// 								</div>
// 								<div className="space-y-3">
// 									{/* <div className="flex items-center justify-between">
// 										<span className="text-sm text-zinc-400">Webhook URL</span>
// 										<button
// 											onClick={() => setShowUrl(!showUrl)}
// 											className="flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-white"
// 										>
// 											{showUrl ? (
// 												<EyeOff className="h-4 w-4" />
// 											) : (
// 												<Eye className="h-4 w-4" />
// 											)}
// 											{showUrl ? "Hide" : "Show"}
// 										</button>
// 									</div> */}
// 									<div className="flex items-center gap-3">
// 										<code className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 font-mono text-xs text-zinc-300">
// 											{showUrl
// 												? currentWebhook
// 												: maskUrl(currentWebhook as string)}
// 										</code>
// 										{/* <button
// 											onClick={copyWebhook}
// 											className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
// 										>
// 											<Copy className="h-4 w-4" />
// 										</button> */}
// 									</div>
// 								</div>
// 							</div>
// 						</div>
// 					)}
