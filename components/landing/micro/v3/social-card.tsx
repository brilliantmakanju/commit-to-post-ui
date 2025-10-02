/* eslint-disable import/no-unresolved */
"use client";
import Image from "next/image";
import React, { useMemo } from "react";
import { FaHeart, FaThumbsUp } from "react-icons/fa";

import { getTimeAgo } from "@/lib/get-time";
import { ConnectedAccount, SocialAccount } from "@/types";
import useOrganizationStore, {
	OrganizationSocial,
} from "@/zustand/useorganization-store";

// Sample post data
const samplePosts = {
	linkedin:
		"Just pushed a commit to squash login bug #123 in my-cool-project. Now auth flows like a dream—seamless and secure! Ready to share more updates straight from my terminal. 😶‍🌫️ #WebDev #Git",
	slack:
		"Hey team, pushed a commit to fix login bug #123. Auth's now buttery smooth, no more hiccups! All from my terminal, no tab juggling. Who's testing it? 😶‍🌫️ #DevLife",
	discord:
		"Yo, crushed login bug #123 with a clean commit in my-cool-project. Pushed it from terminal and it's ready to post here—love this flow! What's your latest fix? 😶‍🌫️ #Code",
	twitter:
		"Fixed login bug #123 with one git push. Auth's solid now, shared to Twitter from my terminal! No context switching, just coding. 😶‍🌫️ #BuildInPublic #100DaysOfCode",
};

type Platform = "linkedin" | "slack" | "discord" | "twitter";
type AnimationType = "flip" | "cube" | "spiral" | "fade-scale" | "stack-slide";

interface SocialCardProps {
	platform: Platform;
	content: string;
	isActive: boolean;
	hideName?: boolean;
	customName?: string;
	customAvatar?: string;
	hideProfile?: boolean;
	customUsername?: string;
	hideReactions?: boolean;
	customTimestamp?: string;
}

// Default user data (generic/safe names)
const defaultUsers = {
	linkedin: {
		name: "Developer",
		title: "Software Engineer",
		avatar: "/default-avatar.png",
	},
	twitter: {
		name: "CodeDev",
		username: "@codedev",
		avatar: "/default-avatar.png",
	},
	slack: {
		name: "Developer",
		avatar: "/default-avatar.png",
	},
	discord: {
		name: "Push to Post",
		avatar: "/logo.png",
	},
};

// Generate random timestamps
const generateRandomTimestamp = (platform: Platform) => {
	const timestamps = {
		linkedin: ["1h", "2h", "3h", "1d", "2d", "1w"],
		twitter: ["2m", "15m", "1h", "2h", "Aug 15", "Aug 16"],
		slack: ["Today at 2:34 PM", "Today at 9:15 AM", "Yesterday at 5:20 PM"],
		discord: ["Today at 9:10 PM", "Yesterday at 2:30 PM", "Aug 15, 2024"],
	};

	const platformTimestamps = timestamps[platform];
	return platformTimestamps[
		Math.floor(Math.random() * platformTimestamps.length)
	];
};

