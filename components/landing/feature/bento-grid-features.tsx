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
			<div className="absolute right-[40px] top-4 mt-[-60px] h-[300px] border-none bg-transparent pt-24 transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] group-hover:scale-105">
				<div className="relative w-full max-w-[500px] overflow-hidden rounded-lg border bg-background p-4 shadow-xl">
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<div className="h-3 w-3 rounded-full bg-red-500" />
							<div className="h-3 w-3 rounded-full bg-yellow-500" />
							<div className="h-3 w-3 rounded-full bg-green-500" />
							<div className="ml-2 text-xs text-muted-foreground">Terminal</div>
						</div>
						<div className="space-y-2 font-mono text-sm">
							<div className="text-muted-foreground">
								$ git commit -m &#34;Add user authentication flow&#34;
							</div>
							<div className="text-green-500">
								[main 3a7c2d1] Add user authentication flow
							</div>
							<div className="text-green-500">✓ Analyzing commit...</div>
							<div className="text-green-500">✓ Generating content...</div>
							<div className="text-green-500">✓ Post created for LinkedIn!</div>
							<div className="mt-4 rounded-md border p-3">
								<div className="text-xs text-muted-foreground">
									LinkedIn Post Preview:
								</div>
								<p className="mt-2">
									Just shipped a secure authentication system for our platform!
									🔐
									<br />
									<br />• Email magic links for passwordless login
									<br />• Session management with JWT
									<br />• Rate limiting to prevent abuse
									<br />
									<br />
									Small commits, big impact. #WebDev #Security
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
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
		<section
			id="why-choose-us"
			className="con ainer mx-auto flex w-full flex-col gap-8"
		>
			<div className="flex w-full flex-col items-center justify-center gap-2 text-center">
				<Paragraph
					className={
						"mb-2 flex w-full items-center justify-center text-center text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400"
					}
				>
					Why Choose Us
				</Paragraph>
				<Heading as="h3" className={"font-bold text-black"}>
					Supercharge Your Workflow with Automation
				</Heading>
			</div>

			<div className="shadow-fade relative mx-auto mb-1 w-full max-w-[1200px] gap-8 overflow-hidden rounded-xl border border-[#969DAD] border-opacity-15 bg-[#FFFFFF] px-[16px] py-12 font-sans md:px-2 md:py-12 lg:px-12 lg:py-20">
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
