import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { getGenerationLimits } from "@/server-actions/playground/generation-limit";
import { getChatHistory } from "@/server-actions/playground/get-messages";
import { GenerationLimitsData, QualitySettings } from "@/types/playground";

// Type definitions
export type MessageType = "post" | "image" | "meme";
export type Platform = "linkedin" | "twitter" | "discord";
export type ImageStyle =
	| "realistic"
	| "cartoon"
	| "abstract"
	| "minimalist"
	| "vintage"
	| "modern";

export interface ChatMessage {
	id: string;
	content: string;
	type: MessageType;
	timestamp: string;
	isUser: boolean;
	platform?: Platform;
	imageStyle?: ImageStyle;
	generatedImage?: string;
	error?: string;
}

interface ChatState {
	// Messages
	messages: ChatMessage[];

	// Input state
	currentInputText: string;
	selectedMode?: MessageType;
	selectedPlatform?: Platform;
	selectedImageStyle?: ImageStyle;

	// Modal states
	isPostModalOpen: boolean;
	isImageModalOpen: boolean;

	// UI states
	isGenerating: boolean;
	searchQuery: string;
	isLoadingHistory: boolean;
	historyError?: string;

	// Generation limits state
	generationLimits?: GenerationLimitsData;
	isLoadingLimits: boolean;
	limitsError?: string;
	lastLimitsUpdate?: string;
}

interface ChatActions {
	// Message management
	addMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => void;
	editMessage: (messageId: string) => void;
	deleteMessage: (messageId: string) => void;
	copyMessageToInput: (content: string) => void;
	getFilteredMessages: () => ChatMessage[];
	clearAllMessages: () => void;

	// Input management
	setInputText: (text: string) => void;
	setSelectedMode: (mode?: MessageType) => void;
	setSelectedPlatform: (platform?: Platform) => void;
	setSelectedImageStyle: (style?: ImageStyle) => void;
	clearSelection: () => void;

	// Modal management
	setPostModalOpen: (open: boolean) => void;
	setImageModalOpen: (open: boolean) => void;
	closeModalWithValidation: (type: "post" | "image") => void;

	// UI management
	setIsGenerating: (generating: boolean) => void;
	setSearchQuery: (query: string) => void;

	// Server response handling
	addUserMessage: (
		content: string,
		type: MessageType,
		platform?: Platform,
		imageStyle?: ImageStyle,
	) => string;

	addServerResponse: (
		userMessageId: string,
		response: {
			content: string;
			generatedImage?: string;
			error?: string;
		},
	) => void;

	updateMessageWithError: (messageId: string, error: string) => void;
	clearInput: () => void;

	// Chat history management
	loadChatHistory: () => Promise<void>;
	setChatHistory: (messages: ChatMessage[]) => void;
	setHistoryError: (error?: string) => void;
	setIsLoadingHistory: (loading: boolean) => void;

	// Generation limits management
	loadGenerationLimits: () => Promise<void>;
	setGenerationLimits: (data: GenerationLimitsData) => void;
	setLimitsError: (error?: string) => void;
	setIsLoadingLimits: (loading: boolean) => void;
	refreshLimitsIfStale: () => Promise<void>;

	// Helper functions
	canGenerate: (type: MessageType) => boolean;
	getRemainingGenerations: () => number;
	getGenerationCost: (type: MessageType) => number;

	// New action to update user limits after successful generation
	updateUserLimitsAfterGeneration: (userLimits: {
		plan?: string;
		plan_type?: string;
		daily_usage?: number;
		daily_limit?: number;
		daily_remaining?: number;
		monthly_usage?: number;
		monthly_limit?: number;
		monthly_remaining?: number;
		remaining_credits?: number;
		total_credits?: number;
		quality_settings?: QualitySettings;
		is_authenticated?: boolean;
	}) => void;
}

