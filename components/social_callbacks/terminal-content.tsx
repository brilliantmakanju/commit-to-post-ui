"use client";

import type React from "react";
import { useEffect, useState } from "react";

interface TerminalContentProps {
	provider: string;
	isTyping: boolean;
	showCursor: boolean;
	currentLine: string;
	terminalLines: string[];
	connectionState: string;
	providerIcon: React.ReactNode;
	terminalTheme: {
		error: string;
		primary: string;
		success: string;
		secondary: string;
	};
}

export function TerminalContent({
	isTyping,
	provider,
	showCursor,
	currentLine,
	providerIcon,
	terminalTheme,
	terminalLines,
	connectionState,
}: TerminalContentProps) {
	const [systemInfo, setSystemInfo] = useState({
		timestamp: "",
		sessionId: "",
	});

	useEffect(() => {
		setSystemInfo({
			timestamp: new Date().toISOString().split("T")[0],
			sessionId: Math.random().toString(36).slice(2, 8).toUpperCase(),
		});
	}, []);

	return (
		<div className="min-h-[500px] p-6 font-mono text-sm">
			{/* Terminal Header Info */}
			<div className="mb-4 space-y-1 text-xs text-gray-500">
				<div>Push to Post OAuth Integration Terminal v2.1.0</div>
				<div>
					Session: {systemInfo.sessionId} | Date: {systemInfo.timestamp}
				</div>
				<div>Connecting to {provider} OAuth 2.0 endpoint...</div>
				<div className="mb-4 border-b border-gray-700 pb-2"></div>
			</div>

			{/* Main Command */}
			<div
				className={`${terminalTheme.primary} flex flex-wrap items-center justify-start md:gap-1`}
			>
				<span className="text-green-400">user@push-to-draft</span>
				<span className="text-gray-500">:</span>
				<span className="text-blue-400">~/integrations</span>
				<span className="text-gray-500">$</span>
				<span>./connect-{provider}.sh --oauth</span>
				<span className="ml-2">{providerIcon}</span>
			</div>

			{/* Terminal Output */}
			<div className="scrollbar-hide max-h-96 space-y-1 overflow-y-auto">
				{terminalLines.map((line, index) => (
					<div
						key={index}
						className={`animate-[fadeIn_0.5s_ease-in-out_forwards] opacity-0 ${
							line.startsWith("✓")
								? terminalTheme.success
								: line.startsWith("✗") || line.startsWith("⚠")
									? terminalTheme.error
									: line.startsWith("→")
										? terminalTheme.secondary
										: line.startsWith("[INFO]")
											? "text-blue-300"
											: line.startsWith("[SUCCESS]")
												? terminalTheme.success
												: line.startsWith("[ERROR]")
													? terminalTheme.error
													: terminalTheme.secondary
						}`}
						style={{ animationDelay: `${index * 0.05}s` }}
					>
						{line}
					</div>
				))}

				{isTyping && (
					<div className={`${terminalTheme.secondary} flex items-center`}>
						<span>{currentLine}</span>
						<span
							className={`ml-1 ${showCursor ? "opacity-100" : "opacity-0"}`}
						>
							█
						</span>
					</div>
				)}

				{!isTyping &&
					(connectionState === "processing" ||
						connectionState === "authenticating" ||
						connectionState === "initializing") && (
						<div
							className={`flex items-center ${terminalTheme.secondary} mt-2`}
						>
							<span className="animate-pulse">▓▓▓</span>
							<span className="ml-2">Processing OAuth handshake</span>
							<span className="ml-2 animate-bounce">...</span>
						</div>
					)}
			</div>

			{/* Terminal Footer */}
			<div className="mt-6 border-t border-gray-800 pt-4">
				<div className="space-y-1 text-xs text-gray-500">
					<div>
						💡 Push to Post automatically converts your git commits into
						engaging social media posts
					</div>
					<div>
						🚀 No manual posting needed - just commit your code and we handle
						the rest
					</div>
					{/* <div>
						⚡ Works with GitHub, GitLab, Bitbucket and posts to Twitter,
						LinkedIn, Dev.to
					</div> */}
				</div>
			</div>
		</div>
	);
}
