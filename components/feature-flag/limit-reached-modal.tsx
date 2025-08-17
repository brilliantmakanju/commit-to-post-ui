/* eslint-disable import/no-unresolved */
"use client";
import { X } from "lucide-react";
import React from "react";
import { FaBan } from "react-icons/fa";

import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { limitConfig } from "@/lib/constants/limit-config";
import { LimitReachedProps } from "@/types/feature-limits";

// Limit Reached Modal (when at limit)
export function LimitReachedModal({
	isOpen,
	onClose,
	limitType,
	maxLimit,
	customTitle,
	customMessage,
	upgradeAction,
}: LimitReachedProps) {
	const config = limitConfig[limitType];
	const Icon = config.icon;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="flex max-h-[80vh] flex-col border border-gray-600 bg-arch-white px-0 shadow-lg sm:max-w-md">
				{/* Header */}
				<div className="flex-shrink-0 border-b border-gray-600 px-6 py-4">
					<DialogHeader>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="flex h-8 w-8 items-center justify-center rounded border border-gray-600 bg-arch-white p-1">
									<FaBan className="h-4 w-4 text-gray-600" />
								</div>
								<h2 className="text-xl font-normal text-arch-black">
									{customTitle || config.reachedTitle}
								</h2>
							</div>
							<button
								onClick={onClose}
								className="text-gray-600 hover:text-arch-black"
							>
								<X className="h-5 w-5" />
							</button>
						</div>
					</DialogHeader>
				</div>

				{/* Content */}
				<div className="flex flex-1 flex-col overflow-hidden">
					<div className="flex-1 space-y-6 p-6">
						{/* Status */}
						<div className="text-center">
							<div className="mb-4 flex justify-center">
								<div className="flex h-16 w-16 items-center justify-center rounded border border-gray-600 bg-arch-white">
									<Icon className="h-8 w-8 text-arch-black" />
								</div>
							</div>
							<p className="text-arch-black">
								{customMessage ||
									`You've reached your limit of ${maxLimit} ${config.unit}`}
							</p>
						</div>

						{/* Progress */}
						<div className="space-y-2">
							<div className="flex items-center justify-between text-xs text-gray-600">
								<span>Usage</span>
								<span>100%</span>
							</div>
							<div className="h-2 rounded-full bg-gray-600/20">
								<div className="h-2 w-full rounded-full bg-arch-black"></div>
							</div>
						</div>

						{/* Info */}
						<div className="rounded border border-gray-600 bg-arch-white p-4">
							<p className="text-sm text-arch-black">
								You need to upgrade your plan to continue. Current actions may
								be limited.
							</p>
						</div>
					</div>

					{/* Footer */}
					<div className="flex-shrink-0 border-t border-gray-600 px-6 py-4">
						<div className="flex justify-end gap-3">
							<button
								onClick={onClose}
								className="px-4 py-2 text-sm text-gray-600 hover:text-arch-black"
							>
								Later
							</button>
							<button
								onClick={upgradeAction || onClose}
								className="rounded border border-arch-black bg-arch-black px-6 py-2 text-sm text-arch-white hover:bg-arch-white hover:text-arch-black"
							>
								Upgrade Now
							</button>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default LimitReachedModal;
