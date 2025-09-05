"use client";

import { UUID } from "node:crypto";

import { useQueryClient } from "@tanstack/react-query";
import { format, parseISO, setHours, setMinutes } from "date-fns";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import useRepoSuperDetails from "@/hooks/core/repo/get-repo-super-detail-hook";
import { deletePost } from "@/server-actions/core/delete-post";
import { updatePost } from "@/server-actions/core/edit-post";
import { reschedulePost } from "@/server-actions/core/reschedule-post";
import {
	addPostIntegrations,
	removePostIntegrations,
} from "@/server-actions/core/social-managment";
import type { PostGroup, PostItem } from "@/types";

import { ConnectedIntegration } from "../repositories/settings/channel-settings";
import EditPostDialog from "./components/edit-post-dialog";
import PostDialog from "./components/post-dialog";
import PostGrid from "./components/post-grid";
import RescheduleDialog from "./components/reschedule-dialog";
import { normalizePlatform } from "./utils/post-utils";

interface GroupedPostCardProps {
	group: PostGroup;
}

export default function GroupedPostCard({ group }: GroupedPostCardProps) {
	const params = useParams();
	const queryClient = useQueryClient();
	const [isLoading, setIsLoading] = useState(false);
	const [socials, setSocials] = useState<any[]>([]);
	const [activeTab, setActiveTab] = useState("posted");
	const [editedContent, setEditedContent] = useState("");
	const [editingPost, setEditingPost] = useState<PostItem | undefined>();
	const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
	const [reschedulingPosts, setReschedulingPosts] = useState<PostItem[]>([]);
	const [selectedSocials, setSelectedSocials] = useState<Set<string>>(
		new Set<string>(),
	);
	const [newScheduleDate, setNewScheduleDate] = useState<Date | undefined>(
		new Date(),
	);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [newScheduleTime, setNewScheduleTime] = useState("12:00");
	const [currentPost, setCurrentPost] = useState<PostItem | undefined>();

	// New loading states for integrations
	const [isAddingIntegrations, setIsAddingIntegrations] = useState(false);
	const [isRemovingIntegrations, setIsRemovingIntegrations] = useState(false);
	const [removingIntegrationIds, setRemovingIntegrationIds] = useState<
		Set<string>
	>(new Set());

	const repoId = useMemo(() => params?.id as UUID, [params?.id]);
	const { repoDetails: repository } = useRepoSuperDetails(repoId);

	const refreshData = useCallback(() => {
		queryClient.invalidateQueries({ queryKey: ["posts"] });
	}, [queryClient]);

	const [isMobile, setIsMobile] = useState(false);
	const [mobileView, setMobileView] = useState<"list" | "detail">("list"); // Track mobile view state

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
		repository.settings.connected_integration_ids,
		repository.social_connections,
	]);

	// Reset selected socials when current post changes
	useEffect(() => {
		setSelectedSocials(new Set());
	}, [currentPost?.id]);

	// Add useEffect to detect screen size
	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 1024); // lg breakpoint
		};

		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	const availableSocials = useMemo<ConnectedIntegration[]>(() => {
		if (
			!currentPost?.platform ||
			!Array.isArray(socials) ||
			socials.length === 0
		) {
			return [];
		}

		// Normalize and restrict to same platform
		const normalizedPlatform = normalizePlatform(currentPost.platform);

		// Socials that match currentPost's platform
		const samePlatformSocials = socials.filter(
			social => social.platform === normalizedPlatform,
		);

		// Collect IDs of integrations already tied to this post
		const usedIntegrationIds = new Set([
			...(currentPost.posted_integrations_data || []).map(index => index.id),
			...(currentPost.planned_integrations_data || []).map(index => index.id),
			...(currentPost.pending_integrations_data || []).map(index => index.id),
		]);

		// Filter: only keep socials of the same platform that are not already used
		const available = samePlatformSocials.filter(
			social => !usedIntegrationIds.has(social.id),
		);

		return available;
	}, [currentPost, socials]);

	const startReschedule = (posts: PostItem[]) => {
		const postsToReschedule = posts.filter(p => p.status !== "published");
		if (postsToReschedule.length > 0) {
			setReschedulingPosts(postsToReschedule);
			const initialDate = postsToReschedule[0]?.scheduled_publish_time
				? parseISO(postsToReschedule[0].scheduled_publish_time)
				: new Date();
			setNewScheduleDate(initialDate);
			setNewScheduleTime(format(initialDate, "HH:mm"));
		} else {
			toast.error(
				"Cannot reschedule: No draft or scheduled posts to reschedule.",
			);
		}
	};

	const handleReschedule = async () => {
		if (!newScheduleDate || reschedulingPosts.length === 0) return;
		setIsLoading(true);
		try {
			const [hours, minutes] = newScheduleTime.split(":").map(Number);
			const finalDate = setMinutes(setHours(newScheduleDate, hours), minutes);
			await Promise.all(
				reschedulingPosts.map(post =>
					reschedulePost(params.id as UUID, post.id, finalDate.toISOString()),
				),
			);
			refreshData();
			setReschedulingPosts([]);
			toast.success(
				`${reschedulingPosts.length} ${reschedulingPosts.length === 1 ? "post" : "posts"} rescheduled successfully.`,
			);
		} catch {
			toast.error("Failed to reschedule posts.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleDeleteSelected = async () => {
		if (selectedPosts.size === 0) return;
		setIsLoading(true);
		try {
			await Promise.all(
				[...selectedPosts].map(postId => deletePost(params.id as UUID, postId)),
			);
			setSelectedPosts(new Set());
			refreshData();
			toast.success(`${selectedPosts.size} posts deleted successfully.`);
		} catch {
			toast.error("Failed to delete posts.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleEditPost = async () => {
		if (!editingPost) return;
		setIsLoading(true);
		try {
			await updatePost(params.id as UUID, editingPost.id, editedContent);
			setEditingPost(undefined);
			setEditedContent("");
			refreshData();
			toast.success("Post updated successfully.");
		} catch {
			toast.error("Failed to update post.");
		} finally {
			setIsLoading(false);
		}
	};

	const togglePostSelection = useCallback((postId: string) => {
		setSelectedPosts(previous => {
			const newSelected = new Set(previous);
			if (newSelected.has(postId)) {
				newSelected.delete(postId);
			} else {
				newSelected.add(postId);
			}
			return newSelected;
		});
	}, []);

	const selectAll = useCallback(() => {
		setSelectedPosts(previous =>
			previous.size === group.posts.length
				? new Set()
				: new Set(group.posts.map(p => p.id)),
		);
	}, [group.posts]);

	const startEdit = useCallback((post: PostItem) => {
		setEditingPost(post);
		setEditedContent(post.content);
	}, []);

	// Modify your handleCardClick function
	const handleCardClick = useCallback(
		(postId: string) => {
			const post = group.posts.find(p => p.id === postId);
			if (post) {
				if (isMobile) {
					// On mobile, first show the list view
					setCurrentPost(post);
					setMobileView("list");
					setIsDialogOpen(true);
				} else {
					// On desktop, show the full dialog as before
					if (post.id !== currentPost?.id) {
						setCurrentPost(post);
						setIsDialogOpen(true);
					}
				}
			}
		},
		[group.posts, currentPost?.id, isMobile],
	);

	// Function to handle mobile post selection from list
	const handleMobilePostSelect = useCallback((post: PostItem) => {
		setCurrentPost(post);
		setMobileView("detail");
	}, []);

	// Function to go back to list view on mobile
	const handleMobileBack = useCallback(() => {
		setMobileView("list");
	}, []);

	// Modify your dialog close handler
	const handleDialogClose = useCallback(() => {
		setIsDialogOpen(false);
		setCurrentPost(undefined);
		setMobileView("list"); // Reset to list view
	}, []);

	// Enhanced function to add integrations with loading state
	const handleSaveIntegration = async () => {
		if (!currentPost || selectedSocials.size === 0) return;

		const integrationIdsToAdd: string[] = [...selectedSocials];
		setIsAddingIntegrations(true);

		try {
			const result = await addPostIntegrations(
				currentPost.id,
				integrationIdsToAdd,
			);

			if (result.success) {
				const addedIntegrations = result.data?.added_integrations || [];

				// Update currentPost state with new planned integrations
				const updatedPlannedIntegrations = [
					...(currentPost.planned_integrations_data || []),
					...addedIntegrations.map((integration: any) => ({
						id: integration.id,
						name: integration.name,
						handle: integration.handle,
						platform: integration.platform,
						profile_image_url: integration.profile_image_url || undefined,
					})),
				];

				// Update pending integrations (same as planned in this context)
				const updatedPendingIntegrations = [
					...(currentPost.pending_integrations_data || []),
					...addedIntegrations.map((integration: any) => ({
						id: integration.id,
						name: integration.name,
						handle: integration.handle,
						platform: integration.platform,
						profile_image_url: integration.profile_image_url || undefined,
					})),
				];

				setCurrentPost({
					...currentPost,
					planned_integrations_data: updatedPlannedIntegrations,
					pending_integrations_data: updatedPendingIntegrations,
				});

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
	};

	// Enhanced function for removing individual integrations with loading state
	const handleCancelIntegration = async (integrationId: string) => {
		if (!currentPost) return;

		setRemovingIntegrationIds(
			previous => new Set([...previous, integrationId]),
		);

		try {
			const result = await removePostIntegrations(currentPost.id, [
				integrationId,
			]);

			if (result.success) {
				// Update currentPost state by removing the integration
				const updatedPlanned = currentPost.planned_integrations_data.filter(
					integration => integration.id !== integrationId,
				);

				const updatedPending = currentPost.pending_integrations_data.filter(
					integration => integration.id !== integrationId,
				);

				setCurrentPost({
					...currentPost,
					planned_integrations_data: updatedPlanned,
					pending_integrations_data: updatedPending,
				});

				refreshData();
				toast.success(result.message || "Social account removed successfully!");
			} else {
				toast.error(result.message || "Failed to remove social account");
			}
		} catch {
			toast.error("Something went wrong. Please try again.");
		} finally {
			setRemovingIntegrationIds(previous => {
				const newSet = new Set(previous);
				newSet.delete(integrationId);
				return newSet;
			});
		}
	};

	// New function to add all available integrations
	const handleAddAllIntegrations = async () => {
		if (!currentPost || availableSocials.length === 0) return;

		const allAvailableIds = availableSocials.map(social => social.id);
		setIsAddingIntegrations(true);

		try {
			const result = await addPostIntegrations(currentPost.id, allAvailableIds);

			if (result.success) {
				const addedIntegrations = result.data?.added_integrations || [];

				// Update currentPost state with new planned integrations
				const updatedPlannedIntegrations = [
					...(currentPost.planned_integrations_data || []),
					...addedIntegrations.map((integration: any) => ({
						id: integration.id,
						name: integration.name,
						handle: integration.handle,
						platform: integration.platform,
						profile_image_url: integration.profile_image_url || undefined,
					})),
				];

				// Update pending integrations
				const updatedPendingIntegrations = [
					...(currentPost.pending_integrations_data || []),
					...addedIntegrations.map((integration: any) => ({
						id: integration.id,
						name: integration.name,
						handle: integration.handle,
						platform: integration.platform,
						profile_image_url: integration.profile_image_url || undefined,
					})),
				];

				setCurrentPost({
					...currentPost,
					planned_integrations_data: updatedPlannedIntegrations,
					pending_integrations_data: updatedPendingIntegrations,
				});

				// Clear selected socials
				setSelectedSocials(new Set<string>());
				refreshData();

				toast.success(
					`Added ${addedIntegrations.length} social accounts successfully!`,
				);
			} else {
				toast.error(result.message || "Failed to add social accounts");
			}
		} catch {
			toast.error("Something went wrong. Please try again.");
		} finally {
			setIsAddingIntegrations(false);
		}
	};

	// New function to remove all pending integrations
	const handleCancelAllIntegrations = async () => {
		if (!currentPost || currentPost.pending_integrations_data.length === 0)
			return;

		const allPendingIds = currentPost.pending_integrations_data.map(
			integration => integration.id,
		);
		setIsRemovingIntegrations(true);

		try {
			const result = await removePostIntegrations(
				currentPost.id,
				allPendingIds,
			);

			if (result.success) {
				// Clear all pending integrations from currentPost state
				setCurrentPost({
					...currentPost,
					planned_integrations_data: [],
					pending_integrations_data: [],
				});

				refreshData();
				toast.success(
					`Removed ${allPendingIds.length} social accounts successfully!`,
				);
			} else {
				toast.error(result.message || "Failed to remove social accounts");
			}
		} catch {
			toast.error("Something went wrong. Please try again.");
		} finally {
			setIsRemovingIntegrations(false);
		}
	};

	// New function to select all available socials
	const handleSelectAllSocials = useCallback(() => {
		if (selectedSocials.size === availableSocials.length) {
			// If all are selected, deselect all
			setSelectedSocials(new Set());
		} else {
			// Select all available socials
			setSelectedSocials(new Set(availableSocials.map(social => social.id)));
		}
	}, [selectedSocials.size, availableSocials]);

	const handleSocialSelect = useCallback(
		(socialId: string) => {
			const newSelected = new Set(selectedSocials);
			if (newSelected.has(socialId)) {
				newSelected.delete(socialId);
			} else {
				newSelected.add(socialId);
			}
			setSelectedSocials(newSelected);
		},
		[selectedSocials],
	);

	return (
		<>
			<PostGrid
				group={group}
				onPostClick={handleCardClick}
				onShowMoreClick={() => setIsDialogOpen(true)}
			/>

			<PostDialog
				isOpen={isDialogOpen}
				onClose={handleDialogClose}
				isMobile={isMobile}
				mobileView={mobileView}
				group={group}
				currentPost={currentPost}
				selectedPosts={selectedPosts}
				activeTab={activeTab}
				editedContent={editedContent}
				availableSocials={availableSocials}
				selectedSocials={selectedSocials}
				onPostSelect={setCurrentPost}
				onToggleSelection={togglePostSelection}
				onMobilePostSelect={handleMobilePostSelect}
				onMobileBack={handleMobileBack}
				onTabChange={setActiveTab}
				onSocialSelect={handleSocialSelect}
				onSelectAllSocials={handleSelectAllSocials}
				onAddAllIntegrations={handleAddAllIntegrations}
				onCancelAllIntegrations={handleCancelAllIntegrations}
				onCancelIntegration={handleCancelIntegration}
				onSaveIntegration={handleSaveIntegration}
				onStartEdit={startEdit}
				onStartReschedule={startReschedule}
				onSelectAll={selectAll}
				onDeleteSelected={handleDeleteSelected}
				isAddingIntegrations={isAddingIntegrations}
				isRemovingIntegrations={isRemovingIntegrations}
				removingIntegrationIds={removingIntegrationIds}
			/>

			<EditPostDialog
				editingPost={editingPost}
				editedContent={editedContent}
				onContentChange={setEditedContent}
				onClose={() => setEditingPost(undefined)}
				onSave={handleEditPost}
				isLoading={isLoading}
			/>

			<RescheduleDialog
				reschedulingPosts={reschedulingPosts}
				newScheduleDate={newScheduleDate}
				newScheduleTime={newScheduleTime}
				onDateChange={setNewScheduleDate}
				onTimeChange={setNewScheduleTime}
				onClose={() => setReschedulingPosts([])}
				onConfirm={handleReschedule}
				isLoading={isLoading}
			/>
		</>
	);
}
