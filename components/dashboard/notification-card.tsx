"use client";

import { formatDistanceToNow, parseISO } from "date-fns";
import { Bell, Check, Clock } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import useRetrieveRecentNotifications from "@/hooks/notifications/recent";

const formatDate = (date: string) => {
	const d = parseISO(date);
	return formatDistanceToNow(d, { addSuffix: true });
};

export function NotificationsList({ isPaid }: { isPaid: boolean }) {
	const { notifications, isNotificationLoading } =
		useRetrieveRecentNotifications();

	if (isNotificationLoading) {
		return <NotificationsSkeleton />;
	}

	if (notifications && notifications.length === 0) {
		return (
			<div className="flex h-[300px] flex-col items-center justify-center space-y-4 text-center">
				<div className="rounded-full border border-[#232323] bg-[#1A1A1A] p-4">
					<Bell className="h-6 w-6 text-zinc-500" />
				</div>
				<div className="flex flex-col items-center justify-center space-y-2 text-center">
					<h3 className="text-lg font-medium text-white">
						No notifications yet
					</h3>
					<p className="w-[70%] text-center text-sm text-zinc-500">
						You don&#39;t have any notifications at the moment. We&lsquo;ll
						notify you when there&lsquo;s activity.
					</p>
				</div>
			</div>
		);
	}

	return (
		<ScrollArea className="h-[400px]">
			<div className="space-y-3 p-4">
				{notifications?.map(notification => (
					<div
						key={notification.id}
						className={`rounded-lg border ${
							notification.read
								? "border-[#232323] bg-[#1A1A1A]"
								: "border-[#2A2A2A] bg-[#232323]"
						} p-4 transition-all hover:shadow-sm`}
					>
						<div className="flex gap-3">
							<Avatar className="h-8 w-8 border border-[#2A2A2A]">
								<AvatarImage src={"/System_icon.jpg"} />
								<AvatarFallback className="bg-[#1A1A1A] text-zinc-300">
									PP
								</AvatarFallback>
							</Avatar>
							<div className="flex-1 space-y-1">
								<h4 className="text-sm font-medium text-white">
									{notification.title}
								</h4>
								<p className="text-sm text-zinc-400">{notification.message}</p>
								<div className="mt-2 flex flex-wrap items-center gap-3">
									<span className="flex items-center gap-1 text-xs text-zinc-500">
										<Clock className="h-3 w-3 text-zinc-500" />
										{formatDate(notification.created_at)}
									</span>
									<span className="text-xs text-zinc-500">By System</span>
									{notification.is_read && (
										<span className="flex items-center text-xs text-zinc-500">
											<Check className="mr-1 h-3 w-3 text-emerald-500" /> Read
										</span>
									)}
								</div>
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
		<div className="space-y-3 p-4">
			{[1, 2, 3].map(index => (
				<div
					key={index}
					className="rounded-lg border border-[#232323] bg-[#1A1A1A] p-4"
				>
					<div className="flex gap-3">
						<div className="h-8 w-8 rounded-full bg-[#232323]" />
						<div className="flex-1 space-y-2">
							<div className="h-4 w-3/4 rounded bg-[#232323]" />
							<div className="h-3 w-full rounded bg-[#232323]" />
							<div className="h-3 w-1/4 rounded bg-[#232323]" />
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
