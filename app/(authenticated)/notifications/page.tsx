"use client";

import { BellIcon } from "lucide-react";
import { useState } from "react";

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
			<div className="container mx-auto p-6">
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<div className="h-6 w-32">
							<Skeleton className="h-full w-full" />
						</div>
						<div className="h-6 w-24">
							<Skeleton className="h-full w-full" />
						</div>
					</div>
					<div className="space-y-3">
						{[1, 2, 3].map(index => (
							<Skeleton key={index} className="h-20 w-full" />
						))}
					</div>
				</div>
			</div>
		);
	}

	return (
		<>
			<div className="flex h-full flex-col">
				<div className="border-b border-notification-border/50 p-6">
					<div className="mb-4 flex items-center justify-between">
						<h1 className="flex items-center gap-2 text-lg font-medium text-gray-300">
							<BellIcon className="h-5 w-5" />
							Notifications
						</h1>
						{/* {unread_count && unread_count > 0 && ( */}
						<span className="rounded-full bg-notification-unread/10 px-2.5 py-0.5 text-xs font-medium text-notification-unread">
							{unread_count} unread
						</span>
						{/* )} */}
					</div>
					<p className="text-sm text-notification-text-secondary">
						You have {total_count} notification{total_count === 1 ? "" : "s"}
					</p>
				</div>

				<ScrollArea className="flex-1 p-2 lg:p-6">
					<div className="space-y-2">
						{Notifications?.map(notification => (
							<NotificationItem
								key={notification.id}
								notification={notification}
								onClick={() => setSelectedNotification(notification)}
							/>
						))}
					</div>
				</ScrollArea>

				{selectedNotification && (
					<NotificationModal
						notification={selectedNotification}
						onClose={() => setSelectedNotification(undefined)}
					/>
				)}
			</div>

			{/* <div className="flex h-full flex-col">
				<div className="border-b p-4">
					<div className="mb-4 flex items-center justify-between">
						<h1 className="flex items-center gap-2 text-xl font-semibold">
							<BellDotIcon />
							List Notification
						</h1>
					</div>
					<div className="flex w-full gap-2">
						<div className="text-sm text-gray-600">
							{total_count} Notification
						</div>
						<div className="text-sm text-gray-600">
							<span className="mr-2 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-600">
								{unread_count}
							</span>
							Notifications
						</div>
					</div>
				</div>

				<ScrollArea className="h-[calc(100vh-240px)] flex-1 pt-3.5">
					<div className="flex flex-col space-y-3">
						{Notifications?.map(notification => (
							<NotificationItem
								key={notification.id}
								notification={notification}
								onClick={() => setSelectedNotification(notification)}
							/>
						))}
					</div>
				</ScrollArea>

				{selectedNotification && (
					<NotificationModal
						notification={selectedNotification}
						onClose={() => setSelectedNotification(undefined)}
					/>
				)}
			</div> */}
		</>
	);
}
