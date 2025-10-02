import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// eslint-disable-next-line import/no-unresolved
import { PostItem } from "@/types";

export type Platform = "twitter" | "linkedin" | "discord";

export interface ToneOption {
	id: string;
	label: string;
	description: string;
}

// Loading state types
type LoadingState = {
	isLoading: boolean;
	operation: string;
	canCancel: boolean;
};

// Modal state interface
interface CreatePostModalState {
	// Modal visibility
	isOpen: boolean;
	platform: Platform;

	// Post data
	posts: PostItem[];
	activeVersionId: string;
	selectedPost: PostItem | undefined;

	// Loading states
	loadingState: LoadingState;
	isGenerating: boolean;

	// UI states
	showScheduleModal: boolean;
	showPublishModal: boolean;
	showPreviewModal: boolean;
	showVersionSidebar: boolean;
	showGeneratorSidebar: boolean;

	// Schedule modal state
	scheduleSelectedVersion: string;
	scheduleDate?: Date;
	scheduleTime: string;

	// Publish modal state
	publishSelectedVersion: string;

	// Generator state
	selectedTones: Set<string>;

	// Selection state
	selectedVersions: Set<string>;

	// Pending operations tracker
	pendingOperations: Set<string>;
}

// Actions interface
interface CreatePostModalActions {
	// Modal control
	openModal: (
		platform?: Platform,
		posts?: PostItem[],
		selectedPost?: PostItem,
	) => void;
	closeModal: () => void;
	setModalOpen: (isOpen: boolean) => void;

	// Platform management
	setPlatform: (platform: Platform) => void;

	// Post management
	setPosts: (posts: PostItem[]) => void;
	setActiveVersionId: (id: string) => void;
	deleteVersions: (versionIds: string[]) => void;
	setSelectedPost: (post: PostItem | undefined) => void;
	addNewVersion: (
		content: string,
		tone?: string,
		metadata?: {
			id?: string;
			platform?: string;
			tone?: string;
			status?: string;
			created_at?: string;
			scheduled_publish_time?: string | null;
			variation_group_id?: string | null;
			apiGeneratedId?: string;
			createdAt?: string;
			// Add other metadata fields as needed
			[key: string]: any;
		},
	) => void;
	updatePostContent: (postId: string, content: string) => void;

	// Loading state management
	stopLoading: () => void;
	setIsGenerating: (isGenerating: boolean) => void;
	startLoading: (operation: string, canCancel?: boolean) => void;

	// UI state management
	setShowPublishModal: (show: boolean) => void;
	setShowPreviewModal: (show: boolean) => void;
	setShowScheduleModal: (show: boolean) => void;
	setShowVersionSidebar: (show: boolean) => void;
	openSpecificModal: (modalType: string) => void;
	closeSpecificModal: (modalType: string) => void;
	setShowGeneratorSidebar: (show: boolean) => void;

	// Schedule modal actions
	setScheduleDate: (date?: Date) => void;
	setScheduleTime: (time: string) => void;
	setScheduleSelectedVersion: (version: string) => void;

	// Publish modal actions
	setPublishSelectedVersion: (version: string) => void;

	// Generator actions
	toggleTone: (toneId: string) => void;
	setSelectedTones: (tones: Set<string>) => void;

	// Selection actions
	selectAllVersions: () => void;
	clearSelectedVersions: () => void;
	toggleVersionSelection: (versionId: string) => void;
	setSelectedVersions: (versions: Set<string>) => void;

	// Pending operations
	clearPendingOperations: () => void;
	addPendingOperation: (key: string) => void;
	removePendingOperation: (key: string) => void;
	hasPendingOperation: (key: string) => boolean;

	// Computed helpers
	isUIDisabled: () => boolean;
	getNextVersionNumber: () => number;
	getOrderedVersions: () => PostItem[];
	getGeneratedVersions: () => PostItem[];
	isCriticalOperationRunning: () => boolean;
	getActiveVersion: () => PostItem | undefined;

	// Reset functions
	resetModalState: () => void;
	resetPublishState: () => void;
	resetScheduleState: () => void;
	resetGeneratorState: () => void;

	hasPublishedPostInGroup: () => boolean;
}

