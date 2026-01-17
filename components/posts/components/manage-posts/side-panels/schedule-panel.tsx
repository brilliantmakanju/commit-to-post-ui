/* eslint-disable import/no-unresolved */
"use client";

import { format } from "date-fns";
import { Calendar, Clock } from "lucide-react";
import React from "react";

import { ConnectedIntegration } from "@/components/repositories/settings/channel-settings";
import { Button } from "@/components/ui/button";
import { TimePicker } from "@/components/ui/time-picker";
import { cn } from "@/lib/utils";
import { PostItem } from "@/types";

import IntegrationTabs from "../../integration-tabs";
import { DatePicker } from "./misc/date-time";
import { SlideInPanel } from "./slide-in-panel";

// Enhanced Schedule Panel with Social Integration
interface SchedulePanelProps {
	isOpen: boolean;
	onClose: () => void;
	disabled?: boolean;
	isScheduling?: boolean;
	isValidSchedule?: boolean;
	scheduleDate?: Date;
	scheduleTime?: string;
	datePresets: Array<{ label: string; date: Date }>;
	setScheduleDate: (date: Date | undefined) => void;
	setScheduleTime: (time: string) => void;
	handleSchedulePost: () => void;

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
}

export const SchedulePanel: React.FC<SchedulePanelProps> = ({
	isOpen,
	onClose,
	disabled = false,
	isScheduling = false,
	isValidSchedule = true,
	scheduleDate,
	scheduleTime,
	datePresets,
	setScheduleDate,
	setScheduleTime,
	handleSchedulePost,

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
}) => {
	return (
		<SlideInPanel
			isOpen={isOpen}
			onClose={onClose}
			title="Schedule Post"
			widthClassName="w-full sm:w-[500px] lg:w-[480px]"
		>
			<div className="flex h-full flex-col bg-zinc-950/50 backdrop-blur-sm">
				{/* Scrollable Content */}
				<div className="scrollbar-hide flex-1 overflow-y-auto">
					{/* Quick Date Presets - 3 columns */}
					<div className="border-b border-zinc-800/50 px-5 py-4">
						<label className="mb-3 block text-xs font-medium uppercase tracking-wider text-zinc-500">
							Quick Select
						</label>
						<div className="grid grid-cols-3 gap-2">
							{datePresets.map(({ label, date }) => (
								<Button
									key={label}
									variant="ghost"
									size="sm"
									disabled={disabled}
									onClick={() => setScheduleDate(date)}
									className={cn(
										"rounded-lg border px-2 py-2.5 text-xs font-medium transition-all duration-200",
										scheduleDate?.toDateString() === date.toDateString()
											? "border-zinc-200 bg-zinc-100 text-zinc-900 shadow-sm"
											: "border-zinc-800/50 bg-zinc-900/30 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800 hover:text-zinc-200",
									)}
								>
									{label}
								</Button>
							))}
						</div>
					</div>

					{/* Date & Time Selection - Side by side */}
					<div className="border-b border-zinc-800/50 px-5 py-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
									<Calendar className="h-3 w-3" />
									Date
								</label>
								<DatePicker
									value={scheduleDate}
									onChange={setScheduleDate}
									disabled={disabled}
									variant="popover"
									placeholder="Select date"
									className="h-10 w-full rounded-lg border-zinc-800/50 bg-zinc-900/30 text-sm text-zinc-200 placeholder:text-zinc-600 hover:border-zinc-700 focus:border-zinc-600 focus:ring-zinc-600/20"
								/>
							</div>

							<div className="space-y-2">
								<label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
									<Clock className="h-3 w-3" />
									Time
								</label>
								<TimePicker
									inline={false}
									disabled={disabled}
									value={scheduleTime}
									placeholder="Select time"
									onChange={setScheduleTime}
									className="h-10 w-full rounded-lg border-zinc-800/50 bg-zinc-900/30 text-sm text-zinc-200 placeholder:text-zinc-600 hover:border-zinc-700 focus:border-zinc-600 focus:ring-zinc-600/20"
								/>
							</div>
						</div>
					</div>

					{/* Schedule Preview - Compact and Simple */}
					{scheduleDate && scheduleTime && selectedSocials.size > 0 && (
						<div className="border-b border-zinc-800/50 px-5 py-4">
							<div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
								<div className="flex h-2 w-2 items-center justify-center rounded-full bg-emerald-500/20">
									<div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
								</div>
								<div className="flex-1 text-sm font-medium text-emerald-200/90">
									{format(scheduleDate, "MMM d")} at {scheduleTime}
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

						<div className="scrollbar-hide h-[390px] overflow-x-hidden rounded-xl border border-zinc-800/50 bg-zinc-900/20 p-1 lg:h-[302px]">
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
					{/* Action Button - Reduced height */}
					<Button
						onClick={handleSchedulePost}
						disabled={
							disabled ||
							!isValidSchedule ||
							isScheduling ||
							// Allow if either has selected OR has pending
							(selectedSocials.size === 0 &&
								(currentPost.pending_integrations_data?.length ?? 0) === 0)
						}
						className={cn(
							"relative h-10 w-full rounded-xl font-medium transition-all duration-300",
							// Update condition for styling
							isValidSchedule &&
								(selectedSocials.size > 0 ||
									(currentPost.pending_integrations_data?.length ?? 0) > 0)
								? "bg-zinc-100 text-zinc-900 shadow-lg shadow-zinc-900/20 hover:bg-white hover:shadow-xl"
								: "cursor-not-allowed border border-zinc-800 bg-zinc-900/50 text-zinc-500",
						)}
					>
						{isScheduling ? (
							<div className="flex items-center gap-2">
								<div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-400 border-t-zinc-900" />
								<span>Scheduling...</span>
							</div>
						) : (
							<div className="flex items-center gap-2">
								<Calendar className="h-4 w-4" />
								<span>Schedule Post</span>
								{selectedSocials.size > 0 && (
									<div className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-bold text-zinc-100">
										{selectedSocials.size}
									</div>
								)}
							</div>
						)}
					</Button>

					{/* Error Message */}
					{!isValidSchedule && (
						<div className="mt-3 text-center">
							<p className="flex items-center justify-center gap-1.5 text-xs text-red-400/90">
								<span className="h-1 w-1 rounded-full bg-red-400" />
								{scheduleDate
									? scheduleTime
										? selectedSocials.size === 0 &&
											(currentPost.pending_integrations_data?.length ?? 0) === 0
											? "Choose at least one social account"
											: "Invalid schedule time"
										: "Please select a time"
									: "Please select a date"}
							</p>
						</div>
					)}
				</div>
			</div>
		</SlideInPanel>
	);
};
