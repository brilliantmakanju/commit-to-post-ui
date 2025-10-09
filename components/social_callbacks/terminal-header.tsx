import { Clock, Zap } from "lucide-react";

// eslint-disable-next-line import/no-unresolved
import { Badge } from "@/components/ui/badge";

interface TerminalHeaderProps {
	provider: string;
	waitingForBackend: boolean;
	connectionState: string;
}

export function TerminalHeader({
	provider,
	waitingForBackend,
	connectionState,
}: TerminalHeaderProps) {
	return (
		<div className="flex items-center gap-2 border-b border-gray-700 px-4 py-3 dark:border-gray-800">
			<div className="flex gap-2">
				<div className="h-3 w-3 rounded-full bg-red-500" />
				<div className="h-3 w-3 rounded-full bg-yellow-500" />
				<div className="h-3 w-3 rounded-full bg-green-500" />
			</div>
			<div className="flex-1 text-center">
				<span className="font-mono text-sm text-gray-400">
					push-to-draft@{provider}:~/oauth-integration
				</span>
			</div>
			<div className="flex items-center gap-2">
				{waitingForBackend && (
					<Badge
						variant="secondary"
						className="bg-yellow-900 text-xs text-yellow-200"
					>
						<Clock className="mr-1 h-3 w-3" />
						Syncing
					</Badge>
				)}
				{connectionState === "success" && (
					<Badge
						variant="secondary"
						className="bg-green-900 text-xs text-green-200"
					>
						<Zap className="mr-1 h-3 w-3" />
						Connected
					</Badge>
				)}
			</div>
		</div>
	);
}
