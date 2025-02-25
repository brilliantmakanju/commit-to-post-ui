import { BellOff } from "lucide-react";

export function EmptyState() {
	return (
		<div className="flex h-[450px] flex-col items-center justify-center space-y-4 text-center">
			<div className="rounded-full bg-muted/10 p-4">
				<BellOff className="h-6 w-6 text-muted-foreground/80" />
			</div>
			<div className="space-y-2">
				<h3 className="text-lg font-medium text-muted-foreground/90">
					No notifications
				</h3>
				<p className="text-sm text-muted-foreground/60">
					You&apos;re all caught up! We&apos;ll notify you when there&apos;s
					something new.
				</p>
			</div>
		</div>
	);
}
