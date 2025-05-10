/* eslint-disable import/no-unresolved */
"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

export function VerificationAnimation() {
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setProgress(previous => {
				if (previous >= 100) {
					clearInterval(interval);
					return 100;
				}
				return previous + 1;
			});
		}, 30);

		return () => clearInterval(interval);
	}, []);

	return (
		<div className="flex w-full flex-col items-center space-y-6">
			{/* Pulse animation */}
			<div className="relative">
				<div className="absolute inset-0 animate-ping rounded-full bg-gray-900 opacity-10 dark:bg-gray-100" />
				<div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800">
					<svg
						className="h-8 w-8 text-gray-700 dark:text-gray-300"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
						/>
					</svg>
				</div>
			</div>

			{/* Progress bar */}
			<div className="w-full max-w-xs space-y-2">
				<div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
					<div
						className="h-full rounded-full bg-gray-900 transition-all duration-300 ease-in-out dark:bg-gray-100"
						style={{ width: `${progress}%` }}
					/>
				</div>
				<div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
					<span>Verifying</span>
					<span>{Math.min(progress, 100)}%</span>
				</div>
			</div>

			{/* Animated dots */}
			<div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
				<span>Processing</span>
				<span className="flex">
					<span
						className={cn(
							"opacity-0",
							progress > 30 && "animate-fadeIn opacity-100",
						)}
					>
						.
					</span>
					<span
						className={cn(
							"opacity-0",
							progress > 50 && "animate-fadeIn opacity-100",
						)}
					>
						.
					</span>
					<span
						className={cn(
							"opacity-0",
							progress > 70 && "animate-fadeIn opacity-100",
						)}
					>
						.
					</span>
				</span>
			</div>
		</div>
	);
}
