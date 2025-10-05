/* eslint-disable import/no-unresolved */
"use client";
import {
	AlertTriangle,
	Calendar,
	CheckCircle2,
	ChevronDown,
	Eye,
	Loader2,
	Plus,
	X,
} from "lucide-react";
import Image from "next/image";
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { BiSolidMagicWand } from "react-icons/bi";
import { FaPaperPlane, FaSave } from "react-icons/fa";
import { toast } from "sonner"; // Import toast

import FeatureLimitWrapper from "@/components/feature-flag/feature-limit-wrapper";
import LimitTooltip from "@/components/feature-flag/limit-tooltip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLimitUI } from "@/hooks/use-limit-ui";
import { FEATURE_LIMITS } from "@/lib/constants/feature-limits";
import { cn } from "@/lib/utils";
import { uploadToCloudinary } from "@/server-actions/core/upload";
import { PostItem, PostStatus } from "@/types";

import { PostVersion } from "./types";

interface ImageState {
	id: string;
	url: string;
	isUploading: boolean;
	isLocal: boolean;
	publicId?: string;
	originalFile?: File;
	uploadError?: boolean;
}

interface EditorProps {
	disabled?: boolean;
	postVersionsCount: number;
	onOpenPreview: () => void;
	onOpenPublish: () => void;
	onOpenVersions: () => void;
	onOpenSchedule: () => void;
	onOpenGenerator: () => void;
	onSaveDraft: () => void | Promise<void>;
	updateVersionImage: (image?: string) => void;
	updateVersionContent: (content: string) => void;
	removeVersionImage?: (imageIndex: number) => void | Promise<void>;
	activeVersion: PostVersion & {
		images?: string[];
		status: PostStatus;
		scheduled_publish_time: string | undefined;
	};
	getCharacterCounts: () => Array<{
		count: number;
		platform: string;
		isOverLimit: boolean;
		limit: number | { default: number; verified: number };
	}>;
	onImageUploaded?: (
		cloudinaryUrl: string,
		originalFile: File,
		uploadData: any,
	) => void;
	onImageUploadError?: (error: string, file: File) => void;
	hasPublishedInGroup?: boolean;
	userSubscriptionTier?: "basic" | "pro" | "studio"; // Add subscription tier
}

interface HistoryEntry {
	content: string;
	images: string[];
	timestamp: Date;
}

const MAX_IMAGES = 2;
const MAX_HISTORY_SIZE = 50;
const MAX_FILE_SIZE = 25 * 1024 * 1024; // Increased to 25MB
const DEBOUNCE_TIME = 300;

// Helper functions
const isValidImageType = (file: File): boolean => {
	const supportedTypes = [
		"image/jpeg",
		"image/jpg",
		"image/png",
		"image/gif",
		"image/webp",
	];
	return supportedTypes.includes(file.type.toLowerCase());
};

const isValidFileSize = (file: File): boolean => {
	return file.size <= MAX_FILE_SIZE;
};

const arraysEqual = (a: string[], b: string[]): boolean => {
	if (a.length !== b.length) return false;
	return a.every((value, index) => value === b[index]);
};

const extractImageUrls = (imageStates: ImageState[]): string[] => {
	return imageStates.map(state => state.url);
};

const extractPublicIdFromUrl = (url: string): string | undefined => {
	try {
		const matches = url.match(/\/v\d+\/(.+?)(?:\.[^.]+)?$/);
		if (matches?.[1]) return matches[1];

		const urlParts = url.split("/");
		const publicIdWithExtension = urlParts.at(-1);
		return publicIdWithExtension?.split(".")[0];
	} catch {
		return undefined;
	}
};

const formatFileSize = (bytes: number): string => {
	if (bytes === 0) return "0 Bytes";
	const k = 1024;
	const sizes = ["Bytes", "KB", "MB"];
	const index = Math.floor(Math.log(bytes) / Math.log(k));
	return (
		Number.parseFloat((bytes / Math.pow(k, index)).toFixed(2)) +
		" " +
		sizes[index]
	);
};

// Validate content before publishing/scheduling
const validatePostContent = (
	content: string,
	images: ImageState[],
	isUploading: boolean,
	hasUploadErrors: boolean,
): { isValid: boolean; error?: string } => {
	const trimmedContent = content.trim();
	const hasText = trimmedContent.length > 0;
	const hasImages = images.length > 0;

	// Must have either text or images
	if (!hasText && !hasImages) {
		return {
			isValid: false,
			error: "Post must contain either text or images",
		};
	}

	// Check for upload in progress
	if (isUploading) {
		return {
			isValid: false,
			error: "Please wait for image uploads to complete",
		};
	}

	// Check for upload errors
	if (hasUploadErrors) {
		return {
			isValid: false,
			error: "Please fix image upload errors before publishing",
		};
	}

	return { isValid: true };
};

