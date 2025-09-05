/* eslint-disable import/no-unresolved */
import { Trash2 } from "lucide-react";
import { FaCalendarAlt } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { PostGroup, PostItem } from "@/types";

import { ConnectedIntegration } from "../../repositories/settings/channel-settings";
import DesktopPostDetail from "./desktop-post-detail";
import DesktopPostList from "./desktop-post-list";
import MobileDetailView from "./mobile-detail-view";
import MobileListView from "./mobile-list-view";

interface PostDialogProps {
	isOpen: boolean;
	onClose: () => void;
	isMobile: boolean;
	mobileView: "list" | "detail";
	group: PostGroup;
	currentPost: PostItem | undefined;
	selectedPosts: Set<string>;
	activeTab: string;
	editedContent: string;
	availableSocials: ConnectedIntegration[];
	selectedSocials: Set<string>;
	onPostSelect: (post: PostItem) => void;
	onToggleSelection: (postId: string) => void;
	onMobilePostSelect: (post: PostItem) => void;
	onMobileBack: () => void;
	onTabChange: (tab: string) => void;
	onSocialSelect: (socialId: string) => void;
	onSelectAllSocials: () => void;
	onAddAllIntegrations: () => void;
	onCancelAllIntegrations: () => void;
	onCancelIntegration: (integrationId: string) => void;
	onSaveIntegration: () => void;
	onStartEdit: (post: PostItem) => void;
	onStartReschedule: (posts: PostItem[]) => void;
	onSelectAll: () => void;
	onDeleteSelected: () => void;
	isAddingIntegrations: boolean;
	isRemovingIntegrations: boolean;
	removingIntegrationIds: Set<string>;
}

