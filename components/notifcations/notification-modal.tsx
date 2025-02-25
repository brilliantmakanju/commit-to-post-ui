"use client";

import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Calendar } from "lucide-react";
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
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="text-primary-foreground/90">
						{notification.title}
					</DialogTitle>
				</DialogHeader>
				<div className="mt-2">
					<p className="text-sm text-muted-foreground">
						{notification.message}
					</p>
				</div>
				<DialogFooter className="mt-6 flex items-center justify-between border-t border-border/5 pt-4">
					<div className="text-sm text-muted-foreground">
						{notification.triggered_by}
					</div>
					<div className="flex items-center gap-1.5 text-sm text-muted-foreground">
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
