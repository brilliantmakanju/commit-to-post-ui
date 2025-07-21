import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import React from "react";
import { BiRepost } from "react-icons/bi";
import { BsReply, BsThreeDots } from "react-icons/bs";
import {
	FaComment,
	FaDiscord,
	FaHeart,
	FaLinkedinIn,
	FaShare,
	FaSlack,
	FaSmile,
	FaThumbsUp,
} from "react-icons/fa";

interface SocialCardProps {
	platform: "linkedin" | "slack" | "discord";
	content: string;
	index: number;
	isActive: boolean;
	totalCards: number;
}

// Fixed height card container to ensure consistency
const CARD_HEIGHT = "220px";

// Memoized platform components with consistent heights
const LinkedInPost = React.memo<{ content: string; isActive: boolean }>(
	({ content, isActive }) => (
		<div
			className="w-full rounded-lg border border-gray-200 bg-white shadow-sm"
			style={{ height: CARD_HEIGHT }}
		>
			{/* Header - Fixed height */}
			<div className="p-4 pb-3" style={{ minHeight: "50px" }}>
				<div className="flex items-start gap-3">
					<div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-lg font-bold text-white">
						J
					</div>
					<div className="min-w-0 flex-1">
						<div className="flex items-center gap-2">
							<h3 className="truncate text-sm font-semibold text-gray-900">
								Jolex Dev
							</h3>
							<span className="text-xs text-gray-500">• 1st</span>
						</div>
						<p className="truncate text-xs text-gray-600">
							Senior Frontend Engineer at TechCorp
						</p>
						<div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
							<span>2h</span>
							<span>•</span>
							<span>🌐</span>
						</div>
					</div>
					<BsThreeDots className="h-5 w-5 flex-shrink-0 cursor-pointer text-gray-500" />
				</div>
			</div>

			{/* Content - Flexible height with scroll if needed */}
			<div
				className="flex-1 overflow-y-auto px-4 pb-3"
				style={{ height: "90px" }}
			>
				<p className="break-words text-sm leading-relaxed text-gray-900">
					{content}
				</p>
			</div>

			{/* Engagement Bar - Fixed height */}
			<div
				className="mt-auto border-t border-gray-100 px-4 py-3"
				style={{ height: "40px" }}
			>
				<div className="flex items-center justify-between text-xs text-gray-500">
					<div className="flex items-center gap-1">
						<div className="flex -space-x-1">
							<div className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500">
								<FaThumbsUp className="h-2 w-2 text-white" />
							</div>
							<div className="flex h-4 w-4 items-center justify-center rounded-full bg-green-500">
								<FaHeart className="h-2 w-2 text-white" />
							</div>
						</div>
						<span>24 reactions</span>
					</div>
					<div className="flex gap-4">
						<span>5 comments</span>
						<span>2 reposts</span>
					</div>
				</div>
			</div>
		</div>
	),
);

const SlackMessage = React.memo<{ content: string; isActive: boolean }>(
	({ content, isActive }) => (
		<div
			className="flex w-full flex-col rounded-lg border border-gray-200 bg-white shadow-sm"
			style={{ height: CARD_HEIGHT }}
		>
			{/* Channel Header - Fixed height */}
			<div
				className="flex-shrink-0 border-b border-gray-100 bg-gray-50 px-4 py-3"
				style={{ height: "50px" }}
			>
				<div className="flex items-center gap-2">
					<span className="text-lg">#</span>
					<span className="font-semibold text-gray-900">general</span>
					<div className="ml-auto flex items-center gap-1 text-xs text-gray-500">
						<div className="h-2 w-2 rounded-full bg-green-500"></div>
						<span>234 members</span>
					</div>
				</div>
				{/* <div className="mt-1 text-xs text-gray-500">
					💡 Share your development wins and get feedback
				</div> */}
			</div>

			{/* Message - Flexible content area */}
			<div className="flex flex-1 flex-col p-4" style={{ height: "90px" }}>
				<div className="flex items-start gap-3">
					<div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-[1px] font-bold text-white">
						<Image
							width={999}
							height={999}
							src={"/logo.png"}
							alt={"PushtoPost_Logo"}
						/>
					</div>
					<div className="min-w-0 flex-1">
						<div className="mb-1 flex items-center gap-2">
							<span className="text-sm font-bold text-gray-900">
								Push to Post
							</span>
							<div className="rounded bg-green-600 px-1.5 py-0.5 text-xs font-bold text-white">
								APP
							</div>
							<span className="text-xs text-gray-500">Today at 2:34 PM</span>
						</div>
						<div className="mb-3 overflow-y-auto" style={{ height: "80px" }}>
							<p className="break-words text-[10px] text-sm leading-relaxed text-gray-900">
								{content}
							</p>
						</div>

						{/* Message Actions */}
						<div className="mt-auto flex items-center gap-1 text-xs">
							<button className="flex items-center gap-1 rounded px-2 py-1 text-gray-600 transition-colors hover:bg-gray-100">
								<span>💯</span>
								<span>3</span>
							</button>
							<button className="flex items-center gap-1 rounded px-2 py-1 text-gray-600 transition-colors hover:bg-gray-100">
								<span>🚀</span>
								<span>1</span>
							</button>
							<button className="rounded p-1 text-gray-500 transition-colors hover:bg-gray-100">
								<BsReply className="h-3 w-3" />
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	),
);

