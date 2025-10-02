/* eslint-disable import/no-unresolved */
"use client";

import React from "react";

import { ConnectedIntegration } from "@/components/repositories/settings/channel-settings";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PostItem } from "@/types";

import IntegrationTabs from "../../integration-tabs";
import { SlideInPanel } from "./slide-in-panel";

interface PublishPanelProps {
	isOpen: boolean;
	onClose: () => void;
	disabled?: boolean;
	isPublishing?: boolean;

	// Social Integration Props
	currentPost: PostItem;
	activeTab: string;
	onTabChange: (tab: string) => void;
	availableSocials: ConnectedIntegration[];
	selectedSocials: Set<string>;
	onSocialSelect: (socialId: string) => void;
	onSelectAllSocials: () => void;
	onAddAllIntegrations: () => void;
	onCancelAllIntegrations: () => void;
	onCancelIntegration: (integrationId: string) => void;
	onSaveIntegration: () => void;
	isAddingIntegrations: boolean;
	isRemovingIntegrations: boolean;
	removingIntegrationIds: Set<string>;
	handlePublishPost: () => void;
}

export const PublishPanel: React.FC<PublishPanelProps> = ({
	isOpen,
	onClose,
	disabled = false,
	isPublishing = false,

	// Social Integration Props
	currentPost,
	activeTab,
	onTabChange,
	availableSocials,
	selectedSocials,
	onSocialSelect,
	onSelectAllSocials,
	onAddAllIntegrations,
	onCancelAllIntegrations,
	onCancelIntegration,
	onSaveIntegration,
	isAddingIntegrations,
	isRemovingIntegrations,
	removingIntegrationIds,
	handlePublishPost,
}) => {
	return (
		<SlideInPanel
			isOpen={isOpen}
			onClose={onClose}
			title="Publish Post"
			widthClassName="w-full sm:w-[500px] lg:w-[480px]"
		>
			<div className="flex h-full flex-col">
				{/* Scrollable Content */}
				<div className="flex-1 overflow-y-auto">
					{/* Selected Platforms Preview */}
					{selectedSocials.size > 0 && (
						<div className="border-b border-white/5 px-5 py-3">
							<div className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2">
								<div className="h-1.5 w-1.5 rounded-full bg-green-400"></div>
								<div className="flex-1 text-sm text-white/90">
									Ready to publish
								</div>
								<div className="text-xs text-white/60">
									{selectedSocials.size} platform
									{selectedSocials.size > 1 ? "s" : ""}
								</div>
							</div>
						</div>
					)}

					{/* Social Accounts Integration - Full width */}
					<div className="px-5 py-5">
						<div className="mb-4 flex items-center justify-between">
							<h3 className="text-xs font-medium uppercase tracking-wide text-white/60">
								Social Accounts
							</h3>
						</div>

						<div className="scrollbar-hide h-full overflow-x-hidden rounded-xl bg-white/5 p-3">
							<IntegrationTabs
								activeTab={activeTab}
								currentPost={currentPost}
								onTabChange={onTabChange}
								onSocialSelect={onSocialSelect}
								selectedSocials={selectedSocials}
								availableSocials={availableSocials}
								onSaveIntegration={onSaveIntegration}
								onSelectAllSocials={onSelectAllSocials}
								onCancelIntegration={onCancelIntegration}
								onAddAllIntegrations={onAddAllIntegrations}
								isAddingIntegrations={isAddingIntegrations}
								isRemovingIntegrations={isRemovingIntegrations}
								removingIntegrationIds={removingIntegrationIds}
								onCancelAllIntegrations={onCancelAllIntegrations}
							/>
						</div>
					</div>
				</div>

				{/* Fixed Bottom Action Section */}
				<div className="border-t border-white/5 bg-black/20 px-5 py-4">
					{/* Publish Button */}
					<Button
						onClick={handlePublishPost}
						disabled={
							disabled ||
							isPublishing ||
							// Allow if either has selected OR has pending
							(selectedSocials.size === 0 &&
								(currentPost.pending_integrations_data?.length ?? 0) === 0)
						}
						className={cn(
							"relative h-10 w-full rounded-xl font-medium transition-all duration-200",
							// Update condition for styling
							selectedSocials.size > 0 ||
								(currentPost.pending_integrations_data?.length ?? 0) > 0
								? "mb-2 bg-white text-black hover:bg-white/90"
								: "cursor-not-allowed bg-white/10 text-white/50",
						)}
					>
						{isPublishing ? (
							<div className="flex items-center gap-2">
								<div className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
								<span>Publishing...</span>
							</div>
						) : (
							<div className="flex items-center gap-2">
								<svg
									className="h-4 w-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M14 5l7 7m0 0l-7 7m7-7H3"
									/>
								</svg>
								<span>Publish Now</span>
								{selectedSocials.size > 0 && (
									<div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/80 text-xs text-white">
										{selectedSocials.size}
									</div>
								)}
							</div>
						)}
					</Button>

					{/* Error Message */}
					{selectedSocials.size === 0 &&
						(currentPost.pending_integrations_data?.length ?? 0) === 0 && (
							<div className="mt-2 text-center">
								<p className="text-xs text-red-400/80">
									Choose at least one social account
								</p>
							</div>
						)}
				</div>
			</div>
		</SlideInPanel>
	);
};
