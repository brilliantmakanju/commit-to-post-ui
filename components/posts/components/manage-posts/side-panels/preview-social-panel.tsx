/* eslint-disable import/no-unresolved */
"use client";

import React from "react";

import { PreviewPane } from "../preview-pane";
import { PostVersion } from "../types";
import { SlideInPanel } from "./slide-in-panel";

interface PreviewSidebarProps {
	isOpen: boolean;
	onClose: () => void;
	version: PostVersion | undefined;
	platform: "twitter" | "linkedin" | "discord";
}

export const PreviewSidebar: React.FC<PreviewSidebarProps> = ({
	isOpen,
	onClose,
	version,
	platform,
}) => {
	return (
		<SlideInPanel
			isOpen={isOpen}
			title="Preview"
			onClose={onClose}
			widthClassName="sm:w-[80%]"
		>
			{/* Preview section */}
			<div className="scrollbar-hide flex-1 overflow-y-auto p-4">
				{version ? (
					<PreviewPane platform={platform} version={version} />
				) : (
					<div className="flex h-full items-center justify-center text-sm text-zinc-500">
						No preview available
					</div>
				)}
			</div>
		</SlideInPanel>
	);
};
