import { Check } from "lucide-react";
import React from "react";

// eslint-disable-next-line import/no-unresolved
import { Button } from "@/components/ui/button";

interface ProgressIndicatorProps {
	currentStep: number;
	onBack: () => void;
	onNext: () => void;
	onSetup: () => void;
	isLoading?: boolean;
	selectedRepoCount: number;
	webhookStatus: "idle" | "setting-up" | "success" | "error";
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
	onBack,
	onNext,
	onSetup,
	currentStep,
	webhookStatus,
	selectedRepoCount,
	isLoading = false,
}) => {
	return (
		<div className="mb-10 flex flex-wrap items-center justify-between">
			<div className="flex items-center justify-start space-x-4">
				{[1, 2, 3].map(step => (
					<div key={step} className="flex items-center">
						<div
							className={`flex h-10 w-10 items-center justify-center text-sm font-medium transition-colors ${
								step <= currentStep
									? "bg-arch-black text-white"
									: "border border-gray-600 text-gray-600"
							}`}
						>
							{step < currentStep ? <Check className="h-5 w-5" /> : step}
						</div>
						{step < 3 && (
							<div
								className={`mr-[-17px] h-0.5 w-12 ${
									step < currentStep ? "bg-arch-black" : "bg-gray-600"
								}`}
							/>
						)}
					</div>
				))}
			</div>
			<div className="flex items-center justify-start gap-2">
				<Button
					variant="outline"
					onClick={onBack}
					disabled={
						webhookStatus === "setting-up" || webhookStatus === "success"
					}
					className={`${
						currentStep === 1
							? "border-none border-transparent bg-transparent bg-none shadow-none"
							: "flex"
					}`}
				>
					{currentStep !== 1 && "Back"}
				</Button>
				<Button
					onClick={currentStep === 3 ? onSetup : onNext}
					disabled={
						webhookStatus === "setting-up" ||
						webhookStatus === "success" ||
						(currentStep === 1 && selectedRepoCount === 0) ||
						isLoading
					}
					className="disabled:cursor-not-allowed"
				>
					{webhookStatus === "setting-up" && (
						<div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-black" />
					)}
					{currentStep === 3 ? "Set Up Repo" : "Next"}
				</Button>
			</div>
		</div>
	);
};
