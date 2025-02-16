"use client";

import { Bell } from "lucide-react";
import { useEffect, useState } from "react";

import NotificationCard from "@/components/notifcations/notification-card";
import NotificationModal from "@/components/notifcations/notification-modal";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
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
			{/* <Card>
				<CardHeader>
					<CardTitle className="flex items-center text-2xl font-bold">
					</CardTitle>
					<CardDescription>
					</CardDescription>
				</CardHeader>
				</CardContent>
				<CardContent>
			</Card> */}
			<Bell className="mr-2 h-6 w-6" /> Notifications You have{" "}
			<span className="font-semibold text-primary">{unread_count}</span> unread
			notifications
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
				{Notifications?.map(notification => (
					<NotificationCard
						key={notification.id}
						notification={notification}
						onClick={() => setSelectedNotification(notification)}
					/>
				))}
			</div>
			{selectedNotification && (
				<NotificationModal
					notification={selectedNotification}
					onClose={() => setSelectedNotification(undefined)}
				/>
			)}
		</>
	);
}
