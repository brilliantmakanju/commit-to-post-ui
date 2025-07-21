"use client";
import {
	motion,
	MotionValue,
	useMotionValueEvent,
	useScroll,
	useTransform,
} from "motion/react";
import React, { useRef, useState } from "react";

// Type-safe utility function
const cn = (...classes: (string | undefined | null | boolean)[]): string =>
	classes.filter(Boolean).join(" ");

// TypeScript interfaces
interface ContentItem {
	title: string;
	description: string;
	content?: React.ReactNode;
}

interface StickyScrollProps {
	content: ContentItem[];
	contentClassName?: string;
}

export const StickyScroll: React.FC<StickyScrollProps> = ({
	content,
	contentClassName,
}) => {
	const [activeCard, setActiveCard] = useState<number>(0);
	const containerRef = useRef<HTMLDivElement>(null);
	const { scrollYProgress } = useScroll({
		target: containerRef,
		offset: ["start start", "end end"],
	});

	const cardLength = content.length;

	useMotionValueEvent(scrollYProgress, "change", (latest: number) => {
		const cardsBreakpoints = content.map(
			(_, index: number) => index / cardLength,
		);
		const closestBreakpointIndex = cardsBreakpoints.reduce(
			(accumulator: number, breakpoint: number, index: number) => {
				const distance = Math.abs(latest - breakpoint);
				if (distance < Math.abs(latest - cardsBreakpoints[accumulator])) {
					return index;
				}
				return accumulator;
			},
			0,
		);
		setActiveCard(closestBreakpointIndex);
	});

	// Minimalist gradient backgrounds - subtle black/white variations
	const backgroundGradients: string[] = [
		"linear-gradient(135deg, #000000 0%, #1a1a1a 100%)",
		"linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
		"linear-gradient(135deg, #2d2d2d 0%, #000000 100%)",
		"linear-gradient(135deg, #0a0a0a 0%, #1f1f1f 100%)",
	];

	const backgroundOpacity = useTransform(scrollYProgress, [0, 1], [0.8, 1]);

	return (
		<div ref={containerRef} className="relative">
			{/* Background with animated gradient - only affects this section */}
			<motion.div
				className="absolute inset-0 -z-10"
				style={{
					background:
						backgroundGradients[activeCard % backgroundGradients.length],
					opacity: backgroundOpacity,
				}}
			/>

			{/* Main container */}
			<div className="relative min-h-screen bg-black">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="grid min-h-screen gap-8 lg:grid-cols-2 lg:gap-16">
						{/* Left side - Scrolling content */}
						<div className="flex flex-col justify-start py-[200px]">
							<div className="pt-[90px]">
								{content.map((item: ContentItem, index: number) => (
									<motion.div
										key={`content-${index}-${item.title}`}
										className="relative flex min-h-[400px] items-center lg:min-h-[300px]"
										initial={{ opacity: 0, y: 50 }}
										whileInView={{ opacity: 1, y: 0 }}
										viewport={{ once: false, amount: 0.3 }}
										transition={{ duration: 0.6, delay: 0.1 }}
									>
										<motion.div
											animate={{
												opacity: activeCard === index ? 1 : 0.4,
												scale: activeCard === index ? 1 : 0.95,
											}}
											transition={{ duration: 0.5, ease: "easeInOut" }}
											className="w-full space-y-6"
										>
											<motion.h2
												className="text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl xl:text-6xl"
												animate={{
													opacity: activeCard === index ? 1 : 0.6,
												}}
											>
												{item.title}
											</motion.h2>
											<motion.p
												className="max-w-lg text-lg leading-relaxed text-gray-300 sm:text-xl"
												animate={{
													opacity: activeCard === index ? 1 : 0.5,
												}}
											>
												{item.description}
											</motion.p>
										</motion.div>

										{/* Active indicator */}
										<motion.div
											className="absolute -left-6 top-1/2 w-1 -translate-y-1/2 transform rounded-full bg-white"
											animate={{
												height: activeCard === index ? "60px" : "0px",
												opacity: activeCard === index ? 1 : 0,
											}}
											transition={{ duration: 0.3 }}
										/>
									</motion.div>
								))}
							</div>
						</div>

						{/* Right side - Sticky content */}
						<div className="relative lg:sticky lg:top-20 lg:flex lg:h-[calc(100vh-160px)] lg:items-center">
							<div className="w-full">
								<motion.div
									className={cn(
										"aspect-square w-full overflow-hidden rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900 to-black shadow-2xl lg:aspect-[4/3] lg:h-96 xl:h-[450px]",
										contentClassName,
									)}
									animate={{
										scale:
											activeCard % 2 === 0 ? [0.98, 1, 0.98] : [1, 0.98, 1],
										rotateY: activeCard * 3,
									}}
									transition={{
										duration: 3,
										repeat: Infinity,
										ease: "easeInOut",
									}}
								>
									<motion.div
										key={`card-${activeCard}`}
										initial={{ opacity: 0, scale: 0.9 }}
										animate={{ opacity: 1, scale: 1 }}
										exit={{ opacity: 0, scale: 0.9 }}
										transition={{ duration: 0.6 }}
										className="flex h-full w-full items-center justify-center p-8"
									>
										{content[activeCard]?.content || (
											<div className="space-y-6 text-center">
												<motion.div
													className="mx-auto h-20 w-20 rounded-full bg-white"
													animate={{
														rotate: 360,
													}}
													transition={{
														duration: 8,
														repeat: Infinity,
														ease: "linear",
													}}
												/>
												<h3 className="text-2xl font-bold text-white">
													{content[activeCard]?.title}
												</h3>
												<p className="max-w-xs text-sm text-gray-400">
													Interactive Content Area
												</p>
											</div>
										)}
									</motion.div>
								</motion.div>

								{/* Progress indicator */}
								<div className="mt-6 flex justify-center space-x-3">
									{content.map((_, index: number) => (
										<motion.div
											key={`indicator-${index}`}
											className="h-2 w-2 cursor-pointer rounded-full bg-gray-600"
											animate={{
												backgroundColor:
													activeCard === index ? "#ffffff" : "#4b5563",
												scale: activeCard === index ? 1.3 : 1,
											}}
											transition={{ duration: 0.3 }}
											whileHover={{ scale: 1.2 }}
											onClick={() => setActiveCard(index)}
										/>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
