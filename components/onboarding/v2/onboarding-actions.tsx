/* eslint-disable import/no-unresolved */
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";

import { Step } from "../../../types/onboarding";

interface OnboardingActionsProps {
	currentStep: Step;
	onNext: () => void;
	onBack: () => void;
	isLastStep: boolean;
	onSkip?: () => void;
	isFirstStep: boolean;
	nextButtonText?: string;
	backButtonText?: string;
	skipButtonText?: string;
	isCurrentStepCompleted: () => boolean;
	onStepClick?: (stepId: number) => void;
	areAllRequiredStepsCompleted: () => boolean;
	getFirstIncompleteRequiredStep: () => Step | undefined;
}

export const OnboardingActions: React.FC<OnboardingActionsProps> = ({
	onNext,
	onBack,
	onSkip,
	isLastStep,
	currentStep,
	onStepClick,
	isFirstStep,
	nextButtonText,
	isCurrentStepCompleted,
	backButtonText = "Back",
	areAllRequiredStepsCompleted,
	getFirstIncompleteRequiredStep,
	skipButtonText = "Skip for now",
}) => {
	// Check if all required steps are completed
	const firstIncompleteStep = getFirstIncompleteRequiredStep();
	const allRequiredStepsCompleted = areAllRequiredStepsCompleted();
	const getButtonText = () => {
		if (isLastStep) {
			if (allRequiredStepsCompleted) {
				return nextButtonText || "Start Sharing Now"; // Updated default
			} else {
				// Show the name of the incomplete step
				return firstIncompleteStep ? firstIncompleteStep.title : "Finish";
			}
		}
		return nextButtonText || "Continue";
	};

	const handleButtonClick = () => {
		if (
			isLastStep &&
			!allRequiredStepsCompleted &&
			firstIncompleteStep &&
			onStepClick
		) {
			// Navigate to the first incomplete required step
			onStepClick(firstIncompleteStep.id);
		} else {
			// Normal next behavior
			onNext();
		}
	};

	const isButtonDisabled = () => {
		if (isLastStep) {
			// On last step, only disable if there's no incomplete step to navigate to
			return !allRequiredStepsCompleted && !firstIncompleteStep;
		}
		// On other steps, use the existing logic
		return !isCurrentStepCompleted();
	};

	// Determine if button is navigating to incomplete step
	const isNavigatingToIncompleteStep =
		isLastStep && !allRequiredStepsCompleted && firstIncompleteStep;

	return (
		<div className="mt-5 space-y-4">
			<div className="flex items-center justify-between">
				<Button
					type="button"
					variant="ghost"
					onClick={onBack}
					disabled={isFirstStep}
					className="flex items-center space-x-2 text-base text-gray-600 hover:text-arch-black focus:ring-2 focus:ring-arch-black focus:ring-opacity-20 disabled:cursor-not-allowed disabled:opacity-50"
				>
					<ChevronLeft className="h-5 w-5" />
					<span>{backButtonText}</span>
				</Button>

				<div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
					{currentStep.optional && onSkip && (
						<Button
							type="button"
							variant="ghost"
							onClick={onSkip}
							className="px-6 py-3 text-base text-gray-600 hover:text-arch-black focus:ring-2 focus:ring-arch-black focus:ring-opacity-20"
						>
							{skipButtonText}
						</Button>
					)}
					<Button
						onClick={handleButtonClick}
						disabled={isButtonDisabled()}
						className={`flex items-center space-x-2 border px-6 py-3 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${
							isNavigatingToIncompleteStep
								? "border-arch-red bg-arch-red text-white hover:bg-red-700 focus:ring-arch-red focus:ring-opacity-20"
								: "border-arch-black bg-arch-black text-white hover:bg-arch-dark focus:ring-arch-black focus:ring-opacity-20"
						}`}
						type="button"
					>
						<span>{getButtonText()}</span>
						{isNavigatingToIncompleteStep ? (
							<ArrowRight className="h-5 w-5" />
						) : isLastStep ? (
							<></>
						) : (
							<ChevronRight className="h-5 w-5" />
						)}
					</Button>
				</div>
			</div>

			{/* Helpful message when navigating to incomplete step */}
			{/* {isNavigatingToIncompleteStep && (
				<div className="text-center">
					<p className="text-sm text-arch-red">
						Click to go back and complete the required step
					</p>
				</div>
			)} */}
		</div>
	);
};
