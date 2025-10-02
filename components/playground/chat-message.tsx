"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FaDiscord, FaDownload, FaLinkedinIn } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { getTimeAgo } from "@/lib/get-time";
import type { ChatMessage as ChatMessageType } from "@/zustand/chat-store";

import { SocialCard } from "../landing/micro/v3/social-card";

interface ChatMessageProps {
	message: ChatMessageType;
	timeAgo?: string;
}

const XIcon: React.FC<{ className?: string }> = ({ className }) => (
	<svg viewBox="0 0 24 24" className={className} fill="currentColor">
		<path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932L18.901 1.153ZM17.61 20.644h2.039L6.486 3.24H4.298L17.61 20.644Z" />
	</svg>
);

const usernames = [
	"dev_ninja",
	"code_wizard",
	"tech_explorer",
	"byte_master",
	"pixel_pusher",
	"data_wrangler",
	"cloud_surfer",
	"api_whisperer",
	"bug_hunter",
	"feature_builder",
	"stack_overflow",
	"git_commit",
	"async_await",
	"full_stack",
	"clean_code",
	"refactor_king",
	"deploy_master",
	"server_side",
	"client_side",
	"database_guru",
	"algorithm_ace",
	"function_first",
	"object_oriented",
	"agile_mind",
	"scrum_master",
	"sprint_runner",
	"code_reviewer",
	"merge_conflict",
	"pull_request",
	"issue_tracker",
];

const fragments = [
	"",
	"_",
	".",
	"__",
	"x",
	"dev",
	"hub",
	"io",
	"js",
	"ts",
	"99",
	"24",
	"ai",
	"bot",
	"the",
	"its",
	"real",
];

function generateRandomUsername() {
	const base = usernames[Math.floor(Math.random() * usernames.length)];
	const fragment = fragments[Math.floor(Math.random() * fragments.length)];

	// Optional number (0–9999 but not always)
	const maybeNumber =
		Math.random() > 0.6 ? Math.floor(Math.random() * 10000) : "";

	// Optionally double a letter in the base for realism
	let tweakedBase = base;
	if (Math.random() > 0.7) {
		const index = Math.floor(Math.random() * base.length);
		tweakedBase = base.slice(0, index) + base[index] + base.slice(index); // doubles one random character
	}

	// Different structure patterns
	const patterns = [
		`@${tweakedBase}${fragment}${maybeNumber}`,
		`@${fragment}${tweakedBase}${maybeNumber}`,
		`@${tweakedBase}${maybeNumber}${fragment}`,
		`@${tweakedBase}_${maybeNumber}`,
		`@${fragment}${tweakedBase}`,
	];

	return patterns[Math.floor(Math.random() * patterns.length)];
}

const getPersistentUsername = () => {
	const stored = localStorage.getItem("randomUsername");
	if (stored) return stored;
	const newOne = generateRandomUsername();
	localStorage.setItem("randomUsername", newOne);
	return newOne;
};

