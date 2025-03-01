/* eslint-disable import/no-unresolved */
"use client";

import { AlertTriangle, ArrowLeft, Terminal } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export default function Error500({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	const [isHovered, setIsHovered] = useState(false);
	const [errorDetails, setErrorDetails] = useState<string[]>([]);

	return (
		<html lang="en">
			<body className={"relative antialiased xl:container xl:mx-auto"}>
				<div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-background px-4">
					<div
						className="group relative mb-8 transition-transform duration-300"
						onMouseEnter={() => setIsHovered(true)}
						onMouseLeave={() => setIsHovered(false)}
					>
						<div className="flex items-center gap-4 text-8xl font-bold tracking-tighter text-zinc-900 dark:text-zinc-100">
							<span
								className={`transition-transform duration-300 ${isHovered ? "-translate-x-2" : ""}`}
							>
								5
							</span>
							<AlertTriangle
								className={`h-24 w-24 transition-all duration-300 ${isHovered ? "rotate-12 scale-110 text-amber-500" : ""}`}
							/>
							<span
								className={`transition-transform duration-300 ${isHovered ? "translate-x-2" : ""}`}
							>
								0
							</span>
						</div>
					</div>

					<div className="mb-8 w-full max-w-md rounded-lg border border-zinc-200 bg-zinc-50 p-4 font-mono dark:border-zinc-800 dark:bg-zinc-900">
						<div className="mb-2 flex items-center justify-between">
							<div className="flex gap-2">
								<div className="h-3 w-3 rounded-full bg-zinc-300 dark:bg-zinc-700" />
								<div className="h-3 w-3 rounded-full bg-zinc-300 dark:bg-zinc-700" />
								<div className="h-3 w-3 rounded-full bg-zinc-300 dark:bg-zinc-700" />
							</div>
							<div className="text-xs text-zinc-400">error-log:~</div>
						</div>
						<div className="space-y-1 text-sm">
							{errorDetails.map((line, index) => (
								<div
									key={index}
									className="flex items-start gap-2 text-zinc-600 dark:text-zinc-400"
								>
									<Terminal className="mt-1 h-3 w-3 flex-shrink-0" />
									<span className="font-mono">{line}</span>
								</div>
							))}
							{errorDetails.length > 0 && (
								<div className="mt-2 animate-pulse text-xs text-zinc-400">
									Error digest: {error.digest}
								</div>
							)}
						</div>
					</div>

					<h2 className="mb-2 text-center text-xl font-medium text-zinc-900 dark:text-zinc-100">
						Something went wrong
					</h2>
					<p className="mb-8 max-w-md text-center text-base text-zinc-600 dark:text-zinc-400">
						Looks like we encountered a critical error. Our team has been
						notified and is working on it.
					</p>

					<div className="flex gap-4">
						<Button
							variant="outline"
							onClick={() => reset()}
							className="group gap-2 border-zinc-200 bg-zinc-50 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
						>
							<ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
							Try Again
						</Button>
						<Button
							asChild
							className="group gap-2 bg-zinc-900 transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
						>
							<Link href="/">
								<Terminal className="h-4 w-4 transition-transform group-hover:scale-110" />
								Return Home
							</Link>
						</Button>
					</div>
				</div>
			</body>
		</html>
	);
}
