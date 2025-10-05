"use client";

import { Play } from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";

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
// MEMOIZED PLAY BUTTON OVERLAY
// ============================================
interface PlayButtonOverlayProps {
	onClick: () => void;
}

const PlayButtonOverlay = memo(({ onClick }: PlayButtonOverlayProps) => (
	<button
		onClick={onClick}
		className="group absolute inset-0 flex h-full w-full cursor-pointer items-center justify-center"
		aria-label="Play video"
	>
		<div className="absolute inset-0 bg-black/0 transition-all duration-300 group-hover:bg-black/5" />
		<div className="relative flex h-20 w-20 transform items-center justify-center rounded-full bg-black shadow-2xl transition-transform duration-200 group-hover:scale-110 md:h-24 md:w-24">
			<Play
				className="ml-1.5 h-10 w-10 text-white md:h-12 md:w-12"
				fill="white"
				strokeWidth={0}
				aria-hidden="true"
			/>
		</div>
	</button>
));

PlayButtonOverlay.displayName = "PlayButtonOverlay";

// ============================================
// MAIN VIDEO DEMO COMPONENT
// ============================================
export default function VideoDemo() {
	const [isPlaying, setIsPlaying] = useState(false);

	// Memoize video stats data
	const videoStats = useMemo<VideoStat[]>(
		() => [
			{
				value: "<60s",
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

	// Memoize the play handler
	const handlePlay = useCallback(() => {
		setIsPlaying(true);
	}, []);

	// Memoize iframe src with autoplay when user clicks
	const iframeSource = useMemo(
		() =>
			isPlaying
				? "https://www.youtube.com/embed/WXsnbXjd3dU?autoplay=1&rel=0"
				: "",
		[isPlaying],
	);

	return (
		<section className="flex w-full items-center justify-center border-b border-gray-200 bg-white">
			<div className="flex w-full max-w-[1260px] flex-col items-center justify-start gap-12 px-6 py-16 md:px-16 md:py-24">
				{/* Video Container */}
				<div className="group relative w-full max-w-[960px]">
					<div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 shadow-lg">
						{isPlaying ? (
							/* Video Player - Lazy loaded only when clicked */
							<iframe
								className="absolute inset-0 h-full w-full"
								src={iframeSource}
								title="Push to Draft Demo"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
								allowFullScreen
								loading="lazy"
							/>
						) : (
							<PlayButtonOverlay onClick={handlePlay} />
						)}
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