// LinkedIn Post Component
export const LinkedInPost = React.memo<{
	content: string;
	isActive: boolean;
	hideProfile?: boolean;
	hideName?: boolean;
	hideReactions?: boolean;
	customName?: string;
	customAvatar?: string;
	customTimestamp?: string;
}>(
	({
		content,
		hideProfile,
		hideName,
		hideReactions,
		customName,
		customAvatar,
		customTimestamp,
	}) => {
		const userName = customName || defaultUsers.linkedin.name;
		const userAvatar = customAvatar || defaultUsers.linkedin.avatar;
		const timestamp = customTimestamp || generateRandomTimestamp("linkedin");

		return (
			<div className="w-full rounded-xl border border-gray-200 bg-white">
				<div className="p-6 px-3 pb-4 pr-9">
					<div className="flex items-start gap-4">
						{!hideProfile && (
							<div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-600 text-sm font-medium text-white">
								<div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
									<div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-800">
										<div className="flex h-4 w-4 items-center justify-center rounded-sm bg-white">
											<div className="h-2 w-2 rotate-45 transform rounded-sm bg-gray-800"></div>
										</div>
									</div>
								</div>
							</div>
						)}
						<div className="flex w-full flex-col items-start justify-start">
							{!hideName && (
								<div className="flex w-full flex-col items-start justify-start gap-[0.5px] text-xs">
									<p className="text-sm text-gray-600">
										{defaultUsers.linkedin.title}
									</p>
									<span className="mt-1 text-sm text-gray-500">
										{timestamp}
									</span>
								</div>
							)}

							<div className={`${hideName ? "" : "mt-3"} flex-1`}>
								<p className="break-words text-start text-base leading-relaxed text-gray-900">
									{content}
								</p>
							</div>
						</div>
					</div>
				</div>
				{hideReactions && <div className="mb-1" />}

				{!hideReactions && (
					<div className="mt-auto border-t border-gray-100 px-6 py-4">
						<div className="flex items-center justify-between text-sm text-gray-500">
							<div className="flex items-center gap-2">
								<div className="flex -space-x-1">
									<div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500">
										<FaThumbsUp className="h-3 w-3 text-white" />
									</div>
									<div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500">
										<FaHeart className="h-3 w-3 text-white" />
									</div>
								</div>
							</div>
							<div className="ml-2 flex gap-4">
								<span>Comments</span>
								<span>Reposts</span>
							</div>
						</div>
					</div>
				)}
			</div>
		);
	},
);

const CommentIcon = () => (
	<svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
		<path
			d="M1.751 10c0-4.42 3.584-8.005 8.005-8.005h4.366c4.421 0 8.005 3.584 8.005 8.005 0 4.42-3.584 8.005-8.005 8.005h-1.463L7.5 21.5v-3.495c-3.043-.402-5.749-2.723-5.749-8.005z"
			stroke="currentColor"
			strokeWidth="1.5"
			fill="none"
		/>
	</svg>
);

const RetweetIcon = () => (
	<svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
		<path d="M4.75 3.79l4.603 4.3-1.706 1.82L6 8.38v7.37c0 .97.784 1.75 1.75 1.75H13V19.25H7.75c-2.347 0-4.25-1.903-4.25-4.25V8.38L1.853 9.91.147 8.09 4.75 3.79zm14.5 16.42l-4.603-4.3 1.706-1.82L18 15.62V8.25c0-.97-.784-1.75-1.75-1.75H11V5.75h5.25c2.347 0 4.25 1.903 4.25 4.25v7.37l1.647-1.53 1.706 1.82-4.603 4.3z" />
	</svg>
);

const HeartIcon = () => (
	<svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
		<path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z" />
	</svg>
);

const ShareIcon = () => (
	<svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
		<path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.29 3.3-1.42-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z" />
	</svg>
);

const BookmarkIcon = () => (
	<svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
		<path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z" />
	</svg>
);

