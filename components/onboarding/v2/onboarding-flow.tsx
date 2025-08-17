/* eslint-disable import/no-unresolved */
"use client";
import { useRouter } from "next/navigation";
import React from "react";

import { Span } from "@/components/general/micro/typography";
import Logo from "@/components/navigation/top_navigation/logo";
import { Button } from "@/components/ui/button";
import { clearCookies } from "@/lib/cookies/create-cookies";
import { useOnboarding } from "@/lib/use-onboarding";
import { signOut } from "@/server-actions/auth/signout";
import { OnboardingConfig, Step } from "@/types/onboarding";
import useLogoutStore from "@/zustand/logout-store";
import useOrganizationStore from "@/zustand/useorganization-store";
import useUserStore from "@/zustand/useuser-store";

import OnboardingMain from "./onboarding-main";
import { OnboardingSidebar } from "./onboarding-sidebar";
import { ProgressBar } from "./progress-bar";

interface OnboardingFlowProps {
	className?: string;
	config: OnboardingConfig;
	onComplete?: () => void;
	onStepContent?: (step: Step) => React.ReactNode;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
	config,
	onComplete,
	onStepContent,
	className = "",
}) => {
	const router = useRouter();
	const userStore = useUserStore();
	const logoutStore = useLogoutStore();
	const organizationStore = useOrganizationStore();

	const {
		totalSteps,
		handleNext,
		handleBack,
		handleSkip,
		isLastStep,
		currentStep,
		isFirstStep,
		completedSteps,
		currentStepData,
		handleStepClick,
		canNavigateToStep,
		isCurrentStepCompleted,
		areAllRequiredStepsCompleted,
		getFirstIncompleteRequiredStep,
	} = useOnboarding(config.steps);
	const logoutClient = async () => {
		organizationStore.clearOrganization();
		logoutStore.setLogout(true);
		userStore.clearUser();
		await clearCookies();
		await signOut({ redirect: false });

		router.push("/");
	};

	const handleNextWithComplete = () => {
		if (isLastStep && onComplete) {
			onComplete();
		} else {
			handleNext();
		}
	};

	const shouldShowProgress = config.showProgress !== false;
	const shouldShowSkip = config.allowSkipOptional !== false;

	return (
		<div
			className={`container mx-auto min-h-screen w-full px-4 sm:px-6 lg:px-8 ${className}`}
		>
			{/* Mobile Layout */}
			<div className="block lg:hidden">
				<div className="py-6">
					<div className="flex w-full items-center justify-between">
						<Logo />
						<Button
							type="button"
							onClick={() => logoutClient()}
							className="flex h-auto items-center space-x-2 border-transparent bg-transparent py-0 text-sm text-gray-600 no-underline underline-offset-1 shadow-none transition-colors hover:border-none hover:bg-transparent hover:text-arch-black hover:underline hover:shadow-none"
						>
							<span>Logout</span>
						</Button>
					</div>

					{shouldShowProgress && (
						<div className="mt-6">
							<Span className="text-sm text-gray-500">
								Step {currentStep} of {totalSteps}
							</Span>
							<ProgressBar
								steps={config.steps}
								currentStep={currentStep}
								completedSteps={completedSteps}
							/>
						</div>
					)}
				</div>
				<OnboardingMain
					totalSteps={totalSteps}
					isLastStep={isLastStep}
					isFirstStep={isFirstStep}
					currentStep={currentStep}
					stepData={currentStepData}
					onStepClick={handleStepClick}
					onNext={handleNextWithComplete}
					isCurrentStepCompleted={isCurrentStepCompleted}
					onSkip={shouldShowSkip ? handleSkip : undefined}
					areAllRequiredStepsCompleted={areAllRequiredStepsCompleted}
					getFirstIncompleteRequiredStep={getFirstIncompleteRequiredStep}
					onBack={config.allowBackNavigation === false ? () => {} : handleBack}
				>
					{onStepContent?.(currentStepData)}
				</OnboardingMain>
			</div>

			{/* Desktop Layout */}
			<div className="hidden lg:flex lg:min-h-screen lg:py-8">
				<OnboardingSidebar
					steps={config.steps}
					currentStep={currentStep}
					onStepClick={handleStepClick}
					completedSteps={completedSteps}
					canNavigateToStep={canNavigateToStep}
				/>
				<OnboardingMain
					totalSteps={totalSteps}
					isLastStep={isLastStep}
					currentStep={currentStep}
					isFirstStep={isFirstStep}
					stepData={currentStepData}
					onStepClick={handleStepClick}
					onNext={handleNextWithComplete}
					isCurrentStepCompleted={isCurrentStepCompleted}
					onSkip={shouldShowSkip ? handleSkip : undefined}
					areAllRequiredStepsCompleted={areAllRequiredStepsCompleted}
					getFirstIncompleteRequiredStep={getFirstIncompleteRequiredStep}
					onBack={config.allowBackNavigation === false ? () => {} : handleBack}
				>
					{onStepContent?.(currentStepData)}
				</OnboardingMain>
			</div>
		</div>
	);
};
