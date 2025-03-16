/* eslint-disable import/no-unresolved */
"use client";
import { Clock, MessageCircle, Puzzle } from "lucide-react";
import React from "react";
import { FaAdjust } from "react-icons/fa";

import { Heading, Paragraph } from "@/components/general/micro/typography";
import { BentoCard, BentoGrid } from "@/components/magicui/bento-grid";
import { Marquee } from "@/components/magicui/marquee";
import { cn } from "@/lib/utils";

import { AnimatedBeamMultipleOutputDemo } from "../micro/usage-flow";
import AnimatedListDemo from "./other/animated-list-demo";
const features = [
	{
		Icon: Puzzle,
		name: "Effortless Integration",
		description: "Get started in minutes with our simple setup process.",
		href: "#",
		className: "col-span-3 md:col-span-1",
		background: (
			<Marquee
				pauseOnHover
				className="absolute top-10 [--duration:20s] [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)]"
			>
				{["Connect GitHub", "Monitor Repos", "Sync Socials"].map(
					(item, index) => (
						<figure
							key={index}
							className={cn(
								"relative w-32 cursor-pointer overflow-hidden rounded-xl border p-4",
								"border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
								"dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
								"transform-gpu blur-[1px] transition-all duration-300 ease-out hover:blur-none",
							)}
						>
							<figcaption className="text-sm font-medium dark:text-white">
								{item}
							</figcaption>
						</figure>
					),
				)}
			</Marquee>
		),
	},
	{
		Icon: Clock,
		name: "Automated Updates",
		description: "AI-powered automation that keeps your social media fresh.",
		href: "#",
		className: "col-span-3 md:col-span-2",
		background: (
			<AnimatedListDemo className="absolute right-2 top-4 h-[300px] w-full scale-75 border-none transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] group-hover:scale-90" />
		),
	},
	{
		Icon: MessageCircle,
		name: "Smart Social Posting",
		description: "AI optimizes your content for maximum reach and engagement.",
		href: "#",
		className: "col-span-3 md:col-span-2",
		background: (
			<AnimatedBeamMultipleOutputDemo
				classic
				className="absolute right-2 top-4 mt-[-10px] h-[300px] border-none bg-transparent pt-24 transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] group-hover:scale-105"
			/>
		),
	},
	{
		Icon: FaAdjust,
		name: "Customizable Tone & Style",
		description:
			"Tailor AI-generated content to match your brand's voice and personality.",
		href: "#",
		className: "col-span-3 md:col-span-1",
		// background: (
		// 	<ToneAdjustmentDemo className="absolute right-2 top-4 w-full scale-75 transition-all duration-300 ease-out group-hover:scale-90" />
		// ),
	},
];

const BentoGridFeature = () => {
	return (
		<section className="container mx-auto flex w-full flex-col gap-8">
			<div className="flex w-full flex-col items-center justify-center gap-2 text-center">
				<Paragraph
					className={
						"mb-2 flex w-full items-center justify-center text-center text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400"
					}
				>
					Why Choose Us
				</Paragraph>
				<Heading as="h3" className={"font-bold text-black"}>
					Powerful Features for Smarter Workflow
				</Heading>
			</div>

			<div
				id="features"
				className="shadow-fade relative mx-auto mb-1 w-full max-w-[1200px] gap-8 overflow-hidden rounded-xl border border-[#969DAD] bg-[#FFFFFF] px-2 py-12 font-sans md:px-2 md:py-12 lg:px-12 lg:py-20"
			>
				<BentoGrid>
					{features.map((feature, index) => (
						<BentoCard key={index} {...feature} />
					))}
				</BentoGrid>
			</div>
		</section>
	);
};

export default BentoGridFeature;
