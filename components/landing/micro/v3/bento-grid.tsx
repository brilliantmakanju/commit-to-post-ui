"use client";
import type { LucideIcon } from "lucide-react";
import { GitCommit, Users, Zap } from "lucide-react";
import React, { memo, useMemo } from "react";

// ============================================
// TYPES
// ============================================
interface BentoCardData {
	icon: LucideIcon;
	title: string;
	description: string;
	badge: string;
}

interface BentoCardProps extends BentoCardData {
	index: number;
}

// ============================================
// MEMOIZED BENTO CARD COMPONENT
// ============================================
const BentoCard = memo(
	({ icon: Icon, title, description, badge, index }: BentoCardProps) => {
		return (
			<div className="flex w-full flex-col items-start justify-between gap-8 border-b border-gray-200 bg-white p-8 last:border-b-0 md:border-b-0 md:border-r md:p-10 md:last:border-r-0 lg:gap-10 lg:py-12">
				<div className="flex w-full items-start gap-4">
					<div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border-2 border-gray-200 bg-white shadow-sm sm:h-14 sm:w-14">
						<Icon
							className="h-6 w-6 text-black sm:h-7 sm:w-7"
							strokeWidth={2}
							aria-hidden="true"
						/>
					</div>
					<div className="flex flex-1 flex-col gap-3">
						<h3 className="font-sans text-lg font-bold leading-tight text-black sm:text-xl lg:text-2xl">
							{title}
						</h3>
						<p className="font-sans text-sm font-normal leading-relaxed text-gray-600 sm:text-base lg:text-base">
							{description}
						</p>
					</div>
				</div>
				<div className="flex w-full items-center justify-start gap-3">
					<div className="h-[1px] flex-1 bg-gray-200" aria-hidden="true" />
					<span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 sm:text-xs">
						{badge}
					</span>
				</div>
			</div>
		);
	},
);

BentoCard.displayName = "BentoCard";

// ============================================
// MEMOIZED HEADER COMPONENT
// ============================================
const BentoHeader = memo(() => {
	return (
		<div className="flex w-full items-center justify-center border-b border-gray-200 py-12 sm:py-16 md:py-20 lg:pb-[100px]">
			<div className="max-w-4xl px-6 sm:px-8 md:px-12">
				<h2 className="text-center font-sans text-2xl font-bold leading-tight tracking-tight text-black sm:text-3xl md:text-4xl lg:text-5xl lg:leading-tight">
					We Killed the &quot;AI Bot&quot; Voice: <br />
					Why Full Automation Fails Authenticity.
				</h2>
			</div>
		</div>
	);
});

BentoHeader.displayName = "BentoHeader";

// ============================================
// MAIN BENTO GRID SECTION
// ============================================
export function BentoGridSection() {
	// Memoize cards data to prevent recreation on every render
	const cards = useMemo<BentoCardData[]>(
		() => [
			{
				icon: Users,
				title: "The Co-Pilot, Not the Autopilot",
				description:
					"AI generates the first draft, but you're always in control. Edit, refine, and add your unique voice before publishing.",
				badge: "Human-First",
			},
			{
				icon: GitCommit,
				title: "Source-Grounded Content",
				description:
					"Every draft comes directly from your Git commits. Real work, real progress—no hallucinations or generic fluff.",
				badge: "Verifiable",
			},
			{
				icon: Zap,
				title: "Saves Mental Energy",
				description:
					"Skip the blank page paralysis. Start with a draft and spend your energy on what matters: building and shipping.",
				badge: "Effortless",
			},
		],
		[],
	);

	return (
		<section
			className="relative -mt-[160px] flex w-full flex-col items-center justify-center overflow-hidden border-b border-l border-gray-200"
			aria-labelledby="bento-section-heading"
		>
			{/* Header Section */}
			<BentoHeader />

			{/* Bento Grid Content */}
			<div className="grid w-full grid-cols-1 border-gray-200 md:grid-cols-3">
				{cards.map((card, index) => (
					<BentoCard
						key={card.title}
						icon={card.icon}
						title={card.title}
						description={card.description}
						badge={card.badge}
						index={index}
					/>
				))}
			</div>

			<div
				className="absolute bottom-[-158px] h-[158px] w-full bg-white"
				aria-hidden="true"
			/>
		</section>
	);
}