export const TwitterPost = ({
	content,
	isActive,
	hideProfile,
	hideName,
	hideReactions,
	customName,
	customUsername,
	customAvatar,
	customTimestamp,
}: {
	content: string;
	isActive: boolean;
	hideProfile?: boolean;
	hideName?: boolean;
	hideReactions?: boolean;
	customName?: string;
	customUsername?: string;
	customAvatar?: string;
	customTimestamp?: string;
}) => {
	const userName = customName || defaultUsers.twitter.name;
	const userUsername = customUsername || defaultUsers.twitter.username;
	const userAvatar = customAvatar || defaultUsers.twitter.avatar;
	const timestamp = customTimestamp || generateRandomTimestamp("twitter");

	return (
		<div className="flex w-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-black text-gray-500">
			<div className="flex w-full items-start justify-between px-3 pb-2 pr-5 pt-4">
				<div className="flex w-full items-start gap-3">
					{/* Profile Picture */}
					{!hideProfile && (
						<div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-600 text-sm font-medium text-white">
							<div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
								<div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-800">
									<div className="flex h-4 w-4 items-center justify-center rounded-sm bg-white">
										<div className="h-2 w-2 rotate-45 transform rounded-sm bg-gray-800"></div>
									</div>
								</div>
							</div>
						</div>
					)}

					{/* User Info */}
					<div className="flex w-full flex-col items-start justify-start gap-2">
						{!hideName && (
							<div className="flex items-center gap-1 text-xs">
								<span className="text-gray-500">{userUsername}</span>
								<span className="text-gray-500">·</span>
								<span className="text-gray-500">{timestamp}</span>
							</div>
						)}

						<div className="pb-1">
							<div className="text-15px whitespace-pre-line text-start leading-5 text-white">
								{content}
							</div>
						</div>

						{/* Action Buttons */}
						{hideReactions && <div className="mb-1" />}
						{!hideReactions && (
							<div className="flex w-full items-center justify-between">
								{/* Comment */}
								<button className="group flex items-center gap-2 rounded-full p-2">
									<CommentIcon />
								</button>

								{/* Retweet */}
								<button className="group flex items-center gap-2 rounded-full p-2">
									<RetweetIcon />
								</button>

								{/* Like */}
								<button className="group flex items-center gap-2 rounded-full p-2">
									<HeartIcon />
								</button>

								{/* Views */}
								<button className="group flex items-center gap-2 rounded-full p-2">
									<svg
										viewBox="0 0 24 24"
										className="h-5 w-5 fill-current text-gray-500"
									>
										<path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10L6 11v10H4zm9.248 0v-7h2v7h-2z" />
									</svg>
								</button>

								{/* Share & Bookmark */}
								<div className="flex items-center gap-1">
									<button className="group rounded-full p-2">
										<ShareIcon />
									</button>
									<button className="group rounded-full p-2">
										<BookmarkIcon />
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

// Slack Message Component
export const SlackMessage = React.memo<{
	content: string;
	isActive: boolean;
	hideProfile?: boolean;
	hideName?: boolean;
	hideReactions?: boolean;
	customName?: string;
	customAvatar?: string;
	customTimestamp?: string;
}>(
	({
		content,
		hideProfile,
		hideName,
		hideReactions,
		customName,
		customAvatar,
		customTimestamp,
	}) => {
		const userName = customName || defaultUsers.slack.name;
		const userAvatar = customAvatar || defaultUsers.slack.avatar;
		const timestamp = customTimestamp || generateRandomTimestamp("slack");

		return (
			<div className="flex w-full flex-col rounded-xl border border-gray-200 bg-white">
				<div className="flex-shrink-0 rounded-t-xl border-b border-gray-100 bg-gray-50 px-6 py-4">
					<div className="flex items-center gap-3">
						<span className="text-xl text-gray-600">#</span>
						<span className="text-base font-semibold text-gray-900">
							general
						</span>
						<div className="ml-auto flex items-center gap-2 text-sm text-gray-500">
							<div className="h-2 w-2 rounded-full bg-green-500"></div>
							<span>members</span>
						</div>
					</div>
				</div>

				<div className="flex-1 p-6">
					<div className="flex items-start gap-4">
						{!hideProfile && (
							<div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-base font-bold text-white">
								<div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
									<div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-800">
										<div className="flex h-4 w-4 items-center justify-center rounded-sm bg-white">
											<div className="h-2 w-2 rotate-45 transform rounded-sm bg-gray-800"></div>
										</div>
									</div>
								</div>
							</div>
						)}
						<div className="min-w-0 flex-1">
							{!hideName && (
								<div className="mb-2 flex items-center gap-3">
									<span className="text-base font-bold text-gray-900">
										{userName}
									</span>
									<div className="rounded bg-green-600 px-2 py-1 text-xs font-bold text-white">
										APP
									</div>
									<span className="text-xs text-gray-500">{timestamp}</span>
								</div>
							)}
							<div className={`${hideName ? "" : "mb-4"}`}>
								<p className="break-words text-start text-base leading-relaxed text-gray-900">
									{content}
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	},
);

// Discord Message Component
export const DiscordMessage = React.memo<{
	content: string;
	isActive: boolean;
	hideProfile?: boolean;
	hideName?: boolean;
	hideReactions?: boolean;
	customName?: string;
	customAvatar?: string;
	timestamp?: string;
	updateTitle?: string;
	postedVia?: string;
	postedTimestamp?: string;
	customTimestamp?: string;
}>(
	({
		content,
		hideProfile,
		hideName,
		hideReactions,
		customName,
		customAvatar,
		timestamp,
		updateTitle = "Update",
		postedVia,
		postedTimestamp,
		customTimestamp,
	}) => {
		const userName = customName || defaultUsers.discord.name;
		const userAvatar = customAvatar || defaultUsers.discord.avatar;
		const displayTimestamp =
			customTimestamp || timestamp || generateRandomTimestamp("discord");

		return (
			<div className="flex w-full flex-col rounded-xl border border-gray-700 bg-[#1c1d22] py-3 text-white">
				{/* Main Message */}
				<div className="flex items-start gap-4 px-4 py-2 transition-colors hover:bg-gray-800/30">
					{/* Avatar */}
					{!hideProfile && (
						<div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-600 text-sm font-medium text-white">
							<div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
								<div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-800">
									<div className="flex h-4 w-4 items-center justify-center rounded-sm bg-white">
										<div className="h-2 w-2 rotate-45 transform rounded-sm bg-gray-800"></div>
									</div>
								</div>
							</div>
						</div>
					)}

					<div className="min-w-0 flex-1">
						{/* Header */}
						{!hideName && (
							<div className="mb-1 flex items-center gap-2">
								<span className="cursor-pointer text-base font-medium text-white hover:underline">
									{userName}
								</span>
								<div className="rounded bg-indigo-600 px-1.5 py-0.5 text-xs font-bold text-white">
									APP
								</div>
								<span className="text-xs font-medium text-gray-400">
									{displayTimestamp}
								</span>
							</div>
						)}

						{/* Message Content with Blue Border */}
						<div className="relative overflow-hidden rounded-2xl bg-[#27272f] pb-2 pt-3">
							<div className="absolute bottom-0 left-0 top-0 w-1 rounded-full bg-indigo-500"></div>
							<div className="pl-4">
								{/* Update Title */}
								<div className="mb-2 text-base font-semibold text-white">
									{updateTitle}
								</div>

								{/* Main Content */}
								<div className="mb-3 text-sm leading-relaxed text-gray-300">
									{content}
								</div>

								{/* Posted Via */}
								{postedVia && postedTimestamp && (
									<div className="text-xs text-gray-400">
										{postedVia} | {postedTimestamp}
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	},
);

// Set display names
TwitterPost.displayName = "TwitterPost";
LinkedInPost.displayName = "LinkedInPost";
SlackMessage.displayName = "SlackMessage";
DiscordMessage.displayName = "DiscordMessage";

// Main Social Card Component
export const SocialCard: React.FC<SocialCardProps> = React.memo(
	({
		platform,
		content,
		isActive,
		hideProfile,
		hideName,
		hideReactions,
		customName,
		customUsername,
		customAvatar,
		customTimestamp,
	}) => {
		const timeAgo = getTimeAgo(customTimestamp);

		const renderPlatform = () => {
			switch (platform) {
				case "linkedin": {
					return (
						<LinkedInPost
							content={content}
							isActive={isActive}
							hideName={hideName}
							customName={customName}
							customTimestamp={timeAgo}
							hideProfile={hideProfile}
							customAvatar={customAvatar}
							hideReactions={hideReactions}
						/>
					);
				}
				case "twitter": {
					return (
						<TwitterPost
							content={content}
							isActive={isActive}
							hideName={hideName}
							customName={customName}
							hideProfile={hideProfile}
							customTimestamp={timeAgo}
							customAvatar={customAvatar}
							hideReactions={hideReactions}
							customUsername={customUsername}
						/>
					);
				}
				case "slack": {
					return (
						<SlackMessage
							content={content}
							isActive={isActive}
							hideName={hideName}
							customName={customName}
							hideProfile={hideProfile}
							customTimestamp={timeAgo}
							customAvatar={customAvatar}
							hideReactions={hideReactions}
						/>
					);
				}
				case "discord": {
					return (
						<DiscordMessage
							content={content}
							isActive={isActive}
							hideName={hideName}
							customName={customName}
							hideProfile={hideProfile}
							customTimestamp={timeAgo}
							customAvatar={customAvatar}
							hideReactions={hideReactions}
						/>
					);
				}
				default: {
					return;
				}
			}
		};

		return <div className="max-w-md">{renderPlatform()}</div>;
	},
);

SocialCard.displayName = "SocialCard";

// const getAnimationVariants = (animationType: AnimationType) => {
// 	const variants = {
// 		// 1. 3D Flip Animation
// 		flip: {
// 			enter: {
// 				rotateY: 90,
// 				opacity: 0,
// 				scale: 0.8,
// 			},
// 			center: {
// 				rotateY: 0,
// 				opacity: 1,
// 				scale: 1,
// 				transition: {
// 					type: "spring",
// 					stiffness: 200,
// 					damping: 20,
// 					duration: 0.8,
// 				},
// 			},
// 			exit: {
// 				rotateY: -90,
// 				opacity: 0,
// 				scale: 0.8,
// 				transition: {
// 					duration: 0.6,
// 					ease: "easeInOut",
// 				},
// 			},
// 		},

// 		// 2. 3D Cube Rotation
// 		cube: {
// 			enter: {
// 				rotateX: 90,
// 				rotateY: 45,
// 				opacity: 0,
// 				scale: 0.7,
// 				z: -200,
// 			},
// 			center: {
// 				rotateX: 0,
// 				rotateY: 0,
// 				opacity: 1,
// 				scale: 1,
// 				z: 0,
// 				transition: {
// 					type: "spring",
// 					stiffness: 180,
// 					damping: 25,
// 					duration: 1,
// 				},
// 			},
// 			exit: {
// 				rotateX: -90,
// 				rotateY: -45,
// 				opacity: 0,
// 				scale: 0.7,
// 				z: -200,
// 				transition: {
// 					duration: 0.7,
// 					ease: "easeInOut",
// 				},
// 			},
// 		},

// 		// 3. Spiral/Twist Animation
// 		spiral: {
// 			enter: {
// 				rotate: 180,
// 				scale: 0,
// 				opacity: 0,
// 				y: 100,
// 			},
// 			center: {
// 				rotate: 0,
// 				scale: 1,
// 				opacity: 1,
// 				y: 0,
// 				transition: {
// 					type: "spring",
// 					stiffness: 150,
// 					damping: 15,
// 					duration: 0.9,
// 				},
// 			},
// 			exit: {
// 				rotate: -180,
// 				scale: 0,
// 				opacity: 0,
// 				y: -100,
// 				transition: {
// 					duration: 0.6,
// 					ease: "easeInOut",
// 				},
// 			},
// 		},

// 		// 4. Fade with Scale Pulse
// 		"fade-scale": {
// 			enter: {
// 				opacity: 0,
// 				scale: 1.3,
// 				filter: "blur(10px)",
// 			},
// 			center: {
// 				opacity: 1,
// 				scale: 1,
// 				filter: "blur(0px)",
// 				transition: {
// 					type: "spring",
// 					stiffness: 120,
// 					damping: 20,
// 					duration: 0.8,
// 				},
// 			},
// 			exit: {
// 				opacity: 0,
// 				scale: 0.7,
// 				filter: "blur(10px)",
// 				transition: {
// 					duration: 0.5,
// 					ease: "easeOut",
// 				},
// 			},
// 		},

// 		// 5. Stack Slide (like cards being shuffled)
// 		"stack-slide": {
// 			enter: {
// 				x: 300,
// 				rotateZ: 15,
// 				opacity: 0,
// 				scale: 0.9,
// 			},
// 			center: {
// 				x: 0,
// 				rotateZ: 0,
// 				opacity: 1,
// 				scale: 1,
// 				transition: {
// 					type: "spring",
// 					stiffness: 160,
// 					damping: 20,
// 					duration: 0.8,
// 				},
// 			},
// 			exit: {
// 				x: -300,
// 				rotateZ: -15,
// 				opacity: 0,
// 				scale: 0.9,
// 				transition: {
// 					duration: 0.6,
// 					ease: "easeInOut",
// 				},
// 			},
// 		},
// 	};

// 	return variants[animationType];
// };
// Main Card Stack Component
interface CardStackProps {
	interval?: number;
	autoPlay?: boolean;
	isVisible?: boolean;
	platforms?: Platform[];
	onCycleComplete?: () => void;
	animationType?: AnimationType;
	posts?: Partial<Record<Platform, string>>;
}

// const CardStack: React.FC<CardStackProps> = ({
// 	platforms = ["linkedin", "twitter", "slack", "discord"],
// 	animationType = "flip",
// 	posts = samplePosts,
// 	isVisible = true,
// 	onCycleComplete,
// 	autoPlay = true,
// 	interval = 3500,
// }) => {
// 	const [currentIndex, setCurrentIndex] = useState(0);
// 	const [isCompleting, setIsCompleting] = useState(false);
// 	const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

// 	const currentPlatform = useMemo(
// 		() => platforms[currentIndex],
// 		[platforms, currentIndex],
// 	);
// 	const currentContent = useMemo(
// 		() => posts[currentPlatform] || "",
// 		[posts, currentPlatform],
// 	);

// 	const cleanupTimers = useCallback(() => {
// 		if (intervalRef.current) {
// 			clearInterval(intervalRef.current);
// 			intervalRef.current = undefined;
// 		}
// 	}, []);

// 	const handleCycleComplete = useCallback(() => {
// 		if (onCycleComplete && !isCompleting) {
// 			setIsCompleting(true);
// 			cleanupTimers();
// 			setTimeout(() => {
// 				onCycleComplete();
// 				setIsCompleting(false);
// 				setCurrentIndex(0);
// 			}, 300);
// 		}
// 	}, [onCycleComplete, isCompleting, cleanupTimers]);

// 	const updateIndex = useCallback(() => {
// 		setCurrentIndex(previous => {
// 			const next = previous + 1;
// 			if (next >= platforms.length) {
// 				if (onCycleComplete) {
// 					handleCycleComplete();
// 					return previous;
// 				} else {
// 					return 0;
// 				}
// 			}
// 			return next;
// 		});
// 	}, [platforms.length, handleCycleComplete, onCycleComplete]);

// 	useEffect(() => {
// 		if (!isVisible || isCompleting || !autoPlay) {
// 			cleanupTimers();
// 			return;
// 		}

// 		intervalRef.current = setInterval(updateIndex, interval);
// 		return cleanupTimers;
// 	}, [isVisible, isCompleting, autoPlay, interval, updateIndex, cleanupTimers]);

// 	useEffect(() => {
// 		if (isVisible && !autoPlay) {
// 			setIsCompleting(false);
// 			setCurrentIndex(0);
// 		}
// 	}, [isVisible, autoPlay]);

// 	useEffect(() => {
// 		return cleanupTimers;
// 	}, [cleanupTimers]);

// 	const slideVariants = getAnimationVariants(animationType);

// 	const containerVariants = useMemo(
// 		() => ({
// 			initial: { opacity: 0, y: 40, scale: 0.98 },
// 			animate: {
// 				opacity: 1,
// 				y: 0,
// 				scale: 1,
// 				transition: {
// 					duration: 0.5,
// 					ease: [0.25, 0.46, 0.45, 0.94],
// 				},
// 			},
// 			exit: {
// 				opacity: 0,
// 				y: -40,
// 				scale: 0.98,
// 				transition: {
// 					duration: 0.3,
// 					ease: [0.55, 0.06, 0.68, 0.19],
// 				},
// 			},
// 		}),
// 		[],
// 	);

// 	if (!isVisible) return;

// 	return (
// 		<motion.div
// 			className="relative w-full max-w-md border-none bg-none shadow-none"
// 			variants={containerVariants}
// 			initial="initial"
// 			animate="animate"
// 			exit="exit"
// 			style={{
// 				height: CARD_HEIGHT,
// 				perspective: "1200px",
// 				transformStyle: "preserve-3d",
// 			}}
// 		>
// 			<AnimatePresence mode="wait" initial={false}>
// 				<motion.div
// 					key={`${currentPlatform}-${currentIndex}-${animationType}`}
// 					className="absolute inset-0 w-full border-none bg-none shadow-none will-change-transform"
// 					variants={slideVariants}
// 					initial="enter"
// 					animate="center"
// 					exit="exit"
// 					style={{
// 						transformStyle: "preserve-3d",
// 						backfaceVisibility: "hidden",
// 					}}
// 				>
// 					<SocialCard
// 						platform={currentPlatform}
// 						content={currentContent}
// 						isActive={true}
// 					/>
// 				</motion.div>
// 			</AnimatePresence>
// 		</motion.div>
// 	);
// };

export const CardStack: React.FC<CardStackProps> = ({
	platforms = ["linkedin", "twitter", "slack", "discord"],
	posts = samplePosts,
}) => {
	if (platforms.length === 0) return;

	return (
		<div className="w-full space-y-4">
			{platforms.map(platform => (
				<SocialCard
					key={platform}
					isActive={true}
					platform={platform}
					content={posts[platform] || ""}
				/>
			))}
		</div>
	);
};

// normalize org platform strings to our scaffold ids
const normalizePlatform = (p?: string) => {
	const v = (p || "").toLowerCase();
	if (v === "x" || v === "twitter" || v === "x-twitter") return "x";
	if (v === "linkedin") return "linkedin";
	if (v === "discord") return "discord";
	if (v === "slack") return "slack";
	return;
};

// --- keep your scaffold as-is (empty connectedAccounts) ---
const socialAccounts: SocialAccount[] = [
	{
		id: "x",
		icon: "x-twitter",
		name: "X (Twitter)",
		description: "Social media and microblogging",
		connectedAccounts: [],
	},
	{
		id: "linkedin",
		icon: "linkedin",
		name: "LinkedIn",
		description: "Professional networking platform",
		connectedAccounts: [],
	},
	{
		id: "slack",
		icon: "slack",
		name: "Slack",
		description: "Team communication workspace",
		connectedAccounts: [],
	},
	{
		id: "discord",
		icon: "discord",
		name: "Discord",
		description: "Community and voice chat platform",
		connectedAccounts: [],
	},
];
// --- Demo Component with Animation Selection ---
const SocialPostsDemo: React.FC = () => {
	const { organization } = useOrganizationStore();

	// Build the list by grouping org socials into the scaffold
	const accounts = useMemo<SocialAccount[]>(() => {
		const grouped: Record<string, ConnectedAccount[]> = {};

		(organization?.socials ?? []).forEach((s: OrganizationSocial) => {
			const pid = normalizePlatform(s.platform);
			if (!pid) return; // skip unknown platforms
			if (!grouped[pid]) grouped[pid] = [];
			grouped[pid].push({
				platform: pid,
				id: String(s.id),
				name: String(s.name),
				handle: String(s.handle),
				profile_image_url: String(s.profile_image_url),
			});
		});

		return socialAccounts.map(card => ({
			...card,
			connectedAccounts: grouped[card.id] ?? [],
		}));
	}, [organization?.socials]);

	// Only keep valid platforms that actually have connected accounts
	const connectedPlatforms = useMemo<Platform[]>(() => {
		const validPlatforms = new Set<Platform>([
			"linkedin",
			"twitter",
			"slack",
			"discord",
		]);

		return accounts
			.filter(accumulator => accumulator.connectedAccounts.length > 0)
			.map(accumulator => accumulator.id)
			.filter((id): id is Platform => validPlatforms.has(id as Platform));
	}, [accounts]);

	// const [isPlaying, setIsPlaying] = useState(true);
	// const [selectedAnimation, setSelectedAnimation] =
	// 	useState<AnimationType>("fade-scale");

	// const handleCycleComplete = useCallback(() => {
	// 	setIsPlaying(false);
	// 	setTimeout(() => setIsPlaying(true), 100);
	// }, []);

	// console.log(connectedPlatforms, "Connected Platforms");

	return (
		<div className="space-y-6">
			{/* CardStack Preview */}
			<div className="relative w-auto overflow-hidden border-none bg-[#f4f4f4] p-3 pb-4 shadow-none">
				<CardStack
					// onCycleComplete={handleCycleComplete}
					platforms={connectedPlatforms}
					// animationType={selectedAnimation}
					// isVisible={isPlaying}
					// autoPlay={true}
					// interval={3500}
				/>
			</div>
		</div>
	);
};

export default SocialPostsDemo;
