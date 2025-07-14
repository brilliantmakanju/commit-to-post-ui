"use client";

/* eslint-disable import/no-unresolved */
import { UUID } from "node:crypto";

import { AlertTriangle, Info, Users } from "lucide-react";
import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

import { OAuthModal } from "./oauth-loading-modal";
import { WebhookModal } from "./webhook-modal";

// Types
type Platform = "linkedin" | "slack" | "discord" | "twitter";

interface SocialConnection {
	connected: boolean | false;
	connected_by: string | null;
	connected_at: string | null;
	token_expiry?: string | null; // For LinkedIn OAuth expiry tracking
	details: {
		webhook_url?: string;
	} | null;
}

interface RepoChannelSettingsCardProps {
	repo_id: UUID;
	socialConnections: Record<Platform, SocialConnection>;
	localSettings: {
		hashtag_automation: boolean;
		default_hashtags: string;
	};
	loading?: boolean;
	onChange: (key: string, value: string | boolean) => void;
	getSocialIcon: (
		platform: Platform,
		connected: boolean,
		expired?: boolean,
	) => React.ReactNode;
	getSocialLabel: (platform: Platform) => string;
}

// Check if LinkedIn token is expired or expiring soon
const isLinkedInExpired = (connection: SocialConnection) => {
	if (!connection.token_expiry) return false;
	const expiryDate = new Date(connection.token_expiry);
	const now = new Date();
	return expiryDate <= now;
};

const isLinkedInExpiringSoon = (connection: SocialConnection) => {
	if (!connection.token_expiry) return false;

	const now = new Date();
	const expiryDate = new Date(connection.token_expiry);
	const fiveDaysFromNow = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

	return expiryDate <= fiveDaysFromNow && expiryDate > now;
};

