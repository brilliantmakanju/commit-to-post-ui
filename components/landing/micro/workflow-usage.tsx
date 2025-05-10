/* eslint-disable import/no-unresolved */
"use client";
import { CheckCircle, Edit, Github, Send } from "lucide-react";
import type React from "react";
import { forwardRef, useRef } from "react";

import { Heading, Paragraph } from "@/components/general/micro/typography";
import { AnimatedGridPattern } from "@/components/magicui/animated-grid-pattern";
import { MagicCard } from "@/components/magicui/magic-card";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const Circle = forwardRef<
	HTMLDivElement,
	{
		className?: string;
		children?: React.ReactNode;
		active?: boolean;
	}
>(({ className, children, active = false }, ref) => {
	return (
		<div
			ref={ref}
			className={cn(
				"z-10 flex items-center justify-center rounded-xl border backdrop-blur-sm transition-all duration-300",
				// Responsive sizing and padding
				"size-10 p-2 sm:size-12 sm:p-2.5 md:size-14 md:p-3 lg:size-16 lg:p-3",
				"border-[#969DAD] border-opacity-15 bg-[#f4f4f4] shadow-lg dark:border-gray-600 dark:bg-black dark:shadow-xl",
				active &&
					"border-gray-500 bg-gray-100 dark:bg-gray-800 dark:ring-1 dark:ring-gray-500",
				className,
			)}
		>
			{children}
		</div>
	);
});
Circle.displayName = "Circle";

interface Step {
	number: number;
	title: string;
	highlight: string;
	description: string;
	icon: React.ElementType;
}

interface WorkflowProps {
	steps?: Step[];
}

const defaultSteps: Step[] = [
	{
		number: 1,
		title: "Sign up & connect",
		highlight: "your accounts",
		description:
			"Start by signing in securely with Magic Link. Then, seamlessly connect your GitHub and social media accounts to unlock automation.",
		icon: CheckCircle,
	},
	{
		number: 2,
		title: "Push code to",
		highlight: "your repository",
		description:
			"Every time you push code to your GitHub repo, we detect changes, analyze commit messages, and prepare smart content drafts for your audience.",
		icon: Github,
	},
	{
		number: 3,
		title: "Refine & preview",
		highlight: "your content",
		description:
			"Preview the AI-generated posts — fine-tune the tone, adjust the message, or personalize it to match your unique style and voice.",
		icon: Edit,
	},
	{
		number: 4,
		title: "Schedule &",
		highlight: "auto-post",
		description:
			"Publish instantly or schedule posts for later. Let the AI manage consistent posting to keep your audience engaged, even while you sleep.",
		icon: Send,
	},
];

export function WorkflowDemo({ steps = defaultSteps }: WorkflowProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	return (
		<section className="container mx-auto flex w-full flex-col gap-4 px-4 sm:gap-6 sm:px-6 md:gap-8">
			<div className="flex w-full flex-col items-center justify-center gap-1 text-center sm:gap-2">
				<Paragraph
					className={
						"mb-1 flex w-full items-center justify-center text-center text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400 sm:mb-2"
					}
				>
					How It Works
				</Paragraph>
				<Heading
					as="h3"
					className={"text-xl font-bold text-black sm:text-2xl md:text-3xl"}
				>
					Automate Your GitHub Activity with Ease
				</Heading>
			</div>

			<div
				className="shadow-fade relative mx-auto mb-1 w-full max-w-[1200px] overflow-hidden rounded-lg border border-[#969DAD] border-opacity-15 bg-white font-sans sm:rounded-xl"
				// Responsive padding
				style={{
					padding: "clamp(0.5rem, 1vw, 5rem)",
				}}
				ref={containerRef}
			>
				<div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-4 lg:gap-12">
					{steps.map((step, index) => (
						<Card key={index} className="overflow-hidden border-[#f4f4f4]">
							<MagicCard
								gradientColor="#969dadb0"
								className={cn(
									"relative flex w-full justify-between border border-[#f4f4f4]",
									// Responsive height using min-height to ensure content fits
									"min-h-[200px] sm:min-h-[240px] md:min-h-[280px] lg:min-h-[320px]",
								)}
							>
								<AnimatedGridPattern
									numSquares={10}
									width={10}
									height={10}
									maxOpacity={0.05}
									duration={3}
									repeatDelay={1}
									className={cn(
										"[mask-image:radial-gradient(120px_circle_at_center,white,transparent)]",
										"inset-x-0 inset-y-[-35%] h-[200%] skew-y-0",
									)}
								/>
								<CardContent className="relative flex h-full flex-col items-end justify-between p-0">
									{/* Top section with icon */}
									<div className="flex w-full items-end justify-end px-3 pt-4 sm:px-4 sm:pt-5 md:px-5 md:pt-6 lg:px-6 lg:pt-8">
										<Circle className="mb-4">
											<step.icon className="size-4 text-gray-900 dark:text-gray-100 sm:size-5 md:size-6 lg:size-8" />
										</Circle>
									</div>

									{/* Bottom section with text */}
									<div className="flex w-full flex-col items-start p-3 pt-0 text-start sm:p-4 md:p-5 lg:p-6">
										<p className="text-base font-medium text-gray-900 dark:text-gray-100 sm:text-lg md:text-lg lg:text-xl">
											{step.title}{" "}
											<span className="font-semibold text-gray-700 dark:text-gray-400">
												{step.highlight}
											</span>
										</p>
										<p className="mt-2 text-xs text-gray-700 dark:text-gray-300 sm:text-sm">
											{step.description}
										</p>
									</div>
								</CardContent>
							</MagicCard>
						</Card>
					))}
				</div>
			</div>
		</section>
	);
}
