/* eslint-disable import/no-unresolved */
"use client";

import { format } from "date-fns";
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
			<div className="flex h-full flex-col">
				{/* Scrollable Content */}
				<div className="flex-1 overflow-y-auto">
					{/* Quick Date Presets - 3 columns */}
					<div className="border-b border-white/5 px-5 py-2">
						<div className="grid grid-cols-3 gap-2">
							{datePresets.map(({ label, date }) => (
								<Button
									key={label}
									variant="ghost"
									size="sm"
									disabled={disabled}
									onClick={() => setScheduleDate(date)}
									className={cn(
										"rounded-lg px-2 py-2.5 text-xs font-medium transition-all",
										scheduleDate?.toDateString() === date.toDateString()
											? "bg-white text-black"
											: "text-white/70 hover:bg-white/10 hover:text-white",
									)}
								>
									{label}
								</Button>
							))}
						</div>
					</div>

					{/* Date & Time Selection - Side by side */}
					<div className="border-b border-white/5 px-5 py-2">
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<label className="text-xs font-medium uppercase tracking-wide text-white/60">
									Date
								</label>
								<DatePicker
									value={scheduleDate}
									onChange={setScheduleDate}
									disabled={disabled}
									variant="popover"
									placeholder="Select date"
									className="h-11 w-full rounded-lg border-white/10 bg-white/5"
								/>
							</div>

							<div className="space-y-2">
								<label className="text-xs font-medium uppercase tracking-wide text-white/60">
									Time
								</label>
								<TimePicker
									inline={false}
									disabled={disabled}
									value={scheduleTime}
									placeholder="Select time"
									onChange={setScheduleTime}
									className="h-11 w-full rounded-lg border-white/10 bg-white/5"
								/>
							</div>
						</div>
					</div>

					{/* Schedule Preview - Compact and Simple */}
					{scheduleDate && scheduleTime && selectedSocials.size > 0 && (
						<div className="border-b border-white/5 px-5 py-3">
							<div className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2">
								<div className="h-1.5 w-1.5 rounded-full bg-green-400"></div>
								<div className="flex-1 text-sm text-white/90">
									{format(scheduleDate, "MMM d")} at {scheduleTime}
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

						<div className="scrollbar-hide h-[390px] overflow-x-hidden rounded-xl bg-white/5 p-3 lg:h-[302px]">
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
							"relative h-10 w-full rounded-xl font-medium transition-all duration-200",
							// Update condition for styling
							isValidSchedule &&
								(selectedSocials.size > 0 ||
									(currentPost.pending_integrations_data?.length ?? 0) > 0)
								? "mb-2 bg-white text-black hover:bg-white/90"
								: "cursor-not-allowed bg-white/10 text-white/50",
						)}
					>
						{isScheduling ? (
							<div className="flex items-center gap-2">
								<div className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
								<span>Scheduling...</span>
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
										d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
								<span>Schedule Post</span>
								{selectedSocials.size > 0 && (
									<div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/80 text-xs text-white">
										{selectedSocials.size}
									</div>
								)}
							</div>
						)}
					</Button>

					{/* Error Message */}
					{!isValidSchedule && (
						<div className="mt-2 text-center">
							<p className="text-xs text-red-400/80">
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
