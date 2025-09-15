import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import { useState } from "react";
import {
	FaArrowDown,
	FaArrowUp,
	FaCheckCircle,
	FaCopy,
	FaFile,
	FaImage,
	FaLock,
	FaSearch,
	FaSignInAlt,
	FaSmile,
	FaTimes,
	FaUser,
} from "react-icons/fa";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useAuthModalStore from "@/zustand/auth/use-auth-modal";
import type { ChatMessage } from "@/zustand/chat-store";
import { useChatStore } from "@/zustand/chat-store";

import SubAuthModal from "../auth/sub-modal";

interface ChatSidebarProps {
	session?: any;
	isMobile?: boolean;
	onClose?: () => void;
}

type SortOrder = "newest" | "oldest";

interface MessageGroup {
	userMessage: ChatMessage;
	aiResponse?: ChatMessage;
}

// Login prompt component for non-authenticated users
function LoginPrompt() {
	const { openModal, isOpen } = useAuthModalStore();

	const handleLogin = () => {
		openModal("login");
	};

	return (
		<>
			{isOpen && <SubAuthModal />}
			<div className="flex h-full flex-col items-center justify-center p-4 text-center md:p-8">
				<div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border-2 border-gray-200 bg-gray-100 md:h-20 md:w-20">
					<FaLock className="h-6 w-6 text-gray-600 md:h-8 md:w-8" />
				</div>

				<h3 className="mb-3 text-base font-semibold text-gray-900 md:text-lg">
					Save Your Chat History
				</h3>

				<p className="mb-6 max-w-sm text-xs leading-relaxed text-gray-600 md:text-sm">
					Sign in to automatically save and access your conversation history
					across all your devices.
				</p>

				<Button
					onClick={handleLogin}
					className="flex items-center gap-2 bg-gray-900 px-4 py-2 text-sm text-white transition-colors hover:bg-gray-800 md:px-6 md:text-base"
				>
					<FaSignInAlt className="h-3 w-3 md:h-4 md:w-4" />
					Sign In to Continue
				</Button>
			</div>
		</>
	);
}

const getPostPreview = (aiResponse: ChatMessage): string => {
	if (aiResponse.type !== "post") return "";

	const match = aiResponse.content.match(/"([^"]*)"/);
	if (match && match[1]) {
		return match[1];
	}

	return aiResponse.content.slice(0, 100) + "...";
};

const groupMessages = (messages: ChatMessage[]): MessageGroup[] => {
	const groups: MessageGroup[] = [];

	for (let index = 0; index < messages.length; index++) {
		const currentMessage = messages[index];

		if (currentMessage.isUser) {
			const nextMessage = messages[index + 1];

			if (
				nextMessage &&
				!nextMessage.isUser &&
				nextMessage.type === currentMessage.type
			) {
				groups.push({
					userMessage: currentMessage,
					aiResponse: nextMessage,
				});
				index++;
			} else {
				groups.push({
					userMessage: currentMessage,
				});
			}
		}
	}

	return groups;
};

