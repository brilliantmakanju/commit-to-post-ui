/* eslint-disable import/no-unresolved */
"use client";

import { AlertTriangle, Clock, X } from "lucide-react";
import React, { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

interface SessionWarningModalProps {
	isOpen: boolean;
	timeRemaining: string;
	onExtendSession: () => void;
	onLogout: () => void;
}

export const SessionWarningModal: React.FC<SessionWarningModalProps> = ({
	isOpen,
	timeRemaining,
	onExtendSession,
	onLogout,
}) => {
	const cardRef = useRef<HTMLDivElement>(null);

	// 🧠 Detect outside click
	useEffect(() => {
		if (!isOpen) return;

		const handleClickOutside = (event: MouseEvent) => {
			if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
				onExtendSession();
			}
		};

		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				onExtendSession();
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("keydown", handleEscape);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleEscape);
		};
	}, [isOpen, onExtendSession]);

	if (!isOpen) return;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
			<Card
				ref={cardRef}
				className="relative w-full max-w-md border border-[#232323] bg-[#121212] text-white shadow-lg shadow-[#4F46E5]/10"
			>
				<button
					onClick={onExtendSession}
					className="absolute right-4 top-4 rounded-full p-1 text-zinc-400 transition-colors hover:bg-[#232323] hover:text-white"
				>
					<X className="h-4 w-4" />
				</button>

				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<AlertTriangle className="h-5 w-5 text-yellow-400" />
						Session Expiring
					</CardTitle>
					<CardDescription className="text-zinc-400">
						Your session will expire in{" "}
						<span className="font-mono font-semibold text-red-500">
							{timeRemaining}
						</span>{" "}
						due to inactivity.
					</CardDescription>
				</CardHeader>

				<CardContent className="space-y-4">
					<div className="flex items-center justify-center space-x-2 text-sm text-zinc-500">
						<Clock className="h-4 w-4" />
						<span>You&apos;ll be logged out automatically</span>
					</div>

					<div className="flex gap-2 pt-2">
						<Button
							variant="outline"
							onClick={onLogout}
							className="flex-1 bg-transparent text-sm text-white hover:bg-transparent hover:text-white"
						>
							Logout
						</Button>
						<Button
							variant="secondary"
							onClick={onExtendSession}
							className="flex-1 text-sm"
						>
							Stay Logged In
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
