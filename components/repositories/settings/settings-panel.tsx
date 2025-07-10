"use client";

import { UUID } from "node:crypto";

import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { FaDiscord, FaLinkedinIn, FaSlack, FaTwitter } from "react-icons/fa";

// eslint-disable-next-line import/no-unresolved
import useRepoSuperDetails from "@/hooks/core/repo/get-repo-super-detail-hook";

import { RepoAISettingsCard } from "./ai-settings";
import { RepoChannelSettingsCard } from "./channel-settings";
import { RepoCommitFiltersCard } from "./commit-filters";
import { RepoDangerZoneCard } from "./danger-zone";
import { RepoGeneralSettingsCard } from "./general-settings";
import { RepoPostingSettingsCard } from "./posting-settings";
import { RepoWebhookHealthCard } from "./webhook-health";

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

const formatLastSync = (timestamp: string) => {
	const date = new Date(timestamp);
	const now = new Date();
	const diffInHours = Math.floor(
		(now.getTime() - date.getTime()) / (1000 * 60 * 60),
	);

	if (diffInHours < 1) return "Just now";
	if (diffInHours < 24) return `${diffInHours}h ago`;
	const diffInDays = Math.floor(diffInHours / 24);
	if (diffInDays === 1) return "Yesterday";
	return `${diffInDays}d ago`;
};

const handleSettingChange = (key: string, value: any) => {
	// const newSettings = { ...localSettings, [key]: value };
	// setLocalSettings(newSettings);
};

export function SettingsPanel({ repo_id }: SettingsPanelProps) {
	const {
		repoDetails: repository,
		isLoadingRepoDetails,
		isError,
	} = useRepoSuperDetails(repo_id);

	if (isLoadingRepoDetails) {
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

				<RepoPostingSettingsCard
					loading
					settings={{
						posting_strategy: "",
						manual_approval: false,
						preferred_post_time: "",
					}}
					onChange={() => {}}
				/>

				<RepoChannelSettingsCard
					loading
					socialConnections={{}}
					localSettings={{
						default_hashtags: "",
						hashtag_automation: false,
					}}
					onChange={() => {}}
					getSocialIcon={() => ""}
					getSocialLabel={() => ""}
				/>

				<RepoWebhookHealthCard
					loading
					webhookStatus="inactive"
					getWebhookStatusIcon={() => ""}
				/>
				<RepoDangerZoneCard onDisconnect={() => {}} loading />
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

	return (
		<div className="space-y-6">
			{/* General Settings */}
			<RepoGeneralSettingsCard
				name={repository.name}
				status={repository.status}
				loading={isLoadingRepoDetails}
				connected_by={repository.connected_by}
				description={repository.description || ""}
			/>

			{/* AI Settings */}
			<RepoAISettingsCard
				settings={repository.settings}
				onChange={handleSettingChange}
				loading={isLoadingRepoDetails}
			/>

			{/* Commit Filters */}
			<RepoCommitFiltersCard
				loading={isLoadingRepoDetails}
				settings={repository.settings}
				onChange={handleSettingChange}
			/>

			{/* Posting Settings */}
			<RepoPostingSettingsCard
				loading={isLoadingRepoDetails}
				settings={repository.settings}
				onChange={handleSettingChange}
			/>

			{/* Channel Settings */}
			<RepoChannelSettingsCard
				getSocialIcon={getSocialIcon}
				loading={isLoadingRepoDetails}
				onChange={handleSettingChange}
				getSocialLabel={getSocialLabel}
				localSettings={repository.settings}
				socialConnections={repository.social_connections}
			/>

			{/* Webhook Health */}
			<RepoWebhookHealthCard
				loading={isLoadingRepoDetails}
				getWebhookStatusIcon={getWebhookStatusIcon}
				webhookStatus={repository.stats.webhook_status}
			/>

			{/* Danger Zone */}
			<RepoDangerZoneCard
				onDisconnect={() => {}}
				loading={isLoadingRepoDetails}
				disabled={isLoadingRepoDetails}
			/>
		</div>
	);
}
