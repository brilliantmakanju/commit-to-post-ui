"use client";

import { Wrench, X } from "lucide-react";
import { useState } from "react";

// eslint-disable-next-line import/no-unresolved
import { Button } from "@/components/ui/button";

export function MaintenanceBanner() {
	const [isVisible, setIsVisible] = useState(true);

	if (!isVisible) return;

	return (
		<div className="fixed left-0 right-0 top-0 z-50 border-b border-gray-200 bg-[#F5F5F5]">
			<div className="container flex h-10 items-center justify-between px-4">
				<div className="flex items-center gap-3">
					<Wrench className="h-4 w-4 text-[#1A1A1A]" />
					<span className="text-sm font-medium text-[#1A1A1A]">
						Push to Post is currently undergoing system changes. Some features
						may be temporarily unavailable.
					</span>
				</div>
				<div className="flex items-center gap-4">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setIsVisible(false)}
						className="h-6 w-6 p-0 hover:bg-gray-200"
					>
						<X className="h-4 w-4" />
						<span className="sr-only">Close banner</span>
					</Button>
				</div>
			</div>
		</div>
	);
}
