"use client";

/* eslint-disable import/no-unresolved */
import { Webhook } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

type WebhookStatus = "success" | "error" | "inactive";

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
		badgeColor: "border-green-600 bg-green-100/10 text-green-400",
	},
	error: {
		title: "Issues Detected",
		description: "There are issues with webhook delivery.",
		badgeColor: "border-red-600 bg-red-100/10 text-red-400",
	},
	inactive: {
		title: "Inactive",
		description: "Webhook is not currently active or installed.",
		badgeColor: "border-yellow-600 bg-yellow-100/10 text-yellow-400",
	},
};

export const RepoWebhookHealthCard = ({
	webhookStatus,
	loading = true,
	getWebhookStatusIcon,
}: RepoWebhookHealthCardProps) => {
	const { title, description, badgeColor } = webhookStatusMap[webhookStatus];

	if (loading) {
		return (
			<Card className="border-zinc-800 bg-zinc-900 text-zinc-100">
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
		<Card className="border-zinc-800 bg-zinc-900 text-zinc-100">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-lg font-semibold text-zinc-100">
					<Webhook className="h-5 w-5 text-blue-400" />
					Webhook Health
				</CardTitle>
			</CardHeader>

			<CardContent className="space-y-4">
				{/* Webhook Status Block */}
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-3">
						{getWebhookStatusIcon(webhookStatus)}
						<div>
							<span className="text-sm font-medium text-zinc-100">
								Status: {title}
							</span>
							<p className="mt-1 text-xs text-zinc-400">{description}</p>
						</div>
					</div>

					<Badge variant="outline" className={badgeColor}>
						{title}
					</Badge>
				</div>

				<Separator className="bg-zinc-800" />

				{/* Future Features Block */}
				<div className="space-y-3">
					<Label className="text-sm font-medium text-zinc-300">
						Coming Soon
					</Label>
					<div className="space-y-2 text-sm text-zinc-400">
						<div className="flex items-center justify-between">
							<span>Reinstall Webhook</span>
							<Badge variant="secondary" className="text-xs">
								Coming Soon
							</Badge>
						</div>
						<div className="flex items-center justify-between">
							<span>Enable / Disable Webhook</span>
							<Badge variant="secondary" className="text-xs">
								Coming Soon
							</Badge>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};
