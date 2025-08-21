"use client";

import { UUID } from "node:crypto";

import { formatDistanceToNow, parseISO } from "date-fns";
import { Check, Loader2 } from "lucide-react";
import { useState } from "react";

import type { Notification } from "@/types";

import { Button } from "../ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";

interface NotificationItemProps {
	notification: Notification;
	onDelete?: (id: UUID) => void;
	onMarkAsRead?: (id: UUID) => void;
	isLoading?: boolean;
}

const formatDate = (date: string) => {
	const d = parseISO(date);
	return formatDistanceToNow(d, { addSuffix: true });
};

export default function NotificationItem({
	onDelete,
	notification,
	onMarkAsRead,
	isLoading = false,
}: NotificationItemProps) {
	const [expanded, setExpanded] = useState(false);

	const toggleExpanded = () => setExpanded(previous => !previous);

	return (
		<Card
			key={notification.id}
			className={`group relative border transition-all duration-200 ${
				notification.is_read
					? "border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-900/50"
					: "border-zinc-700/50 bg-zinc-900/60 hover:bg-zinc-900/80"
			}`}
		>
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between gap-4">
					<div className="flex flex-1 items-start gap-3">
						{!notification.is_read && (
							<div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-white"></div>
						)}

						<div className="min-w-0 flex-1">
							<CardTitle className="text-base font-medium text-white">
								{notification.title}
							</CardTitle>

							<CardDescription
								className={`mt-1 whitespace-pre-wrap break-words text-sm text-zinc-400 ${
									expanded ? "" : "line-clamp-2"
								}`}
								style={{
									overflowWrap: "anywhere", // <-- critical for URLs/long tokens
									wordBreak: "break-word", // extra safety
									maxWidth: "100%", // makes sure it wraps in flex containers
								}}
							>
								{notification.message}
							</CardDescription>

							{/* Toggle button */}
							{notification.message.length > 100 && (
								<button
									onClick={toggleExpanded}
									className="mt-1 text-xs font-medium text-blue-400 hover:underline"
								>
									{expanded ? "Show less" : "Show more"}
								</button>
							)}

							<span className="mt-2 block text-xs text-zinc-500">
								{formatDate(notification.created_at)}
							</span>
						</div>
					</div>

					{/* Action buttons */}
					<div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
						{!notification.is_read && onMarkAsRead && (
							<Button
								variant="ghost"
								size="sm"
								onClick={() => onMarkAsRead(notification.id)}
								disabled={isLoading}
								className="h-7 w-7 p-0 text-zinc-400 hover:bg-zinc-800 hover:text-white"
							>
								{isLoading ? (
									<Loader2 className="h-3 w-3 animate-spin" />
								) : (
									<Check className="h-3 w-3" />
								)}
							</Button>
						)}
						{/* {onDelete && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => onDelete(notification.id)}
							className="h-7 w-7 p-0 text-zinc-400 hover:bg-zinc-800 hover:text-white"
						>
							<X className="h-3 w-3" />
						</Button>
						)} */}
					</div>
				</div>
				{/* Per-item loading overlay (subtle) */}
				{isLoading && (
					<div className="pointer-events-none absolute inset-0 rounded-lg bg-black/20" />
				)}
			</CardHeader>
		</Card>
	);
}
