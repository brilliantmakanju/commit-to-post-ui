import React from "react";

// eslint-disable-next-line import/no-unresolved
import { Step } from "@/types/onboarding";

import { OnboardingActions } from "./onboarding-actions";
import { OnboardingHeader } from "./onboarding-header";
import { StepContent } from "./step-content";

interface OnboardingMainProps {
	stepData: Step;
	totalSteps: number;
	onNext: () => void;
	onBack: () => void;
	currentStep: number;
	onSkip?: () => void;
	isLastStep: boolean;
	isFirstStep: boolean;
	nextButtonText?: string;
	backButtonText?: string;
	skipButtonText?: string;
	children?: React.ReactNode;
	isCurrentStepCompleted: () => boolean;
	onStepClick?: (stepId: number) => void;
	areAllRequiredStepsCompleted: () => boolean;
	getFirstIncompleteRequiredStep: () => Step | undefined;
}

const OnboardingMain: React.FC<OnboardingMainProps> = ({
	onNext,
	onBack,
	onSkip,
	children,
	stepData,
	isLastStep,
	totalSteps,
	currentStep,
	isFirstStep,
	onStepClick,
	nextButtonText,
	backButtonText,
	skipButtonText,
	isCurrentStepCompleted,
	areAllRequiredStepsCompleted,
	getFirstIncompleteRequiredStep,
}) => (
	<div className="flex-1 py-8 sm:pl-5">
		<div className="mx-auto max-w-4xl">
			<OnboardingHeader
				currentStep={currentStep}
				totalSteps={totalSteps}
				stepData={stepData}
			/>
			<StepContent step={stepData}>{children}</StepContent>
			<OnboardingActions
				onNext={onNext}
				onBack={onBack}
				onSkip={onSkip}
				currentStep={stepData}
				isLastStep={isLastStep}
				onStepClick={onStepClick}
				isFirstStep={isFirstStep}
				nextButtonText={nextButtonText}
				backButtonText={backButtonText}
				skipButtonText={skipButtonText}
				isCurrentStepCompleted={isCurrentStepCompleted}
				areAllRequiredStepsCompleted={areAllRequiredStepsCompleted}
				getFirstIncompleteRequiredStep={getFirstIncompleteRequiredStep}
			/>
		</div>
	</div>
);

export default OnboardingMain;
