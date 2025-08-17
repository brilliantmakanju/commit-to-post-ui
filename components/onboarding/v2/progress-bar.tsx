import React from "react";

import { Step } from "../../../types/onboarding";

interface ProgressBarProps {
	steps: Step[];
	currentStep: number;
	completedSteps: Set<number>;
	className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
	steps,
	currentStep,
	completedSteps,
	className = "",
}) => (
	<div className={`mt-3 flex space-x-2 ${className}`}>
		{steps.map(step => (
			<div
				key={step.id}
				className={`h-2 flex-1 rounded-full transition-colors duration-200 ${
					completedSteps.has(step.id) || step.id < currentStep
						? "bg-arch-black"
						: step.id === currentStep
							? "bg-arch-white"
							: "bg-gray-200"
				}`}
				aria-label={`Step ${step.id}: ${step.title}`}
			/>
		))}
	</div>
);
