/* eslint-disable import/no-unresolved */
"use client";

import Link from "next/link";
import React from "react";

import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { limitConfig } from "@/lib/constants/limit-config";
import { LimitTooltipProps } from "@/types/feature-limits";
import useUserStore from "@/zustand/useuser-store";

import { Button } from "../ui/button";

function LimitTooltip({
	children,
	limitType,
	currentUsage,
	maxLimit,
	customMessage,
	position = "top",
}: LimitTooltipProps) {
	const useStore = useUserStore();

	// clamp percentage
	const rawPercentage = (currentUsage / maxLimit) * 100;
	const percentage = Math.min(Math.round(rawPercentage), 100);
	const isNearLimit = percentage >= 80 && percentage < 100;
	const isAtLimit = rawPercentage >= 100;
	const shouldShow = isNearLimit || isAtLimit;

	const config = limitConfig[limitType];

	if (!shouldShow) {
		return <>{children}</>;
	}

	return (
		<TooltipProvider delayDuration={100}>
			<Tooltip>
				<TooltipTrigger asChild>{children}</TooltipTrigger>
				<TooltipContent
					sideOffset={8}
					side={position}
					collisionPadding={16}
					className="w-64 rounded border border-gray-600 bg-arch-white shadow-lg"
				>
					{/* Header */}
					<div className="border-b border-gray-600 p-3">
						<div className="flex items-center gap-2">
							<div className="flex h-4 w-4 items-center justify-center">
								<config.icon className="h-3 w-3 text-gray-600" />
							</div>
							<span className="text-xs font-medium text-arch-black">
								{config.title}
							</span>
						</div>
					</div>

					{/* Content */}
					<div className="space-y-3 p-3">
						<p className="text-xs text-arch-black">
							{customMessage ||
								(useStore.plan === "basic"
									? `This feature is locked on the Basic plan. Upgrade to Pro to unlock ${config.title}.`
									: config.reachedTitle === "Studio Pack Required"
										? `You've reached the maximum ${config.title} allowed on your current plan. Upgrade to Studio to unlock more.`
										: `You've reached the maximum ${config.title} allowed on your plan. Upgrade to Pro for more.`)}
						</p>

						{/* Upgrade Button */}
						<div className="w-full pt-1">
							<Link href="/pricing" className="block w-full">
								<Button
									className={
										"flex w-full items-center space-x-2 border border-arch-black bg-arch-black px-6 py-3 text-white hover:bg-arch-dark focus:ring-2 focus:ring-arch-black focus:ring-opacity-20 disabled:cursor-not-allowed disabled:opacity-50"
									}
								>
									{config.reachedTitle}
								</Button>
							</Link>
						</div>
					</div>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}

export default LimitTooltip;
