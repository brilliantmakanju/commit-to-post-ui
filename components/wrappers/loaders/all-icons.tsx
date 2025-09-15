"use client";
import { motion } from "framer-motion";
import type React from "react";

interface AnimatedPlayButtonProps {
	color: string;
	size: number;
	loop?: boolean;
}

export const AnimatedAIIcon: React.FC<AnimatedPlayButtonProps> = ({
	color,
	size,
	loop = false,
}) => {
	const pathVariants = {
		hidden: { pathLength: 0, opacity: 0 },
		visible: {
			pathLength: 1,
			opacity: 1,
			transition: {
				pathLength: { type: "spring", duration: 1.5, bounce: 0 },
				opacity: { duration: 0.01 },
			},
		},
	};

	const fillVariants = {
		hidden: { opacity: 0, scale: 0 },
		visible: {
			opacity: 1,
			scale: 1,
			transition: {
				delay: 1.5,
				duration: 0.3,
				ease: "easeOut",
			},
		},
	};

	const containerVariants = {
		hidden: {},
		visible: {
			transition: {
				staggerChildren: 0.2,
				repeat: loop ? Number.POSITIVE_INFINITY : 0,
				repeatDelay: 2,
			},
		},
	};

	return (
		<motion.svg
			width={size}
			height={size}
			viewBox="0 0 300 300"
			initial="hidden"
			animate="visible"
			variants={containerVariants}
			xmlns="http://www.w3.org/2000/svg"
		>
			<g transform="translate(0,300) scale(0.1,-0.1)">
				{/* Background container - draws outline first */}
				<motion.path
					d="M820 2780 c-122 -5 -169 -11 -220 -29 -92 -32 -199 -101 -264 -172 -60 -64 -125 -187 -146 -274 -17 -67 -25 -1112 -11 -1365 10 -200 21 -246 82 -360 40 -75 136 -174 214 -222 33 -20 96 -49 140 -65 l80 -28 760 0 760 0 82 28 c163 55 300 173 373 320 70 142 70 139 69 902 0 773 -1 784 -70 925 -54 110 -171 230 -269 277 -141 69 -120 67 -805 69 -341 0 -690 -2 -775 -6z m1427 -45 c228 -53 400 -235 445 -470 10 -53 13 -219 13 -695 0 -755 0 -753 -35 -858 -51 -152 -152 -270 -295 -342 -137 -70 -123 -69 -945 -67 l-735 2 -74 27 c-104 39 -153 70 -231 147 -46 45 -79 89 -104 139 -71 141 -68 111 -72 877 -2 389 1 717 6 751 39 260 237 456 497 493 32 4 374 9 760 10 606 1 712 -1 770 -14z"
					fill="#0a0a0a"
					stroke={"#0a0a0a"}
					fillRule={"nonzero"}
					strokeWidth="8"
					variants={pathVariants}
				>
					<rect width="300" height="300" fill="#0a0a0a" />
				</motion.path>

				{/* Background fill - appears after outline */}
				<motion.path
					d="M820 2780 c-122 -5 -169 -11 -220 -29 -92 -32 -199 -101 -264 -172 -60 -64 -125 -187 -146 -274 -17 -67 -25 -1112 -11 -1365 10 -200 21 -246 82 -360 40 -75 136 -174 214 -222 33 -20 96 -49 140 -65 l80 -28 760 0 760 0 82 28 c163 55 300 173 373 320 70 142 70 139 69 902 0 773 -1 784 -70 925 -54 110 -171 230 -269 277 -141 69 -120 67 -805 69 -341 0 -690 -2 -775 -6z m1427 -45 c228 -53 400 -235 445 -470 10 -53 13 -219 13 -695 0 -755 0 -753 -35 -858 -51 -152 -152 -270 -295 -342 -137 -70 -123 -69 -945 -67 l-735 2 -74 27 c-104 39 -153 70 -231 147 -46 45 -79 89 -104 139 -71 141 -68 111 -72 877 -2 389 1 717 6 751 39 260 237 456 497 493 32 4 374 9 760 10 606 1 712 -1 770 -14z"
					fill={"#4e4e4e"}
					fillRule="inherit"
					variants={fillVariants}
				>
					<rect width="300" height="300" fill="#0a0a0a" />
				</motion.path>

				{/* Play triangle - draws outline first */}
				<motion.path
					d="M1043 2355 c-18 -8 -42 -29 -53 -47 -19 -32 -20 -49 -20 -741 0 -765 -1 -755 53 -790 15 -9 44 -17 65 -17 46 0 44 -1 407 271 143 107 327 244 410 304 82 61 166 127 187 147 62 63 61 134 -3 197 -22 23 -213 162 -316 231 -12 8 -104 73 -205 145 -329 234 -435 305 -453 305 -7 0 -19 2 -27 5 -7 2 -28 -2 -45 -10z m97 -42 c228 -154 933 -659 945 -676 8 -12 15 -40 15 -62 0 -46 -20 -70 -120 -141 -30 -21 -231 -170 -447 -331 -215 -160 -400 -296 -411 -302 -33 -18 -67 -13 -91 13 l-23 24 -1 720 -2 720 24 26 c29 31 74 34 111 9z"
					fill="none"
					stroke="#ffffff"
					strokeWidth="8"
					variants={pathVariants}
				/>

				{/* Play triangle fill */}
				<motion.path
					d="M1043 2355 c-18 -8 -42 -29 -53 -47 -19 -32 -20 -49 -20 -741 0 -765 -1 -755 53 -790 15 -9 44 -17 65 -17 46 0 44 -1 407 271 143 107 327 244 410 304 82 61 166 127 187 147 62 63 61 134 -3 197 -22 23 -213 162 -316 231 -12 8 -104 73 -205 145 -329 234 -435 305 -453 305 -7 0 -19 2 -27 5 -7 2 -28 -2 -45 -10z m97 -42 c228 -154 933 -659 945 -676 8 -12 15 -40 15 -62 0 -46 -20 -70 -120 -141 -30 -21 -231 -170 -447 -331 -215 -160 -400 -296 -411 -302 -33 -18 -67 -13 -91 13 l-23 24 -1 720 -2 720 24 26 c29 31 74 34 111 9z"
					fill="#ffffff"
					variants={fillVariants}
				/>

				{/* Forward button - draws outline first */}
				<motion.path
					d="M1939 1277 c-432 -323 -610 -460 -620 -478 -8 -16 -7 -26 6 -45 18 -28 -2 -27 424 -26 277 1 285 2 316 24 64 43 65 49 65 330 0 234 -1 256 -18 271 -10 10 -25 17 -33 17 -9 0 -71 -42 -140 -93z m159 -197 l-3 -260 -28 -27 -27 -28 -350 -3 c-280 -2 -350 0 -349 10 0 15 727 566 747 567 10 1 12 -51 10 -259z"
					fill="none"
					stroke="#ffffff"
					strokeWidth="8"
					variants={pathVariants}
				/>

				{/* Forward button fill */}
				<motion.path
					d="M1939 1277 c-432 -323 -610 -460 -620 -478 -8 -16 -7 -26 6 -45 18 -28 -2 -27 424 -26 277 1 285 2 316 24 64 43 65 49 65 330 0 234 -1 256 -18 271 -10 10 -25 17 -33 17 -9 0 -71 -42 -140 -93z m159 -197 l-3 -260 -28 -27 -27 -28 -350 -3 c-280 -2 -350 0 -349 10 0 15 727 566 747 567 10 1 12 -51 10 -259z"
					fill="#ffffff"
					variants={fillVariants}
				/>
			</g>
		</motion.svg>
	);
};
