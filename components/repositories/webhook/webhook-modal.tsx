"use client";

import { Copy, ExternalLink, Trash2 } from "lucide-react";
import { useState } from "react";

// eslint-disable-next-line import/no-unresolved
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	// eslint-disable-next-line import/no-unresolved
} from "@/components/ui/dialog";
// eslint-disable-next-line import/no-unresolved
import { Input } from "@/components/ui/input";
// eslint-disable-next-line import/no-unresolved
import { Label } from "@/components/ui/label";
// eslint-disable-next-line import/no-unresolved
import { useToast } from "@/hooks/use-toast";

interface WebhookModalProps {
	isOpen: boolean;
	onClose: () => void;
	platform: "slack" | "discord";
	currentWebhook?: string;
	onSave: (webhook: string) => void;
	onDisconnect?: () => void;
}

export function WebhookModal({
	isOpen,
	onClose,
	platform,
	currentWebhook,
	onSave,
	onDisconnect,
}: WebhookModalProps) {
	const [webhookUrl, setWebhookUrl] = useState(currentWebhook || "");
	const [isLoading, setIsLoading] = useState(false);
	const { toast } = useToast();

	const handleSave = async () => {
		if (!webhookUrl.trim()) {
			toast({
				title: "Error",
				description: "Please enter a webhook URL",
				variant: "destructive",
			});
			return;
		}

		// Basic URL validation
		try {
			new URL(webhookUrl);
		} catch {
			toast({
				title: "Error",
				description: "Please enter a valid webhook URL",
				variant: "destructive",
			});
			return;
		}

		setIsLoading(true);
		try {
			await onSave(webhookUrl);
			toast({
				title: "Success",
				description: `${platform === "slack" ? "Slack" : "Discord"} webhook connected successfully`,
			});
			onClose();
		} catch {
			toast({
				title: "Error",
				description: "Failed to save webhook. Please try again.",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleDisconnect = async () => {
		if (!onDisconnect) return;

		setIsLoading(true);
		try {
			await onDisconnect();
			toast({
				title: "Success",
				description: `${platform === "slack" ? "Slack" : "Discord"} webhook disconnected`,
			});
			onClose();
		} catch {
			toast({
				title: "Error",
				description: "Failed to disconnect webhook. Please try again.",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const copyWebhook = () => {
		if (currentWebhook) {
			navigator.clipboard.writeText(currentWebhook);
			toast({
				title: "Copied",
				description: "Webhook URL copied to clipboard",
			});
		}
	};

	const platformName = platform === "slack" ? "Slack" : "Discord";
	const platformColor =
		platform === "slack" ? "text-purple-600" : "text-indigo-600";

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						{currentWebhook
							? `Manage ${platformName} Webhook`
							: `Connect ${platformName} Webhook`}
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-4">
					{currentWebhook ? (
						<div className="space-y-4">
							<div>
								<Label htmlFor="current-webhook">Current Webhook URL</Label>
								<div className="mt-1 flex items-center gap-2">
									<Input
										id="current-webhook"
										value={currentWebhook}
										readOnly
										className="font-mono text-sm"
									/>
									<Button
										variant="outline"
										size="sm"
										onClick={copyWebhook}
										className="shrink-0 bg-transparent"
									>
										<Copy className="h-4 w-4" />
									</Button>
								</div>
							</div>

							<div>
								<Label htmlFor="new-webhook">
									Replace with New Webhook URL
								</Label>
								<Input
									id="new-webhook"
									placeholder={`Enter new ${platformName} webhook URL...`}
									value={webhookUrl}
									onChange={event_ => setWebhookUrl(event_.target.value)}
									className="mt-1"
								/>
							</div>
						</div>
					) : (
						<div className="space-y-4">
							<div className="text-sm text-gray-600">
								<p className="mb-2">
									To connect {platformName}, you&rsquo;ll need to create a
									webhook URL:
								</p>
								<ol className="list-inside list-decimal space-y-1 text-xs">
									<li>Go to your {platformName} workspace settings</li>
									<li>Create a new webhook integration</li>
									<li>Copy the webhook URL and paste it below</li>
								</ol>
								<a
									href={
										platform === "slack"
											? "https://api.slack.com/messaging/webhooks"
											: "https://support.discord.com/hc/en-us/articles/228383668"
									}
									target="_blank"
									rel="noopener noreferrer"
									className={`mt-2 inline-flex items-center gap-1 text-xs ${platformColor} hover:underline`}
								>
									View {platformName} webhook docs
									<ExternalLink className="h-3 w-3" />
								</a>
							</div>

							<div>
								<Label htmlFor="webhook-url">Webhook URL</Label>
								<Input
									id="webhook-url"
									placeholder={`https://hooks.${platform}.com/services/...`}
									value={webhookUrl}
									onChange={event_ => setWebhookUrl(event_.target.value)}
									className="mt-1 font-mono text-sm"
								/>
							</div>
						</div>
					)}
				</div>

				<DialogFooter className="flex-col gap-2 sm:flex-row">
					{currentWebhook && (
						<Button
							variant="destructive"
							onClick={handleDisconnect}
							disabled={isLoading}
							className="w-full sm:w-auto"
						>
							<Trash2 className="mr-2 h-4 w-4" />
							Disconnect
						</Button>
					)}
					<div className="flex w-full gap-2 sm:w-auto">
						<Button
							variant="outline"
							onClick={onClose}
							disabled={isLoading}
							className="flex-1 bg-transparent sm:flex-none"
						>
							Cancel
						</Button>
						<Button
							onClick={handleSave}
							disabled={isLoading || !webhookUrl.trim()}
							className="flex-1 sm:flex-none"
						>
							{isLoading ? "Saving..." : currentWebhook ? "Update" : "Connect"}
						</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
