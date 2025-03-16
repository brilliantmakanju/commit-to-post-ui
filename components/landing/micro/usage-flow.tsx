/* eslint-disable import/no-unresolved */
"use client";

import { GitBranchIcon } from "lucide-react";
import React, { forwardRef, useRef } from "react";
import { FaGithub, FaLinkedinIn, FaTiktok, FaTwitter } from "react-icons/fa";

import { AnimatedBeam } from "@/components/magicui/animated-beam";
import { AnimatedAIIcon } from "@/components/wrappers/loaders/all-icons";
import { cn } from "@/lib/utils";

import { BackgroundDots } from "./background-dots";

const Circle = forwardRef<
	HTMLDivElement,
	{ className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
	return (
		<div
			ref={ref}
			className={cn(
				"z-10 flex size-20 items-center justify-center rounded-full border-4 bg-white p-6 shadow-[0_0_40px_-12px_rgba(0,0,0,0.8)]",
				className,
			)}
		>
			{children}
		</div>
	);
});

Circle.displayName = "Circle";

export function AnimatedBeamMultipleOutputDemo({
	classic = false,
	className,
}: {
	classic?: boolean;
	className?: string;
}) {
	const containerRef = useRef<HTMLDivElement>(null);
	const div1Ref = useRef<HTMLDivElement>(null);
	const div2Ref = useRef<HTMLDivElement>(null);
	const div3Ref = useRef<HTMLDivElement>(null);
	const div6Ref = useRef<HTMLDivElement>(null);
	const div7Ref = useRef<HTMLDivElement>(null);

	return (
		<div
			className={cn(
				"relative flex h-full w-[570px] items-center justify-center overflow-hidden rounded-l-xl bg-white p-10 pr-12",
				className,
			)}
			ref={containerRef}
		>
			{!classic && (
				<BackgroundDots className="absolute left-0 top-0 h-full w-full" />
			)}

			<div className="flex size-full w-full flex-row items-stretch justify-between bg-transparent">
				<div className="flex flex-col justify-center">
					<Circle ref={div7Ref}>
						<FaGithub className="h-6 w-6 rotate-[270deg] text-[#333333] md:rotate-0" />
					</Circle>
				</div>
				<div className="flex flex-col justify-center">
					<Circle ref={div6Ref} className="size-24">
						<AnimatedAIIcon color={"#111827"} size={96} />
					</Circle>
				</div>
				<div className="flex flex-col justify-center gap-8">
					<Circle ref={div1Ref}>
						<FaLinkedinIn className="h-6 w-6 rotate-[270deg] text-[#0A66C2] md:rotate-0" />
					</Circle>
					<Circle ref={div2Ref}>
						<FaTwitter className="h-6 w-6 rotate-[270deg] text-[#1DA1F2] md:rotate-0" />
					</Circle>
					<Circle ref={div3Ref}>
						<FaTiktok className="h-6 w-6 rotate-[270deg] text-[#000000] md:rotate-0" />
					</Circle>
				</div>
			</div>

			{/* AnimatedBeams */}
			<AnimatedBeam
				containerRef={containerRef}
				fromRef={div1Ref}
				toRef={div6Ref}
				duration={3}
			/>
			<AnimatedBeam
				containerRef={containerRef}
				fromRef={div2Ref}
				toRef={div6Ref}
				duration={3}
			/>
			<AnimatedBeam
				containerRef={containerRef}
				fromRef={div3Ref}
				toRef={div6Ref}
				duration={3}
			/>
			<AnimatedBeam
				containerRef={containerRef}
				fromRef={div6Ref}
				toRef={div7Ref}
				duration={3}
			/>
		</div>
	);
}

// /* eslint-disable import/no-unresolved */
// "use client";
// import type React from "react";
// import { forwardRef, useRef } from "react";
// import { FaGithub, FaLinkedinIn, FaTiktok, FaTwitter } from "react-icons/fa";

// import { AnimatedBeam } from "@/components/magicui/animated-beam";
// import { AnimatedAIIcon } from "@/components/wrappers/loaders/all-icons";
// import { cn } from "@/lib/utils";

// import { BackgroundDots } from "./background-dots";

