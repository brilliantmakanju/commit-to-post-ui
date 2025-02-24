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
			className="bg-notification-bg hover:border-notification-border hover:bg-notification-hover group relative flex cursor-pointer items-start gap-3 rounded-lg border border-transparent p-4 transition-all"
		>
			<div className="flex items-center gap-3">
				{!notification.is_read && (
					<div className="bg-notification-unread h-2 w-2 rounded-full" />
				)}
				<BookMarked className="text-notification-text-secondary h-5 w-5" />
			</div>

			<div className="flex-1 space-y-1">
				<p className="text-notification-text-primary line-clamp-2 text-sm">
					{notification.message}
				</p>
				<p className="text-notification-text-secondary text-xs">
					{formatDistanceToNow(new Date(notification.created_at), {
						addSuffix: true,
					})}
				</p>
			</div>
		</div>
	);
}