export const RepoChannelSettingsCard = ({
	socialConnections,
	localSettings,
	loading = true,
	onChange,
	repo_id,
	getSocialIcon,
	getSocialLabel,
}: RepoChannelSettingsCardProps) => {
	const [platformModal, setPlatformModal] = useState<Platform | undefined>();
	const [webhookPlatformModal, setWebhookPlatformModal] = useState<
		Platform | undefined
	>();

	// Reorder platforms: LinkedIn, Slack, Discord, Twitter (at bottom)
	const platforms: Platform[] = ["linkedin", "slack", "discord", "twitter"];

	// Handle modal logic
	const handleChannelToggle = (platform: Platform) => {
		// Don't allow toggle if LinkedIn is expired
		if (platform === "linkedin") {
			const connection = socialConnections[platform];
			if (connection?.connected && isLinkedInExpired(connection)) {
				return; // Block toggle if expired
			}
		}

		if (platform === "slack" || platform === "discord") {
			setPlatformModal(undefined);
			setWebhookPlatformModal(platform);
		} else if (platform === "twitter" || platform === "linkedin") {
			setWebhookPlatformModal(undefined);
			setPlatformModal(platform);
		}
	};

	// ------------------
	// Loading Skeleton
	// ------------------
	if (loading) {
		return (
			<Card className="border-zinc-800 bg-zinc-900 text-zinc-100">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-lg">
						<Users className="h-5 w-5 text-zinc-400" />
						<Skeleton className="h-6 w-32 bg-zinc-800" />
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					<Skeleton className="h-20 w-full rounded-md bg-zinc-800" />
					<Skeleton className="h-6 w-32 bg-zinc-800" />
					<Skeleton className="h-24 w-full rounded-md bg-zinc-800" />
				</CardContent>
			</Card>
		);
	}

	// ------------------
	// Main UI
	// ------------------
	return (
		<>
			{platformModal && (
				<OAuthModal
					repo_id={repo_id}
					isOpen={!!platformModal}
					onClose={() => setPlatformModal(undefined)}
					platform={platformModal as "twitter" | "linkedin"}
					existingConnection={socialConnections[platformModal]}
				/>
			)}

			{webhookPlatformModal && (
				<WebhookModal
					repo_id={repo_id}
					isOpen={!!webhookPlatformModal}
					onClose={() => setWebhookPlatformModal(undefined)}
					platform={webhookPlatformModal as "slack" | "discord"}
					existingConnection={socialConnections[webhookPlatformModal]}
				/>
			)}

			<Card className="border-zinc-800 bg-zinc-900 text-zinc-100">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-lg font-semibold text-zinc-100">
						<Users className="h-5 w-5 text-blue-400" />
						Channel Settings
					</CardTitle>
				</CardHeader>

				<CardContent className="space-y-6">
					{/* LinkedIn Expiry Alert */}
					{socialConnections.linkedin?.connected &&
						(isLinkedInExpired(socialConnections.linkedin) ||
							isLinkedInExpiringSoon(socialConnections.linkedin)) && (
							<Alert className="border-yellow-600 bg-yellow-900/20">
								<AlertTriangle className="h-4 w-4 text-yellow-400" />
								<AlertDescription className="text-yellow-200">
									{isLinkedInExpired(socialConnections.linkedin)
										? "LinkedIn connection expired. Reconnect to resume posting."
										: "LinkedIn connection expires soon. Reconnect to avoid interruption."}
								</AlertDescription>
							</Alert>
						)}

					{/* Social Connections */}
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<Label className="text-sm font-medium text-zinc-300">
								Connected Channels
							</Label>
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger>
										<Info className="h-4 w-4 text-zinc-400" />
									</TooltipTrigger>
									<TooltipContent className="max-w-xs">
										<p>
											LinkedIn connections last for 60 days. You&lsquo;ll be
											notified to reconnect.
										</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</div>

						{platforms.map(platform => {
							const connection = socialConnections[platform];
							const isConnected = connection?.connected || false;
							const isComingSoon = platform === "twitter";
							const label = getSocialLabel(platform);

							// LinkedIn-specific checks
							const isLinkedIn = platform === "linkedin";
							const isExpired = isLinkedIn && isLinkedInExpired(connection);
							const isExpiringSoon =
								isLinkedIn && isLinkedInExpiringSoon(connection);

							// Determine status text
							let statusText = "Not connected";
							if (isComingSoon) {
								statusText = "Integration coming soon";
							} else if (isConnected) {
								if (isExpired) {
									statusText = "⚠ Expired - Reconnect needed";
								} else if (isExpiringSoon) {
									statusText = "⚠ Expires soon - Reconnect recommended";
								} else {
									statusText = `Connected by ${connection.connected_by || "Unknown"}`;
								}
							}

							return (
								<div
									key={platform}
									className="flex items-center justify-between border-b border-zinc-800 py-2"
								>
									<div className="flex items-center space-x-3">
										{getSocialIcon(platform, isConnected, isExpired)}
										<div>
											<span className="text-sm font-medium text-zinc-100">
												{label}
												{isComingSoon && (
													<span className="ml-2 text-xs font-normal text-yellow-400">
														(Coming Soon)
													</span>
												)}
											</span>
											<p
												className={`text-xs ${
													isExpired
														? "text-red-400"
														: isExpiringSoon
															? "text-yellow-400"
															: "text-zinc-400"
												}`}
											>
												{statusText}
											</p>
										</div>
									</div>

									{/* Switch with tooltip for expired LinkedIn */}
									<div className="flex items-center">
										{isExpired ? (
											<TooltipProvider>
												<Tooltip>
													<TooltipTrigger>
														<Switch
															checked={isConnected}
															className="opacity-50"
															onClick={() => handleChannelToggle(platform)}
														/>
													</TooltipTrigger>
													<TooltipContent>
														<p>
															LinkedIn connection expired. Reconnect to resume
															posting.
														</p>
													</TooltipContent>
												</Tooltip>
											</TooltipProvider>
										) : (
											<Switch
												checked={isConnected && !isExpired}
												disabled={isComingSoon}
												onClick={() =>
													!isComingSoon && handleChannelToggle(platform)
												}
											/>
										)}
									</div>
								</div>
							);
						})}
					</div>

					<Separator className="bg-zinc-800" />

					{/* Hashtag Automation */}
					<div className="flex items-center justify-between">
						<div>
							<Label className="text-sm font-medium text-zinc-100">
								Hashtag Automation
							</Label>
							<p className="mt-1 text-xs text-zinc-400">
								Automatically add relevant hashtags to posts
							</p>
						</div>
						<Switch
							checked={localSettings.hashtag_automation}
							onCheckedChange={checked =>
								onChange("hashtag_automation", checked)
							}
						/>
					</div>

					{/* Default Hashtags */}
					{localSettings.hashtag_automation && (
						<div className="space-y-2">
							<Label className="text-sm font-medium text-zinc-100">
								Default Hashtags
							</Label>
							<Textarea
								value={localSettings.default_hashtags}
								onChange={event_ =>
									onChange("default_hashtags", event_.target.value)
								}
								className="min-h-[80px] border-zinc-700 bg-zinc-800 text-zinc-100 placeholder-zinc-400"
								placeholder="#coding #development #opensource"
							/>
							<p className="text-xs text-zinc-400">
								Default hashtags to include in posts
							</p>
						</div>
					)}
				</CardContent>
			</Card>
		</>
	);
};
