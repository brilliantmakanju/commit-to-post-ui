"use client";
import { useEffect, useState } from "react";
import { FaCodeBranch, FaGithub, FaPaperPlane } from "react-icons/fa";

const steps = [
	{
		id: 1,
		title: "Connect",
		description: "Link GitHub and your preferred platforms in seconds.",
		icon: FaGithub,
	},
	{
		id: 2,
		title: "Commit",
		description: "Each push becomes a clean, ready-to-share update.",
		icon: FaCodeBranch,
	},
	{
		id: 3,
		title: "Post",
		description: "Review, edit if needed, then publish instantly.",
		icon: FaPaperPlane,
	},
];

export function WorkflowDemo() {
	const [activeStep, setActiveStep] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setActiveStep(previous => (previous + 1) % steps.length);
		}, 3000);
		return () => clearInterval(interval);
	}, []);

	return (
		<section className="w-full px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
			<div className="mx-auto max-w-6xl">
				{/* Header */}
				<div className="mb-16 text-center sm:mb-20 lg:mb-24">
					<h2 className="mb-4 text-3xl font-bold leading-tight tracking-tight text-gray-900 sm:mb-6 sm:text-4xl lg:text-5xl">
						Connect once. Push as usual.
						<br className="hidden sm:block" />
						<span className="text-gray-600">Post instantly.</span>
					</h2>
				</div>

				{/* Steps Grid */}
				<div className="relative grid grid-cols-1 gap-8 sm:gap-12 md:grid-cols-3 lg:gap-16">
					{/* Connector Lines Background */}
					<div className="absolute left-0 right-0 top-8 hidden h-px sm:top-10 md:block lg:top-12">
						<div className="relative mx-auto h-full max-w-4xl">
							<div className="absolute left-8 right-8 h-px bg-gray-200 sm:left-10 sm:right-10 lg:left-12 lg:right-12"></div>
						</div>
					</div>

					{steps.map((step, index) => {
						const Icon = step.icon;
						const isActive = activeStep === index;

						return (
							<div
								key={step.id}
								className={`relative flex flex-col items-center text-center transition-all duration-500 ease-out ${isActive ? "scale-105" : "scale-100"} `}
							>
								{/* Icon Container with integrated number */}
								<div className="relative mb-6 sm:mb-8">
									{/* Step Number - much closer */}
									<div className="absolute -left-0.5 -top-0.5 z-10 sm:-left-1 sm:-top-1">
										<div
											className={`flex h-4 w-4 items-center justify-center rounded-full text-xs font-bold shadow-sm transition-all duration-300 sm:h-5 sm:w-5 sm:text-xs lg:h-6 lg:w-6 lg:text-sm ${
												isActive
													? "bg-gray-900 text-white shadow-md"
													: "border border-gray-300 bg-white text-gray-600"
											} `}
										>
											{step.id}
										</div>
									</div>

									{/* Icon Container */}
									<div
										className={`flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-500 ease-out sm:h-20 sm:w-20 sm:rounded-3xl lg:h-24 lg:w-24 ${
											isActive
												? "bg-gray-900 shadow-lg"
												: "border border-gray-200 bg-gray-50"
										} `}
									>
										<Icon
											className={`h-7 w-7 transition-colors duration-300 sm:h-9 sm:w-9 lg:h-11 lg:w-11 ${isActive ? "text-white" : "text-gray-600"} `}
										/>
									</div>
								</div>

								{/* Content */}
								<div className="space-y-3 sm:space-y-4">
									<h3 className="text-xl font-semibold text-gray-900 sm:text-2xl lg:text-3xl">
										{step.title}
									</h3>
									<p className="mx-auto max-w-xs text-sm leading-relaxed text-gray-600 sm:text-base lg:text-lg">
										{step.description}
									</p>
								</div>
							</div>
						);
					})}
				</div>

				{/* Progress Indicator */}
				<div className="mt-12 flex justify-center sm:mt-16 lg:mt-20">
					<div className="flex space-x-2">
						{steps.map((_, index) => (
							<div
								key={index}
								className={`h-2 w-2 rounded-full transition-colors duration-300 ${activeStep === index ? "bg-gray-900" : "bg-gray-300"} `}
							/>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}

// <div className="flex w-full flex-col items-center justify-center gap-1 text-center sm:gap-2">
// 	<Paragraph
// 		className={
// 			"mb-1 flex w-auto items-center justify-center rounded-full bg-gray-900 px-4 py-2 text-center text-xs uppercase tracking-wider text-zinc-100 dark:text-zinc-400 sm:mb-2 md:text-sm"
// 		}
// 	>
// 		<span className="mr-3 h-2 w-2 rounded-full bg-gray-100" /> How It
// 		Works
// 	</Paragraph>
// 	<Heading
// 		as="h3"
// 		className={"text-md md:text-md font-bold text-gray-900"}
// 	>
// 		Automate Your GitHub Content
// 	</Heading>
// </div>

// <div
// 	className="w-full overflow-hidden"
// 	style={{
// 		padding: "clamp(0.5rem, 1vw, 5rem)",
// 	}}
// 	ref={containerRef}
// >
// 	<div className="grid grid-cols-1 gap-4 px-4 sm:gap-6 sm:px-8 md:grid-cols-2 md:gap-6 md:px-12 lg:grid-cols-3 lg:gap-8 lg:px-16 xl:px-20">
// 		{steps.map((step, index) => (
// 			<Card
// 				key={index}
// 				className="border-none bg-transparent p-2 shadow-none sm:p-3 md:p-4"
// 			>
// 				<MagicCard
// 					gradientColor="#969dadb0"
// 					gradientFrom="red"
// 					gradientTo="blue"
// 					className={cn(
// 						"relative flex w-full justify-between border-none",
// 						"min-h-[280px] overflow-hidden rounded-xl sm:min-h-[320px] md:min-h-[360px] lg:min-h-[400px]",
// 					)}
// 				>
// 					<AnimatedGridPattern
// 						width={10}
// 						height={10}
// 						duration={3}
// 						repeatDelay={1}
// 						numSquares={10}
// 						maxOpacity={0.05}
// 						className={cn(
// 							"[mask-image:radial-gradient(120px_circle_at_center,white,transparent)]",
// 							"inset-x-0 inset-y-[-35%] h-[200%] skew-y-0",
// 						)}
// 					/>

// 					<CardContent className="relative flex h-full w-full flex-col p-0">
// 						{/* Step number positioned at top-left */}
// 						<div className="absolute left-3 top-3 z-10 sm:left-4 sm:top-4 md:left-5 md:top-5">
// 							<Circle className="flex size-7 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-zinc-100 sm:size-8 sm:text-sm md:size-9 md:text-sm lg:size-10 lg:text-base">
// 								{index + 1}
// 							</Circle>
// 						</div>

// 						{/* Icon positioned at top-right */}
// 						<div className="absolute right-3 top-3 z-10 sm:right-4 sm:top-4 md:right-5 md:top-5">
// 							<div className="flex size-7 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm sm:size-8 md:size-9 lg:size-10">
// 								<step.icon className="size-3 text-gray-900 dark:text-gray-100 sm:size-4 md:size-5 lg:size-5" />
// 							</div>
// 						</div>

// 						{/* Content section - properly spaced from top */}
// 						<div className="sm:pt-18 flex h-full flex-col justify-end p-3 pb-4 pt-16 sm:p-4 sm:pb-5 md:p-5 md:pb-6 md:pt-20 lg:p-6 lg:pb-8 lg:pt-24">
// 							<div className="space-y-2 sm:space-y-3 md:space-y-4">
// 								<h3 className="text-sm font-medium leading-tight text-gray-900 dark:text-gray-100 sm:text-base md:text-lg lg:text-xl">
// 									{step.title}{" "}
// 									<span className="font-semibold text-gray-700 dark:text-gray-400">
// 										{step.highlight}
// 									</span>
// 								</h3>
// 								<p className="text-xs leading-relaxed text-gray-700 dark:text-gray-300 sm:text-sm md:text-base lg:text-base">
// 									{step.description}
// 								</p>
// 							</div>
// 						</div>
// 					</CardContent>
// 				</MagicCard>
// 			</Card>
// 		))}
// 	</div>
// </div>
