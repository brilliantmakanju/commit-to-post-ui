"use client";

import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Calendar, X } from "lucide-react";
import { useCallback, useEffect } from "react";

import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { readNotifications } from "@/server-actions/notifications/read-notification";
import type { Notification } from "@/types";

interface NotificationModalProps {
	notification: Notification;
	onClose: () => void;
}

export default function NotificationModal({
	notification,
	onClose,
}: NotificationModalProps) {
	const queryClient = useQueryClient();

	const readNotification = useCallback(async () => {
		const response = await readNotifications({ id: notification.id });

		if (response.success) {
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
			queryClient.invalidateQueries({
				queryKey: ["unread_notification_counts"],
			});
		}
	}, [notification.id, queryClient]);

	useEffect(() => {
		readNotification();
	}, [readNotification]);

	return (
		<Dialog open={true} onOpenChange={onClose}>
			<DialogContent className="border border-zinc-800 bg-black p-0 text-white sm:max-w-md">
				<DialogHeader className="p-4 sm:p-6">
					<div className="flex items-start justify-between">
						<DialogTitle className="text-white">
							{notification.title}
						</DialogTitle>
					</div>
				</DialogHeader>
				<div className="px-4 sm:px-6">
					<p className="text-sm text-zinc-300">{notification.message}</p>
				</div>
				<DialogFooter className="mt-6 flex items-center justify-between border-t border-zinc-800/50 p-4 sm:p-6">
					<div className="text-sm text-zinc-500">
						{notification.triggered_by_name}
					</div>
					<div className="flex items-center gap-1.5 text-sm text-zinc-500">
						<Calendar className="h-4 w-4" />
						{formatDistanceToNow(new Date(notification.created_at), {
							addSuffix: true,
						})}
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
