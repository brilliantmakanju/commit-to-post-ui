"use client";
import { UUID } from "node:crypto";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import isEqual from "fast-deep-equal";
import { CheckCircle, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaDiscord, FaLinkedinIn, FaSlack, FaTwitter } from "react-icons/fa";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import useRepoSuperDetails from "@/hooks/core/repo/get-repo-super-detail-hook";
import { deleteRepo } from "@/server-actions/core/repo/repo-status";
import { updateRepoSettings } from "@/server-actions/user-actions/repo/edit-repo";

import { RepoAISettingsCard } from "./ai-settings";
import { RepoChannelSettingsCard } from "./channel-settings";
import { RepoCommitFiltersCard } from "./commit-filters";
import { RepoDangerZoneCard } from "./danger-zone";
import { RepoGeneralSettingsCard } from "./general-settings";

interface SettingsPanelProps {
	repo_id: UUID;
}

const getSocialLabel = (platform: string) => {
	switch (platform) {
		case "linkedin": {
			return "LinkedIn";
		}
		case "twitter": {
			return "Twitter";
		}
		case "slack": {
			return "Slack";
		}
		case "discord": {
			return "Discord";
		}
		default: {
			return platform;
		}
	}
};

const getSocialIcon = (
	platform: string,
	connected: boolean,
	expired?: boolean,
) => {
	const iconClass = `h-4 w-4 ${
		expired ? "text-red-400" : connected ? "text-green-600" : "text-gray-400"
	}`;

	switch (platform) {
		case "linkedin": {
			return <FaLinkedinIn className={iconClass} />;
		}
		case "twitter": {
			return <FaTwitter className={iconClass} />;
		}
		case "slack": {
			return <FaSlack className={iconClass} />;
		}
		case "discord": {
			return <FaDiscord className={iconClass} />;
		}
		default: {
			return;
		}
	}
};

