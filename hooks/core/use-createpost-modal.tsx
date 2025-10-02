/* eslint-disable import/no-unresolved */
"use client";
import { useCallback } from "react";

import { PostItem } from "@/types";
import useCreatePostModalStore, { Platform } from "@/zustand/usepost-store";

/**
 * Custom hook to easily manage the CreatePostModal from any component
 */
export const useCreatePostModal = () => {
	const {
		// State
		posts,
		isOpen,
		platform,
		selectedPost,
		activeVersionId,

		// Actions
		setPosts,
		openModal,
		closeModal,
		setPlatform,
		resetModalState,
		setSelectedPost,
		getActiveVersion,
	} = useCreatePostModalStore();

	/**
	 * Open the modal with specific posts and platform
	 */
	const openCreatePostModal = useCallback(
		(options: {
			posts?: PostItem[];
			platform?: Platform;
			selectedPost?: PostItem;
		}) => {
			const {
				posts: modalPosts = [],
				selectedPost: modalSelectedPost,
				platform: modalPlatform = "twitter",
			} = options;

			// Filter posts to only match the target platform
			const filteredPosts = modalPosts.filter(
				post => post.platform === modalPlatform,
			);

			// Only use selectedPost if it matches the platform
			const validSelectedPost =
				modalSelectedPost && modalSelectedPost.platform === modalPlatform
					? modalSelectedPost
					: undefined;

			openModal(modalPlatform, filteredPosts, validSelectedPost);
		},
		[openModal],
	);

	/**
	 * Open modal for editing a specific post
	 */
	const editPost = useCallback(
		(post: PostItem, platform: Platform = "twitter", allPosts?: PostItem[]) => {
			//Filter allPosts if provided, otherwise just use the single post
			const postsToUse = (allPosts || [post]).filter(
				p => p.platform === platform,
			);

			openModal(platform, postsToUse, post);
		},
		[openModal],
	);

	/**
	 * Update posts data while modal is open
	 */
	const updateModalPosts = useCallback(
		(newPosts: PostItem[], newSelectedPost?: PostItem) => {
			setPosts(newPosts);

			if (newSelectedPost) {
				setSelectedPost(newSelectedPost);
			}
		},
		[setPosts, setSelectedPost],
	);

	/**
	 * Switch platform while modal is open
	 */
	const switchPlatform = useCallback(
		(newPlatform: Platform) => {
			setPlatform(newPlatform);
		},
		[setPlatform],
	);

	/**
	 * Close modal and reset all state
	 */
	const closeAndReset = useCallback(() => {
		resetModalState();
	}, [resetModalState]);

	/**
	 * Get current modal state summary
	 */
	const getModalState = useCallback(() => {
		return {
			isOpen,
			platform,
			postsCount: posts.length,
			hasSelectedPost: !!selectedPost,
			activeVersion: getActiveVersion(),
		};
	}, [isOpen, platform, posts.length, selectedPost, getActiveVersion]);

	return {
		// State
		posts,
		isOpen,
		platform,
		selectedPost,
		activeVersionId,

		// Actions
		editPost,
		closeModal,
		closeAndReset,
		switchPlatform,
		updateModalPosts,
		openCreatePostModal,

		// Utilities
		getModalState,
		getActiveVersion,
	};
};

export default useCreatePostModal;
