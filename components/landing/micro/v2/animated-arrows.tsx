import { motion } from "framer-motion";
import React from "react";

interface AnimatedArrowsProps {
	isVisible: boolean;
}

export const AnimatedArrows: React.FC<AnimatedArrowsProps> = ({
	isVisible,
}) => {
	if (!isVisible) return;

	// Animation variants for the path drawing effect
	const pathVariants = {
		hidden: {
			pathLength: 0,
			opacity: 0,
		},
		visible: {
			pathLength: 1,
			opacity: 1,
			transition: {
				pathLength: {
					duration: 0.8,
					ease: "easeInOut",
				},
				opacity: {
					duration: 0.1,
				},
			},
		},
	};

	// Fill animation that happens after the stroke is drawn
	const fillVariants = {
		hidden: {
			fillOpacity: 0,
		},
		visible: {
			fillOpacity: 1,
			transition: {
				delay: 0.8,
				duration: 0.1,
				ease: "easeInOut",
			},
		},
	};

	return (
		<motion.svg
			width="491"
			height="153"
			fill="none"
			initial="hidden"
			animate="visible"
			viewBox="0 0 491 793"
			xmlns="http://www.w3.org/2000/svg"
			className="mt-[-130px] max-h-screen max-w-md rotate-[-25deg]"
		>
			{/* Main arrow/swoosh path */}
			<motion.path
				d="M13.1636 768.773C3.93826 755.712 51.1212 736.857 60.1788 729.892C119.756 699.24 178.586 666.557 233.046 627.375C298.517 575.067 399.068 447.183 369.266 359.303C340.712 384.063 216.441 433.305 187.949 399.926C172.395 381.283 185.442 356.028 199.44 340.637C240.118 294.363 339.905 267.764 375.472 332.693C453.488 256.372 481.354 140.836 473.038 34.7155C474.448 24.0339 463.785 3.61997 478.329 0.0172619C482.821 -0.274729 486.515 3.17463 486.925 7.55591C501.542 128.021 474.033 262.794 382.591 348.14C419.899 444.581 321.485 571.362 252.525 632.576C198.395 674.076 138.322 707.579 77.7968 738.796C59.3323 748.369 41.3863 758.94 24.3904 770.945C20.823 773.486 15.6056 772.365 13.1636 768.773ZM217.462 395.447C268.719 390.323 321.813 375.686 363.038 343.702C340.537 295.131 277.126 308.715 238.717 328.764C217.718 338.503 169.584 391.829 217.462 395.447Z"
				stroke="white"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				variants={pathVariants}
			>
				{/* Animated fill */}
				<motion.path
					d="M13.1636 768.773C3.93826 755.712 51.1212 736.857 60.1788 729.892C119.756 699.24 178.586 666.557 233.046 627.375C298.517 575.067 399.068 447.183 369.266 359.303C340.712 384.063 216.441 433.305 187.949 399.926C172.395 381.283 185.442 356.028 199.44 340.637C240.118 294.363 339.905 267.764 375.472 332.693C453.488 256.372 481.354 140.836 473.038 34.7155C474.448 24.0339 463.785 3.61997 478.329 0.0172619C482.821 -0.274729 486.515 3.17463 486.925 7.55591C501.542 128.021 474.033 262.794 382.591 348.14C419.899 444.581 321.485 571.362 252.525 632.576C198.395 674.076 138.322 707.579 77.7968 738.796C59.3323 748.369 41.3863 758.94 24.3904 770.945C20.823 773.486 15.6056 772.365 13.1636 768.773ZM217.462 395.447C268.719 390.323 321.813 375.686 363.038 343.702C340.537 295.131 277.126 308.715 238.717 328.764C217.718 338.503 169.584 391.829 217.462 395.447Z"
					fill="white"
					variants={fillVariants}
				/>
			</motion.path>

			{/* Secondary smaller path */}
			<motion.path
				d="M58.8351 791.854C39.9171 781.755 -0.846024 781.669 0.0133791 753.433C5.14252 742.599 6.79666 710.215 19.0098 708.372C38.3622 708.428 16.0846 745.611 15.8573 756.769C25.7674 770.098 76.2174 769.832 69.683 788.237C67.6876 792.247 62.7365 793.748 58.8351 791.854Z"
				stroke="white"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				variants={{
					hidden: {
						pathLength: 0,
						opacity: 0,
					},
					visible: {
						pathLength: 1,
						opacity: 1,
						transition: {
							delay: 1.5, // Start this path animation partway through
							pathLength: {
								duration: 1.5,
								ease: "easeInOut",
							},
							opacity: {
								duration: 0.3,
							},
						},
					},
				}}
			>
				{/* Animated fill for second path */}
				<motion.path
					d="M58.8351 791.854C39.9171 781.755 -0.846024 781.669 0.0133791 753.433C5.14252 742.599 6.79666 710.215 19.0098 708.372C38.3622 708.428 16.0846 745.611 15.8573 756.769C25.7674 770.098 76.2174 769.832 69.683 788.237C67.6876 792.247 62.7365 793.748 58.8351 791.854Z"
					fill="white"
					variants={{
						hidden: {
							fillOpacity: 0,
						},
						visible: {
							fillOpacity: 1,
							transition: {
								delay: 2.8, // Fill after stroke is complete
								duration: 0.6,
								ease: "easeInOut",
							},
						},
					}}
				/>
			</motion.path>
		</motion.svg>
	);
};
