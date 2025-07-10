"use client";

import { Loader2 } from "lucide-react";

// eslint-disable-next-line import/no-unresolved
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface OAuthLoadingModalProps {
	isOpen: boolean;
	platform: "twitter" | "linkedin";
}

export function OAuthLoadingModal({
	isOpen,
	platform,
}: OAuthLoadingModalProps) {
	const platformName = platform === "twitter" ? "Twitter" : "LinkedIn";
	const platformColor =
		platform === "twitter" ? "text-blue-500" : "text-blue-600";

	return (
		<Dialog open={isOpen} onOpenChange={() => {}}>
			<DialogContent className="sm:max-w-md">
				<div className="flex flex-col items-center justify-center space-y-4 py-8">
					<div className="relative">
						<Loader2 className={`h-8 w-8 animate-spin ${platformColor}`} />
					</div>
					<div className="space-y-2 text-center">
						<h3 className="text-lg font-semibold">Connecting {platformName}</h3>
						<p className="text-sm text-gray-600">
							Please complete the authorization in the popup window...
						</p>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
