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
		setPostModalOpen,
		setIsGenerating,
		addServerResponse,
	} = useChatStore();

	const handleModeSelect = (mode: MessageType) => {
		// Don't allow selection of disabled modes
		if (mode === "image" || mode === "meme") {
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

			if (result.success && result.data) {
				// Add successful server response with generated posts
				addServerResponse(userInputId, {
					content: result.data.posts,
				});
			} else {
				// Handle empty or invalid posts array
				addServerResponse(userInputId, {
					content:
						"Sorry, I couldn’t generate a post right now. Please try again.",
					error: "Empty or invalid posts array returned by API.",
				});
			}

			// Clear input and selections
			setInputText("");
		} catch {
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
		const isDisabled = mode === "image" || mode === "meme";
		const baseClasses =
			"h-10 rounded-xl px-4 font-medium transition-all duration-300 ease-out relative overflow-hidden";

		if (isDisabled) {
			return `${baseClasses} bg-gray-800 text-white border border-gray-700 hover:bg-gray-700 hover:border-gray-600 hover:text-gray-100 active:bg-gray-900 opacity-80`;
		}

		if (isSelected) {
			return `${baseClasses} bg-white text-black border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transform hover:scale-105 active:scale-100`;
		}

		return `${baseClasses} bg-gray-800 text-white border border-gray-700 hover:bg-gray-700 hover:border-gray-600 hover:text-gray-100 active:bg-gray-900`;
	};

	return (
		<TooltipProvider>
			<div className="mx-auto max-w-5xl">
				{/* Selection Display */}
				{/* {(selectedPlatform || selectedImageStyle) && (
					<div className="mb-4 flex flex-wrap items-center gap-2">
						{selectedPlatform && (
							<div className={getSelectionTagStyle()}>
								<PlatformIcon platform={selectedPlatform} />
								<button
									onClick={clearCurrentSelection}
									aria-label="Clear platform selection"
									className="h-auto rounded-full bg-transparent p-0.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
								>
									<FaTimes className="h-3 w-3" />
								</button>
							</div>
						)}

						{selectedImageStyle && (
							<div className={getSelectionTagStyle()}>
								<span className="flex items-center gap-2">
									<FaImage className="h-3 w-3" />
									{selectedImageStyle.charAt(0).toUpperCase() +
										selectedImageStyle.slice(1)}
								</span>
								<button
									onClick={clearCurrentSelection}
									className="h-auto rounded-full bg-transparent p-0.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
									aria-label="Clear image style selection"
								>
									<FaTimes className="h-3 w-3" />
								</button>
							</div>
						)}
					</div>
				)} */}

				{/* Input Container */}
				<div className="rounded-xl border border-border bg-background/95 pt-2 shadow-lg backdrop-blur-md">
					{selectedPlatform && (
						<div className={getSelectionTagStyle()}>
							<PlatformIcon platform={selectedPlatform} />
							<button
								onClick={clearCurrentSelection}
								aria-label="Clear platform selection"
								className="h-auto rounded-full bg-transparent p-0.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
							>
								<FaTimes className="h-3 w-3" />
							</button>
						</div>
					)}
					{/* Text Area */}
					<Textarea
						value={currentInputText}
						onKeyDown={handleKeyPress}
						disabled={isSubmitting || isGenerating}
						placeholder="Type your git commit message..."
						onChange={event => setInputText(event.target.value)}
						className="h-[100px] max-h-[130px] min-h-[50px] resize-none border-0 bg-transparent p-4 pb-2 text-base leading-relaxed shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
					/>

					{/* Bottom Controls */}
					<div className="flex items-center justify-between border-t border-border p-3">
						{/* Left Side: Mode Selection Buttons */}
						<div className="flex items-center gap-2">
							{/* Post Button - Always Enabled */}
							<Button
								className={getModeButtonStyle("post")}
								disabled={isSubmitting || isGenerating}
								onClick={() => handleModeSelect("post")}
							>
								Post
							</Button>

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
					</div>
				</div>

				{/* Modals */}
				<PlatformModal />
				<ImageStyleModal />
			</div>
		</TooltipProvider>
	);
}
