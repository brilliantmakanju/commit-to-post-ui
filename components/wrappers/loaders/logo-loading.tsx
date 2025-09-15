"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import type React from "react";

import { AIBubble } from "@/components/wrappers/loaders/all-bubble";
import { Splash } from "@/components/wrappers/loaders/splash";
import { seededRandom } from "@/lib/utils/seeded-random";

interface LoadingScreenProps {
	className?: string;
	backgroundColor?: string;
	iconColor?: string;
	splashColor?: string;
	bubbleColor?: string;
	starColor?: string;
	iconSize?: number;
	bounceHeight?: number;
	bounceDuration?: number;
	splashDuration?: number;
	numBubbles?: number;
	numStars?: number;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
	className = "",
	backgroundColor = "#0F1A20",
	iconColor = "#FFFFFF",
	splashColor = "rgba(255, 255, 255, 0.3)",
	bubbleColor = "rgba(255, 255, 255, 0.2)",
	starColor = "rgba(255, 255, 255, 0.5)",
	iconSize = 60,
	bounceHeight = 30,
	bounceDuration = 1.5,
	splashDuration = 0.8,
	numBubbles: numberBubbles = 5,
	numStars: numberStars = 20,
}) => {
	const bounceVariants = {
		initial: { y: 0 },
		animate: {
			y: [0, -bounceHeight, 0],
			transition: {
				duration: bounceDuration,
				ease: "easeInOut",
				repeat: Number.POSITIVE_INFINITY,
			},
		},
	};

	return (
		<div
			className={`loading-screen-container relative flex h-screen w-full items-center justify-center overflow-hidden ${className}`}
			style={{ backgroundColor }}
		>
			<motion.div
				className="loading-svg"
				variants={bounceVariants}
				initial="initial"
				animate="animate"
				style={{ display: "inline-block", position: "relative" }}
			>
				<div className="relative mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 transition-all duration-300 dark:from-gray-800 dark:to-gray-900">
					<Image
						width={28}
						height={28}
						src="/logo.png"
						alt="PushToPost Logo"
						className="h-full w-full scale-110 object-contain transition-transform duration-300"
						priority
					/>
				</div>
			</motion.div>

			<Splash color={splashColor} duration={splashDuration} />

			<AIBubble color={bubbleColor} numBubbles={numberBubbles} />

			{[[numberStars]].map((_, index) => {
				const seed = index + 1;
				const size = seededRandom(seed) * 2 + 1;
				const top = seededRandom(seed + 1) * 100;
				const left = seededRandom(seed + 2) * 100;
				const animationDuration = seededRandom(seed + 3) * 2 + 1;
				const animationDelay = seededRandom(seed + 4) * 2;

				return (
					<motion.div
						key={`star-${index}`}
						style={{
							position: "absolute",
							width: size,
							height: size,
							backgroundColor: starColor,
							borderRadius: "50%",
							top: `${top}%`,
							left: `${left}%`,
						}}
						animate={{
							opacity: [0, 1, 0],
							scale: [0, 1, 0],
						}}
						transition={{
							duration: animationDuration,
							repeat: Number.POSITIVE_INFINITY,
							repeatType: "loop",
							delay: animationDelay,
						}}
					/>
				);
			})}
		</div>
	);
};

export default LoadingScreen;
