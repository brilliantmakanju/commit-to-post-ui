"use client";
import { UUID } from "node:crypto";

import { useMutation } from "@tanstack/react-query";
import isEqual from "fast-deep-equal";
import {
	AlertCircle,
	CheckCircle,
	CheckCircle2,
	RotateCcw,
	XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { FaDiscord, FaLinkedinIn, FaSlack, FaTwitter } from "react-icons/fa";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip"; // Assuming you’re using shadcn or similar
// eslint-disable-next-line import/no-unresolved
import useRepoSuperDetails from "@/hooks/core/repo/get-repo-super-detail-hook";
import { updateRepoSettings } from "@/server-actions/user-actions/repo/edit-repo";

import { RepoAISettingsCard } from "./ai-settings";
import { RepoChannelSettingsCard } from "./channel-settings";
import { RepoCommitFiltersCard } from "./commit-filters";
import { RepoDangerZoneCard } from "./danger-zone";
import { RepoGeneralSettingsCard } from "./general-settings";
import { RepoPostingSettingsCard } from "./posting-settings";
// import { RepoWebhookHealthCard } from "./webhook-health";

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

const getSocialIcon = (platform: string, connected: unknown | boolean) => {
	const iconClass = `h-4 w-4 ${connected ? "text-green-600" : "text-gray-400"}`;
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

const getWebhookStatusIcon = (status: string) => {
	switch (status) {
		case "success": {
			return <CheckCircle2 className="h-4 w-4 text-green-600" />;
		}
		case "failed": {
			return <XCircle className="h-4 w-4 text-red-600" />;
		}
		case "inactive": {
			return <AlertCircle className="h-4 w-4 text-gray-500" />;
		}
		default: {
			return <AlertCircle className="h-4 w-4 text-gray-500" />;
		}
	}
};

type Platform = "linkedin" | "slack" | "discord" | "twitter";

interface SocialConnection {
	connected: boolean | false;
	connected_by: string | null;
	connected_at: string | null;
	token_expiry?: string | null; // For LinkedIn OAuth expiry tracking
	details: {
		webhook_url?: string;
	} | null;
}

export function SettingsPanel({ repo_id }: SettingsPanelProps) {
	const {
		isError,
		isLoadingRepoDetails,
		repoDetails: repository,
	} = useRepoSuperDetails(repo_id);
	const [localSettings, setLocalSettings] = useState<any | undefined>();
	const [originalSettings, setOriginalSettings] = useState<any | undefined>();

	// Set initial settings once data is loaded
	useEffect(() => {
		if (repository?.settings && !localSettings && !originalSettings) {
			setLocalSettings(repository.settings);
			setOriginalSettings(repository.settings);
		}
	}, [repository, localSettings, originalSettings]);

	const isDirty =
		localSettings &&
		originalSettings &&
		!isEqual(localSettings, originalSettings);

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
						ai_enabled: false,
						ai_tone: "",
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

				{/* <RepoPostingSettingsCard
					loading
					settings={{
						posting_strategy: "",
						manual_approval: false,
						preferred_post_time: "",
					}}
					onChange={() => {}}
				/> */}

				<RepoChannelSettingsCard
					loading
					repo_id={repo_id}
					socialConnections={{} as Record<Platform, SocialConnection>}
					localSettings={{
						default_hashtags: "",
						hashtag_automation: false,
					}}
					onChange={() => {}}
					getSocialIcon={() => ""}
					getSocialLabel={() => ""}
				/>

				{/* <RepoWebhookHealthCard
					loading
					webhookStatus="inactive"
					getWebhookStatusIcon={() => ""}
				/> */}
				{/* <RepoDangerZoneCard onDisconnect={() => {}} loading /> */}
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
			<RepoPostingSettingsCard
				settings={localSettings}
				loading={isLoadingRepoDetails}
				onChange={handleSettingChange}
			/>

			{/* Channel Settings */}
			<RepoChannelSettingsCard
				repo_id={repo_id}
				getSocialIcon={getSocialIcon}
				localSettings={localSettings}
				loading={isLoadingRepoDetails}
				onChange={handleSettingChange}
				getSocialLabel={getSocialLabel}
				socialConnections={repository.social_connections}
			/>

			{/* Webhook Health */}
			{/* <RepoWebhookHealthCard
				loading={isLoadingRepoDetails}
				getWebhookStatusIcon={getWebhookStatusIcon}
				webhookStatus={repository.stats.webhook_status}
			/> */}

			{/* Danger Zone */}
			{/* <RepoDangerZoneCard
				onDisconnect={() => {}}
				loading={isLoadingRepoDetails}
				disabled={isLoadingRepoDetails}
			/> */}
		</div>
	);
}
