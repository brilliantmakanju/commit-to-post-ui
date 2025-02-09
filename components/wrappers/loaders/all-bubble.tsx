"use client";
import { motion } from "framer-motion";
import React from "react";

import { seededRandom } from "@/lib/utils/seeded-random";

interface AIBubbleProps {
	color: string;
	numBubbles: number;
}

export const AIBubble: React.FC<AIBubbleProps> = ({ color, numBubbles }) => {
	const bubbleVariants = {
		initial: { scale: 0, opacity: 0 },
		animate: {
			scale: [0, 1, 0],
			opacity: [0, 0.7, 0],
			transition: {
				duration: 3,
				ease: "easeInOut",
				repeat: Infinity,
				repeatDelay: 1,
			},
		},
	};

	return (
		<>
			{[numBubbles].map((_, index) => {
				const seed = index + 1;
				const size = seededRandom(seed) * 15 + 5;
				const top = seededRandom(seed + 1) * 80 + 10;
				const left = seededRandom(seed + 2) * 80 + 10;

				return (
					<motion.div
						key={index}
						style={{
							position: "absolute",
							width: size,
							height: size,
							borderRadius: "50%",
							backgroundColor: color,
							top: `${top}%`,
							left: `${left}%`,
						}}
						variants={bubbleVariants}
						initial="initial"
						animate="animate"
						transition={{
							delay: index * 0.5,
						}}
					/>
				);
			})}
		</>
	);
};
