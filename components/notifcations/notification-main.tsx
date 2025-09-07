/* eslint-disable import/no-unresolved */
"use client";

import { UUID } from "node:crypto";

import { useQueryClient } from "@tanstack/react-query";
import { Bell, Check } from "lucide-react";
import { useEffect } from "react";

import NotificationItem from "@/components/notifcations/notification-items";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import useRetrieveNotifications from "@/hooks/notifications/notifications";
import {
	readAllNotifications,
	readNotifications,
} from "@/server-actions/notifications/read-notification";
import useNotificationStore from "@/zustand/notification/use-notification-store";

// Mock functions - replace with your actual API calls
const handleDelete = (id: string) => {
	// console.log("Delete notification:", id);
	// Your API call here
};

// const handleClearAll = () => {
// 	console.log("Clear all notifications");
// 	// Your API call here
// };
export default function NotificationsPage() {
	const queryClient = useQueryClient();
	const {
		markAsRead,
		setNotifications,
		notifications: localNotifications,
		setMarking,
		markingIds,
		isBulkMarking,
		setBulkMarking,
		clearMarking,
	} = useNotificationStore();

	const {
		total_count,
		unread_count,
		isNotificationLoading,
		isNotificationFetching,
		notifications: serverNotifications,
	} = useRetrieveNotifications();

	// Hydrate Zustand only once when serverNotifications arrive
	useEffect(() => {
		if (
			!isNotificationFetching ||
			(!isNotificationLoading && serverNotifications.length > 0)
		) {
			setNotifications(serverNotifications);
		}
	}, [
		serverNotifications,
		setNotifications,
		isNotificationFetching,
		isNotificationLoading,
	]);

	const handleMarkAsRead = async (id: UUID) => {
		// Show loading for this item
		setMarking(id, true);
		// Optimistic update
		markAsRead(id);

		const response = await readNotifications({ id });
		if (response.success) {
			queryClient.invalidateQueries({
				queryKey: ["unread_notification_counts"],
			});
		}

		// Clear loading state for this item regardless of outcome
		setMarking(id, false);
	};

	const handleMarkAllAsRead = async () => {
		// Show bulk loading and per-item loading
		setBulkMarking(true);
		localNotifications.forEach(n => setMarking(n.id, true));

		// Optimistic update
		localNotifications.forEach(n => markAsRead(n.id));

		const response = await readAllNotifications();
		if (response.success) {
			queryClient.invalidateQueries({
				queryKey: ["unread_notification_counts"],
			});
		}

		// Clear bulk and per-item loading
		clearMarking();
	};

	if (isNotificationLoading && localNotifications.length === 0) {
		return (
			<div className="flex h-full flex-col bg-black">
				<div className="border-b border-zinc-800/30 p-6">
					<div className="mb-4 flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Skeleton className="h-5 w-5 rounded-full bg-zinc-800" />
							<Skeleton className="h-7 w-32 bg-zinc-800" />
						</div>
						<Skeleton className="h-6 w-20 bg-zinc-800" />
					</div>
					<Skeleton className="h-5 w-48 bg-zinc-800" />
				</div>
				<div className="flex-1 p-6">
					<div className="space-y-3">
						{[1, 2, 3].map(index => (
							<div key={index} className="flex items-start gap-3">
								<Skeleton className="h-8 w-8 rounded-full bg-zinc-800" />
								<div className="flex-1 space-y-2">
									<Skeleton className="h-4 w-full bg-zinc-800" />
									<Skeleton className="h-4 w-[60%] bg-zinc-800" />
									<Skeleton className="h-3 w-24 bg-zinc-800" />
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-black">
			<div className="container mx-auto w-full px-4 py-8">
				{/* Header */}
				<div className="mb-8 flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold text-white">Notifications</h1>
						<p className="mt-2 text-zinc-400">
							Stay updated with your latest activity
						</p>
					</div>
					<div className="flex items-center gap-3">
						<Badge
							// variant="secondary"
							className="border-zinc-700 bg-zinc-800 text-zinc-200"
						>
							{unread_count} unread
						</Badge>
					</div>
				</div>

				{/* Action Bar */}
				<div className="mb-6 flex items-center justify-between rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4">
					<div className="flex items-center gap-2">
						<span className="text-sm text-zinc-400">
							{total_count} total, {unread_count} unread
						</span>
					</div>
					<div className="flex items-center gap-2">
						<Button
							size="sm"
							variant="ghost"
							onClick={handleMarkAllAsRead}
							disabled={unread_count === 0}
							className="text-zinc-400 hover:bg-zinc-800 hover:text-white"
						>
							<Check className="mr-2 h-4 w-4" />
							Mark all read
						</Button>
						{/* <Button
								variant="ghost"
								size="sm"
								onClick={handleClearAll}
								className="text-zinc-400 hover:bg-zinc-800 hover:text-white"
							>
								<Trash2 className="mr-2 h-4 w-4" />
								Clear all
							</Button> */}
					</div>
				</div>

				{/* Notifications List */}
				<div className="space-y-3">
					{localNotifications.map(notification => (
						<NotificationItem
							key={notification.id}
							onDelete={handleDelete}
							notification={notification}
							onMarkAsRead={handleMarkAsRead}
							// Pass loading flag based on store states
							// @ts-ignore - extend props in the component to accept isLoading
							isLoading={isBulkMarking || markingIds.includes(notification.id)}
						/>
					))}
				</div>

				{/* Empty State */}
				{localNotifications.length === 0 && (
					<Card className="border-zinc-800/50 bg-zinc-900/30 py-16 text-center">
						<CardContent>
							<Bell className="mx-auto mb-4 h-12 w-12 text-zinc-600" />
							<h3 className="mb-2 text-lg font-medium text-white">
								No notifications yet
							</h3>
							<p className="text-zinc-400">
								We&apos;ll notify you when there&apos;s something important to
								share.
							</p>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
