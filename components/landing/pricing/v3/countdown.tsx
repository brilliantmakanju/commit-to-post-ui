"use client";

import { Clock } from "lucide-react";
import { useEffect, useState } from "react";

interface GlobalCountdownTimerProps {
	className?: string;
	showIcon?: boolean;
	showLabels?: boolean;
	compact?: boolean;
	onExpire?: () => void;
}

// Format the time remaining
const formatTime = (ms: number) => {
	if (ms <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

	const seconds = Math.floor((ms / 1000) % 60);
	const minutes = Math.floor((ms / (1000 * 60)) % 60);
	const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
	const days = Math.floor(ms / (1000 * 60 * 60 * 24));

	return { days, hours, minutes, seconds };
};

export function GlobalCountdownTimer({
	className = "",
	showIcon = true,
	showLabels = false,
	compact = false,
	onExpire,
}: GlobalCountdownTimerProps) {
	const [timeLeft, setTimeLeft] = useState<number | null>();

	// Define a fixed global end time (March 1st, 2025, 12:00 PM UTC)
	// This is exactly 72 hours from a predetermined start date
	// const FIXED_END_TIME = Date.UTC(2025, 2, 14, 0, 0, 0);const now = new Date(Date.UTC(2025, 2, 13, 0, 0, 0)); // March 13, 2025, 00:00:00 UTC
	// const FIXED_END_TIME = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 3, 0, 0, 0, 0); // 3 days later
	const now = new Date(Date.UTC(2025, 4, 13, 0, 0, 0)); // March 13, 2025, 00:00:00 UTC
	const FIXED_END_TIME = Date.UTC(
		now.getUTCFullYear(),
		now.getUTCMonth(),
		now.getUTCDate() + 4,
		0,
		0,
		0,
		0,
	); // 3 days later

	useEffect(() => {
		// Function to calculate remaining time
		const calculateTimeLeft = () => {
			const now = Date.now();
			const remainingTime = FIXED_END_TIME - now;

			if (remainingTime <= 0) {
				setTimeLeft(0);
				if (onExpire) onExpire();
			} else {
				setTimeLeft(remainingTime);
			}
		};

		// Initial calculation
		calculateTimeLeft();

		// Update every second
		const interval = setInterval(calculateTimeLeft, 1000);

		// Cleanup interval on component unmount
		return () => clearInterval(interval);
	}, [FIXED_END_TIME, onExpire]);

	// If time is still being calculated
	if (timeLeft === null || timeLeft === undefined) {
		return <div className={className}>Loading...</div>;
	}

	// If timer has expired
	if (timeLeft <= 0) {
		return (
			<div className={`text-red-600 dark:text-red-400 ${className}`}>
				{showIcon && <Clock className="mr-1 inline-block h-4 w-4" />}
				Offer expired
			</div>
		);
	}

	// Format the time for display
	const { days, hours, minutes, seconds } = formatTime(timeLeft);

	// Compact display (e.g., "2d 5h 30m 15s")
	if (compact) {
		return (
			<div className={`flex items-center ${className}`}>
				{showIcon && <Clock className="mr-1 h-4 w-4" />}
				<span>
					{days > 0 && `${days}d `}
					{hours}h {minutes}m {seconds}s
				</span>
			</div>
		);
	}

	// Full display with time units in separate containers
	return (
		<div className={`flex items-center ${className}`}>
			{showIcon && <Clock className="mr-2 h-4 w-4" />}
			<div className="flex space-x-2">
				{days > 0 && (
					<div className="flex flex-col items-center">
						<span className="text-lg font-semibold">{days}</span>
						{showLabels && <span className="text-xs">days</span>}
					</div>
				)}
				<div className="flex flex-col items-center">
					<span className="text-lg font-semibold">
						{hours.toString().padStart(2, "0")}
					</span>
					{showLabels && <span className="text-xs">hours</span>}
				</div>
				<span className="text-lg">:</span>
				<div className="flex flex-col items-center">
					<span className="text-lg font-semibold">
						{minutes.toString().padStart(2, "0")}
					</span>
					{showLabels && <span className="text-xs">mins</span>}
				</div>
				<span className="text-lg">:</span>
				<div className="flex flex-col items-center">
					<span className="text-lg font-semibold">
						{seconds.toString().padStart(2, "0")}
					</span>
					{showLabels && <span className="text-xs">secs</span>}
				</div>
			</div>
		</div>
	);
}
