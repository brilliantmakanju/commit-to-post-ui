"use client";
import {
	FaChartLine,
	FaCodeBranch,
	FaGlobe,
	FaHandHoldingHeart,
	FaMagic,
	FaRegClock,
	FaRobot,
	FaRocket,
} from "react-icons/fa";

// eslint-disable-next-line import/no-unresolved
import { Heading } from "@/components/general/micro/typography";
// eslint-disable-next-line import/no-unresolved
import { StickyScroll } from "@/components/ui/sticky-scroll-reveal";
// eslint-disable-next-line import/no-unresolved
import { cn } from "@/lib/utils";

export function FeaturesSectionDemo() {
	const features = [
		{
			title: "AI-Powered Commit Summaries",
			description:
				"Instantly turn your raw Git commits into clear, engaging social content — no writing required.",
			icon: <FaMagic />,
		},
		{
			title: "First to Market",
			description:
				"The original platform built to transform commits into posts. Join the front line of a new content era.",
			icon: <FaRocket />,
		},
		{
			title: "Multi-Platform Publishing",
			description:
				"Auto-post to LinkedIn, Slack, and Discord in one click. Maximum visibility, zero copy-paste.",
			icon: <FaGlobe />,
		},
		{
			title: "Fresh Commits Only",
			description:
				"We focus only on your latest work — no outdated commits, no clutter, just current progress.",
			icon: <FaCodeBranch />,
		},
		{
			title: "Smart Hashtags & Formatting",
			description:
				"Let AI handle tags, structure, and styling so your posts stand out — with zero manual effort.",
			icon: <FaRobot />,
		},
		{
			title: "Level Up Your Build in Public",
			description:
				"Stay consistent and visible with smart, automated updates tailored for devs and indie hackers.",
			icon: <FaChartLine />,
		},
		{
			title: "Full Control Before Publishing",
			description:
				"Preview and tweak every post before it goes live. You're always in control of your narrative.",
			icon: <FaRegClock />,
		},
		{
			title: "Built by Developers, for Developers",
			description:
				"Crafted with love by builders who get it. This tool respects your time, workflow, and momentum.",
			icon: <FaHandHoldingHeart />,
		},
	];

	return (
		<section
			id="why-choose-us"
			className="container mx-auto flex w-full flex-col gap-8"
		>
			<div className="flex w-full flex-col items-center justify-center gap-2 text-center">
				<p className="text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
					Built Different
				</p>
				<Heading className="text-2xl font-bold text-gray-900 dark:text-white">
					Tools That Actually Do the Work
				</Heading>
				<p className="text-sm text-gray-600 dark:text-gray-400">
					Everything you need to grow your reach while keeping your dev flow
					smooth.
				</p>
			</div>

			<div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 py-10 md:grid-cols-2 lg:grid-cols-4">
				{features.map((feature, index) => (
					<Feature key={feature.title} {...feature} index={index} />
				))}
			</div>
		</section>
	);
}

const Feature = ({
	title,
	description,
	icon,
	index,
}: {
	title: string;
	description: string;
	icon: React.ReactNode;
	index: number;
}) => {
	return (
		<div
			className={cn(
				"group/feature relative flex flex-col py-10 dark:border-neutral-800 lg:border-r",
				(index === 0 || index === 4) && "dark:border-neutral-800 lg:border-l",
				index < 4 && "dark:border-neutral-800 lg:border-b",
			)}
		>
			{index < 4 && (
				<div className="pointer-events-none absolute inset-0 h-full w-full bg-gradient-to-t from-neutral-100 to-transparent opacity-0 transition duration-200 group-hover/feature:opacity-100 dark:from-neutral-800" />
			)}
			{index >= 4 && (
				<div className="pointer-events-none absolute inset-0 h-full w-full bg-gradient-to-b from-neutral-100 to-transparent opacity-0 transition duration-200 group-hover/feature:opacity-100 dark:from-neutral-800" />
			)}
			<div className="relative z-10 mb-4 px-10 text-neutral-600 dark:text-neutral-400">
				{icon}
			</div>
			<div className="relative z-10 mb-2 px-10 text-lg font-bold">
				<div className="absolute inset-y-0 left-0 h-6 w-1 origin-center rounded-br-full rounded-tr-full bg-neutral-300 transition-all duration-200 group-hover/feature:h-8 group-hover/feature:bg-blue-500 dark:bg-neutral-700" />
				<span className="inline-block text-neutral-800 transition duration-200 group-hover/feature:translate-x-2 dark:text-neutral-100">
					{title}
				</span>
			</div>
			<p className="relative z-10 max-w-xs px-10 text-sm text-neutral-600 dark:text-neutral-300">
				{description}
			</p>
		</div>
	);
};
