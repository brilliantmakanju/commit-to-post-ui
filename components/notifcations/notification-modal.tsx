"use client";

import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Calendar } from "lucide-react";
import { useEffect } from "react";

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

	const readNotification = async () => {
		const response = await readNotifications({ id: notification.id });

		if (response.success) {
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
			queryClient.invalidateQueries({
				queryKey: ["unread_notification_counts"],
			});
		}
	};

	useEffect(() => {
		readNotification();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<Dialog open={true} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="text-notification-text-primary">
						{notification.title}
					</DialogTitle>
				</DialogHeader>
				<div className="mt-2">
					<p className="text-sm text-notification-text-secondary">
						{notification.message}
					</p>
				</div>
				<DialogFooter className="mt-6 flex items-center justify-between border-t border-notification-border/50 pt-4">
					<div className="text-sm text-notification-text-secondary">
						{notification.triggered_by}
					</div>
					<div className="flex items-center gap-1.5 text-sm text-notification-text-secondary">
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
