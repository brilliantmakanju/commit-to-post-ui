"use client";
import { Check } from "lucide-react";
import { useState } from "react";

// eslint-disable-next-line import/no-unresolved
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// eslint-disable-next-line import/no-unresolved
import { ScrollArea } from "@/components/ui/scroll-area";
// eslint-disable-next-line import/no-unresolved
import useRetrieveNotifications from "@/hooks/notifications/notifications";

import { EmptyState } from "../notifcations/empty-state";

type Notification = {
	id: number;
	message: string;
	createdAt: string;
	read: boolean;
	creator: {
		name: string;
		avatar: string;
		initials: string;
	};
};

export function NotificationsList({ isPaid }: { isPaid: boolean }) {
	const { total_count, unread_count, notifications, isNotificationLoading } =
		useRetrieveNotifications();
	const [selectedNotification, setSelectedNotification] =
		useState<Notification | null>();

	if (isNotificationLoading) {
		return <NotificationsSkeleton />;
	}

	if (notifications?.length === 0) {
		return <EmptyState />;
	}

	return (
		<ScrollArea className="h-full">
			<div className="space-y-4 p-4">
				{notifications?.map(notification => (
					<div
						key={notification.id}
						className={`flex items-start gap-4 rounded-lg p-4 transition-colors ${
							notification.read ? "bg-zinc-800/50" : "bg-zinc-700/50"
						}`}
					>
						<Avatar className="h-8 w-8">
							<AvatarImage src={"/System_icon.png"} />
							<AvatarFallback>{"PP"}</AvatarFallback>
						</Avatar>
						<div className="flex-1 space-y-1">
							<p className="text-sm text-zinc-200">{notification.message}</p>
							<div className="flex items-center gap-4">
								<p className="text-xs text-zinc-500">
									{new Date(notification.createdAt).toLocaleDateString(
										"en-US",
										{
											hour: "numeric",
											minute: "numeric",
											day: "numeric",
											month: "short",
										},
									)}
								</p>
								<p className="text-xs text-zinc-500">
									By {notification.creator.name}
								</p>
								{notification.read && (
									<span className="flex items-center text-xs text-zinc-500">
										<Check className="mr-1 h-3 w-3" /> Read
									</span>
								)}
							</div>
						</div>
					</div>
				))}
			</div>
		</ScrollArea>
	);
}

export function NotificationsSkeleton() {
	return (
		<div className="space-y-4 p-4">
			{[1, 2, 3, 4, 5].map(index => (
				<div
					key={index}
					className="flex animate-pulse items-start gap-4 rounded-lg bg-zinc-700/50 p-4"
				>
					<div className="h-8 w-8 rounded-full bg-zinc-600" />
					<div className="flex-1 space-y-2">
						<div className="h-4 w-3/4 rounded bg-zinc-600" />
						<div className="h-3 w-1/4 rounded bg-zinc-600" />
					</div>
				</div>
			))}
		</div>
	);
}
