/* eslint-disable import/no-unresolved */
"use client";

import { Trash2 } from "lucide-react";
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

	// Memoized truncated content
	const getTruncatedContent = useCallback(
		(content: string, maxLength: number = 120) => {
			return content.length > maxLength
				? `${content.slice(0, Math.max(0, maxLength))}...`
				: content;
		},
		[],
	);

	return (
		<SlideInPanel
			isOpen={isOpen}
			onClose={onClose}
			widthClassName="w-full scrollbar-hide sm:w-[440px]"
			title="Post Versions"
		>
			{/* Action buttons - only show if there are deletable versions */}
			{deletableVersions.length > 0 && (
				<div className="scrollbar-hide mt-2 flex items-center justify-between gap-2 px-3">
					<Button
						size="sm"
						variant="ghost"
						disabled={disabled}
						onClick={handleSelectAllVersions}
						className="text-xs text-zinc-400 transition-colors hover:bg-zinc-800/50 hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{isAllSelected ? "Deselect All" : "Select All"}
					</Button>

					{hasSelectedVersions && (
						<Button
							size="sm"
							variant="ghost"
							disabled={disabled}
							onClick={handleDeleteSelected}
							className="border border-red-500/20 text-xs text-red-400 transition-all hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
						>
							<Trash2 className="mr-1.5 h-3 w-3" />
							Delete ({selectedCount})
						</Button>
					)}
				</div>
			)}

			{/* Version list */}
			<div className="scrollbar-hide h-full space-y-3 overflow-hidden overflow-y-auto p-3 pb-10">
				{postVersions.map(version => {
					const isActive = activeVersionId === version.id;
					const isSelected = selectedVersions.has(version.id);
					const canBeDeleted = !version.isOriginal;

					return (
						<div
							key={version.id}
							onClick={event_ => handleSelectVersion(version.id, event_)}
							className={`scrollbar-hide group relative rounded-lg border p-2 transition-all duration-200 ${
								disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
							} ${
								isActive
									? "border-zinc-500/60 bg-zinc-800/40 shadow-sm"
									: "border-zinc-700/40 bg-zinc-900/30 hover:border-zinc-600/50 hover:bg-zinc-800/20"
							}`}
						>
							{/* Checkbox - only for non-original versions that can be deleted */}
							{canBeDeleted && (
								<div
									data-checkbox-container
									className={`absolute right-3 top-3 z-10 -m-1 rounded p-1 transition-colors ${
										disabled
											? "cursor-not-allowed opacity-50"
											: "hover:bg-zinc-700/30"
									}`}
									onClick={event_ => handleCheckboxChange(version.id, event_)}
								>
									<Checkbox
										disabled={disabled}
										checked={isSelected}
										onCheckedChange={() => {}} // Handled by container click
										className="h-4 w-4 border-zinc-500 data-[state=checked]:border-zinc-200 data-[state=checked]:bg-zinc-200 data-[state=checked]:text-zinc-900"
									/>
								</div>
							)}

							{/* Version header */}
							<div className="mb-2 flex items-start justify-between gap-2">
								<div className="flex flex-wrap items-center gap-2">
									<span
										className={`text-sm font-medium ${isActive ? "text-zinc-100" : "text-zinc-200"}`}
									>
										{version.displayName ||
											(version.isOriginal ? "Original" : version.id)}
									</span>

									{/* Tone badge */}
									{version.tone && (
										<Badge
											variant="outline"
											className="border-blue-400/30 bg-blue-400/10 px-1.5 py-0.5 text-[10px] text-blue-300"
										>
											{version.tone}
										</Badge>
									)}

									{/* Active badge */}
									{isActive && (
										<Badge
											variant="outline"
											className="border-emerald-400/30 bg-emerald-400/10 px-1.5 py-0.5 text-[10px] text-emerald-300"
										>
											Active
										</Badge>
									)}

									{/* Original badge */}
									{version.isOriginal && (
										<Badge
											variant="outline"
											className="border-amber-400/30 bg-amber-400/10 px-1.5 py-0.5 text-[10px] text-amber-300"
										>
											Original
										</Badge>
									)}
								</div>
							</div>

							{/* Content preview */}
							<div className="mb-3 text-sm leading-relaxed text-zinc-400">
								{getTruncatedContent(version.content)}
							</div>

							{/* Image preview */}
							{version.image && (
								<div className="mt-3">
									<Image
										width={400}
										height={200}
										src={version.image}
										alt="Version preview"
										className="h-20 w-full rounded-md border border-zinc-700/40 object-cover"
									/>
								</div>
							)}

							{/* Selection indicator for active version */}
							{isActive && (
								<div className="absolute bottom-2 right-2">
									<div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20">
										<div className="h-2 w-2 rounded-full bg-emerald-400" />
									</div>
								</div>
							)}

							{/* Subtle hover indicator */}
							<div
								className={`pointer-events-none absolute inset-0 rounded-lg transition-all duration-200 ${
									isActive
										? "ring-1 ring-zinc-500/20"
										: !disabled &&
											"group-hover:ring-1 group-hover:ring-zinc-600/30"
								}`}
							/>
							{version.status && version.status !== "drafted" && (
								<Badge
									variant="outline"
									className={cn(
										"mt-3 px-1.5 py-0.5 text-[10px]",
										version.status === "published" &&
											"border-green-400/30 bg-green-400/10 text-green-300",
										version.status === "scheduled" &&
											"border-blue-400/30 bg-blue-400/10 text-blue-300",
									)}
								>
									{version.status === "published"
										? "Published"
										: version.status === "scheduled"
											? "Scheduled"
											: version.status}
								</Badge>
							)}
						</div>
					);
				})}
			</div>

			{/* Empty state */}
			{postVersions.length === 0 && (
				<div className="py-8 text-center">
					<p className="text-sm text-zinc-500">No versions available</p>
				</div>
			)}
		</SlideInPanel>
	);
};
