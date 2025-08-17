/* eslint-disable import/no-unresolved */
"use client";

import React from "react";
import { FaExclamationTriangle } from "react-icons/fa";

import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { limitConfig } from "@/lib/constants/limit-config";
import { LimitTooltipProps } from "@/types/feature-limits";

import { Button } from "../ui/button";

function LimitTooltip({
	children,
	limitType,
	currentUsage,
	maxLimit,
	customMessage,
	position = "top",
}: LimitTooltipProps) {
	// clamp percentage
	const rawPercentage = (currentUsage / maxLimit) * 100;
	const percentage = Math.min(Math.round(rawPercentage), 100);

	const isNearLimit = percentage >= 80 && percentage < 100;
	const isAtLimit = rawPercentage >= 100;
	const shouldShow = isNearLimit || isAtLimit;

	const config = limitConfig[limitType];

	if (!shouldShow) {
		// just render children without tooltip if no need
		return <>{children}</>;
	}

	return (
		<TooltipProvider delayDuration={100}>
			<Tooltip>
				<TooltipTrigger asChild>{children}</TooltipTrigger>
				<TooltipContent
					side={position}
					sideOffset={8}
					collisionPadding={16}
					className="w-64 rounded border border-gray-600 bg-arch-white shadow-lg"
				>
					{/* Header */}
					<div className="border-b border-gray-600 p-3">
						<div className="flex items-center gap-2">
							<div className="flex h-4 w-4 items-center justify-center">
								{isNearLimit ? (
									<FaExclamationTriangle className="h-3 w-3 text-gray-600" />
								) : (
									<config.icon className="h-3 w-3 text-gray-600" />
								)}
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
								(isAtLimit
									? `You’ve reached the ${config.title} limit`
									: `${currentUsage} of ${maxLimit} ${config.unit} used`)}
						</p>

						{/* Progress */}
						<div className="space-y-1">
							<div className="flex items-center justify-between text-xs text-gray-600">
								<span>Usage</span>
								<span>{percentage}%</span>
							</div>
							<div className="h-1 rounded-full bg-gray-600/20">
								<div
									className="h-1 rounded-full bg-arch-black transition-all duration-300"
									style={{ width: `${percentage}%` }}
								/>
							</div>
						</div>

						{/* Upgrade Button */}
						<div className="w-full pt-1">
							<Button
								className={
									"flex w-full items-center space-x-2 border border-arch-black bg-arch-black px-6 py-3 text-white hover:bg-arch-dark focus:ring-2 focus:ring-arch-black focus:ring-opacity-20 disabled:cursor-not-allowed disabled:opacity-50"
								}
							>
								{isAtLimit ? "Upgrade Plan" : "Upgrade Now"}
							</Button>
						</div>
					</div>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}

export default LimitTooltip;
