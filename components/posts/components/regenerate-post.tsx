/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { UUID } from "node:crypto";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FiX } from "react-icons/fi";
import { toast } from "sonner";

import { ConnectedIntegration } from "@/components/repositories/settings/channel-settings";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import useRepoSuperDetails from "@/hooks/core/repo/get-repo-super-detail-hook";
import { useCreditBalance } from "@/hooks/plans/use-credit-balance";
import { cn } from "@/lib/utils";
import {
	bulkPostOperations,
	deletePost,
	publishPostImmediate,
	schedulePost,
	updatePost,
} from "@/server-actions/core/get-posts";
import { createPostVariations } from "@/server-actions/core/post-variations";
import {
	addPostIntegrations,
	removePostIntegrations,
} from "@/server-actions/core/social-managment";
import { PostVariation } from "@/server-actions/core/types/post-variations";
import { PostItem, PostStatus } from "@/types";
import useCreatePostModalStore from "@/zustand/usepost-store";
import useUserStore from "@/zustand/useuser-store";

import { normalizePlatform } from "../utils/post-utils";
import { PLATFORM_LIMITS, TONE_OPTIONS } from "./manage-posts/constants";
import { Editor } from "./manage-posts/editor";
import { PreviewPane } from "./manage-posts/preview-pane";
import { VersionSidebar } from "./manage-posts/side-panels/post-versions-panel";
import { PreviewSidebar } from "./manage-posts/side-panels/preview-social-panel";
import { PublishPanel } from "./manage-posts/side-panels/publish-panel";
import { SchedulePanel } from "./manage-posts/side-panels/schedule-panel";
import { GeneratorSidebar } from "./manage-posts/side-panels/variation-generator-panel";

interface CreatePostModalProps {
	onDeletePost?: (postId: string) => Promise<void>;
	onUpdatePost?: (
		postId: string,
		content: string,
		image?: string[],
	) => Promise<void>;
	repoId: UUID;
}

// Enhanced loading overlay component with better UX
const LoadingOverlay: React.FC<{
	loading: { isLoading: boolean; operation: string; canCancel: boolean };
	onCancel?: () => void;
}> = ({ loading, onCancel }) => {
	if (!loading.isLoading) return;

	return (
		<div className="absolute inset-0 z-[99] flex items-center justify-center bg-gradient-to-br from-zinc-950/95 via-zinc-900/95 to-zinc-950/95 backdrop-blur-sm">
			<div className="relative flex flex-col items-center space-y-6 rounded-2xl border border-zinc-700/50 bg-gradient-to-br from-zinc-900/90 to-zinc-800/90 p-8">
				{/* Animated background effect (grayscale shimmer) */}
				<div className="absolute inset-0 animate-pulse rounded-2xl bg-gradient-to-r from-zinc-200/5 via-white/5 to-zinc-200/5 opacity-20" />

				{/* Loading spinner */}
				<div className="relative">
					<div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-500 border-t-white" />
					<div className="animation-delay-75 absolute inset-0 h-12 w-12 animate-spin rounded-full border-4 border-transparent border-r-zinc-400" />
				</div>

				{/* Operation text */}
				<div className="text-center">
					<h3 className="mb-1 text-lg font-semibold text-zinc-100">
						{loading.operation.includes("Saving") && "Saving Changes"}
						{loading.operation.includes("Deleting") && "Removing Content"}
						{loading.operation.includes("Generating") && "Creating Variants"}
						{loading.operation.includes("Scheduling") && "Scheduling Post"}
						{!["Saving", "Deleting", "Generating", "Scheduling"].some(op =>
							loading.operation.includes(op),
						) && "Processing"}
					</h3>
				</div>

				{/* Cancel button */}
				{loading.canCancel && onCancel && (
					<div className="relative z-10 mt-4">
						<Button
							onClick={onCancel}
							variant="outline"
							size="sm"
							className="border-zinc-600 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700/50 hover:text-white"
						>
							Cancel Operation
						</Button>
					</div>
				)}
			</div>
		</div>
	);
};

// Helper function to resolve platform limits
const resolveLimit = (platform: string): number => {
	const value = PLATFORM_LIMITS[platform as keyof typeof PLATFORM_LIMITS];
	if (!value) return 1000;
	if (typeof value === "number") return value;
	return value.default;
};

