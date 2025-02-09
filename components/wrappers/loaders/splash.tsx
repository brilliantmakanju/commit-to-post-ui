"use client";
import { motion } from "framer-motion";
import type React from "react";

interface SplashProps {
	color: string;
	duration: number;
}

export const Splash: React.FC<SplashProps> = ({ color, duration }) => {
	const splashVariants = {
		initial: { scale: 0, opacity: 0 },
		animate: {
			scale: [0, 1.5, 0],
			opacity: [0.7, 0],
			transition: {
				duration: duration,
				ease: "easeOut",
				repeat: Number.POSITIVE_INFINITY,
				repeatDelay: 1.5 - duration, // Ensures the splash syncs with the bounce
			},
		},
	};

	return (
		<motion.svg
			width="100"
			height="30"
			viewBox="0 0 100 30"
			xmlns="http://www.w3.org/2000/svg"
			style={{
				position: "absolute",
				bottom: 20,
			}}
			variants={splashVariants}
			initial="initial"
			animate="animate"
		>
			<path
				d="M0 30 C25 10, 75 10, 100 30"
				fill="none"
				stroke={color}
				strokeWidth="4"
			/>
			<path
				d="M0 30 C35 20, 65 20, 100 30"
				fill="none"
				stroke={color}
				strokeWidth="3"
			/>
		</motion.svg>
	);
};
