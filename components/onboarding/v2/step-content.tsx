import React from "react";

// eslint-disable-next-line import/no-unresolved
import { Span } from "@/components/general/micro/typography";
// eslint-disable-next-line import/no-unresolved
import { Step } from "@/types/onboarding";

interface StepContentProps {
	step: Step;
	children?: React.ReactNode;
}

export const StepContent: React.FC<StepContentProps> = ({ step, children }) => (
	<div className="min-h-[300px] lg:min-h-[400px]">
		{children || (
			<div className="flex h-full items-center justify-center">
				<div className="text-center">
					<div className="mb-6 flex justify-center text-arch-black">
						<div className="rounded-full">
							{React.cloneElement(step.icon as React.ReactElement, {
								className: "h-12 w-12 lg:h-16 lg:w-16",
							})}
						</div>
					</div>
					<h3 className="mb-3 text-lg font-medium text-arch-black lg:text-xl">
						{step.content}
					</h3>
					{/* <Span className="text-sm text-gray-600 lg:text-base">
						This is where the {step.title.toLowerCase()} interface would be
						displayed
					</Span> */}
				</div>
			</div>
		)}
	</div>
);
