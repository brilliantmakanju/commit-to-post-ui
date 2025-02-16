import { formatDistanceToNow } from "date-fns";
import { Calendar } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { Notification } from "@/types";

interface NotificationCardProps {
	notification: Notification;
	onClick: () => void;
}

export default function NotificationCard({
	notification,
	onClick,
}: NotificationCardProps) {
	console.log(notification, "Notifications");

	return (
		<Card
			className="cursor-pointer transition-shadow hover:shadow-md"
			onClick={onClick}
		>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium">
					{notification.title}
				</CardTitle>
				<Badge variant={notification.is_read_by ? "secondary" : "default"}>
					{notification.is_read_by ? "Read" : "Unread"}
				</Badge>
			</CardHeader>
			<CardContent>
				<p className="line-clamp-2 text-sm text-muted-foreground">
					{notification.message}
				</p>
			</CardContent>
			<CardFooter className="flex flex-col-reverse items-start justify-center gap-3">
				<div className="flex items-center text-sm text-muted-foreground">
					{/* <Avatar className="mr-2 h-8 w-8">
						<AvatarFallback>
							{notification.triggered_by.charAt(0)}
						</AvatarFallback>
					</Avatar> */}
					{notification.triggered_by === "None"
						? "System"
						: notification.triggered_by}
				</div>
				<div className="flex items-center text-sm text-muted-foreground">
					<Calendar className="mr-1 h-4 w-4" />
					{formatDistanceToNow(new Date(notification.created_at), {
						addSuffix: true,
					})}
				</div>
			</CardFooter>
		</Card>
	);
}
