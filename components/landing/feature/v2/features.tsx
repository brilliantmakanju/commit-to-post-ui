"use client";
import {
	FaChartLine,
	FaGlobe,
	FaMagic,
	FaRegClock,
	FaRobot,
} from "react-icons/fa";

// eslint-disable-next-line import/no-unresolved
import { Heading, Paragraph } from "@/components/general/micro/typography";
// eslint-disable-next-line import/no-unresolved
import { cn } from "@/lib/utils";

export function FeaturesSectionDemo() {
	const features = [
		{
			title: "AI Powered Commit Summaries",
			description:
				"Instantly convert raw Git commits into clean, readable posts. No writing, no stress, just fast and clear updates built for humans.",
			icon: <FaMagic />,
		},
		{
			title: "Multi Platform Publishing",
			description:
				"Automatically publish to LinkedIn, Slack, and Discord in one click. Reach more people without switching tabs or copy pasting anything.",
			icon: <FaGlobe />,
		},
		{
			title: "Smart Hashtags and Formatting",
			description:
				"Let AI handle structure, hashtags, and formatting. Make your posts look polished and engaging without lifting a finger.",
			icon: <FaRobot />,
		},
		{
			title: "Full Control Before Publishing",
			description:
				"Review and edit every post before it goes live. You decide what gets published and how it looks every time.",
			icon: <FaRegClock />,
		},
		{
			title: "Level Up Your Build in Public",
			description:
				"Stay visible and consistent with automatic updates designed for devs, indie hackers, and makers who want to grow in public.",
			icon: <FaChartLine />,
		},
	];

	return (
		<section
			id="why-choose-us"
			className="container mx-auto flex w-full flex-col gap-8"
		>
			<div className="flex w-full flex-col items-center justify-center gap-1 text-center sm:gap-2">
				<Paragraph
					className={
						"mb-1 flex w-auto items-center justify-center rounded-full bg-gray-900 px-4 py-2 text-center text-xs uppercase tracking-wider text-zinc-100 dark:text-zinc-400 sm:mb-2 md:text-sm"
					}
				>
					<span className="mr-3 h-2 w-2 rounded-full bg-gray-100" /> Built for
					Developers
				</Paragraph>
				<Heading
					as="h3"
					className={"text-md md:text-md font-bold text-gray-900"}
				>
					Smart. Fast. Automated.
				</Heading>
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