const useChatStore = create<ChatState & ChatActions>()(
	persist(
		(set, get) => ({
			// Initial state
			messages: [],
			currentInputText: "",
			selectedMode: undefined,
			selectedPlatform: undefined,
			selectedImageStyle: undefined,
			isPostModalOpen: false,
			isImageModalOpen: false,
			isGenerating: false,
			searchQuery: "",
			isLoadingHistory: false,
			historyError: undefined,

			// Generation limits state
			generationLimits: undefined,
			isLoadingLimits: false,
			limitsError: undefined,
			lastLimitsUpdate: undefined,

			// Message management
			addMessage: messageData => {
				const newMessage: ChatMessage = {
					...messageData,
					id: crypto.randomUUID(),
					timestamp: `${new Date()}`,
				};
				set(state => ({
					messages: [...state.messages, newMessage],
				}));
			},

			editMessage: (messageId: string) => {
				const message = get().messages.find(m => m.id === messageId);
				if (message) {
					set({
						currentInputText: message.content,
						selectedMode: message.type,
						selectedPlatform: message.platform,
						selectedImageStyle: message.imageStyle,
					});
				}
			},

			deleteMessage: (messageId: string) => {
				set(state => ({
					messages: state.messages.filter(m => m.id !== messageId),
				}));
			},

			copyMessageToInput: (content: string) => {
				set({ currentInputText: content });
			},

			getFilteredMessages: () => {
				const { messages, searchQuery } = get();
				if (!searchQuery.trim()) return messages;

				return messages.filter(
					message =>
						message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
						message.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
						(message.platform &&
							message.platform
								.toLowerCase()
								.includes(searchQuery.toLowerCase())) ||
						(message.imageStyle &&
							message.imageStyle
								.toLowerCase()
								.includes(searchQuery.toLowerCase())),
				);
			},

			clearAllMessages: () => {
				set({ messages: [] });
			},

			// Input management
			setInputText: (text: string) => set({ currentInputText: text }),
			setSelectedMode: (mode?: MessageType) => set({ selectedMode: mode }),
			setSelectedPlatform: (platform?: Platform) =>
				set({ selectedPlatform: platform }),
			setSelectedImageStyle: (style?: ImageStyle) =>
				set({ selectedImageStyle: style }),

			clearSelection: () =>
				set({
					selectedMode: undefined,
					selectedPlatform: undefined,
					selectedImageStyle: undefined,
				}),

			clearInput: () => {
				set({
					currentInputText: "",
					selectedMode: undefined,
					selectedPlatform: undefined,
					selectedImageStyle: undefined,
				});
			},

			// Modal management
			setPostModalOpen: (open: boolean) => set({ isPostModalOpen: open }),
			setImageModalOpen: (open: boolean) => set({ isImageModalOpen: open }),

			closeModalWithValidation: (type: "post" | "image") => {
				if (type === "post") {
					set({ isPostModalOpen: false });
				} else if (type === "image") {
					set({ isImageModalOpen: false });
				}
			},

			// UI management
			setIsGenerating: (generating: boolean) =>
				set({ isGenerating: generating }),
			setSearchQuery: (query: string) => set({ searchQuery: query }),

			// Server response handling
			addUserMessage: (
				content: string,
				type: MessageType,
				platform?: Platform,
				imageStyle?: ImageStyle,
			) => {
				const messageId = crypto.randomUUID();
				const newMessage: ChatMessage = {
					id: messageId,
					content,
					type,
					platform,
					imageStyle,
					isUser: true,
					timestamp: `${new Date()}`,
				};

				set(state => ({
					messages: [...state.messages, newMessage],
				}));

				return messageId;
			},

			addServerResponse: (
				userMessageId: string,
				response: {
					content: string;
					generatedImage?: string;
					error?: string;
				},
			) => {
				const userMessage = get().messages.find(m => m.id === userMessageId);
				if (!userMessage) return;

				const aiMessage: ChatMessage = {
					id: crypto.randomUUID(),
					content: response.content,
					type: userMessage.type,
					platform: userMessage.platform,
					imageStyle: userMessage.imageStyle,
					isUser: false,
					timestamp: `${new Date()}`,
					generatedImage: response.generatedImage,
					error: response.error,
				};

				set(state => ({
					messages: [...state.messages, aiMessage],
				}));
			},

			updateMessageWithError: (messageId: string, error: string) => {
				set(state => ({
					messages: state.messages.map(message =>
						message.id === messageId ? { ...message, error } : message,
					),
				}));
			},

			// Chat history management
			loadChatHistory: async () => {
				set({ isLoadingHistory: true, historyError: undefined });

				try {
					const result = await getChatHistory();

					if (result.success && result.data) {
						set({
							messages: result.data,
							isLoadingHistory: false,
						});
					} else {
						set({
							historyError: result.message || "Failed to load chat history",
							isLoadingHistory: false,
						});
					}
				} catch {
					set({
						historyError: "An error occurred while loading chat history",
						isLoadingHistory: false,
					});
				}
			},

			setChatHistory: (messages: ChatMessage[]) => {
				set({ messages, historyError: undefined });
			},

			setHistoryError: (error?: string) => {
				set({ historyError: error });
			},

			setIsLoadingHistory: (loading: boolean) => {
				set({ isLoadingHistory: loading });
			},

			// Generation limits management
			loadGenerationLimits: async () => {
				set({ isLoadingLimits: true, limitsError: undefined });

				try {
					const result = await getGenerationLimits();

					if (result.success && result.data) {
						set({
							generationLimits: result.data,
							isLoadingLimits: false,
							lastLimitsUpdate: new Date().toISOString(),
						});
					} else {
						set({
							limitsError: result.message || "Failed to load generation limits",
							isLoadingLimits: false,
						});
					}
				} catch {
					set({
						limitsError: "An error occurred while loading generation limits",
						isLoadingLimits: false,
					});
				}
			},

			setGenerationLimits: (data: GenerationLimitsData) => {
				set({
					generationLimits: data,
					limitsError: undefined,
					lastLimitsUpdate: new Date().toISOString(),
				});
			},

			setLimitsError: (error?: string) => {
				set({ limitsError: error });
			},

			setIsLoadingLimits: (loading: boolean) => {
				set({ isLoadingLimits: loading });
			},

			refreshLimitsIfStale: async () => {
				const { lastLimitsUpdate, loadGenerationLimits } = get();

				// Refresh if data is older than 5 minutes or doesn't exist
				if (
					!lastLimitsUpdate ||
					Date.now() - new Date(lastLimitsUpdate).getTime() > 300000
				) {
					await loadGenerationLimits();
				}
			},

			// Helper functions
			canGenerate: (type: MessageType) => {
				const { generationLimits } = get();
				if (!generationLimits?.limits) return false;

				const { limits } = generationLimits;

				if (limits.is_authenticated) {
					// For authenticated users, check monthly limits and credits
					const monthlyRemaining = limits.monthly_remaining || 0;
					const credits =
						limits.remaining_credits || limits.purchased_credits || 0;
					return monthlyRemaining > 0 || credits > 0;
				} else {
					// For anonymous users, check daily limits
					return (limits.daily_remaining || 0) > 0;
				}
			},

			getRemainingGenerations: () => {
				const { generationLimits } = get();
				if (!generationLimits?.limits) return 0;

				const { limits } = generationLimits;

				if (limits.is_authenticated) {
					const monthlyRemaining = limits.monthly_remaining || 0;
					const credits =
						limits.remaining_credits || limits.purchased_credits || 0;
					return monthlyRemaining + credits;
				} else {
					return limits.daily_remaining || 0;
				}
			},

			getGenerationCost: (type: MessageType) => {
				const { generationLimits } = get();
				if (!generationLimits?.costs) return 1;

				const { costs } = generationLimits;

				switch (type) {
					case "post": {
						return costs.post_generation || 1;
					}
					case "image": {
						return costs.image_generation || 1;
					}
					case "meme": {
						return costs.meme_generation || 1;
					}
					default: {
						return 1;
					}
				}
			},

			// New action implementation
			updateUserLimitsAfterGeneration: userLimits => {
				set(state => {
					if (!state.generationLimits) return state;

					return {
						generationLimits: {
							...state.generationLimits,
							limits: {
								...state.generationLimits.limits,
								// Handle both plan and plan_type for compatibility
								plan:
									userLimits.plan ||
									userLimits.plan_type ||
									state.generationLimits.limits.plan,
								plan_type:
									userLimits.plan_type ||
									userLimits.plan ||
									state.generationLimits.limits.plan_type,
								// Update daily limits
								daily_usage:
									userLimits.daily_usage ??
									state.generationLimits.limits.daily_usage,
								daily_limit:
									userLimits.daily_limit ??
									state.generationLimits.limits.daily_limit,
								daily_remaining:
									userLimits.daily_remaining ??
									state.generationLimits.limits.daily_remaining,
								// Update monthly limits
								monthly_usage:
									userLimits.monthly_usage ??
									state.generationLimits.limits.monthly_usage,
								monthly_limit:
									userLimits.monthly_limit ??
									state.generationLimits.limits.monthly_limit,
								monthly_remaining:
									userLimits.monthly_remaining ??
									state.generationLimits.limits.monthly_remaining,
								// Update credits
								remaining_credits:
									userLimits.remaining_credits ??
									state.generationLimits.limits.remaining_credits,
								total_credits:
									userLimits.total_credits ??
									state.generationLimits.limits.total_credits,
								// Update other fields
								quality_settings:
									userLimits.quality_settings ??
									state.generationLimits.limits.quality_settings,
								is_authenticated:
									userLimits.is_authenticated ??
									state.generationLimits.limits.is_authenticated,
							},
						},
						lastLimitsUpdate: new Date().toISOString(),
					};
				});
			},
		}),
		{
			name: "chat-storage",
			storage: createJSONStorage(() => localStorage),
			partialize: state => ({
				messages: state.messages,
				searchQuery: state.searchQuery,
				generationLimits: state.generationLimits,
				lastLimitsUpdate: state.lastLimitsUpdate,
			}),
			version: 3, // Increment version due to new fields
		},
	),
);

export { useChatStore };
