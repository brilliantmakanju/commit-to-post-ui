"use client";
import { useState } from "react";
import { FaDiscord, FaLinkedin, FaPaperPlane, FaTimes } from "react-icons/fa";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { generatePost } from "@/server-actions/playground/post-message";
import { type MessageType, useChatStore } from "@/zustand/chat-store";

import { ImageStyleModal } from "./modal/image-style-modal";
import { PlatformModal } from "./modal/platform-modal";

const XIcon: React.FC<{ className?: string }> = ({ className }) => (
	<svg viewBox="0 0 24 24" className={className} fill="currentColor">
		<path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932L18.901 1.153ZM17.61 20.644h2.039L6.486 3.24H4.298L17.61 20.644Z" />
	</svg>
);

const PlatformIcon = ({ platform }: { platform: string }) => {
	const iconProps = { className: "w-4 h-4 text-zinc-100" };

	switch (platform.toLowerCase()) {
		case "twitter":
		case "x": {
			return <XIcon className="h-4 w-4" />;
		}
		case "linkedin": {
			return <FaLinkedin {...iconProps} />;
		}
		case "discord": {
			return <FaDiscord {...iconProps} />;
		}
		default: {
			return;
		}
	}
};

const getSelectionTagStyle = () =>
	"inline-flex items-center gap-1 rounded-full ml-2 border border-zinc-700/50 bg-arch-dark-light py-[4px] px-2 text-zinc-100 transition-colors hover:border-zinc-600/70";

// Limit Status Component
const LimitStatusBanner = ({
	canGenerate,
	remaining,
	isAuthenticated,
	planType,
}: {
	canGenerate: boolean;
	remaining: number;
	isAuthenticated: boolean;
	planType: string;
}) => {
	if (canGenerate) {
		return <></>;
	}

	return (
		<div className="mb-2 flex items-center gap-3 rounded-md border border-gray-600 bg-gray-800/60 px-4 py-2.5">
			<div className="h-2 w-2 rounded-full bg-gray-400"></div>
			<div className="flex-1">
				<span className="block text-sm text-gray-200">
					{isAuthenticated ? "Monthly limit reached" : "Daily limit reached"}
				</span>
				{!isAuthenticated && (
					<span className="text-xs text-gray-400">
						Sign up for higher limits or try again tomorrow
					</span>
				)}
			</div>
		</div>
	);
};

