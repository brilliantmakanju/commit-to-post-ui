"use client";

import { memo, useMemo } from "react";

// ============================================
// TYPES
// ============================================
interface VideoStat {
	value: string;
	description: string;
}

// ============================================
// MEMOIZED STAT CARD COMPONENT
// ============================================
interface StatCardProps {
	stat: VideoStat;
}

const StatCard = memo(({ stat }: StatCardProps) => (
	<div className="flex flex-col items-center gap-2 p-4 text-center">
		<div className="font-sans text-2xl font-bold text-black md:text-3xl">
			{stat.value}
		</div>
		<p className="font-sans text-sm font-normal leading-relaxed text-gray-600">
			{stat.description}
		</p>
	</div>
));

StatCard.displayName = "StatCard";

// ============================================
// MAIN VIDEO DEMO COMPONENT
// ============================================
export default function VideoDemo() {
	// Memoize video stats data
	const videoStats = useMemo<VideoStat[]>(
		() => [
			{
				value: "<30s",
				description: "Average time to generate a draft",
			},
			{
				value: "3 platforms",
				description: "Twitter, LinkedIn, Discord ready",
			},
			{
				value: "100% editable",
				description: "Full control before publishing",
			},
		],
		[],
	);

	return (
		<section className="flex w-full items-center justify-center border-b border-gray-200 bg-white">
			<div className="flex w-full max-w-[1260px] flex-col items-center justify-start gap-12 px-6 py-16 md:px-16 md:py-24">
				{/* Video Container */}
				<div className="group relative w-full max-w-[960px]">
					<div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 shadow-lg">
						<iframe
							className="absolute inset-0 h-full w-full"
							src={
								"https://www.youtube.com/embed/Ll0LMDfQB1g?si=xTZH8pTPcfMQhHSt?autoplay=1&rel=0"
							}
							title="Push to Draft Demo"
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
							allowFullScreen
							loading="lazy"
						/>
					</div>

					{/* Video Stats/Features Below */}
					<div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
						{videoStats.map(stat => (
							<StatCard key={stat.value} stat={stat} />
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