export function ChatSidebar({
	session,
	isMobile = false,
	onClose,
}: ChatSidebarProps) {
	const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

	const {
		searchQuery,
		setSearchQuery,
		copyMessageToInput,
		getFilteredMessages,
	} = useChatStore();

	const isAuthenticated = !!session;
	const filteredMessages = getFilteredMessages();
	const messageGroups = groupMessages(filteredMessages);
	const sortedGroups = [...messageGroups].sort((a, b) => {
		const dateA = new Date(a.userMessage.timestamp).getTime();
		const dateB = new Date(b.userMessage.timestamp).getTime();
		return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
	});

	const handleCopy = (content: string, type: string) => {
		copyMessageToInput(content);
		toast.success("Content copied", {
			description: `${type} content copied to input area.`,
		});
	};

	const toggleSort = () => {
		setSortOrder(previous => (previous === "newest" ? "oldest" : "newest"));
	};

	const getTypeIcon = (type: string) => {
		switch (type) {
			case "post": {
				return <FaFile className="h-3 w-3 text-gray-500" />;
			}
			case "image": {
				return <FaImage className="h-3 w-3 text-gray-500" />;
			}
			case "meme": {
				return <FaSmile className="h-3 w-3 text-gray-500" />;
			}
			default: {
				return <FaUser className="h-3 w-3 text-gray-500" />;
			}
		}
	};

	const getSortIcon = () => {
		if (sortOrder === "newest") {
			return <FaArrowDown className="h-3 w-3" />;
		}
		return <FaArrowUp className="h-3 w-3" />;
	};

	const renderCopyOptions = (group: MessageGroup) => {
		const { userMessage, aiResponse } = group;

		return userMessage.type === "post" && aiResponse ? (
			<div className="flex items-center gap-1">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => handleCopy(userMessage.content, "User input")}
					className="h-6 px-2 text-xs hover:bg-gray-100"
					title="Copy user input"
				>
					<FaCopy className="mr-1 h-3 w-3 text-gray-500" />
					Input
				</Button>
				<Button
					variant="ghost"
					size="sm"
					onClick={() =>
						handleCopy(getPostPreview(aiResponse), "Generated post")
					}
					className="h-6 px-2 text-xs hover:bg-gray-100"
					title="Copy generated post"
				>
					<FaCopy className="mr-1 h-3 w-3 text-gray-500" />
					Post
				</Button>
			</div>
		) : (
			<Button
				variant="ghost"
				size="sm"
				onClick={() => handleCopy(userMessage.content, "User input")}
				className="h-6 w-6 p-0 hover:bg-gray-100"
				title="Copy user input"
			>
				<FaCopy className="h-3 w-3 text-gray-500" />
			</Button>
		);
	};

	const sidebarWidth = isMobile
		? "w-[90vw] max-w-[400px]"
		: "w-[300px] lg:w-[400px]";

	return (
		<div
			className={`flex h-full ${sidebarWidth} flex-col border-l border-gray-200 bg-white`}
		>
			{/* Header - Only show for authenticated users */}
			{isAuthenticated && (
				<div className="border-b border-gray-200 p-3 md:p-4">
					<div className="mb-3 flex items-center justify-between">
						<h2 className="text-base font-semibold text-gray-900 md:text-lg">
							History
						</h2>
						<div className="flex items-center gap-2">
							{/* Mobile Close Button */}
							{isMobile && onClose && (
								<Button
									variant="ghost"
									size="sm"
									onClick={onClose}
									className="h-8 w-8 p-0 md:hidden"
								>
									<FaTimes className="h-4 w-4" />
								</Button>
							)}
							{/* Sort Button */}
							<Button
								variant="ghost"
								size="sm"
								onClick={toggleSort}
								className="h-8 px-2 text-gray-600 hover:text-gray-900"
								title={`Sort ${sortOrder === "newest" ? "oldest first" : "newest first"}`}
							>
								{getSortIcon()}
							</Button>
						</div>
					</div>

					{/* Search Input */}
					<div className="relative">
						<FaSearch className="absolute left-3 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400 md:h-4 md:w-4" />
						<Input
							placeholder="Search messages..."
							value={searchQuery}
							onChange={event => setSearchQuery(event.target.value)}
							className="h-8 border-gray-300 pl-8 text-sm focus:border-gray-500 md:h-9 md:pl-9"
						/>
					</div>

					{/* Results count */}
					{searchQuery && (
						<p className="mt-2 text-xs text-gray-500">
							{sortedGroups.length} result
							{sortedGroups.length === 1 ? "" : "s"}
						</p>
					)}
				</div>
			)}

			{/* Content Area */}
			<div className="scrollbar-hide flex-1 overflow-y-auto">
				{isAuthenticated ? (
					sortedGroups.length === 0 ? (
						<div className="flex h-full flex-col items-center justify-center p-4 text-center md:p-8">
							<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 md:h-16 md:w-16">
								<FaFile className="h-6 w-6 text-gray-400 md:h-8 md:w-8" />
							</div>
							<p className="mb-2 text-sm text-gray-500">
								{searchQuery ? "No messages found" : "No messages yet"}
							</p>
							<p className="text-xs text-gray-400">
								{searchQuery
									? "Try a different search term"
									: "Start a conversation to see your history"}
							</p>
						</div>
					) : (
						<div className="scrollbar-hide space-y-2 p-2">
							{sortedGroups.map((group: MessageGroup) => {
								const { userMessage, aiResponse } = group;

								return (
									<div
										key={userMessage.id}
										className="group rounded-lg border border-gray-200 bg-white p-2 transition-all duration-200 hover:border-gray-300 hover:shadow-sm md:p-3"
									>
										{/* Message Header */}
										<div className="mb-2 flex items-center justify-between">
											<div className="flex items-center gap-1 md:gap-2">
												{getTypeIcon(userMessage.type)}
												<span className="text-xs font-medium capitalize text-gray-700">
													{userMessage.type}
												</span>
												<span className="h-1 w-1 rounded-full bg-gray-300" />
												<span className="truncate text-xs text-gray-500">
													{formatDistanceToNow(userMessage.timestamp, {
														addSuffix: true,
													})}
												</span>
											</div>

											{/* Action Buttons */}
											<div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
												{renderCopyOptions(group)}
											</div>
										</div>

										{/* User Input */}
										<div className="mb-2 md:mb-3">
											<p className="line-clamp-3 rounded bg-gray-50 p-2 text-xs leading-relaxed text-gray-700 md:text-sm">
												{userMessage.content}
											</p>
										</div>

										{/* Generated Content Preview for Posts */}
										{userMessage.type === "post" && aiResponse && (
											<div className="mb-2 md:mb-3">
												<p className="mb-1 text-xs font-medium text-gray-800 md:text-sm">
													Generated Post:
												</p>
												<p className="line-clamp-2 rounded border-l-2 border-blue-200 bg-blue-50 p-2 text-xs leading-relaxed text-gray-700 md:text-sm">
													{getPostPreview(aiResponse)}
												</p>
											</div>
										)}

										{/* Image/Meme Preview */}
										{(userMessage.type === "image" ||
											userMessage.type === "meme") &&
											aiResponse?.generatedImage && (
												<div className="mb-2 md:mb-3">
													<p className="mb-1 text-xs font-medium text-gray-800 md:text-sm">
														Generated{" "}
														{userMessage.type === "meme" ? "Meme" : "Image"}:
													</p>
													<Image
														alt="Generated content"
														src={aiResponse.generatedImage}
														className="h-16 w-full rounded-md bg-gray-100 object-cover md:h-20"
														width={300}
														height={80}
													/>
												</div>
											)}

										{/* Metadata Tags */}
										{(userMessage.platform || userMessage.imageStyle) && (
											<div className="flex flex-wrap gap-1">
												{userMessage.platform && (
													<span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
														{userMessage.platform}
													</span>
												)}
												{userMessage.imageStyle && (
													<span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
														{userMessage.imageStyle}
													</span>
												)}
											</div>
										)}
									</div>
								);
							})}
						</div>
					)
				) : (
					<LoginPrompt />
				)}
			</div>
		</div>
	);
}
