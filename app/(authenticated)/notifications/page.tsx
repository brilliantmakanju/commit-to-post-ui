"use client";

import { BellIcon } from "lucide-react";
import { useState } from "react";

import { EmptyState } from "@/components/notifcations/empty-state";
import NotificationItem from "@/components/notifcations/notification-items";
import NotificationModal from "@/components/notifcations/notification-modal";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import useRetrieveNotifications from "@/hooks/notifications/notifications";
import type { Notification } from "@/types";

export default function NotificationsPage() {
	const {
		total_count,
		unread_count,
		notifications: Notifications,
		isNotificationLoading,
	} = useRetrieveNotifications();
	const [selectedNotification, setSelectedNotification] =
		useState<Notification | null>();

	if (isNotificationLoading) {
		return (
			<div className="flex h-full flex-col">
				<div className="border-b border-border/5 p-6">
					<div className="mb-4 flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Skeleton className="h-5 w-5 rounded-full" />
							<Skeleton className="h-7 w-32" />
						</div>
						<Skeleton className="h-6 w-20" />
					</div>
					<Skeleton className="h-5 w-48" />
				</div>
				<div className="flex-1 p-6">
					<div className="space-y-3">
						{[1, 2, 3].map(index => (
							<div key={index} className="flex items-start gap-3">
								<Skeleton className="h-5 w-5 rounded-full" />
								<div className="flex-1 space-y-2">
									<Skeleton className="h-4 w-full" />
									<Skeleton className="h-4 w-[60%]" />
									<Skeleton className="h-3 w-24" />
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex h-full flex-col">
			<div className="border-b border-border/5 p-6">
				<div className="mb-4 flex items-center justify-between">
					<h1 className="flex items-center gap-2 text-lg font-medium text-primary-foreground/90">
						<BellIcon className="h-5 w-5" />
						Notifications
					</h1>
					{unread_count && unread_count > 0 && (
						<span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary-foreground/90">
							{unread_count} unread
						</span>
					)}
				</div>
				<p className="text-sm text-muted-foreground">
					You have {total_count} notification{total_count === 1 ? "" : "s"}
				</p>
			</div>

			<ScrollArea className="flex-1 p-2 lg:p-6">
				{Notifications && Notifications.length > 0 ? (
					<div className="space-y-2">
						{Notifications.map(notification => (
							<NotificationItem
								key={notification.id}
								notification={notification}
								onClick={() => setSelectedNotification(notification)}
							/>
						))}
					</div>
				) : (
					<EmptyState />
				)}
			</ScrollArea>

			{selectedNotification && (
				<NotificationModal
					notification={selectedNotification}
					onClose={() => setSelectedNotification(undefined)}
				/>
			)}
		</div>
	);
}
