/* eslint-disable import/no-unresolved */
import { format, formatDistanceToNow, isFuture, parseISO } from "date-fns";
import { Edit3, Save } from "lucide-react";
import { FaCalendarAlt } from "react-icons/fa";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PostItem } from "@/types";

import { ConnectedIntegration } from "../../repositories/settings/channel-settings";
import { getBadgeStyles, getStatusLabel } from "../utils/post-utils";
import IntegrationTabs from "./integration-tabs";

interface DesktopPostDetailProps {
	currentPost: PostItem;
	editedContent: string;
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
	onStartEdit: (post: PostItem) => void;
	onStartReschedule: (posts: PostItem[]) => void;
	isAddingIntegrations: boolean;
	isRemovingIntegrations: boolean;
	removingIntegrationIds: Set<string>;
}

export default function DesktopPostDetail({
	currentPost,
	editedContent,
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
	onStartEdit,
	onStartReschedule,
	isAddingIntegrations,
	isRemovingIntegrations,
	removingIntegrationIds,
}: DesktopPostDetailProps) {
	if (!currentPost) {
		return (
			<div className="flex flex-1 items-center justify-center text-zinc-500">
				<div className="text-center">
					<div className="mb-2 text-lg">Select a post</div>
					<div className="text-sm">
						Choose a post from the left to view and edit details
					</div>
				</div>
			</div>
		);
	}

	return (
		<>
			{/* Content Editor */}
			<div className="mb-4 flex-shrink-0 lg:mb-6">
				<div className="mb-3 flex items-center justify-between">
					<span className="text-xs text-zinc-500">
						{currentPost.created_at &&
							(() => {
								const createdAt = parseISO(currentPost.created_at);

								if (currentPost.status === "published") {
									return `${formatDistanceToNow(createdAt, { addSuffix: true })}`;
									// → "30 minutes ago"
								}

								if (
									currentPost.status === "scheduled" &&
									currentPost.scheduled_publish_time
								) {
									const scheduledAt = parseISO(
										currentPost.scheduled_publish_time,
									);
									return isFuture(scheduledAt)
										? `in ${formatDistanceToNow(scheduledAt)}`
										: `${formatDistanceToNow(scheduledAt, { addSuffix: true })}`;
									// → "in 2 days" or "3 hours ago" if already passed
								}

								// fallback (drafts etc.)
								return format(createdAt, "MMM d, yyyy 'at' h:mm a");
							})()}
					</span>
					<div className="flex items-center justify-end gap-2">
						<Badge
							variant="outline"
							className={`text-xs font-semibold ${getBadgeStyles(currentPost.status)}`}
						>
							{getStatusLabel(currentPost.status)}
						</Badge>
					</div>
				</div>

				<p className="scrollbar-hide max-h-32 overflow-y-auto rounded-lg border-zinc-800/30 bg-zinc-800/30 p-6 leading-relaxed text-zinc-300 backdrop-blur-sm">
					{editedContent || currentPost.content}
				</p>

				{currentPost.status !== "published" && (
					<div className="mt-3 flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Button
								size="sm"
								variant="outline"
								onClick={() => onStartReschedule([currentPost])}
								className="border-zinc-700/50 bg-zinc-800/50 text-zinc-300 transition-all duration-300 hover:border-zinc-600/70 hover:bg-zinc-700/70 hover:text-zinc-100 disabled:opacity-50"
							>
								<FaCalendarAlt className="h-3 w-3" />
							</Button>
							<Button
								size="sm"
								onClick={onSaveIntegration}
								disabled={selectedSocials.size === 0}
								className="border-emerald-600/30 bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 disabled:opacity-50"
							>
								<Save className="h-3 w-3" />
							</Button>
						</div>
						<Button
							size="sm"
							variant="ghost"
							onClick={() => onStartEdit(currentPost)}
							className="bg-transparent text-zinc-400 hover:bg-transparent hover:text-zinc-100 hover:underline"
						>
							<Edit3 className="mr-1 h-3 w-3" />
							Edit
						</Button>
					</div>
				)}
			</div>

			{/* Platform Integrations */}
			<div className="mt-1 flex min-h-0 flex-1 flex-col overflow-hidden">
				<IntegrationTabs
					currentPost={currentPost}
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
					isAddingIntegrations={isAddingIntegrations}
					isRemovingIntegrations={isRemovingIntegrations}
					removingIntegrationIds={removingIntegrationIds}
				/>
			</div>
		</>
	);
}
