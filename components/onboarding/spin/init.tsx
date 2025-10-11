/* eslint-disable import/no-unresolved */
"use client";

import { Sparkles } from "lucide-react";
import React from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

// ============================================================================
// INITIAL MODAL
// ============================================================================
interface InitialModalProps {
	isOpen: boolean;
	onClaim: () => void;
	onSkip: () => void;
	errorMessage?: string;
}

export const InitialModal: React.FC<InitialModalProps> = ({
	isOpen,
	onClaim,
	onSkip,
	errorMessage,
}) => (
	<Dialog open={isOpen} onOpenChange={() => {}}>
		<DialogContent className="sm:max-w-md">
			<div className="absolute right-2 top-2 z-[1] h-8 w-8 bg-background" />

			<DialogHeader className="space-y-3">
				<DialogTitle className="text-2xl">Welcome to Push to Draft</DialogTitle>
				<DialogDescription className="text-base leading-relaxed">
					Turn your Git commits into polished social media posts. Claim your
					bonus credits to start converting commits into drafts.
				</DialogDescription>
			</DialogHeader>

			<Alert className="flex items-center justify-start border-muted">
				<Sparkles className="h-4 w-4" />
				<AlertDescription className="mt-2 text-xs">
					1 credit = 1 social media draft from your commits
				</AlertDescription>
			</Alert>
			<div className="flex flex-col gap-2 pt-2">
				<Button onClick={onClaim} className="w-full">
					Claim Bonus Credits
				</Button>
				<Button onClick={onSkip} variant="outline" className="w-full">
					Skip
				</Button>
			</div>
		</DialogContent>
	</Dialog>
);
