"use client";
import { Check } from "lucide-react";
import React from "react";

import { Dialog, DialogContent } from "@/components/ui/dialog";

const PROCESSING_STEPS = [
	"Reading your commits",
	"Preparing AI engine",
	"Generating your bonus",
];

interface ProcessingModalProps {
	isOpen: boolean;
	currentStep: number;
}

export const ProcessingModal: React.FC<ProcessingModalProps> = ({
	isOpen,
	currentStep,
}) => (
	<Dialog open={isOpen} onOpenChange={() => {}}>
		<DialogContent className="sm:max-w-md">
			<div className="absolute right-2 top-2 z-[1] h-8 w-8 bg-background" />

			<div className="space-y-6 py-4">
				{PROCESSING_STEPS.map((step, index) => {
					const isCompleted = index < currentStep;
					const isCurrent = index === currentStep;

					return (
						<div key={step} className="flex items-center gap-4">
							<div
								className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all ${
									isCompleted
										? "border-primary bg-primary"
										: isCurrent
											? "border-primary bg-background"
											: "border-muted bg-background"
								}`}
							>
								{isCompleted ? (
									<Check className="h-4 w-4 text-primary-foreground" />
								) : isCurrent ? (
									<div className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary" />
								) : (
									<div className="h-2 w-2 rounded-full bg-muted-foreground/20" />
								)}
							</div>

							<div
								className={`text-sm transition-all ${
									isCompleted || isCurrent
										? "font-medium text-foreground"
										: "text-muted-foreground"
								}`}
							>
								{step}
							</div>
						</div>
					);
				})}
			</div>
		</DialogContent>
	</Dialog>
);
