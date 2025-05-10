"use client";

import { formatDistanceToNow, parseISO } from "date-fns";
import { Check } from "lucide-react";

import type { Notification } from "@/types";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface NotificationItemProps {
	notification: Notification;
	onClick: () => void;
}

const formatDate = (date: string) => {
	const d = parseISO(date);
	return formatDistanceToNow(d, { addSuffix: true });
};

export default function NotificationItem({
	notification,
	onClick,
}: NotificationItemProps) {
	return (
		<div
			onClick={onClick}
			key={notification.id}
			className={`flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition-all hover:border-zinc-700 ${
				notification.is_read
					? "border-zinc-800/50 bg-zinc-900/20"
					: "border-zinc-700/50 bg-zinc-800/20"
			}`}
		>
			<Avatar className="h-8 w-8 border border-zinc-800">
				<AvatarImage src={"/System_icon.jpg"} />
				<AvatarFallback className="bg-zinc-900 text-zinc-300">
					PP
				</AvatarFallback>
			</Avatar>
			<div className="flex-1 space-y-1">
				<h4
					className={`text-sm font-medium ${notification.is_read ? "text-zinc-300" : "text-white"}`}
				>
					{notification.title}
				</h4>
				<p className="text-sm text-zinc-400">{notification.message}</p>
				<div className="flex flex-wrap items-center gap-3 pt-1">
					<p className="text-xs text-zinc-500">
						{formatDate(notification.created_at)}
					</p>
					<p className="text-xs text-zinc-500">By System</p>
					{notification.is_read && (
						<span className="flex items-center text-xs text-zinc-500">
							<Check className="mr-1 h-3 w-3" /> Read
						</span>
					)}
				</div>
			</div>
		</div>
	);
}
