"use client";

import { Settings } from "lucide-react";
import { useEffect, useState } from "react";

// eslint-disable-next-line import/no-unresolved
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	// eslint-disable-next-line import/no-unresolved
} from "@/components/ui/dialog";

export function MaintenanceModal() {
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		// Show modal once per session
		const hasSeenModal = sessionStorage.getItem("maintenance-modal-seen");
		if (!hasSeenModal) {
			const timer = setTimeout(() => {
				setIsOpen(true);
			}, 2000); // Show after 2 seconds
			return () => clearTimeout(timer);
		}
	}, []);

	const handleClose = () => {
		setIsOpen(false);
		sessionStorage.setItem("maintenance-modal-seen", "true");
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="border-0 bg-white shadow-none sm:max-w-md">
				<DialogHeader className="space-y-4 text-center">
					<div className="flex justify-center">
						<Settings className="h-8 w-8 text-[#1A1A1A]" />
					</div>
					<DialogTitle className="text-xl font-semibold text-[#1A1A1A]">
						Updates in Progress
					</DialogTitle>
					<DialogDescription className="leading-relaxed text-[#666]">
						We&apos;re currently improving parts of the app — some functionality
						might behave unexpectedly during this time. Don&apos;t worry,
						everything will be back to normal soon.
					</DialogDescription>
				</DialogHeader>
				<div className="flex justify-center pt-4">
					<Button
						onClick={handleClose}
						className="bg-[#1A1A1A] px-8 text-white hover:bg-[#333]"
					>
						Got it
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