export const Editor: React.FC<EditorProps> = ({
	disabled,
	onSaveDraft,
	onOpenPublish,
	activeVersion,
	onOpenPreview,
	onOpenSchedule,
	onOpenVersions,
	onImageUploaded,
	onOpenGenerator,
	hasPublishedInGroup,
	postVersionsCount,
	updateVersionImage,
	removeVersionImage,
	getCharacterCounts,
	onImageUploadError,
	updateVersionContent,
	userSubscriptionTier = "basic", // Default to free tier
}) => {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const historyRef = useRef<Map<string, HistoryEntry[]>>(new Map());
	const historyIndexRef = useRef<Map<string, number>>(new Map());
	const contentChangeTimeoutRef = useRef<NodeJS.Timeout>();

	// State
	const [imageStates, setImageStates] = useState<ImageState[]>([]);
	const [removingImageIds, setRemovingImageIds] = useState<Set<string>>(
		new Set(),
	);
	const [isSaving, setIsSaving] = useState(false);
	const [saveError, setSaveError] = useState<string | undefined>();

	// Check if user can upload images based on subscription
	const canUploadImages = useMemo(() => {
		return userSubscriptionTier !== "basic";
	}, [userSubscriptionTier]);

	// Get current platform from character counts
	const currentPlatform = useMemo(() => {
		const characterCounts = getCharacterCounts();
		if (characterCounts.length > 0) {
			return characterCounts[0].platform.toLowerCase();
		}
		return "";
	}, [getCharacterCounts]);

	// Check if current platform is Twitter/X
	const isTwitterPlatform = useMemo(() => {
		return currentPlatform === "twitter" || currentPlatform === "x";
	}, [currentPlatform]);

	// Determine if image upload should be blocked
	const shouldBlockImageUpload = useMemo(() => {
		return isTwitterPlatform;
	}, [isTwitterPlatform]);

	// Current state with better memoization
	const currentContent = activeVersion?.content || "";
	const currentImages = useMemo(() => {
		if ((activeVersion?.images?.length ?? 0) > 0) {
			return activeVersion!.images!.map((imageUrl, index) => ({
				id: `version-${activeVersion!.id}-${index}`,
				url: imageUrl,
				isUploading: false,
				isLocal: imageUrl.startsWith("blob:") || imageUrl.startsWith("data:"),
				publicId: extractPublicIdFromUrl(imageUrl),
				uploadError: false,
			}));
		}
		return imageStates;
	}, [activeVersion, imageStates]);

	// Helper states
	const isUploading = useMemo(
		() => imageStates.some(state => state.isUploading),
		[imageStates],
	);
	const hasUploadErrors = useMemo(
		() => currentImages.some(image => image.uploadError),
		[currentImages],
	);
	const canAddMoreImages =
		currentImages.length < MAX_IMAGES &&
		canUploadImages &&
		!shouldBlockImageUpload;
	const isProcessing = isUploading || removingImageIds.size > 0;

	// History management
	const addToHistory = useCallback(
		(content: string, imageUrls: string[]) => {
			if (!activeVersion?.id) return;

			const versionHistory = historyRef.current.get(activeVersion.id) || [];
			const currentIndex = historyIndexRef.current.get(activeVersion.id) || -1;
			const lastEntry = versionHistory[currentIndex];

			if (
				lastEntry?.content === content &&
				arraysEqual(lastEntry.images, imageUrls)
			) {
				return;
			}

			const newEntry: HistoryEntry = {
				content,
				images: imageUrls,
				timestamp: new Date(),
			};
			const newHistory = [
				...versionHistory.slice(0, currentIndex + 1),
				newEntry,
			];

			if (newHistory.length > MAX_HISTORY_SIZE) {
				newHistory.shift();
			}

			historyRef.current.set(activeVersion.id, newHistory);
			historyIndexRef.current.set(activeVersion.id, newHistory.length - 1);
		},
		[activeVersion?.id],
	);

	// Initialize history when version changes
	useEffect(() => {
		if (!activeVersion?.id) return;

		if (!historyRef.current.has(activeVersion.id)) {
			const initialEntry: HistoryEntry = {
				content: currentContent,
				images: extractImageUrls(currentImages),
				timestamp: new Date(),
			};
			historyRef.current.set(activeVersion.id, [initialEntry]);
			historyIndexRef.current.set(activeVersion.id, 0);
		}
	}, [activeVersion?.id, currentContent, currentImages]);

	useEffect(() => {
		setImageStates([]);
		setSaveError(undefined);
	}, [activeVersion?.id]);

	useEffect(() => {
		return () => {
			currentImages.forEach(imageState => {
				if (imageState.url.startsWith("blob:")) {
					URL.revokeObjectURL(imageState.url);
				}
			});

			if (contentChangeTimeoutRef.current) {
				clearTimeout(contentChangeTimeoutRef.current);
			}
		};
	}, [currentImages]);

	// Enhanced image removal
	const handleRemoveImage = useCallback(
		async (imageIndex: number) => {
			const imageState = currentImages[imageIndex];
			if (!imageState) return;

			if (imageState.isUploading) {
				toast.error("Cannot remove image while uploading", {
					description: "Please wait for upload to complete",
				});
				return;
			}

			try {
				setRemovingImageIds(previous => new Set([...previous, imageState.id]));
				setSaveError(undefined);

				if (imageState.url.startsWith("blob:")) {
					URL.revokeObjectURL(imageState.url);
				}

				setImageStates(previous =>
					previous.filter(state => state.id !== imageState.id),
				);

				if (removeVersionImage) {
					await removeVersionImage(imageIndex);
				}

				const newImageUrls = currentImages
					.filter((_, index) => index !== imageIndex)
					.map(state => state.url);
				addToHistory(currentContent, newImageUrls);

				toast.success("Image removed successfully");
			} catch {
				toast.error("Failed to remove image", {
					description: "Please try again",
				});
			} finally {
				setRemovingImageIds(previous => {
					const newSet = new Set(previous);
					newSet.delete(imageState.id);
					return newSet;
				});
			}
		},
		[currentImages, removeVersionImage, addToHistory, currentContent],
	);

	// Upload to server with enhanced validation
	const uploadToServer = useCallback(
		async (file: File, imageStateId: string, previewUrl: string) => {
			try {
				// Server-side validation will also check this
				const result = await uploadToCloudinary(
					file,
					activeVersion?.id || "draft",
				);

				if (!result.success || !result.data) {
					throw new Error(result.error || "Upload failed");
				}

				const uploadData = result.data;

				setImageStates(previous =>
					previous.map(state =>
						state.id === imageStateId
							? {
									...state,
									url: uploadData.url,
									isLocal: false,
									isUploading: false,
									publicId: uploadData.public_id,
									uploadError: false,
								}
							: state,
					),
				);

				updateVersionImage(uploadData.url);

				if (previewUrl.startsWith("blob:")) {
					URL.revokeObjectURL(previewUrl);
				}

				onImageUploaded?.(uploadData.url, file, uploadData);

				const updatedImageUrls = currentImages.map(imageState =>
					imageState.id === imageStateId ? uploadData.url : imageState.url,
				);
				addToHistory(currentContent, updatedImageUrls);

				toast.success("Image uploaded successfully", {
					description: `${formatFileSize(file.size)} uploaded to cloud`,
				});
			} catch (error) {
				setImageStates(previous =>
					previous.map(state =>
						state.id === imageStateId
							? { ...state, isUploading: false, uploadError: true }
							: state,
					),
				);

				const errorMessage =
					error instanceof Error ? error.message : "Unknown upload error";

				toast.error("Image upload failed", {
					description: errorMessage,
				});

				onImageUploadError?.(errorMessage, file);
			}
		},
		[
			currentImages,
			updateVersionImage,
			onImageUploaded,
			onImageUploadError,
			activeVersion?.id,
			addToHistory,
			currentContent,
		],
	);

	// File upload handler with subscription check and Twitter/X platform check
	const handleFileUpload = useCallback(
		async (file: File) => {
			// Check if Twitter/X platform
			if (shouldBlockImageUpload) {
				toast.error("Image upload not available for Twitter/X", {
					description: "Image uploads for Twitter/X posts coming soon!",
				});
				return;
			}

			// Check subscription tier
			if (!canUploadImages) {
				toast.error("Image upload not available", {
					description: "Upgrade to Pro or Premium to upload images",
				});
				return;
			}

			if (!isValidImageType(file)) {
				toast.error("Unsupported file type", {
					description: "Only JPEG, PNG, GIF, and WebP images are allowed",
				});
				return;
			}

			if (!isValidFileSize(file)) {
				toast.error("File size too large", {
					description: `Maximum size is ${formatFileSize(MAX_FILE_SIZE)}`,
				});
				return;
			}

			if (currentImages.length >= MAX_IMAGES) {
				toast.error("Maximum images reached", {
					description: `You can only upload ${MAX_IMAGES} images per post`,
				});
				return;
			}

			const existingUpload = imageStates.find(
				state =>
					state.originalFile?.name === file.name &&
					state.originalFile?.size === file.size &&
					state.isUploading,
			);

			if (existingUpload) {
				toast.warning("Duplicate upload", {
					description: "This file is already being uploaded",
				});
				return;
			}

			const imageStateId = `${file.name}-${Date.now()}-${Math.random()}`;

			try {
				setSaveError(undefined);
				const previewUrl = URL.createObjectURL(file);

				const newImageState: ImageState = {
					id: imageStateId,
					url: previewUrl,
					isUploading: true,
					isLocal: true,
					originalFile: file,
					uploadError: false,
				};

				setImageStates(previous => [...previous, newImageState]);
				updateVersionImage(previewUrl);

				toast.info("Uploading image...", {
					description: file.name,
				});

				await uploadToServer(file, imageStateId, previewUrl);
			} catch (error) {
				console.error("Error in file upload:", error);
				toast.error("Failed to upload image", {
					description: "Please try again",
				});
				setImageStates(previous =>
					previous.filter(state => state.id !== imageStateId),
				);
			}
		},
		[
			currentImages,
			imageStates,
			updateVersionImage,
			uploadToServer,
			canUploadImages,
			shouldBlockImageUpload,
		],
	);

	// Drag and drop handler
	const handleDrop = useCallback(
		async (event: React.DragEvent) => {
			event.preventDefault();

			// Check if Twitter/X platform
			if (shouldBlockImageUpload) {
				toast.error("Image upload not available for Twitter/X", {
					description: "Image uploads for Twitter/X posts coming soon!",
				});
				return;
			}

			if (!canUploadImages) {
				toast.error("Image upload not available", {
					description: "Upgrade to Pro or Premium to upload images",
				});
				return;
			}

			try {
				const files = [...event.dataTransfer.files];
				if (files.length === 0) return;

				const remainingSlots = MAX_IMAGES - currentImages.length;
				const validFiles = files.filter(
					file => isValidImageType(file) && isValidFileSize(file),
				);
				const filesToProcess = validFiles.slice(0, remainingSlots);

				if (validFiles.length === 0) {
					toast.error("No valid images found", {
						description: `Only JPEG, PNG, GIF, and WebP files under ${formatFileSize(MAX_FILE_SIZE)} are supported`,
					});
					return;
				}

				if (files.length > filesToProcess.length) {
					toast.warning("Some files skipped", {
						description: `Only ${filesToProcess.length} image(s) could be added`,
					});
				}

				for (const file of filesToProcess) {
					await handleFileUpload(file);
					await new Promise(resolve => setTimeout(resolve, 100));
				}
			} catch (error) {
				console.error("Error in drag and drop:", error);
				toast.error("Failed to process dropped files");
			}
		},
		[
			handleFileUpload,
			currentImages.length,
			canUploadImages,
			shouldBlockImageUpload,
		],
	);

	// File input change handler
	const handleFileInputChange = useCallback(
		async (event: React.ChangeEvent<HTMLInputElement>) => {
			const files = event.target.files;
			if (!files?.length) return;

			// Check if Twitter/X platform
			if (shouldBlockImageUpload) {
				toast.error("Image upload not available for Twitter/X", {
					description: "Image uploads for Twitter/X posts coming soon!",
				});
				event.target.value = "";
				return;
			}

			if (!canUploadImages) {
				toast.error("Image upload not available", {
					description: "Upgrade to Pro or Premium to upload images",
				});
				event.target.value = "";
				return;
			}

			try {
				const fileArray = [...files];
				const remainingSlots = MAX_IMAGES - currentImages.length;
				const validFiles = fileArray
					.filter(file => isValidImageType(file) && isValidFileSize(file))
					.slice(0, remainingSlots);

				if (validFiles.length === 0) {
					toast.error("No valid images selected", {
						description: `Only JPEG, PNG, GIF, and WebP files under ${formatFileSize(MAX_FILE_SIZE)} are supported`,
					});
					event.target.value = "";
					return;
				}

				for (const file of validFiles) {
					await handleFileUpload(file);
					await new Promise(resolve => setTimeout(resolve, 100));
				}
			} catch (error) {
				console.error("Error processing selected files:", error);
				toast.error("Failed to process selected files");
			} finally {
				event.target.value = "";
			}
		},
		[
			handleFileUpload,
			currentImages.length,
			canUploadImages,
			shouldBlockImageUpload,
		],
	);

	// Content change handler with debouncing
	const handleContentChange = useCallback(
		(event: React.ChangeEvent<HTMLTextAreaElement>) => {
			const newContent = event.target.value;
			updateVersionContent(newContent);
			setSaveError(undefined);

			if (contentChangeTimeoutRef.current) {
				clearTimeout(contentChangeTimeoutRef.current);
			}

			contentChangeTimeoutRef.current = setTimeout(() => {
				const imageUrls = extractImageUrls(currentImages);
				addToHistory(newContent, imageUrls);
			}, DEBOUNCE_TIME);
		},
		[updateVersionContent, addToHistory, currentImages],
	);

	// Manual save handler
	const handleSaveDraftClick = useCallback(async () => {
		if (disabled || !activeVersion?.id) return;

		const isAnyImageUploading = currentImages.some(image => image.isUploading);
		if (isAnyImageUploading) {
			toast.error("Cannot save while uploading", {
				description: "Please wait for all images to finish uploading",
			});
			return;
		}

		const hasUploadErrors = currentImages.some(image => image.uploadError);
		if (hasUploadErrors) {
			toast.error("Cannot save with upload errors", {
				description: "Please fix image upload errors before saving",
			});
			return;
		}

		try {
			setIsSaving(true);
			setSaveError(undefined);
			await onSaveDraft();
		} catch {
		} finally {
			setIsSaving(false);
		}
	}, [disabled, activeVersion?.id, currentImages, onSaveDraft]);

	// Enhanced publish handler with validation
	const handlePublishClick = useCallback(() => {
		const validation = validatePostContent(
			currentContent,
			currentImages,
			isUploading,
			hasUploadErrors,
		);

		if (!validation.isValid) {
			toast.error("Cannot publish post", {
				description: validation.error,
			});
			return;
		}

		onOpenPublish();
	}, [
		currentContent,
		currentImages,
		hasUploadErrors,
		isUploading,
		onOpenPublish,
	]);

	// Enhanced schedule handler with validation
	const handleScheduleClick = useCallback(() => {
		const validation = validatePostContent(
			currentContent,
			currentImages,
			isUploading,
			hasUploadErrors,
		);

		if (!validation.isValid) {
			toast.error("Cannot schedule post", {
				description: validation.error,
			});
			return;
		}

		onOpenSchedule();
	}, [
		currentContent,
		currentImages,
		hasUploadErrors,
		isUploading,
		onOpenSchedule,
	]);

	const getPostStatusInfo = (activeVersion: PostItem) => {
		const status = activeVersion.status;
		const publishedCount = activeVersion.posted_integrations_data?.length || 0;
		const scheduledCount = activeVersion.planned_integrations_data?.length || 0;

		switch (status) {
			case "published": {
				return {
					label: "Published",
					color: "text-green-400 bg-green-500/10 border-green-500/20",
					icon: CheckCircle2,
					detail: `to ${publishedCount} account${publishedCount === 1 ? "" : "s"}`,
				};
			}
			case "scheduled": {
				return {
					label: "Scheduled",
					color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
					icon: Calendar,
					detail: activeVersion.scheduled_publish_time
						? `for ${new Date(activeVersion.scheduled_publish_time).toLocaleDateString()}`
						: `to ${scheduledCount} account${scheduledCount === 1 ? "" : "s"}`,
				};
			}
			default: {
				return {
					label: "Draft",
					color: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20",
					icon: AlertTriangle,
					detail: "Not published",
				};
			}
		}
	};

	const statusInfo = getPostStatusInfo(activeVersion as unknown as PostItem);
	const StatusIcon = statusInfo.icon;

	const imageLimitUI = useLimitUI({
		currentCount: 1,
		warningThreshold: 80,
		limitType: "image_upload",
		limitId: FEATURE_LIMITS.IMAGE_UPLOAD,
	});

	const scheduleLimitUI = useLimitUI({
		currentCount: 1,
		warningThreshold: 80,
		limitType: "schedule_post",
		limitId: FEATURE_LIMITS.SCHEDULE_POST,
	});

	return (
		<div className="scrollbar-hide mt-10 flex h-full w-full flex-col lg:mt-2">
			{/* Header */}
			<div className="scrollbar-hide border-b border-zinc-800/50 bg-zinc-950/50 px-2 py-2">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<Button
							variant="outline"
							onClick={onOpenVersions}
							disabled={disabled}
							className="border-zinc-700/50 bg-zinc-900/30 text-zinc-300 hover:bg-zinc-800/50 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
						>
							<span className="mr-2">
								{activeVersion?.displayName || activeVersion?.id || "Version"}
							</span>
							{activeVersion?.tone && (
								<Badge
									variant="outline"
									className="mr-2 border-blue-500/30 bg-blue-500/10 text-xs text-blue-400"
								>
									{activeVersion.tone}
								</Badge>
							)}
							<ChevronDown className="h-4 w-4" />
						</Button>
						<span className="hidden text-xs text-zinc-400 sm:inline">
							{postVersionsCount} version{postVersionsCount === 1 ? "" : "s"}
						</span>
					</div>
					<div className="flex items-center gap-2">
						<Button
							size="sm"
							variant="ghost"
							onClick={onOpenGenerator}
							disabled={disabled}
							className="text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
						>
							<BiSolidMagicWand className="h-3 w-3 lg:mr-1" />
							<span className="hidden lg:inline">Generate</span>
						</Button>
					</div>
				</div>

				<Badge
					variant="outline"
					className={`${statusInfo.color} mt-2 flex w-[188px] items-center justify-center gap-1`}
				>
					<StatusIcon className="h-3 w-3" />
					<span>{statusInfo.label}</span>
					{statusInfo.detail && (
						<span className="text-xs opacity-75">• {statusInfo.detail}</span>
					)}
				</Badge>

				{saveError && (
					<div className="mt-3 flex items-center text-xs">
						<span className="flex items-center gap-1 text-red-400">
							<AlertTriangle className="h-3 w-3" />
							{saveError}
						</span>
					</div>
				)}
			</div>

			{/* Content */}
			<div className="scrollbar-hide flex-1 overflow-y-auto px-2 py-2">
				<div className="scrollbar-hide max-w-none space-y-6">
					<div className="space-y-3">
						<Label className="text-sm font-medium text-zinc-200">Content</Label>
						<div className="relative">
							<Textarea
								disabled={disabled}
								placeholder="What's happening?"
								onChange={handleContentChange}
								value={currentContent}
								className="min-h-[200px] w-full resize-none border-zinc-800/50 bg-zinc-900/30 pr-20 text-sm leading-relaxed text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-700 focus:ring-zinc-600 disabled:cursor-not-allowed disabled:opacity-50"
							/>
							{getCharacterCounts().map(count => (
								<div key={count.platform} className="absolute bottom-3 right-3">
									<span
										className={`text-xs font-medium ${
											count.isOverLimit ? "text-red-400" : "text-zinc-400"
										}`}
									>
										{count.count} /{" "}
										{typeof count.limit === "number"
											? count.limit.toLocaleString()
											: count.limit.default.toLocaleString()}
									</span>
								</div>
							))}
						</div>
					</div>

					{/* Image Upload */}
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<Label className="text-sm font-medium text-zinc-200">
								Images
								{!canUploadImages && (
									<Badge
										variant="outline"
										className="ml-2 border-amber-500/30 bg-amber-500/10 text-xs text-amber-400"
									>
										Pro+
									</Badge>
								)}
								{shouldBlockImageUpload && (
									<Badge
										variant="outline"
										className="ml-2 border-blue-500/30 bg-blue-500/10 text-xs text-blue-400"
									>
										Coming Soon
									</Badge>
								)}
							</Label>
							{currentImages.length > 0 && (
								<span className="text-xs text-zinc-400">
									{currentImages.length}/{MAX_IMAGES} image
									{currentImages.length === 1 ? "" : "s"}
								</span>
							)}
						</div>

						{/* Twitter/X Image Upload Disclaimer */}
						{shouldBlockImageUpload && (
							<div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
								<div className="flex items-start gap-3">
									<div className="flex-shrink-0 rounded-full bg-blue-500/10 p-2">
										<AlertTriangle className="h-4 w-4 text-blue-400" />
									</div>
									<div className="flex-1 space-y-1">
										<p className="text-sm font-medium text-blue-300">
											Image uploads not available for Twitter/X posts
										</p>
										<p className="text-xs leading-relaxed text-blue-400/80">
											We&apos;re working hard to bring image upload support for
											Twitter/X posts. This feature is coming soon! For now, you
											can still create and schedule text-based posts for your
											Twitter/X accounts.
										</p>
										<div className="mt-2 flex items-center gap-2">
											<div className="flex items-center gap-1 rounded-md bg-blue-500/10 px-2 py-1">
												<Calendar className="h-3 w-3 text-blue-400" />
												<span className="text-xs font-medium text-blue-300">
													Coming Soon
												</span>
											</div>
										</div>
									</div>
								</div>
							</div>
						)}

						<div className="grid grid-cols-2 gap-3">
							{currentImages
								.filter(imageState => !removingImageIds.has(imageState.id))
								.map((imageState, index) => (
									<div key={imageState.id} className="group relative">
										<div className="relative h-[120px] w-full overflow-hidden rounded-lg border border-zinc-800/50">
											<Image
												src={imageState.url}
												alt={`Uploaded content ${index + 1}`}
												fill
												className={cn(
													"object-cover transition-opacity duration-200",
													imageState.isUploading && "opacity-50",
												)}
												unoptimized={
													imageState.url.startsWith("data:image/gif") ||
													imageState.url.startsWith("blob:")
												}
												sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
											/>

											{imageState.isUploading && (
												<div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/70 backdrop-blur-[2px]">
													<div className="flex flex-col items-center gap-2">
														<div className="relative">
															<div className="border-3 animation-delay-150 absolute inset-0 h-8 w-8 animate-spin rounded-full border-transparent border-r-blue-400" />
														</div>
														<div className="text-center">
															<div className="text-xs font-semibold text-white">
																Uploading...
															</div>
															<div className="text-xs text-white/70">
																Please wait
															</div>
														</div>
													</div>
												</div>
											)}

											{removingImageIds.has(imageState.id) && (
												<div className="absolute inset-0 flex items-center justify-center rounded-lg bg-zinc-900/80 backdrop-blur-sm">
													<div className="flex flex-col items-center gap-2">
														<Loader2 className="h-6 w-6 animate-spin text-zinc-300" />
														<span className="text-xs font-medium text-zinc-300">
															Removing...
														</span>
													</div>
												</div>
											)}

											{imageState.uploadError && (
												<div className="absolute inset-0 flex items-center justify-center rounded-lg bg-red-900/80 backdrop-blur-sm">
													<div className="flex flex-col items-center gap-2 px-2 text-center">
														<AlertTriangle className="h-6 w-6 text-red-300" />
														<span className="text-xs font-medium text-red-200">
															Upload failed
														</span>
														<span className="text-xs text-red-300">
															Remove and try again
														</span>
													</div>
												</div>
											)}

											{!imageState.isLocal &&
												imageState.publicId &&
												!imageState.uploadError &&
												!imageState.isUploading && (
													<div className="absolute left-2 top-2">
														<div className="flex items-center gap-1 rounded bg-green-500/20 px-1.5 py-0.5 text-xs text-green-400">
															<CheckCircle2 className="h-3 w-3" />
															Cloud
														</div>
													</div>
												)}
										</div>

										<button
											type="button"
											disabled={
												disabled ||
												removingImageIds.has(imageState.id) ||
												imageState.isUploading ||
												isUploading
											}
											onClick={() => {
												if (
													disabled ||
													removingImageIds.has(imageState.id) ||
													imageState.isUploading
												) {
													return;
												}
												handleRemoveImage(index);
											}}
											className={cn(
												"absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 opacity-0 transition-opacity hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 group-hover:opacity-100",
												imageState.isUploading &&
													"cursor-not-allowed opacity-30",
											)}
											title={
												imageState.isUploading
													? "Cannot remove while uploading"
													: "Remove image"
											}
										>
											{removingImageIds.has(imageState.id) ? (
												<Loader2 className="h-3 w-3 animate-spin text-zinc-300" />
											) : (
												<X className="h-3 w-3 text-zinc-300" />
											)}
										</button>
									</div>
								))}

							<FeatureLimitWrapper
								limitId={FEATURE_LIMITS.IMAGE_UPLOAD}
								currentCount={1}
								fallback={
									<LimitTooltip
										position="bottom"
										currentUsage={1}
										limitType="image_upload"
										maxLimit={imageLimitUI.limit}
									>
										<div
											className={
												"flex h-[120px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-700/50 bg-zinc-900/20 text-center opacity-75 transition-colors"
											}
										>
											<Plus className="mb-2 h-6 w-6 text-zinc-500" />
											<p className="mb-1 text-sm text-zinc-400">
												{currentImages.length > 0
													? "Add more images"
													: "Add images"}
											</p>
											<p className="text-xs text-zinc-500">
												Drag & drop or click
											</p>
											<p className="mt-1 text-xs text-zinc-600">
												JPEG, PNG, GIF, WebP • Max{" "}
												{formatFileSize(MAX_FILE_SIZE)}
											</p>
										</div>
									</LimitTooltip>
								}
							>
								{canAddMoreImages && (
									<div
										onDrop={handleDrop}
										onDragOver={event => event.preventDefault()}
										onClick={() =>
											!disabled &&
											!isProcessing &&
											canUploadImages &&
											!shouldBlockImageUpload &&
											fileInputRef.current?.click()
										}
										className={`flex h-[120px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-700/50 bg-zinc-900/20 text-center transition-colors ${
											disabled ||
											isProcessing ||
											!canUploadImages ||
											shouldBlockImageUpload
												? "cursor-not-allowed opacity-50"
												: "cursor-pointer hover:border-zinc-600/50 hover:bg-zinc-900/40"
										}`}
									>
										{isUploading ? (
											<>
												<Loader2 className="mb-2 h-6 w-6 animate-spin text-zinc-500" />
												<p className="mb-1 text-sm text-zinc-400">
													Uploading...
												</p>
												<p className="text-xs text-zinc-500">
													Processing image
												</p>
											</>
										) : (
											<>
												<Plus className="mb-2 h-6 w-6 text-zinc-500" />
												<p className="mb-1 text-sm text-zinc-400">
													{currentImages.length > 0
														? "Add more images"
														: "Add images"}
												</p>
												<p className="text-xs text-zinc-500">
													Drag & drop or click
												</p>
												<p className="mt-1 text-xs text-zinc-600">
													JPEG, PNG, GIF, WebP • Max{" "}
													{formatFileSize(MAX_FILE_SIZE)}
												</p>
												{!canUploadImages && (
													<p className="mt-2 text-xs text-amber-400">
														⚡ Pro+ required
													</p>
												)}
												{shouldBlockImageUpload && (
													<p className="mt-2 text-xs text-blue-400">
														🚀 Coming soon for Twitter/X
													</p>
												)}
											</>
										)}
										<input
											type="file"
											className="hidden"
											ref={fileInputRef}
											onChange={handleFileInputChange}
											disabled={
												disabled ||
												isProcessing ||
												!canUploadImages ||
												shouldBlockImageUpload
											}
											accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
											multiple={canAddMoreImages && currentImages.length === 0}
										/>
									</div>
								)}
							</FeatureLimitWrapper>
						</div>
					</div>
				</div>
			</div>

			{/* Footer */}
			<div className="scrollbar-hide border-t border-zinc-800/50 bg-zinc-950/80 px-2 py-2 backdrop-blur-sm">
				<div className="mb-3 rounded-md border border-blue-500/20 bg-blue-500/10 p-2">
					<p className="flex items-start gap-1 text-xs text-blue-400 lg:items-center">
						<AlertTriangle className="h-3 w-3 flex-shrink-0" />
						Remember to save your changes before switching posts or closing the
						editor to avoid losing your work.
					</p>
				</div>

				{isUploading && (
					<div className="mb-3 flex items-center gap-2 rounded-md border border-amber-500/20 bg-amber-500/5 px-3 py-2">
						<Loader2 className="h-3 w-3 animate-spin text-amber-400" />
						<span className="text-xs text-amber-400">
							Uploading images - actions disabled
						</span>
					</div>
				)}

				<div className="flex flex-col gap-4 py-3 lg:flex-row lg:items-center lg:justify-between">
					<div className="flex flex-row gap-3 lg:gap-3">
						<Button
							disabled={disabled || hasPublishedInGroup || isUploading}
							onClick={handlePublishClick}
							className={cn(
								"w-full bg-zinc-100 text-zinc-950 hover:bg-zinc-200",
								hasPublishedInGroup
									? "disabled:cursor-not-allowed disabled:bg-red-900/20 disabled:text-red-400"
									: "disabled:bg-zinc-800 disabled:text-zinc-500",
							)}
							title={
								isUploading
									? "Please wait for image uploads to complete"
									: hasPublishedInGroup
										? "Cannot publish - another version is already published"
										: undefined
							}
						>
							<FaPaperPlane className="mr-1 h-4 w-4" />
							{hasPublishedInGroup ? "Already Published" : "Publish now"}
						</Button>

						<FeatureLimitWrapper
							limitId={FEATURE_LIMITS.SCHEDULE_POST}
							currentCount={1}
							fallback={
								<LimitTooltip
									position="bottom"
									currentUsage={1}
									limitType="schedule_post"
									maxLimit={scheduleLimitUI.limit}
								>
									<div className="cursor-pointer">
										<Button
											disabled={true}
											variant="outline"
											className={cn(
												"w-full border-zinc-700/50 bg-zinc-900/30 text-zinc-300 transition-colors duration-75",
											)}
										>
											<Calendar className="mr-1 h-4 w-4" />
											Schedule
										</Button>
									</div>
								</LimitTooltip>
							}
						>
							<Button
								onClick={handleScheduleClick}
								disabled={disabled || hasPublishedInGroup || isUploading}
								variant="outline"
								className={cn(
									"w-full border-zinc-700/50 bg-zinc-900/30 text-zinc-300 transition-colors duration-75",
									hasPublishedInGroup &&
										"disabled:border-red-700/30 disabled:text-red-400",
								)}
								title={
									isUploading
										? "Please wait for image uploads to complete"
										: hasPublishedInGroup
											? "Cannot schedule - another version is already published"
											: undefined
								}
							>
								<Calendar className="mr-1 h-4 w-4" />
								{hasPublishedInGroup ? "Already Published" : "Schedule"}
							</Button>
						</FeatureLimitWrapper>
					</div>

					<div className="flex flex-col gap-3 lg:gap-3">
						<Button
							variant="outline"
							disabled={disabled}
							onClick={onOpenPreview}
							className="w-full border-zinc-700/50 bg-zinc-900/30 text-zinc-300 hover:bg-zinc-800/50 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-1 md:hidden lg:w-[130px] lg:flex-none"
						>
							<Eye className="mr-1 h-4 w-4" />
							Preview
						</Button>
						<Button
							variant="outline"
							disabled={disabled || isSaving || hasUploadErrors || isUploading}
							onClick={handleSaveDraftClick}
							className="w-full border-zinc-700/50 bg-zinc-900/30 text-zinc-300 hover:bg-zinc-800/50 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-1 lg:w-[130px] lg:flex-none"
							title={
								hasUploadErrors
									? "Fix upload errors first"
									: isUploading
										? "Wait for uploads to complete"
										: "Save draft"
							}
						>
							{isSaving ? (
								<>
									<Loader2 className="mr-1 h-4 w-4 animate-spin" />
									Saving...
								</>
							) : (
								<>
									<FaSave className="mr-1 h-4 w-4" />
									Save
								</>
							)}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};