export function ChatMessage({ message }: ChatMessageProps) {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedImageUrl, setSelectedImageUrl] = useState("");
	const [selectedImageIndex, setSelectedImageIndex] = useState(0);
	const [randomUsername, setRandomUsername] = useState<string>("");

	useEffect(() => {
		setRandomUsername(getPersistentUsername());
	}, []);

	const getPlatformIcon = (platform?: string) => {
		switch (platform) {
			case "linkedin": {
				return (
					<FaLinkedinIn className="h-3 w-3 text-gray-400 transition-all duration-200 sm:h-4 sm:w-4 md:h-4 md:w-4" />
				);
			}
			case "twitter": {
				return (
					<XIcon className="h-3 w-3 text-gray-400 transition-all duration-200 sm:h-4 sm:w-4 md:h-4 md:w-4" />
				);
			}
			case "discord": {
				return (
					<FaDiscord className="h-3 w-3 text-gray-400 transition-all duration-200 sm:h-4 sm:w-4 md:h-4 md:w-4" />
				);
			}
			case "slack": {
				return (
					<div className="flex h-3 w-3 items-center justify-center rounded bg-green-600 text-xs font-bold text-white sm:h-4 sm:w-4">
						S
					</div>
				);
			}
			default: {
				return;
			}
		}
	};

	const handleImageClick = (imageUrl: string, index: number) => {
		setSelectedImageUrl(imageUrl.trim());
		setSelectedImageIndex(index);
		setIsModalOpen(true);
	};

	const handleDownloadImage = async () => {
		try {
			const response = await fetch(selectedImageUrl);
			const blob = await response.blob();
			const url = globalThis.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.style.display = "none";
			a.href = url;
			a.download = `generated-image-${selectedImageIndex + 1}.png`;
			document.body.append(a);
			a.click();
			globalThis.URL.revokeObjectURL(url);
			a.remove();
		} catch (error) {
			console.error("Error downloading image:", error);
		}
	};

	const getShareUrl = (platform: string) => {
		const imageText = "Check out this AI-generated image!";
		const encodedText = encodeURIComponent(imageText);
		const encodedImageUrl = encodeURIComponent(selectedImageUrl);

		switch (platform) {
			case "linkedin": {
				return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedImageUrl}&text=${encodedText}`;
			}
			case "twitter": {
				return `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedImageUrl}`;
			}
			case "discord": {
				// Discord doesn't have a direct share URL, so we'll copy to clipboard instead
				navigator.clipboard.writeText(`${imageText} ${selectedImageUrl}`);
				return;
			}
			default: {
				return;
			}
		}
	};

	const handleShare = (platform: string) => {
		const shareUrl = getShareUrl(platform);
		if (shareUrl) {
			window.open(shareUrl, "_blank", "noopener,noreferrer");
		}
		// For Discord, the URL is already copied to clipboard in getShareUrl
		if (platform === "discord") {
			// You could show a toast notification here
			console.log("Discord share text copied to clipboard!");
		}
	};

	if (message.isUser) {
		// User messages - right aligned, dark theme
		return (
			<div className="mb-4 flex justify-end">
				<div className="max-w-[80%]">
					<div className="rounded-lg bg-gray-900 px-4 py-3 text-white shadow-sm">
						<p className="break-words text-sm leading-relaxed">
							{message.content}
						</p>

						{/* Metadata */}
						<div className="mt-2 flex items-center gap-3 border-t border-gray-700 pt-2">
							{message.platform && (
								<div className="flex items-center gap-1">
									{getPlatformIcon(message.platform)}
								</div>
							)}
							{message.imageStyle && (
								<span className="text-xs capitalize text-gray-400">
									{message.imageStyle} style
								</span>
							)}
							<span className="ml-auto text-xs text-gray-500">
								{getTimeAgo(message.timestamp)}
							</span>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// AI responses - left aligned, light theme
	return (
		<>
			<div className="mb-4 flex justify-start">
				<div className="max-w-[80%]">
					{/* Text-only responses (posts) */}
					{message.type === "post" && message.platform && (
						<div className="space-y-3">
							<SocialCard
								isActive={true}
								// hideReactions={true}
								content={message.content}
								platform={message.platform}
								customName={"Generated"}
								customUsername={
									message.platform === "twitter" ? randomUsername : undefined
								}
								customTimestamp={`${message.timestamp}`}
							/>
						</div>
					)}

					{/* Text-only responses without platform */}
					{message.type === "post" && !message.platform && (
						<div className="rounded-lg bg-gray-100 px-4 py-3 text-gray-900 shadow-sm">
							<p className="text-sm leading-relaxed">{message.content}</p>
							<span className="mt-2 block text-xs text-gray-500">
								{getTimeAgo(message.timestamp)}
							</span>
						</div>
					)}

					{/* Default text responses */}
					{!message.type && (
						<div className="rounded-lg bg-gray-100 px-4 py-3 text-gray-900 shadow-sm">
							<p className="text-sm leading-relaxed">{message.content}</p>
							<span className="mt-2 block text-xs text-gray-500">
								{getTimeAgo(message.timestamp)}
							</span>
						</div>
					)}

					{/* Image/Meme responses */}
					{(message.type === "image" || message.type === "meme") && (
						<div className="space-y-3">
							{/* Generated images */}
							{message.generatedImage && (
								<>
									<div className="rounded-lg bg-gray-50 p-3 shadow-sm">
										<div className="space-y-4">
											{/* Multiple images support - split by comma if needed */}
											{message.generatedImage
												.split(",")
												.map((imageUrl, index) => (
													<div key={index} className="space-y-3">
														<div className="relative">
															<Image
																src={imageUrl.trim()}
																alt={`Generated ${message.type} ${index + 1}`}
																className="h-auto max-h-80 w-full max-w-sm cursor-pointer rounded-lg object-cover transition-opacity hover:opacity-90"
																width={400}
																height={300}
																onClick={() =>
																	handleImageClick(imageUrl, index)
																}
																style={{
																	maxWidth: "320px",
																	maxHeight: "320px",
																	objectFit: "cover",
																}}
															/>
														</div>
														{/* Quick Actions under each image */}
														<div className="flex items-center justify-between border-t border-gray-200 pt-3">
															<div className="flex items-center gap-1">
																{/* Social share buttons */}
																<Button
																	variant="ghost"
																	size="sm"
																	onClick={() => {
																		setSelectedImageUrl(imageUrl.trim());
																		setSelectedImageIndex(index);
																		handleShare("linkedin");
																	}}
																	className="h-8 w-8 rounded-full p-0 hover:bg-gray-200"
																	title="Share on LinkedIn"
																>
																	<FaLinkedinIn className="h-3 w-3 text-gray-500 hover:text-gray-700" />
																</Button>
																<Button
																	variant="ghost"
																	size="sm"
																	onClick={() => {
																		setSelectedImageUrl(imageUrl.trim());
																		setSelectedImageIndex(index);
																		handleShare("twitter");
																	}}
																	className="h-8 w-8 rounded-full p-0 hover:bg-gray-200"
																	title="Share on Twitter"
																>
																	<XIcon className="h-3 w-3 text-gray-500 hover:text-gray-700" />
																</Button>
																<Button
																	variant="ghost"
																	size="sm"
																	onClick={() => {
																		setSelectedImageUrl(imageUrl.trim());
																		setSelectedImageIndex(index);
																		handleShare("discord");
																	}}
																	className="h-8 w-8 rounded-full p-0 hover:bg-gray-200"
																	title="Share on Discord"
																>
																	<FaDiscord className="h-3 w-3 text-gray-500 hover:text-gray-700" />
																</Button>
															</div>

															<div className="flex items-center gap-1">
																{/* Download button */}
																<Button
																	variant="ghost"
																	size="sm"
																	onClick={async () => {
																		setSelectedImageUrl(imageUrl.trim());
																		setSelectedImageIndex(index);
																		await handleDownloadImage();
																	}}
																	className="h-8 w-8 rounded-full p-0 hover:bg-gray-200"
																	title="Download image"
																>
																	<FaDownload className="h-3 w-3 text-gray-500 hover:text-gray-700" />
																</Button>
																{/* View in modal button */}
																<Button
																	variant="ghost"
																	size="sm"
																	onClick={() =>
																		handleImageClick(imageUrl, index)
																	}
																	className="h-8 w-8 rounded-full p-0 hover:bg-gray-200"
																	title="View larger"
																>
																	<svg
																		className="h-3 w-3 text-gray-500 hover:text-gray-700"
																		fill="none"
																		viewBox="0 0 24 24"
																		stroke="currentColor"
																	>
																		<path
																			strokeLinecap="round"
																			strokeLinejoin="round"
																			strokeWidth={2}
																			d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
																		/>
																	</svg>
																</Button>
															</div>
														</div>
													</div>
												))}
										</div>
									</div>
									<span className="block px-2 text-xs text-gray-500">
										{getTimeAgo(message.timestamp)}
									</span>
								</>
							)}

							{/* Text-only image/meme request (no generated image yet) */}
							{!message.generatedImage && (
								<div className="rounded-lg bg-gray-100 px-4 py-3 text-gray-900 shadow-sm">
									<p className="text-sm leading-relaxed">{message.content}</p>
									<span className="mt-2 block text-xs text-gray-500">
										{getTimeAgo(message.timestamp)}
									</span>
								</div>
							)}
						</div>
					)}
				</div>
			</div>

			{/* Modal for image viewing and sharing */}
			<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
				<DialogContent className="max-w-3xl border-0 bg-white p-0 shadow-2xl">
					<DialogHeader className="hidden border-b-[1px] border-arch-dark p-3">
						<DialogTitle>View and Share Generated Image</DialogTitle>
					</DialogHeader>

					{/* Image Container - Full width at top */}
					<div className="relative">
						<div className="flex items-center justify-center p-6">
							<Image
								src={selectedImageUrl}
								alt="Generated image preview"
								className="max-h-96 max-w-full rounded-lg object-contain"
								width={600}
								height={400}
							/>
						</div>

						{/* Close button overlay */}
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setIsModalOpen(false)}
							className="absolute right-2 top-2 h-8 w-8 rounded-full bg-white/80 p-0 text-gray-600 shadow-sm hover:bg-white hover:text-gray-800"
						>
							<svg
								className="h-4 w-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</Button>
					</div>

					{/* Actions Panel - Bottom section */}
					<div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
						<div className="flex items-center justify-between">
							{/* Social Share Buttons */}
							<div className="flex items-center gap-2">
								<span className="mr-2 text-sm font-medium text-gray-700">
									Share:
								</span>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => handleShare("linkedin")}
									className="h-8 w-8 rounded-full p-0 hover:bg-gray-200"
									title="Share on LinkedIn"
								>
									<FaLinkedinIn className="h-4 w-4 text-gray-500 hover:text-blue-600" />
								</Button>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => handleShare("twitter")}
									className="h-8 w-8 rounded-full p-0 hover:bg-gray-200"
									title="Share on Twitter"
								>
									<XIcon className="h-4 w-4 text-gray-500 hover:text-gray-800" />
								</Button>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => handleShare("discord")}
									className="h-8 w-8 rounded-full p-0 hover:bg-gray-200"
									title="Share on Discord"
								>
									<FaDiscord className="h-4 w-4 text-gray-500 hover:text-indigo-600" />
								</Button>
							</div>

							{/* Download Button */}
							<div className="flex items-center gap-3">
								<Button
									onClick={handleDownloadImage}
									size="sm"
									className="flex items-center gap-2"
								>
									<FaDownload className="h-3 w-3" />
									Download
								</Button>
							</div>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
