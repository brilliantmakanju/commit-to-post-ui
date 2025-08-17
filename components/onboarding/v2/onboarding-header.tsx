import React from "react";

// eslint-disable-next-line import/no-unresolved
import { Span } from "@/components/general/micro/typography";
// eslint-disable-next-line import/no-unresolved
import { Step } from "@/types/onboarding";

interface OnboardingHeaderProps {
	currentStep: number;
	totalSteps: number;
	stepData: Step;
}

export const OnboardingHeader: React.FC<OnboardingHeaderProps> = ({
	currentStep,
	totalSteps,
	stepData,
}) => (
	<header className="mb-8 lg:mb-12">
		<div className="mb-3 hidden text-sm font-medium text-gray-500 lg:flex">
			Step {currentStep} of {totalSteps}
		</div>
		<h1 className="mb-4 text-3xl font-light text-arch-black lg:text-5xl">
			{stepData.title}
			{stepData.optional && (
				<span className="ml-3 text-base text-gray-400 lg:text-lg">
					(optional)
				</span>
			)}
		</h1>
		<Span className="text-base leading-relaxed text-gray-600 lg:text-lg">
			{stepData.subtitle}
		</Span>
	</header>
);
