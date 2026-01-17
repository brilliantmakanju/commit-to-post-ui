/* eslint-disable import/no-unresolved */
"use client";
import { AnimatePresence, motion } from "framer-motion";
import {
	AlertTriangle,
	Calendar,
	CheckCircle2,
	ChevronDown,
	Eye,
	Image as ImageIcon,
	Loader2,
	Plus,
	Sparkles,
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
import { toast } from "sonner";

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
	userSubscriptionTier?: "basic" | "pro" | "studio";
}

interface HistoryEntry {
	content: string;
	images: string[];
	timestamp: Date;
}

const MAX_IMAGES = 2;
const MAX_HISTORY_SIZE = 50;
const MAX_FILE_SIZE = 25 * 1024 * 1024;
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

const validatePostContent = (
	content: string,
	images: ImageState[],
	isUploading: boolean,
	hasUploadErrors: boolean,
): { isValid: boolean; error?: string } => {
	const trimmedContent = content.trim();
	const hasText = trimmedContent.length > 0;
	const hasImages = images.length > 0;

	if (!hasText && !hasImages) {
		return {
			isValid: false,
			error: "Post must contain either text or images",
		};
	}

	if (isUploading) {
		return {
			isValid: false,
			error: "Please wait for image uploads to complete",
		};
	}

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
	userSubscriptionTier = "basic",
}) => {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const historyRef = useRef<Map<string, HistoryEntry[]>>(new Map());
	const historyIndexRef = useRef<Map<string, number>>(new Map());
	const contentChangeTimeoutRef = useRef<NodeJS.Timeout>();

	const [imageStates, setImageStates] = useState<ImageState[]>([]);
	const [removingImageIds, setRemovingImageIds] = useState<Set<string>>(
		new Set(),
	);
	const [isSaving, setIsSaving] = useState(false);
	const [saveError, setSaveError] = useState<string | undefined>();

	const canUploadImages = useMemo(() => {
		return userSubscriptionTier !== "basic";
	}, [userSubscriptionTier]);

	const currentPlatform = useMemo(() => {
		const characterCounts = getCharacterCounts();
		if (characterCounts.length > 0) {
			return characterCounts[0].platform.toLowerCase();
		}
		return "";
	}, [getCharacterCounts]);

	const isTwitterPlatform = useMemo(() => {
		return currentPlatform === "twitter" || currentPlatform === "x";
	}, [currentPlatform]);

	const shouldBlockImageUpload = useMemo(() => {
		return isTwitterPlatform;
	}, [isTwitterPlatform]);

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

	const uploadToServer = useCallback(
		async (file: File, imageStateId: string, previewUrl: string) => {
			try {
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

	const handleFileUpload = useCallback(
		async (file: File) => {
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

	const handleDrop = useCallback(
		async (event: React.DragEvent) => {
			event.preventDefault();

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

	const handleFileInputChange = useCallback(
		async (event: React.ChangeEvent<HTMLInputElement>) => {
			const files = event.target.files;
			if (!files?.length) return;

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
					color: "text-zinc-300 bg-zinc-100/10 border-zinc-100/20",
					icon: CheckCircle2,
					detail: `to ${publishedCount} account${publishedCount === 1 ? "" : "s"}`,
				};
			}
			case "scheduled": {
				return {
					label: "Scheduled",
					color: "text-zinc-300 bg-zinc-100/10 border-zinc-100/20",
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
			<div className="scrollbar-hide border-b border-white/5 bg-black/40 px-4 py-3 backdrop-blur-md">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<Button
							variant="outline"
							onClick={onOpenVersions}
							disabled={disabled}
							className="h-9 border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
						>
							<span className="mr-2 font-medium">
								{activeVersion?.displayName || activeVersion?.id || "Version"}
							</span>
							{activeVersion?.tone && (
								<Badge
									variant="outline"
									className="mr-2 border-white/20 bg-white/10 text-xs text-zinc-300"
								>
									{activeVersion.tone}
								</Badge>
							)}
							<ChevronDown className="h-4 w-4 opacity-50" />
						</Button>
						<span className="hidden text-xs font-medium text-zinc-500 sm:inline">
							{postVersionsCount} version{postVersionsCount === 1 ? "" : "s"}
						</span>
					</div>
					<div className="flex items-center gap-2">
						<Button
							size="sm"
							variant="ghost"
							onClick={onOpenGenerator}
							disabled={disabled}
							className="group h-9 text-xs font-medium text-zinc-400 hover:bg-white/5 hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
						>
							<Sparkles className="mr-1.5 h-3.5 w-3.5 transition-transform group-hover:scale-110" />
							<span className="hidden lg:inline">Generate AI</span>
						</Button>
					</div>
				</div>

				<div className="mt-3 flex items-center justify-between">
					<Badge
						variant="outline"
						className={cn(
							"flex items-center gap-1.5 px-2.5 py-1",
							statusInfo.color,
						)}
					>
						<StatusIcon className="h-3.5 w-3.5" />
						<span className="font-medium">{statusInfo.label}</span>
						{statusInfo.detail && (
							<span className="text-xs opacity-60">• {statusInfo.detail}</span>
						)}
					</Badge>

					{saveError && (
						<div className="flex items-center gap-1.5 text-xs text-red-400">
							<AlertTriangle className="h-3.5 w-3.5" />
							{saveError}
						</div>
					)}
				</div>
			</div>

			{/* Content */}
			<div className="scrollbar-hide flex-1 overflow-y-auto bg-black/20 p-4">
				<div className="mx-auto max-w-3xl space-y-6">
					<div className="group relative rounded-2xl border border-white/5 bg-white/[0.02] p-1 transition-colors hover:border-white/10 hover:bg-white/[0.04]">
						<Textarea
							disabled={disabled}
							placeholder="What's on your mind?"
							onChange={handleContentChange}
							value={currentContent}
							className="scrollbar-hide min-h-[240px] w-full resize-none border-0 bg-transparent p-4 text-base leading-relaxed text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
						/>
						<div className="absolute bottom-4 right-4 flex gap-3">
							{getCharacterCounts().map(count => (
								<div
									key={count.platform}
									className={cn(
										"flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium backdrop-blur-sm",
										count.isOverLimit
											? "border-red-500/20 bg-red-500/10 text-red-400"
											: "border-white/5 bg-black/40 text-zinc-500",
									)}
								>
									<span>{count.platform}</span>
									<span className="opacity-50">|</span>
									<span>
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
					<div className="space-y-4">
						<div className="flex items-center justify-between px-1">
							<Label className="text-sm font-medium text-zinc-400">
								Media
								{!canUploadImages && (
									<Badge
										variant="outline"
										className="ml-2 border-amber-500/20 bg-amber-500/5 text-[10px] text-amber-400"
									>
										PRO
									</Badge>
								)}
							</Label>
							{currentImages.length > 0 && (
								<span className="text-xs text-zinc-600">
									{currentImages.length}/{MAX_IMAGES}
								</span>
							)}
						</div>

						{shouldBlockImageUpload && (
							<div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
								<div className="flex items-start gap-3">
									<div className="rounded-full bg-white/5 p-2">
										<ImageIcon className="h-4 w-4 text-zinc-400" />
									</div>
									<div className="space-y-1">
										<p className="text-sm font-medium text-zinc-300">
											Media upload unavailable
										</p>
										<p className="text-xs leading-relaxed text-zinc-500">
											Image uploads are currently disabled for this platform.
											You can still create text-only posts.
										</p>
									</div>
								</div>
							</div>
						)}

						<div className="grid grid-cols-2 gap-4">
							<AnimatePresence mode="popLayout">
								{currentImages
									.filter(imageState => !removingImageIds.has(imageState.id))
									.map((imageState, index) => (
										<motion.div
											key={imageState.id}
											initial={{ opacity: 0, scale: 0.95 }}
											animate={{ opacity: 1, scale: 1 }}
											exit={{ opacity: 0, scale: 0.95 }}
											className="group relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-black/40"
										>
											<Image
												src={imageState.url}
												alt={`Uploaded content ${index + 1}`}
												fill
												className={cn(
													"object-cover transition-all duration-300 group-hover:scale-105",
													imageState.isUploading && "opacity-50 blur-sm",
												)}
											/>

											{/* Overlay Actions */}
											<div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />

											<button
												type="button"
												disabled={
													disabled ||
													removingImageIds.has(imageState.id) ||
													imageState.isUploading ||
													isUploading
												}
												onClick={() => handleRemoveImage(index)}
												className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white opacity-0 backdrop-blur-md transition-all hover:bg-black/80 group-hover:opacity-100"
											>
												{removingImageIds.has(imageState.id) ? (
													<Loader2 className="h-4 w-4 animate-spin" />
												) : (
													<X className="h-4 w-4" />
												)}
											</button>

											{/* Status Indicators */}
											{imageState.isUploading && (
												<div className="absolute inset-0 flex items-center justify-center">
													<Loader2 className="h-8 w-8 animate-spin text-white" />
												</div>
											)}

											{imageState.uploadError && (
												<div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
													<AlertTriangle className="mb-2 h-6 w-6 text-red-400" />
													<span className="text-xs font-medium text-red-400">
														Upload Failed
													</span>
												</div>
											)}
										</motion.div>
									))}
							</AnimatePresence>

							{/* Upload Button */}
							{!shouldBlockImageUpload && (
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
											<div className="flex aspect-video cursor-not-allowed flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] opacity-50">
												<ImageIcon className="mb-2 h-6 w-6 text-zinc-600" />
												<span className="text-xs text-zinc-500">
													Limit Reached
												</span>
											</div>
										</LimitTooltip>
									}
								>
									{canAddMoreImages && (
										<motion.div
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											className={cn(
												"relative flex aspect-video cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] transition-all hover:border-white/20 hover:bg-white/[0.04]",
												(disabled || isProcessing) &&
													"cursor-not-allowed opacity-50",
											)}
											onClick={() =>
												!disabled &&
												!isProcessing &&
												fileInputRef.current?.click()
											}
											onDrop={handleDrop}
											onDragOver={event_ => event_.preventDefault()}
										>
											<input
												type="file"
												className="hidden"
												ref={fileInputRef}
												onChange={handleFileInputChange}
												accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
												multiple={
													canAddMoreImages && currentImages.length === 0
												}
												disabled={disabled || isProcessing}
											/>
											<div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10 transition-transform group-hover:scale-110">
												<Plus className="h-5 w-5 text-zinc-400" />
											</div>
											<p className="mt-3 text-xs font-medium text-zinc-400">
												Add Media
											</p>
											<p className="mt-1 text-[10px] text-zinc-600">
												Drag & drop or click
											</p>
										</motion.div>
									)}
								</FeatureLimitWrapper>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Footer */}
			<div className="scrollbar-hide border-t border-white/5 bg-black/40 px-4 py-4 backdrop-blur-md">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
					<div className="flex flex-1 gap-3">
						<Button
							disabled={disabled || hasPublishedInGroup || isUploading}
							onClick={handlePublishClick}
							className={cn(
								"h-10 flex-1 bg-white text-black hover:bg-zinc-200",
								hasPublishedInGroup && "opacity-50",
							)}
						>
							<FaPaperPlane className="mr-2 h-3.5 w-3.5" />
							{hasPublishedInGroup ? "Published" : "Publish Now"}
						</Button>

						<FeatureLimitWrapper
							limitId={FEATURE_LIMITS.SCHEDULE_POST}
							currentCount={1}
							fallback={
								<Button
									disabled
									variant="outline"
									className="h-10 flex-1 border-white/10 bg-white/5 text-zinc-400"
								>
									<Calendar className="mr-2 h-4 w-4" />
									Schedule
								</Button>
							}
						>
							<Button
								onClick={handleScheduleClick}
								disabled={disabled || hasPublishedInGroup || isUploading}
								variant="outline"
								className="h-10 flex-1 border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white"
							>
								<Calendar className="mr-2 h-4 w-4" />
								Schedule
							</Button>
						</FeatureLimitWrapper>
					</div>

					<div className="flex gap-3 lg:w-auto">
						<Button
							variant="ghost"
							disabled={disabled}
							onClick={onOpenPreview}
							className="h-10 flex-1 text-zinc-400 hover:bg-white/5 hover:text-zinc-200 md:hidden lg:flex-none"
						>
							<Eye className="mr-2 h-4 w-4" />
							Preview
						</Button>

						<Button
							variant="ghost"
							disabled={disabled || isSaving || hasUploadErrors || isUploading}
							onClick={handleSaveDraftClick}
							className="h-10 flex-1 text-zinc-400 hover:bg-white/5 hover:text-zinc-200 lg:flex-none"
						>
							{isSaving ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : (
								<FaSave className="mr-2 h-4 w-4" />
							)}
							Save Draft
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};
