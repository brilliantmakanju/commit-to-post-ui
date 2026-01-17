/* eslint-disable import/no-unresolved */
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Circle, Clock, Sparkles, Trash2 } from "lucide-react";
import Image from "next/image";
import React, { useCallback, useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

import { PostVersion } from "../types";
import { SlideInPanel } from "./slide-in-panel";

interface VersionSidebarProps {
	isOpen: boolean;
	disabled?: boolean;
	onClose: () => void;
	activeVersionId: string;
	postVersions: PostVersion[];
	selectedVersions: Set<string>;
	selectAllVersions: () => void;
	generatedVersions: PostVersion[];
	selectVersion: (id: string) => void;
	deleteVersions: (ids: string[]) => void;
	toggleVersionSelection: (id: string) => void;
}

export const VersionSidebar: React.FC<VersionSidebarProps> = ({
	isOpen,
	onClose,
	disabled,
	postVersions,
	selectVersion,
	deleteVersions,
	activeVersionId,
	selectedVersions,
	generatedVersions,
	selectAllVersions,
	toggleVersionSelection,
}) => {
	// Memoized calculations
	const hasGeneratedVersions = useMemo(
		() => generatedVersions.length > 0,
		[generatedVersions.length],
	);

	// Filter out original versions from selection count and operations
	const deletableVersions = useMemo(
		() => generatedVersions.filter(version => !version.isOriginal),
		[generatedVersions],
	);

	const selectedDeletableVersions = useMemo(
		() =>
			[...selectedVersions].filter(id => {
				const version = postVersions.find(v => v.id === id);
				return version && !version.isOriginal;
			}),
		[selectedVersions, postVersions],
	);

	const selectedCount = useMemo(
		() => selectedDeletableVersions.length,
		[selectedDeletableVersions.length],
	);

	const isAllSelected = useMemo(
		() =>
			deletableVersions.length > 0 &&
			selectedCount === deletableVersions.length,
		[deletableVersions.length, selectedCount],
	);

	const hasSelectedVersions = useMemo(() => selectedCount > 0, [selectedCount]);

	// Optimized handlers - FIXED: Prevent event propagation issues
	const handleSelectVersion = useCallback(
		(versionId: string, event: React.MouseEvent) => {
			if (disabled) return;

			// Prevent triggering when clicking on checkbox or its container
			const target = event.target as HTMLElement;
			if (
				target.closest("[data-checkbox-container]") ||
				target.closest("input[type='checkbox']") ||
				target.closest("[role='checkbox']")
			) {
				return;
			}

			// Only select if it's not already active to prevent unnecessary re-renders
			if (versionId !== activeVersionId) {
				selectVersion(versionId);
			}
		},
		[disabled, selectVersion, activeVersionId],
	);

	const handleCheckboxChange = useCallback(
		(versionId: string, event: React.MouseEvent) => {
			if (disabled) return;

			// Check if this is an original version - prevent selection for deletion
			const version = postVersions.find(v => v.id === versionId);
			if (version?.isOriginal) return;

			// Stop propagation to prevent version selection
			event.stopPropagation();
			event.preventDefault();
			toggleVersionSelection(versionId);
		},
		[toggleVersionSelection, disabled, postVersions],
	);

	// Updated select all to only select non-original versions
	const handleSelectAllVersions = useCallback(() => {
		if (disabled) return;

		// Only select/deselect deletable (non-original) versions
		if (isAllSelected) {
			// Deselect all deletable versions
			deletableVersions.forEach(version => {
				if (selectedVersions.has(version.id)) {
					toggleVersionSelection(version.id);
				}
			});
		} else {
			// Select all deletable versions
			deletableVersions.forEach(version => {
				if (!selectedVersions.has(version.id)) {
					toggleVersionSelection(version.id);
				}
			});
		}
	}, [
		disabled,
		isAllSelected,
		deletableVersions,
		selectedVersions,
		toggleVersionSelection,
	]);

	const handleDeleteSelected = useCallback(() => {
		if (disabled) return;
		// Only delete non-original versions
		deleteVersions(selectedDeletableVersions);
	}, [deleteVersions, selectedDeletableVersions, disabled]);

	return (
		<SlideInPanel
			isOpen={isOpen}
			onClose={onClose}
			widthClassName="w-full scrollbar-hide sm:w-[480px]"
			title="Version History"
		>
			{/* Action buttons - only show if there are deletable versions */}
			{deletableVersions.length > 0 && (
				<div className="sticky top-0 z-20 mb-4 flex items-center justify-between border-b border-white/5 bg-black/40 px-4 py-3 backdrop-blur-md">
					<Button
						size="sm"
						variant="ghost"
						disabled={disabled}
						onClick={handleSelectAllVersions}
						className="h-8 text-xs font-medium text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
					>
						{isAllSelected ? (
							<>
								<CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
								Deselect All
							</>
						) : (
							<>
								<Circle className="mr-1.5 h-3.5 w-3.5" />
								Select All
							</>
						)}
					</Button>

					{hasSelectedVersions && (
						<Button
							size="sm"
							variant="ghost"
							disabled={disabled}
							onClick={handleDeleteSelected}
							className="h-8 border border-white/10 bg-white/5 text-xs font-medium text-zinc-300 hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-400"
						>
							<Trash2 className="mr-1.5 h-3.5 w-3.5" />
							Delete ({selectedCount})
						</Button>
					)}
				</div>
			)}

			{/* Version list */}
			<div className="scrollbar-hide h-full space-y-4 overflow-hidden overflow-y-auto px-4 pb-20 pt-2">
				<AnimatePresence mode="popLayout">
					{postVersions.map((version, index) => {
						const isActive = activeVersionId === version.id;
						const isSelected = selectedVersions.has(version.id);
						const canBeDeleted = !version.isOriginal;

						return (
							<motion.div
								key={version.id}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.95 }}
								transition={{ duration: 0.2, delay: index * 0.05 }}
								onClick={event_ => handleSelectVersion(version.id, event_)}
								className={cn(
									"group relative overflow-hidden rounded-2xl border p-4 transition-all duration-300",
									disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
									isActive
										? "border-white/20 bg-white/5 shadow-2xl ring-1 ring-white/10"
										: "border-white/5 bg-black/20 hover:border-white/10 hover:bg-white/[0.02]",
								)}
							>
								{/* Active Glow Effect */}
								{isActive && (
									<div className="absolute -left-full -top-full h-[200%] w-[200%] rotate-45 bg-gradient-to-b from-white/5 via-transparent to-transparent opacity-50 blur-3xl" />
								)}

								{/* Checkbox - only for non-original versions */}
								{canBeDeleted && (
									<div
										data-checkbox-container
										className={cn(
											"absolute right-3 top-3 z-10 rounded-full p-1 transition-all duration-200",
											disabled ? "cursor-not-allowed" : "hover:bg-white/10",
											isSelected
												? "opacity-100"
												: "opacity-0 group-hover:opacity-100",
										)}
										onClick={event_ => handleCheckboxChange(version.id, event_)}
									>
										<Checkbox
											disabled={disabled}
											checked={isSelected}
											onCheckedChange={() => {}}
											className="h-4 w-4 rounded-full border-zinc-600 data-[state=checked]:border-white data-[state=checked]:bg-white data-[state=checked]:text-black"
										/>
									</div>
								)}

								{/* Header Info */}
								<div className="mb-3 flex items-center justify-between gap-3">
									<div className="flex items-center gap-2">
										{version.isOriginal ? (
											<Badge
												variant="outline"
												className="border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-medium text-zinc-200"
											>
												Original
											</Badge>
										) : (
											<Badge
												variant="outline"
												className="border-zinc-800 bg-zinc-900/50 px-2 py-0.5 text-[10px] font-medium text-zinc-400"
											>
												v{index}
											</Badge>
										)}

										{/* Tone/Template Badges - Monochrome */}
										{version.tone && (
											<span className="flex items-center gap-1 text-[10px] text-zinc-500">
												<span className="h-0.5 w-0.5 rounded-full bg-zinc-500" />
												{version.tone}
											</span>
										)}
										{version.template && (
											<span className="flex items-center gap-1 text-[10px] text-zinc-500">
												<span className="h-0.5 w-0.5 rounded-full bg-zinc-500" />
												{version.template}
											</span>
										)}
									</div>

									{/* Status Indicator */}
									{version.status && version.status !== "drafted" && (
										<span className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-400">
											{version.status === "published" && (
												<div className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
											)}
											{version.status === "scheduled" && (
												<Clock className="h-3 w-3" />
											)}
											<span className="capitalize">{version.status}</span>
										</span>
									)}
								</div>

								{/* Content */}
								<div className="relative">
									<p
										className={cn(
											"line-clamp-3 text-sm leading-relaxed transition-colors",
											isActive
												? "text-zinc-200"
												: "text-zinc-400 group-hover:text-zinc-300",
										)}
									>
										{version.content}
									</p>
									{/* Fade out effect for text */}
									<div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-black/0 to-transparent" />
								</div>

								{/* Image Preview */}
								{version.image && (
									<div className="mt-4 overflow-hidden rounded-lg border border-white/5 bg-black/40">
										<div className="relative aspect-video w-full">
											<Image
												fill
												src={version.image}
												alt="Version preview"
												className="object-cover opacity-80 transition-opacity duration-300 group-hover:opacity-100"
											/>
										</div>
									</div>
								)}

								{/* Active Indicator */}
								{isActive && (
									<motion.div
										layoutId="active-indicator"
										className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent"
									/>
								)}
							</motion.div>
						);
					})}
				</AnimatePresence>

				{/* Empty state */}
				{postVersions.length === 0 && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="flex flex-col items-center justify-center py-12 text-center"
					>
						<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900/50 ring-1 ring-white/5">
							<Sparkles className="h-5 w-5 text-zinc-600" />
						</div>
						<p className="text-sm font-medium text-zinc-400">No versions yet</p>
						<p className="mt-1 text-xs text-zinc-600">
							Generate some variations to get started
						</p>
					</motion.div>
				)}
			</div>
		</SlideInPanel>
	);
};
