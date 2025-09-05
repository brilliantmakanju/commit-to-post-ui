/* eslint-disable import/no-unresolved */
import React from "react";

import { Span } from "@/components/general/micro/typography";
import Logo from "@/components/navigation/top_navigation/logo";
import { useSessionManager } from "@/components/tracker/auth-tracker";
import { Button } from "@/components/ui/button";
import { Step } from "@/types/onboarding";

import { StepIndicator } from "./step-indicator";

interface OnboardingSidebarProps {
	steps: Step[];
	currentStep: number;
	showHelpButton?: boolean;
	completedSteps: Set<number>;
	onStepClick: (stepId: number) => void;
	canNavigateToStep: (stepId: number) => boolean;
}

export const OnboardingSidebar: React.FC<OnboardingSidebarProps> = ({
	steps,
	currentStep,
	onStepClick,
	completedSteps,
	canNavigateToStep,
	showHelpButton = true,
}) => {
	const { logout } = useSessionManager();

	const logoutClient = async () => {
		await logout();
	};
	return (
		<aside
			role="navigation"
			aria-label="Onboarding steps"
			className="flex w-80 flex-col border-r border-gray-200"
		>
			<header className="border-b border-gray-200 px-8 py-8">
				<Logo />
				<Span className="mt-4 block text-base text-gray-600">
					Complete the following steps to setup your workspace
				</Span>
			</header>

			<div className="flex-1 px-8 py-8">
				<div className="space-y-4" role="list">
					{steps.map(step => (
						<div key={step.id} role="listitem">
							<StepIndicator
								step={step}
								onClick={onStepClick}
								isCurrent={step.id === currentStep}
								canNavigate={canNavigateToStep(step.id)}
								isCompleted={completedSteps.has(step.id)}
							/>
						</div>
					))}
				</div>
			</div>

			{showHelpButton && (
				<footer className="flex flex-col items-start justify-start gap-2 border-t border-gray-200 px-8 py-6">
					<Button
						type="button"
						onClick={() => logoutClient()}
						className="flex h-auto items-center space-x-2 border-transparent bg-transparent py-0 text-sm text-gray-600 no-underline underline-offset-1 shadow-none transition-colors hover:border-none hover:bg-transparent hover:text-arch-black hover:underline hover:shadow-none"
					>
						<span>Logout</span>
					</Button>
				</footer>
			)}
		</aside>
	);
};