export default function PostDialog({
	isOpen,
	onClose,
	isMobile,
	mobileView,
	group,
	currentPost,
	selectedPosts,
	activeTab,
	editedContent,
	availableSocials,
	selectedSocials,
	onPostSelect,
	onToggleSelection,
	onMobilePostSelect,
	onMobileBack,
	onTabChange,
	onSocialSelect,
	onSelectAllSocials,
	onAddAllIntegrations,
	onCancelAllIntegrations,
	onCancelIntegration,
	onSaveIntegration,
	onStartEdit,
	onStartReschedule,
	onSelectAll,
	onDeleteSelected,
	isAddingIntegrations,
	isRemovingIntegrations,
	removingIntegrationIds,
}: PostDialogProps) {
	return (
		<Dialog open={isOpen} onOpenChange={() => onClose()}>
			<DialogContent className="flex h-[78vh] w-[95vw] max-w-5xl flex-col overflow-hidden border-zinc-800/50 bg-zinc-900/90 text-zinc-100 backdrop-blur-xl sm:h-[74vh] md:h-[74vh] lg:h-[74vh] xl:h-[74vh]">
				{/* Mobile List View */}
				{isMobile && mobileView === "list" && (
					<MobileListView
						group={group}
						currentPost={currentPost}
						selectedPosts={selectedPosts}
						onPostSelect={onMobilePostSelect}
						onToggleSelection={onToggleSelection}
					/>
				)}

				{/* Mobile Detail View */}
				{isMobile && mobileView === "detail" && currentPost && (
					<MobileDetailView
						currentPost={currentPost}
						editedContent={editedContent}
						activeTab={activeTab}
						onTabChange={onTabChange}
						availableSocials={availableSocials}
						selectedSocials={selectedSocials}
						onSocialSelect={onSocialSelect}
						onSelectAllSocials={onSelectAllSocials}
						onAddAllIntegrations={onAddAllIntegrations}
						onCancelAllIntegrations={onCancelAllIntegrations}
						onCancelIntegration={onCancelIntegration}
						onSaveIntegration={onSaveIntegration}
						onBack={onMobileBack}
						onStartEdit={onStartEdit}
						onStartReschedule={onStartReschedule}
						isAddingIntegrations={isAddingIntegrations}
						isRemovingIntegrations={isRemovingIntegrations}
						removingIntegrationIds={removingIntegrationIds}
					/>
				)}

				{/* Desktop View */}
				{!isMobile && (
					<>
						{/* Desktop Header */}
						<DialogHeader className="flex-shrink-0 border-b border-zinc-800/50 pb-4">
							<div className="flex items-center justify-between">
								<div className="min-w-0 flex-1 items-start justify-start text-left">
									<DialogTitle className="truncate text-lg font-medium text-zinc-100 sm:text-xl">
										Manage Posts
									</DialogTitle>
									<DialogDescription className="mt-1 text-sm text-zinc-400">
										{group.posts.length} posts • Edit and schedule across
										platforms
									</DialogDescription>
								</div>

								{/* Quick Actions */}
								<div className="hidden flex-shrink-0 items-center gap-2 sm:flex">
									<Checkbox
										id="select-all"
										checked={
											selectedPosts.size > 0 &&
											selectedPosts.size === group.posts.length
										}
										onCheckedChange={onSelectAll}
										className="border-zinc-600 data-[state=checked]:border-zinc-600 data-[state=checked]:bg-zinc-700"
									/>
									<Button
										variant="outline"
										size="sm"
										disabled={selectedPosts.size === 0}
										onClick={() =>
											onStartReschedule(
												[...selectedPosts]
													.map(id => group.posts.find(p => p.id === id)!)
													.filter(Boolean),
											)
										}
										className="hidden border-zinc-700/50 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700/70 hover:text-zinc-100 sm:flex"
									>
										<FaCalendarAlt className="h-3 w-3" />
									</Button>
									<Button
										variant="outline"
										size="sm"
										disabled={selectedPosts.size === 0}
										onClick={onDeleteSelected}
										className="border-red-800/50 bg-red-900/50 text-red-300 transition-all duration-300 hover:border-red-700/70 hover:bg-red-800/70 hover:text-red-100 disabled:opacity-50"
									>
										<Trash2 className="h-3 w-3" />
										{selectedPosts.size > 0 && (
											<span className="ml-1 text-xs">
												({selectedPosts.size})
											</span>
										)}
									</Button>
								</div>
							</div>
						</DialogHeader>

						{/* Main Content Area */}
						<div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden lg:flex-row lg:gap-6">
							{/* Left Panel - Posts Grid */}
							<DesktopPostList
								group={group}
								currentPost={currentPost}
								selectedPosts={selectedPosts}
								onPostSelect={onPostSelect}
								onToggleSelection={onToggleSelection}
							/>

							{/* Right Panel - Content Editor & Integrations */}
							<div className="flex min-h-0 flex-1 flex-col overflow-hidden">
								<DesktopPostDetail
									currentPost={currentPost as PostItem}
									editedContent={editedContent}
									activeTab={activeTab}
									onTabChange={onTabChange}
									availableSocials={availableSocials}
									selectedSocials={selectedSocials}
									onSocialSelect={onSocialSelect}
									onSelectAllSocials={onSelectAllSocials}
									onAddAllIntegrations={onAddAllIntegrations}
									onCancelAllIntegrations={onCancelAllIntegrations}
									onCancelIntegration={onCancelIntegration}
									onSaveIntegration={onSaveIntegration}
									onStartEdit={onStartEdit}
									onStartReschedule={onStartReschedule}
									isAddingIntegrations={isAddingIntegrations}
									isRemovingIntegrations={isRemovingIntegrations}
									removingIntegrationIds={removingIntegrationIds}
								/>
							</div>
						</div>
					</>
				)}

				{/* Mobile Action Bar */}
				<div className="flex items-center justify-between gap-4 border-t border-zinc-800/50 pt-3 sm:hidden">
					<Checkbox
						id="select-all"
						checked={
							selectedPosts.size > 0 &&
							selectedPosts.size === group.posts.length
						}
						onCheckedChange={onSelectAll}
						className="border-zinc-600 data-[state=checked]:border-zinc-600 data-[state=checked]:bg-zinc-700"
					/>
					<Button
						variant="outline"
						size="sm"
						disabled={selectedPosts.size === 0}
						onClick={() =>
							onStartReschedule(
								[...selectedPosts]
									.map(id => group.posts.find(p => p.id === id)!)
									.filter(Boolean),
							)
						}
						className="flex-1 border-zinc-700/50 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700/70 hover:text-zinc-100"
					>
						<FaCalendarAlt className="mr-1 h-3 w-3" />
						Reschedule
					</Button>
					<Button
						variant="outline"
						size="sm"
						disabled={selectedPosts.size === 0}
						onClick={onDeleteSelected}
						className="flex-1 border-red-800/50 bg-red-900/50 text-red-300 transition-all duration-300 hover:border-red-700/70 hover:bg-red-800/70 hover:text-red-100 disabled:opacity-50"
					>
						<Trash2 className="mr-1 h-3 w-3" />
						Delete {selectedPosts.size > 0 && `(${selectedPosts.size})`}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