const DiscordMessage = React.memo<{ content: string; isActive: boolean }>(
	({ content, isActive }) => (
		<div
			className="flex w-full flex-col rounded-lg border border-gray-700 bg-gray-800 text-white shadow-lg"
			style={{ height: CARD_HEIGHT }}
		>
			{/* Channel Header - Fixed height */}
			<div
				className="bg-gray-750 flex-shrink-0 border-b border-gray-700 px-4 py-3"
				style={{ height: "50px" }}
			>
				<div className="flex items-center gap-2">
					<span className="text-gray-400">#</span>
					<span className="font-semibold text-white">development</span>
					<div className="ml-2 h-4 w-px bg-gray-600"></div>
					<span className="text-xs text-gray-400">
						Frontend team discussions
					</span>
					{/* <div className="ml-auto flex items-center gap-1 text-xs text-gray-400">
						<div className="h-2 w-2 rounded-full bg-green-500"></div>
						<span>12 online</span>
					</div> */}
				</div>
				{/* <div className="mt-1 text-xs text-gray-500">
					🎯 Share your code, get instant feedback
				</div> */}
			</div>

			{/* Message - Flexible content area */}
			<div className="flex-1 p-4" style={{ height: "90px" }}>
				<div className="hover:bg-gray-750 group relative -mx-4 flex items-start gap-3 rounded px-4 py-1">
					<div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-[1px] font-bold text-white">
						<Image
							width={999}
							height={999}
							src={"/logo.png"}
							alt={"PushtoPost_Logo"}
						/>
					</div>
					<div className="min-w-0 flex-1">
						<div className="mb-1 flex items-center gap-2">
							<span className="font-semibold text-white">Push to Post</span>
							<div className="rounded bg-indigo-600 px-1.5 py-0.5 text-xs font-bold text-white">
								BOT
							</div>
							<span className="text-xs text-gray-400">Today at 2:34 PM</span>
						</div>
						<div className="overflow-y-auto" style={{ height: "80px" }}>
							<p className="break-words text-sm leading-relaxed text-gray-100">
								{content}
							</p>
						</div>
					</div>
				</div>

				{/* Reactions - Fixed at bottom */}
				<div className="ml-13 mt-auto flex items-center gap-1">
					<div className="flex cursor-pointer items-center gap-1 rounded bg-gray-700 px-2 py-1 text-xs transition-colors hover:bg-gray-600">
						<span>⚡</span>
						<span className="text-gray-300">4</span>
					</div>
					<div className="flex cursor-pointer items-center gap-1 rounded bg-gray-700 px-2 py-1 text-xs transition-colors hover:bg-gray-600">
						<span>🔥</span>
						<span className="text-gray-300">2</span>
					</div>
					<button className="rounded p-1 text-gray-500 transition-colors hover:bg-gray-700">
						<FaSmile className="h-3 w-3" />
					</button>
				</div>
			</div>
		</div>
	),
);

// Set display names for better debugging
LinkedInPost.displayName = "LinkedInPost";
SlackMessage.displayName = "SlackMessage";
DiscordMessage.displayName = "DiscordMessage";

// Background card component (no animations)
const BackgroundCard: React.FC<{
	platform: "linkedin" | "slack" | "discord";
	content: string;
	index: number;
}> = React.memo(({ platform, content, index }) => {
	// Static positioning for background cards
	const stackOffset = Math.min(index * 8, 24);
	const scaleReduction = Math.min(index * 0.02, 0.06);
	const opacityReduction = Math.min(index * 0.15, 0.45);

	const renderPlatform = () => {
		switch (platform) {
			case "linkedin": {
				return <LinkedInPost content={content} isActive={false} />;
			}
			case "slack": {
				return <SlackMessage content={content} isActive={false} />;
			}
			case "discord": {
				return <DiscordMessage content={content} isActive={false} />;
			}
			default: {
				return;
			}
		}
	};

	return (
		<div
			className="pointer-events-none absolute w-full will-change-transform"
			style={{
				transform: `translateY(${stackOffset}px) scale(${1 - scaleReduction}) rotateY(${Math.min(index * 2, 6)}deg)`,
				opacity: 1 - opacityReduction,
				zIndex: Math.max(30 - index, 1),
				height: CARD_HEIGHT,
				filter: "blur(0.3px) brightness(0.9)",
			}}
		>
			{renderPlatform()}
		</div>
	);
});

BackgroundCard.displayName = "BackgroundCard";

export const SocialCard: React.FC<SocialCardProps> = React.memo(
	({ platform, content, index, isActive, totalCards }) => {
		// Only render animated card for active card, static card for background
		if (!isActive) {
			return (
				<BackgroundCard platform={platform} content={content} index={index} />
			);
		}

		const renderPlatform = () => {
			switch (platform) {
				case "linkedin": {
					return <LinkedInPost content={content} isActive={true} />;
				}
				case "slack": {
					return <SlackMessage content={content} isActive={true} />;
				}
				case "discord": {
					return <DiscordMessage content={content} isActive={true} />;
				}
				default: {
					return;
				}
			}
		};

		// Animation variants for active card only
		const activeCardVariants = {
			initial: {
				x: 400,
				opacity: 0,
				scale: 0.9,
				rotateY: 15,
			},
			animate: {
				x: 0,
				opacity: 1,
				scale: 1,
				rotateY: 0,
				transition: {
					type: "spring",
					stiffness: 300,
					damping: 25,
					mass: 0.9,
				},
			},
			exit: {
				x: -400,
				opacity: 0,
				scale: 0.9,
				rotateY: -15,
				transition: {
					duration: 0.3,
					ease: [0.4, 0, 0.2, 1],
				},
			},
		};

		return (
			<motion.div
				key={`active-${platform}-${index}`}
				className="absolute w-full will-change-transform"
				variants={activeCardVariants}
				initial="initial"
				animate="animate"
				exit="exit"
				style={{
					zIndex: 50,
					height: CARD_HEIGHT,
					perspective: "1200px",
					transformStyle: "preserve-3d",
				}}
				layout={false}
			>
				{renderPlatform()}
			</motion.div>
		);
	},
);

SocialCard.displayName = "SocialCard";
