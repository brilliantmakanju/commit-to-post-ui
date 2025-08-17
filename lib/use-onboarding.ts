"use client";
import { useCallback, useEffect, useMemo, useState } from "react";

import useRetrieveConnectedRepos from "@/hooks/core/repo/get-repo-hook";
import useOrganizationStore from "@/zustand/useorganization-store";

import { Step } from "../types/onboarding";

export const useOnboarding = (steps: Step[], initialStep = 1) => {
	const githubConnected = useOrganizationStore(
		state =>
			state.organization.github_installation_status === "active" &&
			!!state.organization.github_installation_id,
	);
	const { organization } = useOrganizationStore();
	const { totalRepositories } = useRetrieveConnectedRepos();
	const [currentStep, setCurrentStep] = useState(initialStep);
	const [completedSteps, setCompletedSteps] = useState<Set<number>>(
		new Set([]),
	);

	useEffect(() => {
		if (githubConnected) {
			setCompletedSteps(previous => new Set([...previous, 1]));
		}

		if (
			Array.isArray(organization.socials) &&
			organization.socials.length > 0
		) {
			setCompletedSteps(previous => new Set([...previous, 2]));
		}

		if (totalRepositories >= 1) {
			setCompletedSteps(previous => new Set([...previous, 3]));
		}
	}, [githubConnected, organization.socials, totalRepositories]);

	const currentStepData = useMemo(
		() => steps.find(step => step.id === currentStep) || steps[0],
		[steps, currentStep],
	);

	const totalSteps = steps.length;
	const isFirstStep = currentStep === 1;
	const isLastStep = currentStep == totalSteps;

	const canNavigateToStep = useCallback(
		(stepId: number) => {
			return stepId <= currentStep || completedSteps.has(stepId);
		},
		[currentStep, completedSteps],
	);

	// Function to check if current step is completed
	const isCurrentStepCompleted = useCallback(() => {
		switch (currentStep) {
			case 1: {
				// GitHub Connection
				return githubConnected;
			}
			case 2: {
				// Social Connections
				return !!organization?.socials && organization.socials.length > 0;
			} // Placeholder - will be enhanced
			case 3: {
				// Repository Selection
				return totalRepositories >= 1;
			}
			case 4: {
				// Setup Complete
				return true;
			} // Always allow completion
			default: {
				return false;
			}
		}
	}, [currentStep, githubConnected, organization.socials, totalRepositories]);

	// Function to check if all required steps are completed
	const areAllRequiredStepsCompleted = useCallback(() => {
		const requiredSteps = steps.filter(step => !step.optional);

		for (const step of requiredSteps) {
			switch (step.id) {
				case 1: {
					if (!githubConnected) return false;
					break;
				}
				case 2: {
					if (!organization?.socials || organization.socials.length === 0)
						return false;
					break;
				}
				case 3: {
					if (totalRepositories < 1) return false;
					break;
				}
				case 4: {
					// Setup Complete step is always considered completed
					break;
				}
			}
		}
		return true;
	}, [steps, githubConnected, organization.socials, totalRepositories]);

	// Function to get the first incomplete required step
	const getFirstIncompleteRequiredStep = useCallback(() => {
		const requiredSteps = steps.filter(step => !step.optional);

		for (const step of requiredSteps) {
			switch (step.id) {
				case 1: {
					if (!githubConnected) return step;
					break;
				}
				case 2: {
					if (!organization?.socials || organization.socials.length === 0)
						return step;
					break;
				}
				case 3: {
					if (totalRepositories < 1) return step;
					break;
				}
				case 4: {
					// Setup Complete step is always considered completed
					break;
				}
			}
		}
		return;
	}, [steps, githubConnected, organization.socials, totalRepositories]);

	const handleNext = useCallback(() => {
		if (!isLastStep) {
			setCompletedSteps(previous => new Set([...previous, currentStep]));
			setCurrentStep(previous => previous + 1);
		}
	}, [currentStep, isLastStep]);

	const handleBack = useCallback(() => {
		if (!isFirstStep) {
			setCurrentStep(previous => previous - 1);
		}
	}, [isFirstStep]);

	const handleSkip = useCallback(() => {
		if (!isLastStep && currentStepData.optional) {
			setCurrentStep(previous => previous + 1);
		}
	}, [currentStepData.optional, isLastStep]);

	const handleStepClick = useCallback(
		(stepId: number) => {
			if (canNavigateToStep(stepId)) {
				setCurrentStep(stepId);
			}
		},
		[canNavigateToStep],
	);

	const markStepCompleted = useCallback((stepId: number) => {
		setCompletedSteps(previous => new Set([...previous, stepId]));
	}, []);

	return {
		totalSteps,
		isLastStep,
		handleNext,
		handleBack,
		handleSkip,
		isFirstStep,
		currentStep,
		completedSteps,
		handleStepClick,
		currentStepData,
		markStepCompleted,
		canNavigateToStep,
		isCurrentStepCompleted,
		areAllRequiredStepsCompleted,
		getFirstIncompleteRequiredStep,
	};
};
