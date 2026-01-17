/* eslint-disable import/no-unresolved */
"use client";

import { Send } from "lucide-react";
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
			<div className="flex h-full flex-col bg-zinc-950/50 backdrop-blur-sm">
				{/* Scrollable Content */}
				<div className="scrollbar-hide flex-1 overflow-y-auto">
					{/* Selected Platforms Preview */}
					{selectedSocials.size > 0 && (
						<div className="border-b border-zinc-800/50 px-5 py-4">
							<div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
								<div className="flex h-2 w-2 items-center justify-center rounded-full bg-emerald-500/20">
									<div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
								</div>
								<div className="flex-1 text-sm font-medium text-emerald-200/90">
									Ready to publish
								</div>
								<div className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
									{selectedSocials.size} platform
									{selectedSocials.size > 1 ? "s" : ""}
								</div>
							</div>
						</div>
					)}

					{/* Social Accounts Integration - Full width */}
					<div className="px-5 py-5">
						<div className="mb-4 flex items-center justify-between">
							<h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">
								Social Accounts
							</h3>
						</div>

						<div className="scrollbar-hide h-full overflow-x-hidden rounded-xl border border-zinc-800/50 bg-zinc-900/20 p-1">
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
				<div className="border-t border-zinc-800/50 bg-zinc-950/80 px-5 py-4 backdrop-blur-md">
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
							"relative h-10 w-full rounded-xl font-medium transition-all duration-300",
							// Update condition for styling
							selectedSocials.size > 0 ||
								(currentPost.pending_integrations_data?.length ?? 0) > 0
								? "bg-zinc-100 text-zinc-900 shadow-lg shadow-zinc-900/20 hover:bg-white hover:shadow-xl"
								: "cursor-not-allowed border border-zinc-800 bg-zinc-900/50 text-zinc-500",
						)}
					>
						{isPublishing ? (
							<div className="flex items-center gap-2">
								<div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-400 border-t-zinc-900" />
								<span>Publishing...</span>
							</div>
						) : (
							<div className="flex items-center gap-2">
								<Send className="h-4 w-4" />
								<span>Publish Now</span>
								{selectedSocials.size > 0 && (
									<div className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-bold text-zinc-100">
										{selectedSocials.size}
									</div>
								)}
							</div>
						)}
					</Button>

					{/* Error Message */}
					{selectedSocials.size === 0 &&
						(currentPost.pending_integrations_data?.length ?? 0) === 0 && (
							<div className="mt-3 text-center">
								<p className="flex items-center justify-center gap-1.5 text-xs text-red-400/90">
									<span className="h-1 w-1 rounded-full bg-red-400" />
									Choose at least one social account
								</p>
							</div>
						)}
				</div>
			</div>
		</SlideInPanel>
	);
};
