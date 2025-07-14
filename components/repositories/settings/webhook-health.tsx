"use client";
/* eslint-disable import/no-unresolved */
import { Webhook } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

type WebhookStatus = "success" | "failed" | "inactive";

interface RepoWebhookHealthCardProps {
	webhookStatus: WebhookStatus;
	loading?: boolean;
	getWebhookStatusIcon: (status: WebhookStatus) => React.ReactNode;
}

const webhookStatusMap: Record<
	WebhookStatus,
	{ title: string; description: string; badgeColor: string }
> = {
	success: {
		title: "Healthy",
		description: "Webhook is receiving events successfully.",
		badgeColor:
			"border-green-500/50 bg-green-500/10 text-green-400 hover:bg-green-500/20",
	},
	failed: {
		title: "Failed",
		description: "There are critical issues with webhook delivery.",
		badgeColor:
			"border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20",
	},
	inactive: {
		title: "Inactive",
		description: "Webhook is not currently active or installed.",
		badgeColor:
			"border-yellow-500/50 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20",
	},
};

export const RepoWebhookHealthCard = ({
	webhookStatus,
	loading = false,
	getWebhookStatusIcon,
}: RepoWebhookHealthCardProps) => {
	const { title, description, badgeColor } = webhookStatusMap[webhookStatus];

	if (loading) {
		return (
			<Card className="border-zinc-800/50 bg-zinc-900/50 text-zinc-100 backdrop-blur-sm">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-lg">
						<Webhook className="h-5 w-5 text-zinc-400" />
						<Skeleton className="h-6 w-36 bg-zinc-800" />
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<Skeleton className="h-12 w-full rounded-md bg-zinc-800" />
					<Separator className="bg-zinc-800" />
					<Skeleton className="h-20 w-full rounded-md bg-zinc-800" />
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="border-zinc-800/50 bg-zinc-900/50 text-zinc-100 backdrop-blur-sm transition-all duration-200 hover:border-zinc-700/50">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-lg font-semibold text-zinc-100">
					<Webhook className="h-5 w-5 text-blue-400" />
					Webhook Health
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Webhook Status Block */}
				<div className="flex items-center justify-between rounded-lg border border-zinc-800/30 bg-zinc-800/20 p-4 transition-all duration-200 hover:bg-zinc-800/30">
					<div className="flex items-center space-x-3">
						{getWebhookStatusIcon(webhookStatus)}
						<div>
							<span className="text-sm font-medium text-zinc-100">
								Status: {title}
							</span>
							<p className="mt-1 text-xs text-zinc-400">{description}</p>
						</div>
					</div>
					<Badge
						variant="outline"
						className={`${badgeColor} transition-all duration-200`}
					>
						{title}
					</Badge>
				</div>

				<Separator className="bg-zinc-800/50" />

				{/* Future Features Block */}
				<div className="space-y-3">
					<Label className="text-sm font-medium text-zinc-300">
						Coming Soon
					</Label>
					<div className="space-y-2 text-sm text-zinc-400">
						<div className="flex items-center justify-between rounded-md border border-zinc-800/30 bg-zinc-800/10 p-3 transition-all duration-200 hover:bg-zinc-800/20">
							<span>Reinstall Webhook</span>
							<Badge
								variant="secondary"
								className="border-zinc-700 bg-zinc-800/50 text-xs text-zinc-400"
							>
								Coming Soon
							</Badge>
						</div>
						<div className="flex items-center justify-between rounded-md border border-zinc-800/30 bg-zinc-800/10 p-3 transition-all duration-200 hover:bg-zinc-800/20">
							<span>Enable / Disable Webhook</span>
							<Badge
								variant="secondary"
								className="border-zinc-700 bg-zinc-800/50 text-xs text-zinc-400"
							>
								Coming Soon
							</Badge>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};