export function ChatInput() {
	const [isSubmitting, setIsSubmitting] = useState(false);

	const {
		isGenerating,
		selectedMode,
		currentInputText,
		selectedPlatform,
		selectedImageStyle,
		setInputText,
		clearSelection,
		addUserMessage,
		setSelectedMode,
		setIsGenerating,
		setPostModalOpen,
		addServerResponse,
		updateUserLimitsAfterGeneration,
		canGenerate,
		getRemainingGenerations,
		generationLimits,
	} = useChatStore();

	// Check if user can generate content
	const userCanGenerate = canGenerate("post");
	const remainingGenerations = getRemainingGenerations();
	const isAuthenticated = generationLimits?.limits?.is_authenticated || false;
	const planType =
		generationLimits?.limits?.plan ||
		generationLimits?.limits?.plan_type ||
		"anonymous";

	const handleModeSelect = (mode: MessageType) => {
		// Don't allow selection of disabled modes
		if (mode === "image" || mode === "meme") {
			return;
		}

		// Don't allow mode selection if limit reached
		if (!userCanGenerate) {
			toast.error("Generation limit reached", {
				description: isAuthenticated
					? "You've reached your monthly generation limit."
					: "Daily limit reached. Sign up for higher limits or try again tomorrow.",
			});
			return;
		}

		if (selectedMode === mode) {
			// If clicking the same mode, clear everything
			setSelectedMode(undefined);
			clearSelection();
		} else {
			// Set the new mode
			setSelectedMode(mode);

			// Mode-specific actions
			if (mode === "post") {
				// Clear image style but keep mode and platform
				useChatStore.getState().setSelectedImageStyle(undefined);
				setPostModalOpen(true);
			}
		}
	};

	const handleSubmit = async () => {
		if (!userCanGenerate) {
			toast.error("Generation limit reached", {
				description: isAuthenticated
					? "You've reached your monthly generation limit."
					: "Daily limit reached. Sign up for higher limits or try again tomorrow.",
			});
			return;
		}

		if (!currentInputText.trim()) {
			toast.error("Please enter a message", {
				description: "Type something before sending.",
			});
			return;
		}

		if (!selectedMode) {
			toast.error("Please select a mode", {
				description: "Choose Post before sending.",
			});
			return;
		}

		if (selectedMode === "post" && !selectedPlatform) {
			toast.error("Please select a platform", {
				description: "Choose a platform for your post.",
			});
			return;
		}

		setIsSubmitting(true);
		setIsGenerating(true);

		try {
			// Add user message first
			const userInputId = addUserMessage(
				currentInputText,
				selectedMode,
				selectedPlatform,
			);

			// Generate posts using server action
			const result = await generatePost({
				commits: currentInputText,
				tone: "professional",
				platform: selectedPlatform || "linkedin",
			});

			console.log(result, "Result");

			if (result.success && result.data) {
				// Add successful server response with generated posts
				addServerResponse(userInputId, {
					content: result.data.posts,
				});

				// Update user limits if provided in the response
				if (result.data.user_limits) {
					updateUserLimitsAfterGeneration(result.data.user_limits);
				}
			} else {
				// Handle different error types
				if (
					result.error === "daily_limit_exceeded" ||
					result.error === "monthly_limit_exceeded"
				) {
					toast.error("Generation limit reached", {
						description:
							result.message || "You've reached your generation limit.",
					});
				} else if (result.error === "insufficient_credits") {
					toast.error("Insufficient credits", {
						description:
							result.message ||
							"You don't have enough credits for this generation.",
					});
				} else {
					// Handle empty or invalid posts array
					addServerResponse(userInputId, {
						content:
							"Sorry, I couldn't generate a post right now. Please try again.",
						error:
							result.error || "Empty or invalid posts array returned by API.",
					});
				}
			}

			// Clear input and selections
			setInputText("");
		} catch (error) {
			console.error("Failed to send message:", error);
			toast.error("Failed to send message", {
				description: "Unexpected error. Please try again.",
			});
		} finally {
			setIsSubmitting(false);
			setIsGenerating(false);
		}
	};

	const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault();
			handleSubmit();
		}
	};

	const clearCurrentSelection = () => {
		setSelectedMode(undefined);
		clearSelection();
	};

	const isSendDisabled = () => {
		// Check limits first
		if (!userCanGenerate) {
			return true;
		}

		// Basic checks
		if (!currentInputText.trim() || isSubmitting || isGenerating) {
			return true;
		}

		// Must have a mode selected
		if (!selectedMode) {
			return true;
		}

		// Mode-specific validation
		if (selectedMode === "post" && !selectedPlatform) {
			return true;
		}

		if (selectedMode === "image" && !selectedImageStyle) {
			return true;
		}

		return false;
	};

	const getModeButtonStyle = (mode: MessageType) => {
		const isSelected = selectedMode === mode;
		const isDisabled = mode === "image" || mode === "meme" || !userCanGenerate;
		const baseClasses =
			"h-10 rounded-xl px-4 font-medium transition-all duration-300 ease-out relative overflow-hidden";

		if (isDisabled) {
			return `${baseClasses} bg-gray-800 text-white border border-gray-700 hover:bg-gray-700 hover:border-gray-600 hover:text-gray-100 active:bg-gray-900 opacity-60 cursor-not-allowed`;
		}

		if (isSelected) {
			return `${baseClasses} bg-white text-black border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transform hover:scale-105 active:scale-100`;
		}

		return `${baseClasses} bg-gray-800 text-white border border-gray-700 hover:bg-gray-700 hover:border-gray-600 hover:text-gray-100 active:bg-gray-900`;
	};

	const getTextareaClasses = () => {
		const baseClasses =
			"h-[100px] max-h-[130px] min-h-[50px] resize-none border-0 bg-transparent p-4 pb-2 text-base leading-relaxed shadow-none focus-visible:ring-0 focus-visible:ring-offset-0";

		if (!userCanGenerate) {
			return `${baseClasses} opacity-50 cursor-not-allowed`;
		}

		return baseClasses;
	};

	const getInputContainerClasses = () => {
		const baseClasses =
			"rounded-xl border bg-background/95 pt-2 shadow-lg backdrop-blur-md";

		if (!userCanGenerate) {
			return `${baseClasses} border-gray-600 bg-gray-900/20`;
		}

		return `${baseClasses} border-border`;
	};

	return (
		<TooltipProvider>
			<div className="mx-auto max-w-5xl">
				{/* Limit Status Banner */}
				{generationLimits && (
					<LimitStatusBanner
						canGenerate={userCanGenerate}
						remaining={remainingGenerations}
						isAuthenticated={isAuthenticated}
						planType={planType}
					/>
				)}

				{/* Input Container */}
				<div className={getInputContainerClasses()}>
					{selectedPlatform && (
						<div className={getSelectionTagStyle()}>
							<PlatformIcon platform={selectedPlatform} />
							<button
								onClick={clearCurrentSelection}
								aria-label="Clear platform selection"
								className="h-auto rounded-full bg-transparent p-0.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
								disabled={!userCanGenerate}
							>
								<FaTimes className="h-3 w-3" />
							</button>
						</div>
					)}

					{/* Text Area */}
					<Textarea
						value={currentInputText}
						onKeyDown={handleKeyPress}
						disabled={isSubmitting || isGenerating || !userCanGenerate}
						placeholder={
							userCanGenerate
								? "Type your git commit message..."
								: "Generation limit reached. Please try again later or upgrade your plan."
						}
						onChange={event => setInputText(event.target.value)}
						className={getTextareaClasses()}
					/>

					{/* Bottom Controls */}
					<div className="flex items-center justify-between border-t border-border p-3">
						{/* Left Side: Mode Selection Buttons */}
						<div className="flex items-center gap-2">
							{/* Post Button */}
							<Tooltip>
								<TooltipTrigger asChild>
									<div>
										<Button
											className={getModeButtonStyle("post")}
											disabled={
												isSubmitting || isGenerating || !userCanGenerate
											}
											onClick={() => handleModeSelect("post")}
										>
											Post
										</Button>
									</div>
								</TooltipTrigger>
								{!userCanGenerate && (
									<TooltipContent
										side="top"
										className="border-gray-600 bg-gray-900 text-gray-200"
									>
										<p>
											Generation limit reached.{" "}
											{isAuthenticated
												? "Monthly limit exceeded."
												: "Daily limit exceeded."}
										</p>
									</TooltipContent>
								)}
							</Tooltip>

							{/* Image Button - Disabled with Tooltip */}
							<Tooltip>
								<TooltipTrigger asChild>
									<div>
										<Button disabled className={getModeButtonStyle("image")}>
											Image
										</Button>
									</div>
								</TooltipTrigger>
								<TooltipContent
									side="top"
									className="border-gray-700 bg-black text-white"
								>
									<p>Coming Soon! This feature is under development.</p>
								</TooltipContent>
							</Tooltip>

							{/* Meme Button - Disabled with Tooltip */}
							<Tooltip>
								<TooltipTrigger asChild>
									<div>
										<Button disabled className={getModeButtonStyle("meme")}>
											Meme
										</Button>
									</div>
								</TooltipTrigger>
								<TooltipContent
									side="top"
									className="border-gray-700 bg-black text-white"
								>
									<p>Coming Soon! This feature is under development.</p>
								</TooltipContent>
							</Tooltip>
						</div>

						{/* Right Side: Send Button */}
						<div className="flex items-center gap-2">
							<Tooltip>
								<TooltipTrigger asChild>
									<div>
										<Button
											onClick={handleSubmit}
											disabled={isSendDisabled()}
											className={`h-10 rounded-xl px-4 font-medium transition-all duration-200 ease-out ${
												isSendDisabled()
													? "cursor-not-allowed bg-gray-600/50 text-white/30"
													: "transform bg-white text-black shadow-lg hover:-translate-y-0.5 hover:shadow-xl"
											}`}
										>
											<FaPaperPlane className="mr-2 h-4 w-4" />
											{isSubmitting || isGenerating ? "Sending..." : "Send"}
										</Button>
									</div>
								</TooltipTrigger>
								{!userCanGenerate && (
									<TooltipContent
										side="top"
										className="border-gray-600 bg-gray-900 text-gray-200"
									>
										<p>Cannot send: Generation limit reached</p>
									</TooltipContent>
								)}
							</Tooltip>
						</div>
					</div>
				</div>

				{/* Modals */}
				<PlatformModal />
				<ImageStyleModal />
			</div>
		</TooltipProvider>
	);
}
