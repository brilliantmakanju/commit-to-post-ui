/* eslint-disable import/no-unresolved */
"use client";

import { AlertCircle } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

/**
 * Modal shown when user attempts to skip the bonus
 */
interface CancelModalProps {
	isOpen: boolean;
	onSkip: () => void;
	onClaim: () => void;
}

export const CancelModal: React.FC<CancelModalProps> = ({
	isOpen,
	onClaim,
	onSkip,
}) => (
	<Dialog open={isOpen} onOpenChange={() => {}}>
		<DialogContent className="sm:max-w-md">
			<div className="absolute right-2 top-2 z-[1] h-8 w-8 bg-background" />

			<DialogHeader className="items-center space-y-3 text-center">
				<div className="flex h-12 w-12 items-center justify-center rounded-full border-2">
					<AlertCircle className="h-6 w-6" />
				</div>
				<DialogTitle className="text-2xl">One Time Only</DialogTitle>
				<DialogDescription>
					This bonus won&apos;t appear again. Skip anyway?
				</DialogDescription>
			</DialogHeader>

			<div className="flex flex-col gap-2 pt-2">
				<Button onClick={onClaim} className="w-full">
					Claim Credits
				</Button>
				<Button onClick={onSkip} variant="outline" className="w-full">
					Skip
				</Button>
			</div>
		</DialogContent>
	</Dialog>
);