// const Circle = forwardRef<
// 	HTMLDivElement,
// 	{ className?: string; children?: React.ReactNode }
// >(({ className, children }, ref) => {
// 	return (
// 		<div
// 			ref={ref}
// 			className={cn(
// 				"z-10 flex items-center justify-center rounded-full border-4 bg-white shadow-[0_0_40px_-12px_rgba(0,0,0,0.8)]",
// 				// Make circles responsive
// 				"size-12 p-3 sm:size-16 sm:p-4 md:size-20 md:p-6",
// 				className,
// 			)}
// 		>
// 			{children}
// 		</div>
// 	);
// });

// Circle.displayName = "Circle";

// export function AnimatedBeamMultipleOutputDemo({
// 	classic = false,
// 	className,
// }: {
// 	classic?: boolean;
// 	className?: string;
// }) {
// 	const containerRef = useRef<HTMLDivElement>(null);
// 	const div1Ref = useRef<HTMLDivElement>(null);
// 	const div2Ref = useRef<HTMLDivElement>(null);
// 	const div3Ref = useRef<HTMLDivElement>(null);
// 	const div6Ref = useRef<HTMLDivElement>(null);
// 	const div7Ref = useRef<HTMLDivElement>(null);

// 	return (
// 		<div
// 			className={cn(
// 				"relative flex items-center justify-center overflow-hidden rounded-xl bg-white p-4 sm:p-6 md:p-10 md:pr-12 lg:rounded-l-xl",
// 				// Make container responsive
// 				"w-full max-w-full md:max-w-[570px]",
// 				className,
// 			)}
// 			ref={containerRef}
// 		>
// 			{!classic && (
// 				<BackgroundDots className="absolute left-0 top-0 h-full w-full" />
// 			)}

// 			<div className="flex w-full flex-col items-center justify-between gap-8 bg-transparent sm:flex-row sm:items-stretch">
// 				{/* GitHub - Positioned differently on mobile */}
// 				<div className="order-1 flex justify-center sm:order-1 sm:flex-col">
// 					<Circle ref={div7Ref}>
// 						<FaGithub className="h-4 w-4 text-[#333333] sm:h-5 sm:w-5 md:h-6 md:w-6" />
// 					</Circle>
// 				</div>

// 				{/* Center AI Icon */}
// 				<div className="order-1 flex justify-center sm:order-2 sm:flex-col">
// 					<Circle ref={div6Ref} className="size-16 sm:size-20 md:size-24">
// 						<AnimatedAIIcon color={"#111827"} size={48} />
// 					</Circle>
// 				</div>

// 				{/* Social Media Icons - Stack horizontally on mobile */}
// 				<div className="order-2 flex flex-row justify-center gap-4 sm:order-3 sm:flex-col sm:gap-8">
// 					<Circle ref={div1Ref}>
// 						<FaLinkedinIn className="h-4 w-4 text-[#0A66C2] sm:h-5 sm:w-5 md:h-6 md:w-6" />
// 					</Circle>
// 					<Circle ref={div2Ref}>
// 						<FaTwitter className="h-4 w-4 text-[#1DA1F2] sm:h-5 sm:w-5 md:h-6 md:w-6" />
// 					</Circle>
// 					<Circle ref={div3Ref}>
// 						<FaTiktok className="h-4 w-4 text-[#000000] sm:h-5 sm:w-5 md:h-6 md:w-6" />
// 					</Circle>
// 				</div>
// 			</div>

// 			{/* AnimatedBeams */}
// 			<AnimatedBeam
// 				containerRef={containerRef}
// 				fromRef={div1Ref}
// 				toRef={div6Ref}
// 				duration={3}
// 			/>
// 			<AnimatedBeam
// 				containerRef={containerRef}
// 				fromRef={div2Ref}
// 				toRef={div6Ref}
// 				duration={3}
// 			/>
// 			<AnimatedBeam
// 				containerRef={containerRef}
// 				fromRef={div3Ref}
// 				toRef={div6Ref}
// 				duration={3}
// 			/>
// 			<AnimatedBeam
// 				containerRef={containerRef}
// 				fromRef={div6Ref}
// 				toRef={div7Ref}
// 				duration={3}
// 			/>
// 		</div>
// 	);
// }
