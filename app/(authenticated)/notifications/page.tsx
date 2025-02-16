"use client";

import { BellDotIcon } from "lucide-react";
import { useState } from "react";

import NotificationItem from "@/components/notifcations/notification-items";
import NotificationModal from "@/components/notifcations/notification-modal";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
			<div className="container mx-auto px-4 py-8">
				<Card>
					<CardHeader>
						<CardTitle>Notifications</CardTitle>
						<CardDescription>Loading your notifications...</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<Skeleton className="h-12 w-full" />
							<Skeleton className="h-12 w-full" />
							<Skeleton className="h-12 w-full" />
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<>
			<div className="flex h-full flex-col">
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
			</div>
		</>
	);
}
