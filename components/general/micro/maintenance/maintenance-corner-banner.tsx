"use client";

import { Settings, Wrench } from "lucide-react";
import { useState } from "react";

export function MaintenanceCornerBanner() {
	const [isExpanded, setIsExpanded] = useState(true);

	return (
		<div
			className={`fixed bottom-[100px] left-4 z-40 cursor-pointer rounded-lg border border-white/10 bg-black/80 text-white backdrop-blur-sm transition-all duration-200 ${
				isExpanded ? "max-w-sm px-4 py-3" : "p-3"
			}`}
			onClick={() => setIsExpanded(!isExpanded)}
		>
			{isExpanded ? (
				<div className="flex items-center gap-3">
					<Wrench className="h-4 w-4 flex-shrink-0" />
					<span className="text-sm leading-tight">
						App under maintenance — things might break.
					</span>
				</div>
			) : (
				<div className="flex items-center justify-center">
					<Settings className="h-4 w-4" />
				</div>
			)}
		</div>
	);
}