// Initial state
const initialState: CreatePostModalState = {
	// Modal visibility
	isOpen: false,
	platform: "twitter",

	// Post data
	posts: [],
	activeVersionId: "",
	selectedPost: undefined,

	// Loading states
	loadingState: {
		operation: "",
		isLoading: false,
		canCancel: false,
	},
	isGenerating: false,

	// UI states
	showPublishModal: false,
	showPreviewModal: false,
	showScheduleModal: false,
	showVersionSidebar: false,
	showGeneratorSidebar: false,

	// Schedule modal state
	scheduleTime: "12:00",
	scheduleDate: undefined,
	scheduleSelectedVersion: "original",

	// Publish modal state
	publishSelectedVersion: "original",

	// Generator state
	selectedTones: new Set(),

	// Selection state
	selectedVersions: new Set(),

	// Pending operations
	pendingOperations: new Set(),
};

// Create the store
const useCreatePostModalStore = create<
	CreatePostModalState & CreatePostModalActions
>()(
	persist(
		(set, get) => ({
			...initialState,

			// Modal control - FIXED: Preserve individual post statuses
			openModal: (platform = "twitter", posts = [], selectedPost?) => {
				// Determine active version ID
				const activeVersionId = selectedPost?.id || posts[0]?.id || "";

				// FIXED: Use posts as-is instead of deriving from selectedPost
				// This preserves the individual status of each post
				set({
					// Reset modal state first
					...initialState,
					// Then set new values
					isOpen: true,
					posts: [...posts], // Use the actual posts array with their individual statuses
					platform: platform,
					selectedPost: selectedPost,
					activeVersionId: activeVersionId,
					// Clear any previous selections
					selectedVersions: new Set(),
					pendingOperations: new Set(),
				});
			},

			closeModal: () => {
				const state = get();
				// Only allow closing if no critical operations are running
				if (
					state.isCriticalOperationRunning() &&
					!state.loadingState.canCancel
				) {
					return;
				}

				// Reset all modal states
				set({
					...initialState,
				});
			},

			setModalOpen: isOpen => {
				if (isOpen) {
					set({ isOpen });
				} else {
					get().closeModal();
				}
			},

			// Platform management
			setPlatform: platform => set({ platform }),

			// Post management - FIXED: Ensure proper state updates
			setPosts: posts => {
				const state = get();

				const newActiveVersionId =
					state.activeVersionId &&
					posts.some(p => p.id === state.activeVersionId)
						? state.activeVersionId
						: posts[0]?.id || "";

				set({
					posts: [...posts], // Create new array reference
					activeVersionId: newActiveVersionId,
				});
			},

			setSelectedPost: post => {
				set({
					selectedPost: post,
					activeVersionId: post?.id || "",
				});
			},

			setActiveVersionId: id => {
				set({ activeVersionId: id });
			},

			updatePostContent: (postId, content) => {
				const state = get();
				if (state.isUIDisabled()) return;

				const updatedPosts = state.posts.map(post =>
					post.id === postId
						? {
								...post,
								content,
								updated_at: new Date().toISOString(),
								is_edited: true,
							}
						: post,
				);

				set({ posts: updatedPosts });
			},

			// FIXED: Create new versions with proper status instead of copying from base post
			addNewVersion: (content, tone, metadata) => {
				const state = get();
				console.log("🎨 Adding new version:", {
					content: content.slice(0, 50) + "...",
					tone,
					metadata,
					currentPostsCount: state.posts.length,
					isUIDisabled: state.isUIDisabled(),
				});

				if (state.isUIDisabled()) {
					console.log("⏸️ UI disabled, cannot add new version");
					return;
				}

				const versionNumber = state.getNextVersionNumber();
				const basePost = state.posts.find(p => p.is_original) || state.posts[0];

				if (!basePost) {
					console.error("❌ No base post found");
					return;
				}

				// Generate version ID - use provided ID or create new one
				const newVersionId =
					metadata?.id ||
					metadata?.apiGeneratedId ||
					`v${versionNumber}_${Date.now()}`;

				console.log("🆔 Using version ID:", newVersionId);

				// ENHANCED: Create new version with metadata support
				const newVersion: PostItem = {
					...basePost,
					// Core fields
					id: newVersionId,
					content,
					status: metadata?.status || "drafted", // Use provided status or default to drafted

					// Timestamps - use provided or create new
					created_at:
						metadata?.created_at ||
						metadata?.createdAt ||
						new Date().toISOString(),
					updated_at: new Date().toISOString(),

					// Version flags
					is_original: false,
					is_edited: false,

					// Clear image URLs for new versions
					image_urls: [],

					// Scheduling info - use provided or clear
					scheduled_publish_time: metadata?.scheduled_publish_time || undefined,
					actual_publish_time: undefined,

					// Source info
					source_commit_message: tone
						? `Generated with ${tone} tone`
						: metadata?.source_commit_message || "AI Generated",

					// Additional metadata fields
					...(metadata?.platform && { platform: metadata.platform }),
					...(metadata?.variation_group_id && {
						variation_group_id: metadata.variation_group_id,
					}),

					// Store the tone if provided in metadata (overrides parameter)
					tone: metadata?.tone || tone,

					// Include any additional metadata fields
					...Object.keys(metadata || {}).reduce((accumulator, key) => {
						// Skip fields we've already handled
						const handledFields = [
							"id",
							"status",
							"created_at",
							"createdAt",
							"scheduled_publish_time",
							"platform",
							"variation_group_id",
							"tone",
							"apiGeneratedId",
						];

						if (!handledFields.includes(key) && metadata![key] !== undefined) {
							accumulator[key] = metadata![key];
						}

						return accumulator;
					}, {} as any),
				};

				const updatedPosts = [...state.posts, newVersion];

				set({
					posts: updatedPosts,
					activeVersionId: newVersionId,
				});

				console.log("📊 Posts updated:", {
					totalPosts: updatedPosts.length,
					activeVersionId: newVersionId,
					newVersionStatus: newVersion.status,
				});
			},

			deleteVersions: versionIds => {
				const state = get();
				if (state.isUIDisabled()) return;

				const updatedPosts = state.posts.filter(
					p => !versionIds.includes(p.id),
				);
				let newActiveVersionId = state.activeVersionId;

				// If we deleted the active version, select a new one
				if (versionIds.includes(state.activeVersionId)) {
					newActiveVersionId = updatedPosts[0]?.id || "";
				}

				set({
					posts: updatedPosts,
					activeVersionId: newActiveVersionId,
					selectedVersions: new Set(),
				});
			},

			// Loading state management
			startLoading: (operation, canCancel = false) => {
				set({
					loadingState: {
						isLoading: true,
						operation,
						canCancel,
					},
				});
			},

			stopLoading: () => {
				set({
					loadingState: {
						isLoading: false,
						operation: "",
						canCancel: false,
					},
				});
			},

			setIsGenerating: isGenerating => set({ isGenerating }),

			// UI state management
			setShowScheduleModal: show => set({ showScheduleModal: show }),
			setShowPublishModal: show => set({ showPublishModal: show }),
			setShowPreviewModal: show => set({ showPreviewModal: show }),
			setShowVersionSidebar: show => set({ showVersionSidebar: show }),
			setShowGeneratorSidebar: show => set({ showGeneratorSidebar: show }),

			openSpecificModal: modalType => {
				const state = get();
				if (state.isUIDisabled()) return;

				// Close all modals first
				set({
					showPublishModal: false,
					showPreviewModal: false,
					showScheduleModal: false,
					showVersionSidebar: false,
					showGeneratorSidebar: false,
				});

				// Open specific modal
				switch (modalType) {
					case "schedule": {
						const activeVersion = state.getActiveVersion();

						// Auto-fill if post is already scheduled
						if (
							activeVersion?.status === "scheduled" &&
							activeVersion.scheduled_publish_time
						) {
							const scheduledDate = new Date(
								activeVersion.scheduled_publish_time,
							);
							const timeString = scheduledDate.toLocaleTimeString("en-US", {
								hour12: false,
								hour: "2-digit",
								minute: "2-digit",
							});

							set({
								showScheduleModal: true,
								scheduleDate: scheduledDate,
								scheduleTime: timeString,
							});
						} else {
							set({ showScheduleModal: true });
						}
						break;
					}
					case "publish": {
						set({ showPublishModal: true });
						break;
					}
					case "preview": {
						set({ showPreviewModal: true });
						break;
					}
					case "versions": {
						set({ showVersionSidebar: true });
						break;
					}
					case "generator": {
						set({ showGeneratorSidebar: true });
						break;
					}
				}
			},

			closeSpecificModal: modalType => {
				const state = get();
				if (state.isUIDisabled()) return;

				switch (modalType) {
					case "schedule": {
						state.resetScheduleState();
						break;
					}
					case "publish": {
						state.resetPublishState();
						break;
					}
					case "preview": {
						set({ showPreviewModal: false });
						break;
					}
					case "versions": {
						set({
							showVersionSidebar: false,
							selectedVersions: new Set(),
						});
					}
					case "generator": {
						state.resetGeneratorState();
						break;
					}
				}
			},

			// Schedule modal actions
			setScheduleSelectedVersion: version =>
				set({ scheduleSelectedVersion: version }),
			setScheduleDate: date => set({ scheduleDate: date }),
			setScheduleTime: time => set({ scheduleTime: time }),

			// Publish modal actions
			setPublishSelectedVersion: version =>
				set({ publishSelectedVersion: version }),

			// Generator actions
			setSelectedTones: tones => set({ selectedTones: tones }),

			toggleTone: toneId => {
				const state = get();
				const newTones = new Set(state.selectedTones);
				if (newTones.has(toneId)) {
					newTones.delete(toneId);
				} else {
					newTones.add(toneId);
				}
				set({ selectedTones: newTones });
			},

			// Selection actions
			setSelectedVersions: versions => set({ selectedVersions: versions }),

			toggleVersionSelection: versionId => {
				const state = get();
				if (state.isUIDisabled()) return;

				const newSelected = new Set(state.selectedVersions);
				if (newSelected.has(versionId)) {
					newSelected.delete(versionId);
				} else {
					newSelected.add(versionId);
				}
				set({ selectedVersions: newSelected });
			},

			selectAllVersions: () => {
				const state = get();
				if (state.isUIDisabled()) return;

				const allVersionIds = state.posts.map(p => p.id);
				const isAllSelected =
					state.selectedVersions.size === allVersionIds.length;

				set({
					selectedVersions: isAllSelected ? new Set() : new Set(allVersionIds),
				});
			},

			clearSelectedVersions: () => set({ selectedVersions: new Set() }),

			// Pending operations
			addPendingOperation: key => {
				const state = get();
				const newPending = new Set(state.pendingOperations);
				newPending.add(key);
				set({ pendingOperations: newPending });
			},

			removePendingOperation: key => {
				const state = get();
				const newPending = new Set(state.pendingOperations);
				newPending.delete(key);
				set({ pendingOperations: newPending });
			},

			hasPendingOperation: key => {
				return get().pendingOperations.has(key);
			},

			clearPendingOperations: () => set({ pendingOperations: new Set() }),

			// Computed helpers - FIXED: Add more debugging and ensure proper data flow
			getActiveVersion: () => {
				const state = get();
				const activeVersion =
					state.posts.find(p => p.id === state.activeVersionId) ||
					state.posts[0];

				return activeVersion;
			},

			getGeneratedVersions: () => {
				const state = get();
				const generated = state.posts
					.filter(p => !p.is_original)
					.sort(
						(a, b) =>
							new Date(a.created_at).getTime() -
							new Date(b.created_at).getTime(),
					);

				return generated;
			},

			getOrderedVersions: () => {
				const state = get();
				const original = state.posts.find(p => p.is_original);
				const generated = state.posts
					.filter(p => !p.is_original)
					.sort(
						(a, b) =>
							new Date(a.created_at).getTime() -
							new Date(b.created_at).getTime(),
					)
					.map((v, index) => ({
						...v,
						versionNumber: index + 1,
					}));

				const ordered = original ? [original, ...generated] : generated;

				return ordered;
			},

			getNextVersionNumber: () => {
				const state = get();
				const existingNumbers = state
					.getGeneratedVersions()
					.map(v => {
						const match = v.id.match(/^v(\d+)/);
						return match ? Number.parseInt(match[1], 10) : 0;
					})
					.filter(number_ => number_ > 0);

				return existingNumbers.length > 0
					? Math.max(...existingNumbers) + 1
					: 1;
			},

			isCriticalOperationRunning: () => {
				const state = get();
				return (
					state.loadingState.isLoading &&
					(state.loadingState.operation.includes("Deleting") ||
						state.loadingState.operation.includes("Publishing") ||
						state.loadingState.operation.includes("Scheduling"))
				);
			},

			isUIDisabled: () => {
				return get().isCriticalOperationRunning();
			},

			// Reset functions
			resetModalState: () => {
				set({
					...initialState,
				});
			},

			resetScheduleState: () => {
				set({
					showScheduleModal: false,
					scheduleSelectedVersion: "original",
					scheduleDate: undefined,
					scheduleTime: "12:00",
				});
			},

			resetPublishState: () => {
				set({
					showPublishModal: false,
					publishSelectedVersion: "original",
				});
			},

			resetGeneratorState: () => {
				set({
					showGeneratorSidebar: false,
					selectedTones: new Set(),
					isGenerating: false,
				});
			},

			hasPublishedPostInGroup: () => {
				const state = get();
				return state.posts.some(post => post.status === "published");
			},
		}),
		{
			name: "create-post-modal-storage",
			storage: createJSONStorage(() => localStorage),
			// FIXED: Don't persist posts or activeVersionId as they should be fresh each time
			partialize: state => ({
				platform: state.platform,
				scheduleTime: state.scheduleTime,
			}),
		},
	),
);

export default useCreatePostModalStore;
