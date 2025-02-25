"use client";

import { formatDistanceToNow } from "date-fns";
import { BookMarked } from "lucide-react";

import type { Notification } from "@/types";

interface NotificationItemProps {
	notification: Notification;
	onClick: () => void;
}

export default function NotificationItem({
	notification,
	onClick,
}: NotificationItemProps) {
	return (
		<div
			onClick={onClick}
			className="group relative flex cursor-pointer items-start gap-3 rounded-lg border border-border/5 bg-muted/5 p-4 transition-all hover:bg-muted/10"
		>
			<div className="flex items-center gap-3">
				{!notification.is_read && (
					<div className="h-2 w-2 rounded-full bg-muted" />
				)}
				<BookMarked className="h-5 w-5 text-muted-foreground" />
			</div>

			<div className="flex-1 space-y-1">
				<p className="line-clamp-2 text-sm text-primary-foreground/90">
					{notification.message}
				</p>
				<p className="text-xs text-muted-foreground">
					{formatDistanceToNow(new Date(notification.created_at), {
						addSuffix: true,
					})}
				</p>
			</div>
		</div>
	);
}
