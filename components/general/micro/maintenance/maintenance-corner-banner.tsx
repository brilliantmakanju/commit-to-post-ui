"use client";

import { Settings, Wrench } from "lucide-react";
import { useState } from "react";

export function MaintenanceCornerBanner() {
	const [isExpanded, setIsExpanded] = useState(false);
	const [hasInteracted, setHasInteracted] = useState(false);

	const handleClick = () => {
		setIsExpanded(previous => !previous);
		setHasInteracted(true);
	};

	return (
		<div
			className={`fixed bottom-[80px] right-4 z-50 cursor-pointer rounded-lg border border-white/10 bg-black/80 backdrop-blur-sm transition-all duration-200 ${
				isExpanded ? "max-w-xs px-4 py-3" : "p-2"
			} ${hasInteracted ? "" : "animate-slow-pulse"}`}
			onClick={handleClick}
		>
			{isExpanded ? (
				<div className="flex items-start space-x-3">
					<Wrench className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-400" />
					<div className="text-white">
						<p className="text-sm font-medium">App under maintenance</p>
						<p className="mt-1 text-xs text-gray-300">Things might break.</p>
					</div>
				</div>
			) : (
				<Settings className="h-5 w-5 text-orange-400" />
			)}
		</div>
	);
}
