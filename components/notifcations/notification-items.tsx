"use client";
import { formatDistanceToNow } from "date-fns";
import { BookMarked } from "lucide-react";

import { Notification } from "../../types";

interface NotificationItemProps {
	notification: Notification;
	onClick: () => void;
}

export default function NotificationItem({
	notification,
	onClick,
}: NotificationItemProps) {
	return (
		<div
			onClick={onClick}
			className="group relative flex cursor-pointer items-center justify-start gap-1 rounded-md bg-gray-50 p-1 hover:bg-gray-200"
		>
			<div
				className={`mt-2 h-1.5 w-1.5 rounded-full ${!notification.is_read && "flex bg-[red]"}`}
			/>

			<BookMarked className="mt-0.5 h-5 w-5 text-gray-400" />
			{/* <BookMarkedIcon /> */}

			<div className="w-full min-w-0 flex-1 md:gap-7">
				<p className="line-clamp-1 w-full text-sm text-gray-900">
					{notification.message}
				</p>
				<p className="mt-1 text-xs text-gray-500">
					{formatDistanceToNow(new Date(notification.created_at), {
						addSuffix: true,
					})}
				</p>
			</div>
		</div>
	);
}
