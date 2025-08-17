import { Check } from "lucide-react";
import React from "react";

import { Step } from "../../../types/onboarding";

interface StepIndicatorProps {
	step: Step;
	isCurrent: boolean;
	isCompleted: boolean;
	canNavigate: boolean;
	onClick: (stepId: number) => void;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
	step,
	onClick,
	isCurrent,
	isCompleted,
	canNavigate,
}) => {
	const handleClick = () => {
		if (canNavigate) {
			onClick(step.id);
		}
	};

	const handleKeyDown = (event_: React.KeyboardEvent) => {
		if ((event_.key === "Enter" || event_.key === " ") && canNavigate) {
			event_.preventDefault();
			onClick(step.id);
		}
	};

	return (
		<div
			className={`rounded-lg border p-4 transition-all duration-200 ${
				isCurrent
					? "border-arch-black bg-gray-50 shadow-sm"
					: isCompleted
						? "border-gray-300 bg-white hover:shadow-sm"
						: "border-gray-200 bg-white hover:border-gray-300"
			} ${
				canNavigate
					? "cursor-pointer focus-within:ring-2 focus-within:ring-arch-black focus-within:ring-opacity-20"
					: "cursor-not-allowed opacity-60"
			}`}
			role="button"
			onClick={handleClick}
			aria-pressed={isCurrent}
			onKeyDown={handleKeyDown}
			aria-disabled={!canNavigate}
			tabIndex={canNavigate ? 0 : -1}
		>
			<div className="flex items-start space-x-4">
				<div
					className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border transition-colors duration-200 ${
						isCompleted
							? "border-arch-black bg-arch-black text-white"
							: isCurrent
								? "border-arch-black bg-white text-arch-black"
								: "border-gray-300 bg-gray-100 text-gray-400"
					}`}
				>
					{isCompleted ? <Check className="h-5 w-5" /> : step.icon}
				</div>

				<div className="min-w-0 flex-1">
					<div className="flex items-center space-x-2">
						<h3
							className={`text-sm font-medium transition-colors duration-200 ${
								isCurrent || isCompleted ? "text-arch-black" : "text-gray-500"
							}`}
						>
							{step.title}
						</h3>
						{step.optional && (
							<span className="text-xs text-gray-400">(optional)</span>
						)}
					</div>
					<p className="mt-1 text-xs leading-relaxed text-gray-500">
						{step.subtitle}
					</p>
				</div>
			</div>
		</div>
	);
};
