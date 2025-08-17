import { Check, LinkIcon } from "lucide-react";
import React from "react";

interface WebhookSetupProps {
	webhookProgress: number;
	selectedRepoNames: string;
	webhookStatus: "idle" | "setting-up" | "success" | "error";
}

export const WebhookSetup: React.FC<WebhookSetupProps> = ({
	webhookStatus,
	webhookProgress,
	selectedRepoNames,
}) => {
	return (
		<div className="w-full space-y-6">
			{/* Heading */}
			<div className="flex items-center gap-2 border-b border-gray-200 pb-4">
				<LinkIcon className="h-5 w-5 text-arch-black" />
				<div>
					<h2 className="text-lg font-medium text-arch-black">
						Repositories Connection
					</h2>
					<p className="text-sm text-gray-600">
						Tracking commits for{" "}
						<span className="font-medium text-arch-black">
							{selectedRepoNames}
						</span>
					</p>
				</div>
			</div>

			{/* Progress State */}
			{webhookStatus === "setting-up" && (
				<div className="space-y-3 rounded border border-gray-200 p-4">
					<div className="flex justify-between text-xs">
						<span className="text-gray-600">Setting up...</span>
						<span className="font-medium text-arch-black">
							{webhookProgress}%
						</span>
					</div>
					<div className="h-1.5 w-full rounded-full bg-gray-200">
						<div
							className="h-1.5 rounded-full bg-arch-black transition-all duration-500"
							style={{ width: `${webhookProgress}%` }}
						/>
					</div>
				</div>
			)}

			{/* Success State */}
			{webhookStatus === "success" && (
				<div className="flex items-center gap-3 rounded border border-gray-200 p-4">
					<div className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300">
						<Check className="h-4 w-4 text-arch-black" />
					</div>
					<div>
						<h3 className="text-sm font-medium text-arch-black">
							Repositories Connected
						</h3>
						<p className="text-xs text-gray-600">
							Commit tracking is now active.
						</p>
					</div>
				</div>
			)}
		</div>
	);
};
