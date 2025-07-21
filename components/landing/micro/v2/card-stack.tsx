import { AnimatePresence, motion } from "framer-motion";
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";

import { SocialCard } from "./social-card";

interface CardStackProps {
	posts: {
		linkedin: string;
		slack: string;
		discord: string;
	};
	isVisible: boolean;
	onCycleComplete?: () => void;
}

type Platform = "linkedin" | "slack" | "discord";

export const CardStack: React.FC<CardStackProps> = React.memo(
	({ posts, isVisible, onCycleComplete }) => {
		const [currentIndex, setCurrentIndex] = useState(0);
		const [isCompleting, setIsCompleting] = useState(false);
		const intervalRef = useRef<NodeJS.Timeout | null>(null);
		const timeoutRef = useRef<NodeJS.Timeout | null>(null);

		// Memoize platforms array to prevent recreations
		const platforms: Platform[] = useMemo(
			() => ["linkedin", "slack", "discord"],
			[],
		);

		// Get current platform - memoized for performance
		const currentPlatform = useMemo(
			() => platforms[currentIndex],
			[platforms, currentIndex],
		);

		// Cleanup all timers
		const cleanupTimers = useCallback(() => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				// eslint-disable-next-line unicorn/no-null
				intervalRef.current = null;
			}
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
				// eslint-disable-next-line unicorn/no-null
				timeoutRef.current = null;
			}
		}, []);

		// Optimized cycle complete handler
		const handleCycleComplete = useCallback(() => {
			if (onCycleComplete && !isCompleting) {
				setIsCompleting(true);
				cleanupTimers();

				// onCycleComplete();
				setTimeout(onCycleComplete, 300);
				// Shorter delay for smoother transitions
				// timeoutRef.current = setTimeout(onCycleComplete, 300);
			}
		}, [onCycleComplete, isCompleting, cleanupTimers]);

		// Optimized index update with proper cycle logic
		const updateIndex = useCallback(() => {
			setCurrentIndex(previous => {
				const next = previous + 1;
				// Check if we've shown all platforms
				if (next >= platforms.length) {
					// Complete the cycle instead of going back to 0
					handleCycleComplete();
					return previous; // Keep current index, don't reset to 0
				}
				return next;
			});
		}, [platforms.length, handleCycleComplete]);

		// Effect for managing the interval
		useEffect(() => {
			if (!isVisible || isCompleting) {
				cleanupTimers();
				return;
			}

			// Start interval
			intervalRef.current = setInterval(updateIndex, 3500);

			return cleanupTimers;
		}, [isVisible, isCompleting, updateIndex, cleanupTimers]);

		// Reset states when component becomes visible again
		useEffect(() => {
			if (isVisible) {
				setIsCompleting(false);
				setCurrentIndex(0);
			}
		}, [isVisible]);

		// Cleanup on unmount
		useEffect(() => {
			return cleanupTimers;
		}, [cleanupTimers]);

		// Memoized animation variants for better performance
		const slideVariants = useMemo(
			() => ({
				enter: {
					x: 320,
					opacity: 0,
					scale: 0.95,
					rotateY: 15,
				},
				center: {
					x: 0,
					opacity: 1,
					scale: 1,
					rotateY: 0,
					transition: {
						type: "spring",
						stiffness: 260,
						damping: 20,
						mass: 0.8,
						opacity: { duration: 0.25 },
						scale: { duration: 0.25 },
						rotateY: { duration: 0.3 },
					},
				},
				exit: {
					x: -320,
					opacity: 0,
					scale: 0.95,
					rotateY: -15,
					transition: {
						type: "spring",
						stiffness: 260,
						damping: 20,
						mass: 0.8,
						opacity: { duration: 0.2 },
						scale: { duration: 0.2 },
						rotateY: { duration: 0.25 },
					},
				},
			}),
			[],
		);

		const containerVariants = useMemo(
			() => ({
				initial: {
					opacity: 0,
					y: 40,
					scale: 0.98,
				},
				animate: {
					y: 0,
					opacity: 1,
					scale: 1,
					transition: {
						duration: 0.4,
						ease: [0.25, 0.46, 0.45, 0.94],
						opacity: { duration: 0.3 },
						scale: { duration: 0.35 },
					},
				},
				exit: {
					y: -40,
					opacity: 0,
					scale: 0.98,
					transition: {
						duration: 0.25,
						ease: [0.55, 0.06, 0.68, 0.19],
					},
				},
			}),
			[],
		);

		// Don't render if not visible or completing
		if (!isVisible) return;

		return (
			<motion.div
				className="relative mb-[-300px] h-[238px] w-full overflow-hidden py-3"
				variants={containerVariants}
				initial="initial"
				animate="animate"
				exit="exit"
				style={{
					perspective: "1000px", // Enable 3D transforms
				}}
			>
				<AnimatePresence mode="wait" initial={false}>
					<motion.div
						key={`${currentPlatform}-${currentIndex}`}
						className="absolute inset-0 w-full will-change-transform"
						variants={slideVariants}
						initial="enter"
						animate="center"
						exit="exit"
						style={{
							transformStyle: "preserve-3d",
						}}
					>
						<SocialCard
							index={0}
							totalCards={2}
							isActive={true}
							platform={currentPlatform}
							content={posts[currentPlatform]}
						/>
					</motion.div>
				</AnimatePresence>
			</motion.div>
		);
	},
);

CardStack.displayName = "CardStack";