const CreatePostModal: React.FC<CreatePostModalProps> = ({
	repoId,
	onDeletePost,
	onUpdatePost,
}) => {
	const router = useRouter();
	const { plan } = useUserStore();
	const { credits } = useCreditBalance();

	// Get state and actions from Zustand store
	const {
		// Core state
		isOpen,
		posts,
		platform,
		loadingState,
		isGenerating,
		scheduleDate,
		scheduleTime,
		selectedTones,
		activeVersionId,
		showPreviewModal,
		selectedVersions,
		showPublishModal,
		showScheduleModal,
		pendingOperations,
		showVersionSidebar,
		showGeneratorSidebar,

		// Actions
		closeModal,
		stopLoading,
		startLoading,
		addNewVersion,
		deleteVersions,
		setIsGenerating,
		setSelectedTones,
		selectAllVersions,
		openSpecificModal,
		updatePostContent,
		closeSpecificModal,
		toggleVersionSelection,

		// Computed helpers
		isUIDisabled,
		getActiveVersion,
		getOrderedVersions,
		getGeneratedVersions,
		isCriticalOperationRunning,

		// Pending operations
		addPendingOperation,
		hasPendingOperation,
		removePendingOperation,
		clearPendingOperations,
	} = useCreatePostModalStore();

	const hasPublishedInGroup = useMemo(() => {
		return posts.some(post => post.status === "published");
	}, [posts]);

	// Local state for integrations
	const [selectedSocials, setSelectedSocials] = useState<Set<string>>(
		new Set(),
	);
	const [socials, setSocials] = useState<any[]>([]);
	const [activeIntegrationTab, setActiveIntegrationTab] = useState("posted");
	const [isAddingIntegrations, setIsAddingIntegrations] = useState(false);
	const [isRemovingIntegrations, setIsRemovingIntegrations] = useState(false);
	const [removingIntegrationIds, setRemovingIntegrationIds] = useState<
		Set<string>
	>(new Set());

	const { repoDetails: repository } = useRepoSuperDetails(repoId);
	const { forceRefresh } = useCreditBalance({
		showNotifications: false,
		syncWithStore: true,
	});
	// Set socials from repository details when available
	useEffect(() => {
		if (
			repository?.settings?.connected_integration_ids &&
			Array.isArray(repository.settings.connected_integration_ids) &&
			repository?.social_connections?.connected_integrations
		) {
			const connectedIds = repository.settings.connected_integration_ids;
			const allIntegrations = repository.social_connections
				.connected_integrations as ConnectedIntegration;

			// Flatten the integrations into one array
			const flatIntegrations: ConnectedIntegration[] = Object.entries(
				allIntegrations,
			).flatMap(([platform, integrations]) =>
				(integrations as ConnectedIntegration[]).map(integration => ({
					...integration,
					platform, // inject platform key (linkedin, twitter, etc.)
				})),
			);

			// Only keep integrations whose IDs are in connected_integration_ids
			const hydrated = flatIntegrations.filter(integration =>
				connectedIds.includes(integration.id),
			);

			setSocials(hydrated);
		} else {
			setSocials([]);
		}
	}, [
		repository,
		repository?.settings?.connected_integration_ids,
		repository?.social_connections,
	]);

	// Date presets for scheduling
	const datePresets = useMemo(() => {
		const now = new Date();
		return [
			{ label: "Today", date: now },
			{
				label: "Tomorrow",
				date: new Date(now.getTime() + 24 * 60 * 60 * 1000),
			},
			{
				label: "Next Week",
				date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
			},
		];
	}, []);

	// Get active version
	const activeVersion = getActiveVersion();

	// Memoized computed values
	const orderedVersions = useMemo(() => {
		return getOrderedVersions();
	}, [getOrderedVersions, posts]);

	const generatedVersions = useMemo(() => {
		return getGeneratedVersions();
	}, [getGeneratedVersions, posts]);

	const queryClient = useQueryClient();
	const refreshData = useCallback(() => {
		queryClient.invalidateQueries({ queryKey: ["posts"] });
	}, [queryClient]);

	// Validation for schedule
	// Validation for schedule - include pending integrations
	const isValidSchedule = useMemo(() => {
		if (!scheduleDate || !scheduleTime) return false;

		const [hours, minutes] = scheduleTime.split(":");
		const scheduledDateTime = new Date(scheduleDate);
		scheduledDateTime.setHours(
			Number.parseInt(hours),
			Number.parseInt(minutes),
			0,
			0,
		);

		// Valid if future date AND (has selected socials OR has pending integrations)
		const hasSocialAccounts =
			selectedSocials.size > 0 ||
			(activeVersion?.pending_integrations_data?.length ?? 0) > 0;

		return scheduledDateTime > new Date() && hasSocialAccounts;
	}, [
		scheduleDate,
		scheduleTime,
		selectedSocials.size,
		activeVersion?.pending_integrations_data,
	]);

	// Enhanced image update function
	const updateVersionImage = useCallback(
		async (image: string | undefined) => {
			if (!activeVersionId || isUIDisabled()) return;

			const operationKey = `image_update_${activeVersionId}`;
			if (hasPendingOperation(operationKey)) return;

			try {
				addPendingOperation(operationKey);

				const updatedPosts = posts.map(post => {
					if (post.id === activeVersionId) {
						let newImageUrls: string[];

						if (image) {
							// Add new image (replace or append based on current state)
							const currentImages = post.image_urls || [];
							if (currentImages.length === 0) {
								newImageUrls = [image];
							} else {
								// Replace the last image or add if under limit
								newImageUrls = [...currentImages];
								if (newImageUrls.length < 2) {
									newImageUrls.push(image);
								} else {
									newImageUrls[newImageUrls.length - 1] = image;
								}
							}
						} else {
							newImageUrls = [];
						}

						return {
							...post,
							image_urls: newImageUrls,
							updated_at: new Date().toISOString(),
							is_edited: true,
						};
					}
					return post;
				});

				useCreatePostModalStore.setState({ posts: updatedPosts });
				await new Promise(resolve => setTimeout(resolve, 300));
			} catch (error) {
				console.error("Image update failed:", error);
			} finally {
				removePendingOperation(operationKey);
			}
		},
		[
			activeVersionId,
			posts,
			isUIDisabled,
			hasPendingOperation,
			addPendingOperation,
			removePendingOperation,
		],
	);

	// Enhanced remove image function
	const removeVersionImage = useCallback(
		async (imageIndex: number) => {
			if (!activeVersionId || isUIDisabled()) return;

			const operationKey = `image_remove_${activeVersionId}_${imageIndex}`;
			if (hasPendingOperation(operationKey)) return;

			try {
				addPendingOperation(operationKey);

				const updatedPosts = posts.map(post => {
					if (post.id === activeVersionId) {
						const currentImages = post.image_urls || [];
						const newImageUrls = currentImages.filter(
							(_, index) => index !== imageIndex,
						);

						return {
							...post,
							image_urls: newImageUrls,
							updated_at: new Date().toISOString(),
							is_edited: true,
						};
					}
					return post;
				});

				useCreatePostModalStore.setState({ posts: updatedPosts });
				await new Promise(resolve => setTimeout(resolve, 200));
			} catch (error) {
				console.error("Image removal failed:", error);
			} finally {
				removePendingOperation(operationKey);
			}
		},
		[
			activeVersionId,
			posts,
			isUIDisabled,
			hasPendingOperation,
			addPendingOperation,
			removePendingOperation,
		],
	);

	// Enhanced save function with proper state management
	const saveVersionContent = useCallback(
		async (versionId?: string) => {
			const targetVersionId = versionId || activeVersionId;
			if (!targetVersionId || isUIDisabled()) return;

			const operationKey = `save_${targetVersionId}`;
			if (hasPendingOperation(operationKey)) return;

			try {
				addPendingOperation(operationKey);
				startLoading("Saving changes...", false);

				const versionToSave = posts.find(post => post.id === targetVersionId);
				if (versionToSave && onUpdatePost) {
					// Call the updatePost API function
					const result = await updatePost({
						post_id: versionToSave.id as UUID,
						data: {
							content: versionToSave.content,
							image_urls: versionToSave.image_urls,
						},
					});

					if (result.success) {
						// Update the post state to reflect saved status
						const updatedPosts = posts.map(post => {
							if (post.id === targetVersionId) {
								return {
									...post,
									is_edited: false,
									updated_at: new Date().toISOString(),
								};
							}
							return post;
						});

						useCreatePostModalStore.setState({ posts: updatedPosts });

						// Call the callback with the updated data
						await onUpdatePost(
							versionToSave.id,
							versionToSave.content,
							versionToSave.image_urls,
						);

						// Show success toast
						toast.success(result.message);
					} else {
						toast.error(result.message);
					}
					// Refresh data to ensure consistency
					refreshData();
				}
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : "Failed to save changes";
				toast.error(errorMessage);
			} finally {
				removePendingOperation(operationKey);
				stopLoading();
			}
		},
		[
			activeVersionId,
			posts,
			onUpdatePost,
			isUIDisabled,
			hasPendingOperation,
			addPendingOperation,
			removePendingOperation,
			startLoading,
			stopLoading,
			refreshData,
		],
	);

	// Enhanced delete versions function with modal auto-close
	const handleDeleteVersions = useCallback(
		async (versionIds: string[]) => {
			if (posts.length === 0 || isUIDisabled()) return;

			const operationKey = `delete_${versionIds.join("_")}`;
			if (hasPendingOperation(operationKey)) return;

			// Check if we're deleting all remaining posts
			const willDeleteAllPosts = versionIds.length === posts.length;

			try {
				addPendingOperation(operationKey);
				startLoading(
					`Removing ${versionIds.length} version${versionIds.length > 1 ? "s" : ""}...`,
					false,
				);

				// Hybrid approach: use bulk delete for multiple items, individual delete for single items
				if (versionIds.length === 1) {
					// Single deletion - use individual delete for better error granularity
					if (onDeletePost) {
						await onDeletePost(versionIds[0]);
					}
					await deletePost({ post_id: versionIds[0] as UUID });
				} else {
					// Multiple deletions - use bulk delete for better performance
					await bulkPostOperations({
						action: "bulk_delete",
						post_ids: versionIds as UUID[],
					});

					// Still call onDeletePost callback for each if needed for UI consistency
					if (onDeletePost) {
						for (const id of versionIds) {
							await onDeletePost(id);
						}
					}
				}

				// Delete versions using store action
				deleteVersions(versionIds);

				// Refresh data
				refreshData();
				await new Promise(resolve => setTimeout(resolve, 500));

				// Auto-close modal if all posts were deleted
				if (willDeleteAllPosts) {
					closeModal();
				}
			} catch (error) {
				console.error("Deletion failed:", error);
				// You might want to show a user-friendly error message here
				// showErrorToast(`Failed to delete ${versionIds.length > 1 ? 'versions' : 'version'}`);
			} finally {
				removePendingOperation(operationKey);
				stopLoading();
			}
		},
		[
			posts,
			onDeletePost,
			deleteVersions,
			isUIDisabled,
			hasPendingOperation,
			addPendingOperation,
			removePendingOperation,
			startLoading,
			stopLoading,
			refreshData,
			closeModal,
		],
	);

	// Simplified generate variants function (removed tone generation props)
	const generateVariants = useCallback(async (): Promise<void> => {
		if (isUIDisabled() || isGenerating) {
			return;
		}

		const operationKey = `generate_${[...selectedTones].join("_")}`;
		if (hasPendingOperation(operationKey)) {
			return;
		}

		let wasApiCallMade = false;
		let creditsWereDeducted = false;

		try {
			addPendingOperation(operationKey);
			setIsGenerating(true);
			startLoading("Creating content variations...", true);

			// Get the original post data
			const originalPost = posts.find(post => post.is_original);
			if (!originalPost) {
				toast.error("⚠️ No original post found to create variations from");
				return;
			}

			// Get required data for API call
			const postId = originalPost.id;
			const commitMessage =
				originalPost.source_commit_message || "Manual variation generation";
			const platform = originalPost.platform?.toLowerCase() || "linkedin";
			const selectedTonesArray = [...selectedTones];

			// Validate we have the required data
			if (!postId) {
				toast.error("⚠️ Post ID is required to generate variations");
				return;
			}
			if (selectedTonesArray.length === 0) {
				toast.error("⚠️ Please select at least one tone to continue");
				return;
			}
			if (selectedTonesArray.length > 3) {
				toast.error("⚠️ Maximum 3 tones can be selected at once");
				return;
			}

			// Check credit balance before making the API call
			const currentCredits = useUserStore.getState().credits;
			const requiredCredits = selectedTonesArray.length;

			if (currentCredits < requiredCredits) {
				toast.error(
					`💳 Insufficient credits. You need ${requiredCredits} credits but only have ${currentCredits}.`,
					{
						duration: 6000,
						action: {
							label: "Get Credits",
							onClick: () => router.push("/refill"),
						},
					},
				);
				return;
			}

			// Mark that we're about to make the API call
			wasApiCallMade = true;

			// Call the server action to create variations
			const result = await createPostVariations({
				post_id: postId,
				commit_message: commitMessage,
				platform: platform as "linkedin" | "twitter" | "slack" | "discord",
				tones: selectedTonesArray,
			});

			// Mark that credits were likely deducted (even if we don't get the response)
			creditsWereDeducted = true;

			if (!result.success) {
				toast.error(
					"❌ " +
						(result.message ||
							"Failed to create variations. Please try again."),
					{
						duration: 5000,
					},
				);
				return;
			}

			// Update user credits with the new balance from the server
			if (result.data.credits_info) {
				const { credits_used } = result.data.credits_info;
				forceRefresh();

				toast.success(
					`🎉 ${result.data.variations.length} variations created successfully! ${credits_used} credits used.`,
				);
			}

			// Process the created variations and add them to the UI
			const variations = result.data.variations || [];

			variations.forEach((variation: PostVariation, index: number) => {
				// Find the tone label for display
				const toneLabel =
					TONE_OPTIONS.find(t => t.id === variation.tone)?.label ||
					variation.tone;

				// Add the new version to your UI state
				addNewVersion(variation.content, toneLabel, {
					id: variation.id,
					platform: variation.platform,
					tone: variation.tone,
					status: variation.status,
					created_at: variation.created_at,
					variation_group_id: result.data.variation_group_id,
				});
			});

			closeSpecificModal("generator");
		} catch (error) {
			// Handle different error scenarios with user-friendly messages
			if (error instanceof Error) {
				// Network/timeout errors where the request might have succeeded
				if (
					wasApiCallMade &&
					(error.name === "TimeoutError" ||
						error.message.includes("fetch") ||
						error.message.includes("network") ||
						error.message.includes("timeout") ||
						!navigator.onLine)
				) {
					toast.error(
						"⚠️ Connection issue detected! Your variations might have been generated but didn't load properly.",
						{
							duration: 8000,
							action: {
								label: "Refresh Page",
								onClick: () => globalThis.location.reload(),
							},
						},
					);
					return;
				}

				// Credit-related errors
				if (error.message.includes("Insufficient credits")) {
					toast.error("💳 " + error.message, {
						duration: 6000,
						action: {
							label: "Get Credits",
							onClick: () => router.push("/refill"),
						},
					});
					return;
				}

				if (error.message.includes("Payment Required")) {
					toast.error(
						"💳 You need more credits to generate variations. No worries, you can top up anytime!",
						{
							duration: 6000,
							action: {
								label: "Get Credits",
								onClick: () => router.push("/refill"),
							},
						},
					);
					return;
				}

				// Server errors where processing might have started
				if (
					wasApiCallMade &&
					(error.message.includes("500") ||
						error.message.includes("Internal Server Error") ||
						error.message.includes("Service Unavailable"))
				) {
					toast.error(
						"🔧 Server hiccup detected! Your variations might be processing in the background.",
						{
							duration: 8000,
							action: {
								label: "Refresh Page",
								onClick: () => globalThis.location.reload(),
							},
						},
					);
					return;
				}

				// Rate limiting
				if (
					error.message.includes("429") ||
					error.message.includes("rate limit")
				) {
					toast.error(
						"🐌 Whoa there, speedy! You're generating variations a bit too fast. Take a quick breather and try again in a moment.",
						{
							duration: 5000,
						},
					);
					return;
				}

				// Generic API errors after the call was made
				if (wasApiCallMade) {
					toast.error(
						"🤔 Something unexpected happened during generation. Your variations might still be created - try refreshing the page.",
						{
							duration: 8000,
							action: {
								label: "Refresh Page",
								onClick: () => globalThis.location.reload(),
							},
						},
					);
					return;
				}

				// Pre-API validation errors
				toast.error(
					"⚠️ " +
						(error.message ||
							"Unable to start generation. Please check your settings and try again."),
					{
						duration: 4000,
					},
				);
			} else {
				// Unknown error type
				if (wasApiCallMade) {
					toast.error(
						"🚨 Unexpected error occurred. Your content might have been generated - try refreshing the page.",
						{
							duration: 8000,
							action: {
								label: "Refresh Page",
								onClick: () => globalThis.location.reload(),
							},
						},
					);
				} else {
					toast.error(
						"🚨 Something went wrong before we could start. Please try again, and contact support if this keeps happening.",
						{
							duration: 5000,
						},
					);
				}
			}

			// If we made the API call and might have used credits, suggest checking credit balance
			if (wasApiCallMade && creditsWereDeducted) {
				// Add a subtle follow-up toast about checking credits
				setTimeout(() => {
					toast.info(
						"💡 Pro tip: Check your credit balance to see if any were used during the error.",
						{
							duration: 4000,
						},
					);
				}, 2000);
			}
		} finally {
			removePendingOperation(operationKey);
			setIsGenerating(false);
			stopLoading();
		}
	}, [
		posts,
		activeVersion,
		selectedTones,
		addNewVersion,
		closeSpecificModal,
		isUIDisabled,
		isGenerating,
		hasPendingOperation,
		addPendingOperation,
		removePendingOperation,
		setIsGenerating,
		startLoading,
		stopLoading,
	]);

	// Select version and close sidebar
	const selectVersion = useCallback(
		(versionId: string) => {
			useCreatePostModalStore.setState({ activeVersionId: versionId });
			closeSpecificModal("versions");
		},
		[closeSpecificModal],
	);

	// Cancel loading function
	const cancelLoading = useCallback(() => {
		clearPendingOperations();
		stopLoading();
	}, [clearPendingOperations, stopLoading]);

	// Get character counts for the current platform
	const characterCounts = useMemo(() => {
		if (!activeVersion) return [];

		let limit: number;
		if (platform === "twitter") {
			const xLimit = PLATFORM_LIMITS.x;
			limit = typeof xLimit === "number" ? xLimit : xLimit.verified;
		} else {
			limit = resolveLimit(platform);
		}

		const count = activeVersion.content.length;
		const isOverLimit = count > limit;

		return [{ platform, count, limit, isOverLimit }];
	}, [activeVersion, platform]);

	// Get version display name
	const getVersionDisplayName = useCallback(
		(post: PostItem, prefix: "V" | "Version" = "Version") => {
			if (post.is_original) return "Original";

			const sorted = [...posts]
				.filter(p => !p.is_original)
				.sort(
					(a, b) =>
						new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
				);

			const index = sorted.findIndex(p => p.id === post.id);
			if (index === -1) return prefix === "V" ? "V?" : "Version?";
			return `${prefix} ${index + 1}`;
		},
		[posts],
	);

	// Convert PostItem to version format
	const convertPostToVersion = useCallback(
		(post: PostItem) => ({
			id: post.id,
			tone: post.tone,
			content: post.content,
			createdAt: post.created_at,
			isOriginal: post.is_original,
			isGenerated: !post.is_original,
			images: post.image_urls || [],
			image: post.image_urls?.[0],
			displayName: getVersionDisplayName(post),
			status: post.status,
			scheduled_publish_time: post.scheduled_publish_time,
		}),
		[getVersionDisplayName],
	);

	// Render preview for a specific version
	const renderPreview = useCallback(
		(post: PostItem) => {
			const versionForPreview = convertPostToVersion(post);
			return <PreviewPane platform={platform} version={versionForPreview} />;
		},
		[platform, convertPostToVersion],
	);

	// Memoized active version for editor
	const activeVersionForEditor = useMemo(() => {
		if (!activeVersion) return;
		return convertPostToVersion(activeVersion);
	}, [activeVersion, convertPostToVersion]);

	// Memoized versions for sidebars
	const orderedVersionsForSidebar = useMemo(() => {
		return orderedVersions.map(convertPostToVersion);
	}, [orderedVersions, convertPostToVersion]);

	const generatedVersionsForSidebar = useMemo(() => {
		return generatedVersions.map(convertPostToVersion);
	}, [generatedVersions, convertPostToVersion]);

	// Handle dialog open/close
	const handleDialogOpenChange = useCallback(
		(open: boolean) => {
			if (
				!open &&
				isCriticalOperationRunning() &&
				!loadingState.canCancel &&
				pendingOperations
			) {
				return; // Prevent closing during critical operations
			}

			if (!open) {
				// If there are pending operations, block closing
				if (pendingOperations && pendingOperations.size > 0) {
					return;
				}

				// Safe to clear and close
				setSelectedSocials(new Set());
				closeModal();
			}
		},
		[isCriticalOperationRunning, loadingState, closeModal, pendingOperations],
	);

	// Handle schedule post function
	const handleSchedulePost = useCallback(async (): Promise<void> => {
		if (
			!scheduleDate ||
			!scheduleTime ||
			!activeVersion || // Added safety check for activeVersion
			isUIDisabled() ||
			(selectedSocials.size === 0 &&
				activeVersion.pending_integrations_data.length === 0)
		)
			return;

		// Validate that the scheduled time is in the future
		const [hours, minutes] = scheduleTime.split(":");
		const scheduledDateTime = new Date(scheduleDate);
		scheduledDateTime.setHours(
			Number.parseInt(hours),
			Number.parseInt(minutes),
			0,
			0,
		);

		if (scheduledDateTime <= new Date()) {
			toast.error("Please select a future date and time for scheduling.");
			return;
		}

		const operationKey = `schedule_${activeVersionId}`;
		if (hasPendingOperation(operationKey)) return;

		try {
			addPendingOperation(operationKey);
			startLoading("Setting up scheduled post...", false);

			// Get integration IDs from selected socials
			// Merge selected socials with existing pending integrations (no duplicates)
			const existingPendingIds =
				activeVersion.pending_integrations_data?.map(
					(integration: any) => integration.id,
				) || [];

			const selectedSocialIds = [...selectedSocials];

			// Combine and remove duplicates using Set
			const integrationIds = [
				...new Set([...existingPendingIds, ...selectedSocialIds]),
			];

			// API call with integration IDs
			const result = await schedulePost({
				post_id: activeVersion.id as UUID,
				scheduled_publish_time: scheduledDateTime.toISOString(),
				integrationIds,
			});

			if (result.success) {
				// Refresh data to ensure backend sync
				refreshData();

				// FIXED: Update all posts - set scheduled one as "scheduled" and all others as "drafted"
				const updatedPosts = posts.map(post =>
					post.id === activeVersion.id
						? {
								// This is the post being scheduled
								...post,
								status: "scheduled" as PostStatus,
								scheduled_publish_time: scheduledDateTime.toISOString(),
								// Use the data from the backend response
								planned_integrations_data:
									result.data.planned_integrations_data || [],
								pending_integrations_data:
									result.data.pending_integrations_data || [],
								posting_summary:
									result.data.posting_summary || post.posting_summary,
							}
						: {
								// All other posts should be reset to "drafted" status
								...post,
								status: "drafted" as PostStatus,
								// Clear any scheduling data from other posts
								scheduled_publish_time: undefined,
								published_at: undefined,
								// Clear integration data from other posts since they're no longer scheduled/published
								planned_integrations_data: [],
								pending_integrations_data: [],
								// Keep their original posting_summary if they have one
							},
				);

				useCreatePostModalStore.setState({ posts: updatedPosts });

				toast.success(result.message || "Post scheduled successfully!");

				// Safe to clear and close
				setSelectedSocials(new Set());
				closeModal();
			}
		} catch (error) {
			console.error("Failed to schedule post:", error);
			const errorMessage =
				error instanceof Error
					? error.message
					: "Failed to schedule post. Please try again.";
			toast.error(errorMessage);
		} finally {
			removePendingOperation(operationKey);
			stopLoading();
		}
	}, [
		scheduleDate,
		scheduleTime,
		activeVersion,
		activeVersionId,
		selectedSocials,
		isUIDisabled,
		hasPendingOperation,
		addPendingOperation,
		removePendingOperation,
		startLoading,
		stopLoading,
		closeSpecificModal,
		posts, // Add posts to dependencies since we're using it
		toast, // Add toast to dependencies
	]);

	// Handle publish post function (immediate publishing without scheduling)
	const handlePublishPost = useCallback(async (): Promise<void> => {
		if (
			!activeVersion ||
			isUIDisabled() ||
			(selectedSocials.size === 0 &&
				activeVersion.pending_integrations_data.length === 0)
		)
			return;

		const operationKey = `publish_${activeVersionId}`;
		if (hasPendingOperation(operationKey)) return;

		try {
			addPendingOperation(operationKey);
			startLoading("Publishing post...", false);

			// Get integration IDs from selected socials
			// Merge selected socials with existing pending integrations (no duplicates)
			const existingPendingIds =
				activeVersion.pending_integrations_data?.map(
					(integration: any) => integration.id,
				) || [];

			const selectedSocialIds = [...selectedSocials];

			// Combine and remove duplicates using Set
			const integrationIds = [
				...new Set([...existingPendingIds, ...selectedSocialIds]),
			];

			// Call the new publish endpoint that handles actual publishing
			const result = await publishPostImmediate({
				post_id: activeVersion.id as UUID,
				integration_ids: integrationIds,
				check_credits: true,
			});

			if (result.success) {
				// Refresh data to ensure backend sync
				refreshData();

				// Show warning if partial success
				if (result.warning) {
					toast.warning(result.warning);
				}

				// Update posts - set published one as "published" and others as "drafted"
				const updatedPosts = posts.map(post =>
					post.id === activeVersion.id
						? {
								// This is the post being published
								...post,
								status: "published" as PostStatus,
								published_at: new Date().toISOString(),
								// Use the data from the backend response
								planned_integrations_data:
									result.data.post.planned_integrations_data || [],
								pending_integrations_data:
									result.data.post.pending_integrations_data || [],
								posting_summary:
									result.data.post.posting_summary || post.posting_summary,
							}
						: {
								// All other posts should be reset to "drafted" status
								...post,
								status: "drafted" as PostStatus,
								// Clear any scheduling data from other posts
								scheduled_publish_time: undefined,
								published_at: undefined,
								// Clear integration data from other posts since they're no longer scheduled/published
								planned_integrations_data: [],
								pending_integrations_data: [],
							},
				);

				useCreatePostModalStore.setState({ posts: updatedPosts });
				// Show success message with credits info
				const successMessage = result.message || "Post published successfully!";
				const creditsInfo = result.credits_used
					? ` (${result.credits_used} credit${result.credits_used > 1 ? "s" : ""} used)`
					: "";
				toast.success(successMessage + creditsInfo);

				// Safe to clear and close
				setSelectedSocials(new Set());
				closeModal();
			}
		} catch (error) {
			console.error("Failed to publish post:", error);

			// Enhanced error handling for specific error types
			let errorMessage = "Failed to publish post. Please try again.";

			if (error instanceof Error) {
				const message = error.message;

				// Check for insufficient credits error
				if (message.includes("Insufficient credits")) {
					errorMessage = message;
					// You might want to show a specific modal or prompt to buy credits
					// openCreditsModal(); // If you have such functionality
				}
				// Check for validation errors
				else if (message.includes("Validation failed")) {
					errorMessage = "Please check your selections and try again.";
				}
				// Check for integration errors
				else if (message.includes("integration")) {
					errorMessage =
						"There was an issue with your social media connections. Please reconnect and try again.";
				}
				// Generic error message from backend
				else {
					errorMessage = message;
				}
			}

			toast.error(errorMessage);
		} finally {
			removePendingOperation(operationKey);
			stopLoading();
		}
	}, [
		activeVersion,
		activeVersionId,
		selectedSocials,
		isUIDisabled,
		hasPendingOperation,
		addPendingOperation,
		removePendingOperation,
		startLoading,
		stopLoading,
		posts,
		closeModal,
		refreshData,
		toast,
	]);

	// Social integration handlers
	const handleSocialSelect = useCallback((socialId: string) => {
		setSelectedSocials(previous => {
			const newSet = new Set(previous);
			if (newSet.has(socialId)) {
				newSet.delete(socialId);
			} else {
				newSet.add(socialId);
			}
			return newSet;
		});
	}, []);

	const availableSocials = useMemo<ConnectedIntegration[]>(() => {
		if (
			!activeVersion?.platform ||
			!Array.isArray(socials) ||
			socials.length === 0
		) {
			return [];
		}

		// Normalize and restrict to same platform
		const normalizedPlatform = normalizePlatform(activeVersion.platform);

		// Socials that match activeVersion's platform
		const samePlatformSocials = socials.filter(
			social => social.platform === normalizedPlatform,
		);

		// Collect IDs of integrations already tied to this post
		const usedIntegrationIds = new Set([
			...(activeVersion.posted_integrations_data || []).map(index => index.id),
			...(activeVersion.planned_integrations_data || []).map(index => index.id),
			...(activeVersion.pending_integrations_data || []).map(index => index.id),
		]);

		// Filter: only keep socials of the same platform that are not already used
		const available = samePlatformSocials.filter(
			social => !usedIntegrationIds.has(social.id),
		);

		return available;
	}, [activeVersion, socials]);

	const handleSelectAllSocials = useCallback(() => {
		if (selectedSocials.size === availableSocials.length) {
			setSelectedSocials(new Set());
		} else {
			setSelectedSocials(new Set(availableSocials.map(social => social.id)));
		}
	}, [selectedSocials.size, availableSocials]);

	const handleAddAllIntegrations = useCallback(async () => {
		if (selectedSocials.size === 0) return;

		setIsAddingIntegrations(true);
		try {
			// API call would go here
			await new Promise(resolve => setTimeout(resolve, 1000));
			setSelectedSocials(new Set());
		} catch (error) {
			console.error("Failed to add integrations:", error);
		} finally {
			setIsAddingIntegrations(false);
		}
	}, [selectedSocials]);

	const handleCancelAllIntegrations = useCallback(async () => {
		if (!activeVersion?.pending_integrations_data?.length) return;

		const integrationIds = activeVersion.pending_integrations_data.map(
			index => index.id,
		);
		setIsRemovingIntegrations(true);

		try {
			// Show loading toast
			const loadingToast = toast.loading(
				`Removing ${integrationIds.length} social account${integrationIds.length > 1 ? "s" : ""}...`,
			);

			const result = await removePostIntegrations(
				activeVersion.id,
				integrationIds,
			);

			// Dismiss loading toast
			toast.dismiss(loadingToast);

			if (result.success) {
				const updatedPosts = posts.map(post => {
					if (post.id === activeVersion.id) {
						return {
							...post,
							pending_integrations_data: [],
							// Optionally also clear planned if needed
							// planned_integrations_data: []
						};
					}
					return post;
				});

				useCreatePostModalStore.setState({ posts: updatedPosts });
				refreshData();
				toast.success(
					result.message || "All social accounts removed successfully!",
				);

				// Switch to available tab since all are removed
				setActiveIntegrationTab("available");
			} else {
				toast.error(result.message || "Failed to remove social accounts");
			}
		} catch (error) {
			console.error("Error removing all integrations:", error);
			toast.error("Something went wrong. Please try again.");
		} finally {
			setIsRemovingIntegrations(false);
		}
	}, [activeVersion, posts, refreshData]);

	const handleCancelIntegration = useCallback(
		async (integrationId: string) => {
			if (!activeVersion) return;

			setRemovingIntegrationIds(previous =>
				new Set(previous).add(integrationId),
			);

			try {
				// Show loading toast
				const loadingToast = toast.loading("Removing social account...");

				const result = await removePostIntegrations(activeVersion.id, [
					integrationId,
				]);

				// Dismiss loading toast
				toast.dismiss(loadingToast);

				if (result.success) {
					const updatedPosts = posts.map(post => {
						if (post.id === activeVersion.id) {
							return {
								...post,
								planned_integrations_data:
									post.planned_integrations_data?.filter(
										integration => integration.id !== integrationId,
									),
								pending_integrations_data:
									post.pending_integrations_data?.filter(
										integration => integration.id !== integrationId,
									),
							};
						}
						return post;
					});

					useCreatePostModalStore.setState({ posts: updatedPosts });
					refreshData();
					toast.success(
						result.message || "Social account removed successfully!",
					);

					// If this was the last pending/planned integration, switch to "available" tab
					const remainingIntegrations = [
						...(updatedPosts.find(p => p.id === activeVersion.id)
							?.planned_integrations_data || []),
						...(updatedPosts.find(p => p.id === activeVersion.id)
							?.pending_integrations_data || []),
					];

					if (remainingIntegrations.length === 0) {
						setActiveIntegrationTab("available");
					}
				} else {
					toast.error(result.message || "Failed to remove social account");
				}
			} catch (error) {
				console.error("Error removing integration:", error);
				toast.error("Something went wrong. Please try again.");
			} finally {
				setRemovingIntegrationIds(previous => {
					const newSet = new Set(previous);
					newSet.delete(integrationId);
					return newSet;
				});
			}
		},
		[activeVersion, posts, refreshData],
	);

	const handleSaveIntegration = useCallback(async () => {
		if (!activeVersion || selectedSocials.size === 0) return;

		const integrationIdsToAdd: string[] = [...selectedSocials];
		setIsAddingIntegrations(true);

		try {
			const result = await addPostIntegrations(
				activeVersion.id,
				integrationIdsToAdd,
			);

			if (result.success) {
				const addedIntegrations = result.data?.added_integrations || [];

				const updatedPlannedIntegrations = [
					...(activeVersion.planned_integrations_data || []),
					...addedIntegrations.map((integration: any) => ({
						id: integration.id,
						name: integration.name,
						handle: integration.handle,
						platform: integration.platform,
						profile_image_url: integration.profile_image_url || undefined,
					})),
				];

				const updatedPendingIntegrations = [
					...(activeVersion.pending_integrations_data || []),
					...addedIntegrations.map((integration: any) => ({
						id: integration.id,
						name: integration.name,
						handle: integration.handle,
						platform: integration.platform,
						profile_image_url: integration.profile_image_url || undefined,
					})),
				];
				// Clear selected socials since they've been added
				setSelectedSocials(new Set<string>());
				refreshData();

				// Show success toast
				toast.success(result.message || "Social accounts added successfully!");
			} else {
				// Show error toast
				toast.error(result.message || "Failed to add social accounts");
			}
		} catch {
			toast.error("Something went wrong. Please try again.");
		} finally {
			setIsAddingIntegrations(false);
		}
	}, []);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			clearPendingOperations();
		};
	}, [clearPendingOperations]);

	if (!isOpen) return;

	return (
		<Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
			<DialogContent className="scrollbar-hide flex h-[54rem] w-full max-w-6xl flex-col overflow-hidden border-zinc-800 bg-zinc-950 p-0 text-zinc-100 md:h-[47.6rem] lg:h-[45.2rem]">
				{/* Enhanced Loading Overlay */}
				<LoadingOverlay
					loading={loadingState}
					onCancel={loadingState.canCancel ? cancelLoading : undefined}
				/>

				{/* Header */}
				<DialogHeader className="hidden border-b border-zinc-800/50 px-4 py-4 sm:px-6">
					<div className="flex items-center justify-between">
						<DialogTitle className="text-lg font-medium text-zinc-50 sm:text-xl">
							{posts.length === 1 ? "Edit post" : "Manage posts"} for{" "}
							{platform.charAt(0).toUpperCase() + platform.slice(1)}
						</DialogTitle>
					</div>
				</DialogHeader>

				{/* Main Content */}
				<div className="scrollbar-hide relative flex flex-1 overflow-hidden">
					{/* Enhanced Close Button */}
					<Button
						onClick={
							isCriticalOperationRunning() && !loadingState.canCancel
								? undefined
								: closeModal
						}
						disabled={isCriticalOperationRunning() && !loadingState.canCancel}
						aria-label="Close panel"
						className={cn(
							"absolute right-2 top-1 z-[30] flex h-9 w-9 items-center justify-center rounded-full border border-zinc-800/50 bg-zinc-950/90 text-zinc-400 backdrop-blur-sm transition-all duration-200 md:w-auto md:px-3",
							isCriticalOperationRunning() && !loadingState.canCancel
								? "cursor-not-allowed opacity-50"
								: "hover:scale-105 hover:border-zinc-700/50 hover:bg-zinc-800/90 hover:text-zinc-100",
						)}
					>
						<FiX className="h-5 w-5 md:hidden" />
						<span className="hidden md:inline">Close</span>
					</Button>

					{/* Left Panel - Editor */}
					<div className="scrollbar-hide flex w-full flex-col overflow-y-auto md:w-[550px]">
						{activeVersionForEditor && (
							<Editor
								disabled={isUIDisabled()}
								postVersionsCount={posts.length}
								activeVersion={activeVersionForEditor}
								updateVersionImage={updateVersionImage}
								removeVersionImage={removeVersionImage}
								getCharacterCounts={() => characterCounts}
								onOpenPreview={() => openSpecificModal("preview")}
								onOpenPublish={() => openSpecificModal("publish")}
								updateVersionContent={(content: string) =>
									updatePostContent(activeVersionId, content)
								}
								onOpenVersions={() => openSpecificModal("versions")}
								onOpenSchedule={() => openSpecificModal("schedule")}
								onOpenGenerator={() => openSpecificModal("generator")}
								onSaveDraft={() => saveVersionContent()}
								hasPublishedInGroup={hasPublishedInGroup}
								userSubscriptionTier={
									plan as "basic" | "pro" | "studio" | undefined
								}
							/>
						)}
					</div>

					{/* Right Panel - Preview (desktop only) */}
					<div className="scrollbar-hide hidden w-0 overflow-y-auto border-l border-zinc-800/50 bg-zinc-950/30 p-3 pt-[50px] sm:hidden md:block md:w-[600px] md:min-w-[350px] md:max-w-[650px]">
						{activeVersion && renderPreview(activeVersion)}
					</div>

					{/* Sidebars */}
					<VersionSidebar
						disabled={isUIDisabled()}
						isOpen={showVersionSidebar}
						selectVersion={selectVersion}
						activeVersionId={activeVersionId}
						selectedVersions={selectedVersions}
						selectAllVersions={selectAllVersions}
						deleteVersions={handleDeleteVersions}
						postVersions={orderedVersionsForSidebar}
						onClose={() => closeSpecificModal("versions")}
						generatedVersions={generatedVersionsForSidebar}
						toggleVersionSelection={toggleVersionSelection}
					/>

					<GeneratorSidebar
						disabled={isUIDisabled()}
						availableCredits={credits}
						isGenerating={isGenerating}
						isOpen={showGeneratorSidebar}
						selectedTones={selectedTones}
						setSelectedTones={setSelectedTones}
						generateVariants={generateVariants}
						onClose={() => closeSpecificModal("generator")}
						userPlan={plan as "basic" | "pro" | "studio" | undefined}
					/>

					<PreviewSidebar
						platform={platform}
						isOpen={showPreviewModal}
						version={activeVersionForEditor}
						onClose={() => closeSpecificModal("preview")}
					/>

					{/* Updated Schedule Panel */}
					<SchedulePanel
						disabled={isUIDisabled()}
						isOpen={showScheduleModal}
						onClose={() => closeSpecificModal("schedule")}
						isScheduling={
							loadingState.isLoading &&
							loadingState.operation.includes("Scheduling")
						}
						isValidSchedule={isValidSchedule}
						scheduleDate={scheduleDate}
						scheduleTime={scheduleTime}
						datePresets={datePresets}
						setScheduleDate={date => {
							useCreatePostModalStore.setState({ scheduleDate: date });
						}}
						setScheduleTime={time => {
							useCreatePostModalStore.setState({ scheduleTime: time });
						}}
						handleSchedulePost={handleSchedulePost}
						// Social Integration Props
						activeTab={activeIntegrationTab}
						selectedSocials={selectedSocials}
						availableSocials={availableSocials}
						onSocialSelect={handleSocialSelect}
						onTabChange={setActiveIntegrationTab}
						currentPost={activeVersion || posts[0]}
						onSaveIntegration={handleSaveIntegration}
						onSelectAllSocials={handleSelectAllSocials}
						isAddingIntegrations={isAddingIntegrations}
						onCancelIntegration={handleCancelIntegration}
						onAddAllIntegrations={handleAddAllIntegrations}
						isRemovingIntegrations={isRemovingIntegrations}
						removingIntegrationIds={removingIntegrationIds}
						onCancelAllIntegrations={handleCancelAllIntegrations}
					/>

					{/* Updated Publish Panel */}
					<PublishPanel
						disabled={isUIDisabled()}
						isOpen={showPublishModal} // Change this from showScheduleModal
						handlePublishPost={handlePublishPost}
						onClose={() => closeSpecificModal("publish")}
						isPublishing={
							loadingState.isLoading &&
							loadingState.operation.includes("Publishing")
						}
						// Social Integration Props
						activeTab={activeIntegrationTab}
						selectedSocials={selectedSocials}
						availableSocials={availableSocials}
						onSocialSelect={handleSocialSelect}
						onTabChange={setActiveIntegrationTab}
						currentPost={activeVersion || posts[0]}
						onSaveIntegration={handleSaveIntegration}
						onSelectAllSocials={handleSelectAllSocials}
						isAddingIntegrations={isAddingIntegrations}
						onCancelIntegration={handleCancelIntegration}
						onAddAllIntegrations={handleAddAllIntegrations}
						isRemovingIntegrations={isRemovingIntegrations}
						removingIntegrationIds={removingIntegrationIds}
						onCancelAllIntegrations={handleCancelAllIntegrations}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default CreatePostModal;
