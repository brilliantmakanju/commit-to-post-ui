import { BellOff } from "lucide-react";

export function EmptyState() {
	return (
		<div className="flex h-[300px] flex-col items-center justify-center space-y-4 rounded-lg border border-zinc-800/30 bg-zinc-900/10 p-8 text-center">
			<div className="rounded-full border border-zinc-800 bg-zinc-900/50 p-3">
				<BellOff className="h-6 w-6 text-zinc-400" />
			</div>
			<div>
				<h3 className="text-lg font-medium text-white">No notifications</h3>
				<p className="mt-1 text-sm text-zinc-400">
					You don&lsquo;t have any notifications at the moment.
				</p>
			</div>
		</div>
	);
}
