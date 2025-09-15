"use client";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

import {
	type ChatMessage as ChatMessageType,
	useChatStore,
} from "@/zustand/chat-store";

import { ChatError } from "./chat/chat-error";
import { ChatLoadingMinimal } from "./chat/chat-loading";
import { ChatMessage } from "./chat-message";

export function ChatContainer() {
	const { data: session, status } = useSession();
	const {
		messages,
		isGenerating,
		isLoadingHistory,
		historyError,
		loadChatHistory,
		setHistoryError,
	} = useChatStore();

	const scrollRef = useRef<HTMLDivElement>(null);
	const bottomRef = useRef<HTMLDivElement>(null);
	const hasLoadedHistory = useRef(false);
	const [isInitializing, setIsInitializing] = useState(true);

	// Load chat history on mount (only once)
	useEffect(() => {
		// Don't load if we've already loaded or if session is still loading
		if (hasLoadedHistory.current || status === "loading") return;

		const loadHistory = async () => {
			// Only load from backend if user is authenticated
			if (status === "authenticated" && session?.user) {
				try {
					await loadChatHistory();
				} catch (error) {
					console.error("Failed to load chat history:", error);
				}
			}
			// For unauthenticated users, Zustand will automatically load from localStorage
			// due to the persist configuration, so no additional action needed

			hasLoadedHistory.current = true;
			setIsInitializing(false);
		};

		loadHistory();
	}, [status, session, loadChatHistory]);

	// Auto-scroll to bottom when new messages arrive OR when generating
	useEffect(() => {
		if (bottomRef.current) {
			bottomRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [messages, isGenerating]);

	// Handle retry for error state
	const handleRetry = async () => {
		setHistoryError(undefined);
		hasLoadedHistory.current = false;
		if (status === "authenticated" && session?.user) {
			try {
				await loadChatHistory();
			} catch (error) {
				console.error("Retry failed:", error);
			}
		}
		hasLoadedHistory.current = true;
	};

	// Show loading skeleton while:
	// 1. Session is loading, OR
	// 2. We're loading history from backend for authenticated users, OR
	// 3. We're still initializing
	const showLoading =
		status === "loading" ||
		(status === "authenticated" && isLoadingHistory) ||
		isInitializing;

	return (
		<div
			ref={scrollRef}
			className="scrollbar-hide h-full w-full overflow-y-auto overflow-x-hidden py-3"
		>
			{showLoading ? (
				<ChatLoadingMinimal />
			) : historyError ? (
				/* Show error state if history loading failed */
				<ChatError error={historyError} onRetry={handleRetry} />
			) : messages.length === 0 ? (
				/* Empty state when no messages - only shown after loading is complete */
				<div className="flex h-full items-center justify-center px-4">
					<div className="max-w-md text-center">
						<h3 className="mb-2 text-lg font-medium text-gray-900 md:text-xl">
							Start a conversation
						</h3>
						<p className="text-sm text-gray-600 md:text-base">
							Choose a platform (Twitter, LinkedIn or Discord) and start
							creating content with Push to Post.
							{status === "unauthenticated" && (
								<span className="mt-2 block text-xs text-gray-500">
									Sign in to save your chat history across devices.
								</span>
							)}
						</p>
					</div>
				</div>
			) : (
				/* Chat messages */
				<div className="mx-auto max-w-4xl space-y-4 px-3 md:space-y-6">
					{messages.map((message: ChatMessageType) => (
						<ChatMessage key={message.id} message={message} />
					))}

					{/* AI Typing Indicator */}
					{isGenerating && (
						<div className="flex justify-start">
							<div className="max-w-xs rounded-2xl bg-gray-100 px-4 py-3">
								<div className="flex space-x-1">
									<div
										className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
										style={{ animationDelay: "0ms" }}
									/>
									<div
										className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
										style={{ animationDelay: "150ms" }}
									/>
									<div
										className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
										style={{ animationDelay: "300ms" }}
									/>
								</div>
							</div>
						</div>
					)}

					{/* Sentinel always at the very bottom */}
					<div ref={bottomRef} />
				</div>
			)}
		</div>
	);
}
