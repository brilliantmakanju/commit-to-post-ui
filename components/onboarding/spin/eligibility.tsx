"use client";

import { Check, Loader2 } from "lucide-react";
import React from "react";

import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export const CheckingEligibility: React.FC<{ open: boolean }> = ({ open }) => (
	<Dialog open={open}>
		<DialogContent className="flex w-[12rem] flex-col items-center justify-center gap-3 py-10 text-center">
			<div className="absolute right-2 top-2 z-[1] h-8 w-8 bg-background" />
			<Loader2 className="h-8 w-8 animate-spin text-foreground" />
			<p className="text-md text-muted-foreground">Checking eligibility</p>
		</DialogContent>
	</Dialog>
);

export const NotEligibleModal: React.FC<{
	open: boolean;
	onClose?: () => void;
}> = ({ open, onClose }) => (
	<Dialog open={open} onOpenChange={onClose}>
		<DialogContent className="max-w-md p-0">
			<div className="absolute right-2 top-2 z-[1] h-8 w-8 bg-background" />
			<Card className="w-full border-0 shadow-none">
				<CardHeader className="p-6 text-center">
					<div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
						<Check className="h-6 w-6 text-primary" />
					</div>
					<CardTitle>Already Set Up</CardTitle>
					<CardDescription>Your account is configured</CardDescription>
				</CardHeader>
			</Card>
		</DialogContent>
	</Dialog>
);
