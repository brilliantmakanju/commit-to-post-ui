/* eslint-disable import/no-unresolved */
"use client";
import { Link, Send } from "lucide-react";
import type React from "react";
import { forwardRef, useRef } from "react";
import { BiLinkExternal } from "react-icons/bi";
import { FaCodeBranch, FaGithub, FaPaperPlane } from "react-icons/fa";

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
		title: "Connect",
		highlight: "accounts",
		description:
			"Sign up instantly with a magic link. Then connect GitHub and your socials so we can sync your work and help you share it.",
		// Fallback icon options (if no Lottie):
		icon: BiLinkExternal, // or "FaLink", "BiGitBranch", "FaUserPlus"
	},
	{
		number: 2,
		title: "Push",
		highlight: "code",
		description:
			"Each time you commit, we fetch the update, understand the message, and create a ready-to-share post for you.",
		icon: FaCodeBranch, // or "BiGitCommit", "FaCode", "BiTerminal"
	},
	{
		number: 3,
		title: "Share",
		highlight: "instantly",
		description:
			"Review your post in seconds. Make edits if you want, then publish or schedule to Twitter or LinkedIn with one click.",
		icon: FaPaperPlane, // or "BiShare", "FaShareAlt", "BiSend"
	},
];

export function WorkflowDemo({ steps = defaultSteps }: WorkflowProps) {
	const containerRef = useRef<HTMLDivElement>(null);

	return (
		<section className="container mx-auto flex w-full flex-col gap-4 px-4 sm:gap-6 sm:px-6 md:gap-8">
			<div className="flex w-full flex-col items-center justify-center gap-1 text-center sm:gap-2">
				<Paragraph
					className={
						"mb-1 flex w-auto items-center justify-center rounded-full bg-gray-900 px-4 py-2 text-center text-xs uppercase tracking-wider text-zinc-100 dark:text-zinc-400 sm:mb-2 md:text-sm"
					}
				>
					<span className="mr-3 h-2 w-2 rounded-full bg-gray-100" /> How It
					Works
				</Paragraph>
				<Heading
					as="h3"
					className={"text-md md:text-md font-bold text-gray-900"}
				>
					Automate Your GitHub Content
				</Heading>
			</div>

			<div
				className="w-full overflow-hidden"
				style={{
					padding: "clamp(0.5rem, 1vw, 5rem)",
				}}
				ref={containerRef}
			>
				<div className="grid grid-cols-1 gap-4 px-4 sm:gap-6 sm:px-8 md:grid-cols-2 md:gap-6 md:px-12 lg:grid-cols-3 lg:gap-8 lg:px-16 xl:px-20">
					{steps.map((step, index) => (
						<Card
							key={index}
							className="border-none bg-transparent p-2 shadow-none sm:p-3 md:p-4"
						>
							<MagicCard
								gradientColor="#969dadb0"
								gradientFrom="red"
								gradientTo="blue"
								className={cn(
									"relative flex w-full justify-between border-none",
									"min-h-[280px] overflow-hidden rounded-xl sm:min-h-[320px] md:min-h-[360px] lg:min-h-[400px]",
								)}
							>
								<AnimatedGridPattern
									width={10}
									height={10}
									duration={3}
									repeatDelay={1}
									numSquares={10}
									maxOpacity={0.05}
									className={cn(
										"[mask-image:radial-gradient(120px_circle_at_center,white,transparent)]",
										"inset-x-0 inset-y-[-35%] h-[200%] skew-y-0",
									)}
								/>

								<CardContent className="relative flex h-full w-full flex-col p-0">
									{/* Step number positioned at top-left */}
									<div className="absolute left-3 top-3 z-10 sm:left-4 sm:top-4 md:left-5 md:top-5">
										<Circle className="flex size-7 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-zinc-100 sm:size-8 sm:text-sm md:size-9 md:text-sm lg:size-10 lg:text-base">
											{index + 1}
										</Circle>
									</div>

									{/* Icon positioned at top-right */}
									<div className="absolute right-3 top-3 z-10 sm:right-4 sm:top-4 md:right-5 md:top-5">
										<div className="flex size-7 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm sm:size-8 md:size-9 lg:size-10">
											<step.icon className="size-3 text-gray-900 dark:text-gray-100 sm:size-4 md:size-5 lg:size-5" />
										</div>
									</div>

									{/* Content section - properly spaced from top */}
									<div className="sm:pt-18 flex h-full flex-col justify-end p-3 pb-4 pt-16 sm:p-4 sm:pb-5 md:p-5 md:pb-6 md:pt-20 lg:p-6 lg:pb-8 lg:pt-24">
										<div className="space-y-2 sm:space-y-3 md:space-y-4">
											<h3 className="text-sm font-medium leading-tight text-gray-900 dark:text-gray-100 sm:text-base md:text-lg lg:text-xl">
												{step.title}{" "}
												<span className="font-semibold text-gray-700 dark:text-gray-400">
													{step.highlight}
												</span>
											</h3>
											<p className="text-xs leading-relaxed text-gray-700 dark:text-gray-300 sm:text-sm md:text-base lg:text-base">
												{step.description}
											</p>
										</div>
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
