/* eslint-disable import/no-unresolved */
"use client";

import { ArrowLeft, Code2, Command, Terminal } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

export default function NotFound() {
	const [isHovered, setIsHovered] = useState(false);
	const [terminalOpen, setTerminalOpen] = useState(false);
	const [currentCommand, setCurrentCommand] = useState(0);
	const [isTyping, setIsTyping] = useState(false);
	const [countdown, setCountdown] = useState<number | undefined>();
	const router = useRouter();

	const commands = [
		{ input: "git status", output: "404: Path not found" },
		{ input: "git log", output: "fatal: not a git repository" },
		{ input: "git checkout main", output: "Switched to branch 'main'" },
		{ input: "cd /home", output: "Navigating to home..." },
	];

	// Handle keyboard navigation
	useEffect(() => {
		const handleKeyPress = (event_: KeyboardEvent) => {
			if (event_.key === "Escape") {
				setTerminalOpen(false);
			} else if (event_.key === "Enter" && !terminalOpen) {
				setTerminalOpen(true);
			} else if (
				terminalOpen &&
				(event_.key === "ArrowDown" || event_.key === "ArrowUp")
			) {
				setCurrentCommand(previous => {
					if (event_.key === "ArrowDown") {
						return previous < commands.length - 1 ? previous + 1 : previous;
					} else {
						return previous > 0 ? previous - 1 : previous;
					}
				});
			}
		};

		globalThis.addEventListener("keydown", handleKeyPress);
		return () => globalThis.removeEventListener("keydown", handleKeyPress);
	}, [commands.length, terminalOpen]);

	// Handle countdown and redirect
	useEffect(() => {
		if (currentCommand === commands.length - 1 && !isTyping) {
			setCountdown(5);
		}
	}, [commands.length, currentCommand, isTyping]);

	useEffect(() => {
		let timer: NodeJS.Timeout;
		if (countdown !== undefined && countdown > 0) {
			timer = setTimeout(() => {
				setCountdown(countdown - 1);
			}, 1000);
		} else if (countdown === 0) {
			router.push("/");
		}
		return () => clearTimeout(timer);
	}, [countdown, router]);

	// Simulate typing effect
	useEffect(() => {
		if (terminalOpen) {
			setIsTyping(true);
			const timer = setTimeout(() => {
				setIsTyping(false);
			}, 500);
			return () => clearTimeout(timer);
		}
	}, [terminalOpen]);

	return (
		<html lang="en">
			<body className={"relative antialiased xl:container xl:mx-auto"}>
				<div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-background px-4">
					<TooltipProvider>
						<div
							className="group relative mb-8 transition-transform duration-300"
							onMouseEnter={() => setIsHovered(true)}
							onMouseLeave={() => setIsHovered(false)}
							onClick={() => setTerminalOpen(true)}
							role="button"
							tabIndex={0}
							aria-label="Toggle terminal view"
						>
							{terminalOpen ? (
								<div className="min-w-[320px] rounded-lg border border-zinc-200 bg-zinc-50 p-4 shadow-lg transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-900">
									<div className="mb-2 flex items-center justify-between">
										<div className="flex gap-2">
											<div
												className="h-3 w-3 cursor-pointer rounded-full bg-zinc-300 transition-colors hover:bg-red-500 dark:bg-zinc-700"
												onClick={event_ => {
													event_.stopPropagation();
													setTerminalOpen(false);
												}}
											/>
											<div className="h-3 w-3 rounded-full bg-zinc-300 dark:bg-zinc-700" />
											<div className="h-3 w-3 rounded-full bg-zinc-300 dark:bg-zinc-700" />
										</div>
										<div className="text-xs text-zinc-400">push-to-post:~</div>
									</div>
									<div className="space-y-2 font-mono text-sm">
										{commands.map((command, index) => (
											<div
												key={index}
												className={`transition-opacity ${index > currentCommand ? "opacity-0" : "opacity-100"}`}
											>
												<div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
													<Terminal className="h-4 w-4" />
													<span>$ {command.input}</span>
													{index === currentCommand && isTyping && (
														<span className="ml-1 inline-block h-4 w-2 animate-pulse bg-zinc-400 dark:bg-zinc-500" />
													)}
												</div>
												{!isTyping && (
													<div className="ml-6 text-zinc-500 dark:text-zinc-500">
														{command.output}
														{index === commands.length - 1 &&
															countdown !== null && (
																<div className="mt-2 font-mono text-amber-600 dark:text-amber-500">
																	$ Redirecting in {countdown}
																	<span className="inline-block animate-pulse">
																		{".".repeat(5 - (countdown || 0))}
																	</span>
																</div>
															)}
													</div>
												)}
											</div>
										))}
									</div>
								</div>
							) : (
								<Tooltip>
									<TooltipTrigger>
										<div className="flex items-center gap-4 text-8xl font-bold tracking-tighter text-zinc-900 dark:text-zinc-100">
											<span
												className={`transition-transform duration-300 ${isHovered ? "-translate-x-2" : ""}`}
											>
												4
											</span>
											<Code2
												className={`h-24 w-24 transition-all duration-300 ${isHovered ? "rotate-12 scale-110" : ""}`}
											/>
											<span
												className={`transition-transform duration-300 ${isHovered ? "translate-x-2" : ""}`}
											>
												4
											</span>
										</div>
									</TooltipTrigger>
									<TooltipContent>
										<div className="flex items-center gap-2">
											<Command className="h-4 w-4" /> Press Enter to open
											terminal
										</div>
									</TooltipContent>
								</Tooltip>
							)}
						</div>
					</TooltipProvider>

					<h2 className="mb-2 text-center text-xl font-medium text-zinc-900 dark:text-zinc-100">
						Page not found
					</h2>
					<p className="mb-8 max-w-md text-center text-base text-zinc-600 dark:text-zinc-400">
						Looks like this commit didn&apos;t make it to production. Let&apos;s
						get you back to the main branch.
					</p>

					<div className="flex gap-4">
						<Button
							variant="outline"
							onClick={() => globalThis.history.back()}
							className="group gap-2 border-zinc-200 bg-zinc-50 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
						>
							<ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
							Go Back
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
