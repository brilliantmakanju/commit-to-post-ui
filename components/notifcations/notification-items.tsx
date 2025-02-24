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
			className="group relative flex cursor-pointer items-start gap-3 rounded-lg border border-transparent bg-notification-bg p-4 transition-all hover:border-notification-border hover:bg-notification-hover"
		>
			<div className="flex items-center gap-3">
				{!notification.is_read && (
					<div className="h-2 w-2 rounded-full bg-notification-unread" />
				)}
				<BookMarked className="h-5 w-5 text-notification-text-secondary" />
			</div>

			<div className="flex-1 space-y-1">
				<p className="line-clamp-2 text-sm text-notification-text-primary">
					{notification.message}
				</p>
				<p className="text-xs text-notification-text-secondary">
					{formatDistanceToNow(new Date(notification.created_at), {
						addSuffix: true,
					})}
				</p>
			</div>
		</div>
	);
}
