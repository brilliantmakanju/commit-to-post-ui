"use client";

/* eslint-disable import/no-unresolved */
import { UUID } from "node:crypto";

import { Users } from "lucide-react";
import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import { WebhookModal } from "./webhook-modal";

// Types
type Platform = "twitter" | "linkedin" | "slack" | "discord" | string;

interface SocialConnection {
	connected: boolean;
	connected_by: string | null;
	connected_at: string | null;
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
	getSocialIcon: (platform: Platform, connected: boolean) => React.ReactNode;
	getSocialLabel: (platform: Platform) => string;
}

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

	// Handle modal logic only for Slack/Discord
	const handleChannelToggle = (platform: Platform) => {
		if (platform === "slack" || platform === "discord") {
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
				<WebhookModal
					repo_id={repo_id}
					isOpen={!!platformModal}
					onClose={() => setPlatformModal(undefined)}
					platform={platformModal as "slack" | "discord"}
					existingConnection={socialConnections[platformModal]}
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
					{/* Social Connections */}
					<div className="space-y-4">
						<Label className="text-sm font-medium text-zinc-300">
							Connected Channels
						</Label>

						{Object.entries(socialConnections).map(([platform, connection]) => {
							const isConnected = connection?.connected || false;

							return (
								<div
									key={platform}
									className="flex items-center justify-between border-b border-zinc-800 py-2"
								>
									<div className="flex items-center space-x-3">
										{getSocialIcon(platform, isConnected)}
										<div>
											<span className="text-sm font-medium text-zinc-100">
												{getSocialLabel(platform)}
											</span>
											<p className="text-xs text-zinc-400">
												{isConnected
													? `Connected by ${connection.connected_by || "Unknown"}`
													: "Not connected"}
											</p>
										</div>
									</div>

									<Switch
										checked={isConnected}
										onClick={() => handleChannelToggle(platform)}
									/>
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