export function SettingsPanel({ repo_id }: SettingsPanelProps) {
	const {
		isError,
		isLoadingRepoDetails,
		repoDetails: repository,
	} = useRepoSuperDetails(repo_id);
	const router = useRouter();
	const queryClient = useQueryClient();
	const [localSettings, setLocalSettings] = useState<any | undefined>();
	const [originalSettings, setOriginalSettings] = useState<any | undefined>();

	// Set initial settings once data is loaded
	useEffect(() => {
		if (repository?.settings && !localSettings && !originalSettings) {
			setLocalSettings(repository.settings);
			setOriginalSettings(repository.settings);
		}
	}, [repository, localSettings, originalSettings]);

	// const isDirty =
	// 	localSettings &&
	// 	originalSettings &&
	// 	!isEqual(localSettings, originalSettings);

	// Custom isDirty calculation that excludes connected_integration_ids
	const isDirty = (() => {
		if (!localSettings || !originalSettings) return false;

		// Create copies without connected_integration_ids for comparison
		const { connected_integration_ids: localIds, ...localWithoutIds } =
			localSettings;
		const { connected_integration_ids: originalIds, ...originalWithoutIds } =
			originalSettings;

		// Only consider it dirty if non-integration settings have changed
		return !isEqual(localWithoutIds, originalWithoutIds);
	})();

	const mutation = useMutation({
		mutationFn: (newSettings: any) => updateRepoSettings(repo_id, newSettings),
		onSuccess: result => {
			if (result?.success) {
				toast.success("Settings saved!");
				setOriginalSettings(localSettings);
			} else {
				toast.error("Save failed: " + result?.error);
			}
		},
		onError: () => {
			toast.error("Error saving settings");
		},
	});

	const handleSaveSettings = () => {
		mutation.mutate(localSettings);
	};

	const handleRevertSettings = () => {
		setLocalSettings(originalSettings);
	};

	const onDelete = async () => {
		const result = await deleteRepo({
			repoId: repo_id,
		});

		if (result.success) {
			queryClient.invalidateQueries({
				queryKey: ["connected_repos"],
			});
			queryClient.invalidateQueries({
				queryKey: ["dashboard_metrics"],
			});
			router.push("/repositories");
			toast.success(result.message);
		} else {
			toast.error(result.message);
		}
	};

	// const analyticsLimitUI = useLimitUI({
	// 	currentCount: 0,
	// 	warningThreshold: 80,
	// 	limitType: "analytics",
	// 	limitId: FEATURE_LIMITS.ADVANCED_ANALYTICS,
	// });

	if (
		isLoadingRepoDetails ||
		!repository ||
		!localSettings ||
		!originalSettings
	) {
		return (
			<div className="space-y-6">
				<RepoGeneralSettingsCard loading />

				<RepoAISettingsCard
					loading
					settings={{
						ai_tone: "",
						template: "",
						ai_enabled: false,
						tracked_branch: "",
					}}
					onChange={() => {}}
				/>

				<RepoCommitFiltersCard
					loading
					settings={{
						prefix_filter: "",
						ignored_keywords: "",
					}}
					onChange={() => {}}
				/>

				<RepoChannelSettingsCard
					loading
					repo_id={repo_id}
					socialConnections={{
						connected_integrations: {
							slack: [],
							twitter: [],
							discord: [],
							linkedin: [],
						},
						summary: "",
						total_count: 0,
					}}
					localSettings={{
						default_hashtags: "",
						hashtag_automation: false,
						connected_integration_ids: [],
					}}
					onChange={() => {}}
					getSocialIcon={() => ""}
					getSocialLabel={() => ""}
				/>

				<RepoDangerZoneCard repo_id={repo_id} onDelete={() => {}} loading />
			</div>
		);
	}

	if (isError || !repository) {
		return (
			<div className="text-sm text-red-400">
				Failed to load repository details. Please refresh or try again later.
			</div>
		);
	}

	const handleSettingChange = (key: string, value: any) => {
		const newSettings = { ...localSettings, [key]: value };
		setLocalSettings(newSettings);
	};

	return (
		<div className="space-y-6 pb-4">
			<div className="flex justify-end gap-2 pt-6">
				{/* Revert Button */}
				{/* <FeatureLimitWrapper
					limitId={FEATURE_LIMITS.ADVANCED_ANALYTICS}
					currentCount={0}
					fallback={
						<LimitTooltip
							position="left"
							currentUsage={0}
							limitType="analytics"
							maxLimit={analyticsLimitUI.limit}
						>
							<div className="cursor-not-allowed opacity-50">
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant="ghost"
											size="icon"
											disabled={!isDirty || mutation.isPending}
											onClick={handleRevertSettings}
											className="hover:bg-muted"
										>
											<RotateCcw className="h-5 w-5" />
										</Button>
									</TooltipTrigger>
									<TooltipContent side="top" className="text-xs">
										Revert
									</TooltipContent>
								</Tooltip>
							</div>
						</LimitTooltip>
					}
				>
				</FeatureLimitWrapper> */}
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							disabled={!isDirty || mutation.isPending}
							onClick={handleRevertSettings}
							className="hover:bg-muted"
						>
							<RotateCcw className="h-5 w-5" />
						</Button>
					</TooltipTrigger>
					<TooltipContent side="top" className="text-xs">
						Revert
					</TooltipContent>
				</Tooltip>

				{/* Save Button */}
				{/* <FeatureLimitWrapper
					limitId={FEATURE_LIMITS.ADVANCED_ANALYTICS}
					currentCount={0}
					fallback={
						<LimitTooltip
							position="left"
							currentUsage={0}
							limitType="analytics"
							maxLimit={1}
						>
							<div className="cursor-not-allowed opacity-50"> */}
				{/* Save Button */}
				{/* <Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant="default"
											size="icon"
											disabled={!isDirty || mutation.isPending}
											onClick={handleSaveSettings}
											className="hover:bg-primary/90"
										>
											{mutation.isPending ? (
												<svg
													className="h-5 w-5 animate-spin"
													viewBox="0 0 24 24"
													fill="none"
												>
													<circle
														className="opacity-25"
														cx="12"
														cy="12"
														r="10"
														stroke="currentColor"
														strokeWidth="4"
													></circle>
													<path
														className="opacity-75"
														fill="currentColor"
														d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
													></path>
												</svg>
											) : (
												<CheckCircle className="h-5 w-5" />
											)}
										</Button>
									</TooltipTrigger>
									<TooltipContent side="top" className="text-xs">
										{mutation.isPending ? "Saving..." : "Save Settings"}
									</TooltipContent>
								</Tooltip>
							</div>
						</LimitTooltip>
					}
				>
				</FeatureLimitWrapper> */}
				{/* Save Button */}
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="default"
							size="icon"
							disabled={!isDirty || mutation.isPending}
							onClick={handleSaveSettings}
							className="hover:bg-primary/90"
						>
							{mutation.isPending ? (
								<svg
									className="h-5 w-5 animate-spin"
									viewBox="0 0 24 24"
									fill="none"
								>
									<circle
										className="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="4"
									></circle>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
									></path>
								</svg>
							) : (
								<CheckCircle className="h-5 w-5" />
							)}
						</Button>
					</TooltipTrigger>
					<TooltipContent side="top" className="text-xs">
						{mutation.isPending ? "Saving..." : "Save Settings"}
					</TooltipContent>
				</Tooltip>
			</div>

			{/* General Settings */}
			<RepoGeneralSettingsCard
				name={repository.name}
				status={repository.status}
				loading={isLoadingRepoDetails}
				description={repository.description}
				connected_by={repository.connected_by}
			/>

			{/* AI Settings */}
			<RepoAISettingsCard
				settings={localSettings}
				onChange={handleSettingChange}
				loading={isLoadingRepoDetails}
			/>

			{/* Commit Filters */}
			<RepoCommitFiltersCard
				settings={localSettings}
				loading={isLoadingRepoDetails}
				onChange={handleSettingChange}
			/>

			{/* Posting Settings */}
			{/* <RepoPostingSettingsCard
				settings={localSettings}
				loading={isLoadingRepoDetails}
				onChange={handleSettingChange}
			/> */}

			{/* Channel Settings - Updated to use new data structure */}
			<RepoChannelSettingsCard
				repo_id={repo_id}
				getSocialIcon={getSocialIcon}
				localSettings={localSettings}
				loading={isLoadingRepoDetails}
				onChange={handleSettingChange}
				getSocialLabel={getSocialLabel}
				socialConnections={repository.social_connections}
			/>

			{/* Danger Zone */}
			<RepoDangerZoneCard
				repo_id={repo_id}
				onDelete={() => onDelete()}
				loading={isLoadingRepoDetails}
				disabled={isLoadingRepoDetails}
			/>
		</div>
	);
}
