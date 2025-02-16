import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Calendar, X } from "lucide-react";
import { useCallback, useEffect } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
		const reponse = await readNotifications({ id: notification.id });

		if (reponse.success) {
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
			queryClient.invalidateQueries({
				queryKey: ["unread_notification_counts"],
			});
		}
	};

	useEffect(() => {
		readNotification();
	}, []);

	return (
		<Dialog open={true} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{notification.title}</DialogTitle>
					<Button
						variant="ghost"
						size="icon"
						onClick={onClose}
						className="absolute right-4 top-4"
					>
						<X className="h-4 w-4" />
					</Button>
				</DialogHeader>
				<div className="mt-2">
					<p className="text-sm text-muted-foreground">
						{notification.message}
					</p>
				</div>
				<DialogFooter className="mt-4 flex items-center justify-between">
					<div className="flex items-center text-sm text-muted-foreground">
						<Avatar className="mr-2 h-8 w-8">
							<AvatarFallback>
								{notification.triggered_by.charAt(0)}
							</AvatarFallback>
						</Avatar>
						{notification.triggered_by}
					</div>
					<div className="flex items-center text-sm text-muted-foreground">
						<Calendar className="mr-1 h-4 w-4" />
						{formatDistanceToNow(new Date(notification.created_at), {
							addSuffix: true,
						})}
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
