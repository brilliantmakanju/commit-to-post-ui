"use client";

import { motion } from "framer-motion";
import React, { useMemo } from "react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

import { CanvasConfetti } from "./confetti";

interface ResultModalProps {
	isOpen: boolean;
	credits: number;
	onClose: () => void;
}

const fadeUp = {
	initial: { y: 15, opacity: 0 },
	animate: { y: 0, opacity: 1 },
	exit: { opacity: 0 },
	transition: { duration: 0.7, ease: "easeOut" },
};

export const ResultModal: React.FC<ResultModalProps> = ({
	isOpen,
	credits,
	onClose,
}) => {
	const formattedCredits = useMemo(() => credits.toFixed(1), [credits]);

	const getTitle = useMemo(() => {
		if (credits >= 9.4) return "Maximum Bonus";
		if (credits >= 6) return "Great Start";
		return "Ready to Convert";
	}, [credits]);

	return (
		<Dialog open={isOpen}>
			<DialogContent className="overflow-hidden border border-zinc-300 bg-gradient-to-b from-white to-zinc-100 text-zinc-900 sm:max-w-md">
				{/* Background Confetti */}
				{isOpen && <CanvasConfetti isOpen={isOpen} />}

				{/* Header */}
				<DialogHeader className="relative z-20 flex flex-col items-center space-y-6 text-center">
					<motion.div
						initial={{ scale: 0.6, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						transition={{ duration: 0.7, ease: "easeOut" }}
						className="flex h-28 w-28 items-center justify-center rounded-full border border-zinc-300 bg-white/80 shadow-lg backdrop-blur-sm"
					>
						<span
							className="text-5xl font-bold tracking-tight"
							aria-label={`${formattedCredits} credits won`}
						>
							{formattedCredits}
						</span>
					</motion.div>

					<motion.div {...fadeUp} className="space-y-2">
						<DialogTitle className="text-center text-2xl font-semibold tracking-tight">
							{getTitle}
						</DialogTitle>
						<DialogDescription className="text-sm text-zinc-600">
							Convert {formattedCredits} credits into social drafts
						</DialogDescription>
					</motion.div>
				</DialogHeader>

				{/* Action Button */}
				<motion.div
					className="relative z-20 mt-6 flex flex-col gap-2"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.8 }}
				>
					<Button
						onClick={onClose}
						className="w-full border border-zinc-400 bg-zinc-900 text-zinc-100 shadow-md transition-colors hover:bg-zinc-800"
					>
						Start Converting Commits
					</Button>
				</motion.div>

				{/* Floor Reflection */}
				<div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-32 bg-gradient-to-t from-zinc-200/70 to-transparent" />
			</DialogContent>
		</Dialog>
	);
};
