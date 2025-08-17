"use client";

import Image from "next/image";
import React, { useMemo, useState } from "react";
import {
	FaChevronDown,
	FaChevronUp,
	FaDiscord,
	FaLinkedinIn,
	FaSlack,
	FaSpinner,
	FaTimes,
} from "react-icons/fa";
import { toast } from "sonner";

import FeatureLimitWrapper from "@/components/feature-flag/feature-limit-wrapper";
import LimitTooltip from "@/components/feature-flag/limit-tooltip";
import { OAuthModalV2 } from "@/components/repositories/settings/v2/oauth-modal";
import { Button } from "@/components/ui/button";
import { useLimitUI } from "@/hooks/use-limit-ui";
import { FEATURE_LIMITS } from "@/lib/constants/feature-limits";
import { initializeFeatureFlags } from "@/lib/utils/feature-flags-init";
import { initializeFeatureLimits } from "@/lib/utils/feature-limits-init";
import { disconnectIntegration } from "@/server-actions/core/repo/social-connect";
import useOrganizationStore, {
	OrganizationSocial,
} from "@/zustand/useorganization-store";

interface ConnectedAccount {
	id: string;
	name: string;
	handle: string;
	platform: string;
	profile_image_url: string;
}

interface SocialAccount {
	id: string;
	name: string;
	icon: string;
	description: string;
	connectedAccounts: ConnectedAccount[];
}
type Platform = "linkedin" | "slack" | "discord" | "x";

const XIcon: React.FC<{ className?: string }> = ({ className }) => (
	<svg viewBox="0 0 24 24" className={className} fill="currentColor">
		<path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932L18.901 1.153ZM17.61 20.644h2.039L6.486 3.24H4.298L17.61 20.644Z" />
	</svg>
);

// --- keep your scaffold as-is (empty connectedAccounts) ---
const socialAccounts: SocialAccount[] = [
	{
		id: "x",
		icon: "x-twitter",
		name: "X (Twitter)",
		description: "Social media and microblogging",
		connectedAccounts: [],
	},
	{
		id: "linkedin",
		icon: "linkedin",
		name: "LinkedIn",
		description: "Professional networking platform",
		connectedAccounts: [],
	},
	{
		id: "slack",
		icon: "slack",
		name: "Slack",
		description: "Team communication workspace",
		connectedAccounts: [],
	},
	{
		id: "discord",
		icon: "discord",
		name: "Discord",
		description: "Community and voice chat platform",
		connectedAccounts: [],
	},
];

// normalize org platform strings to our scaffold ids
const normalizePlatform = (p?: string) => {
	const v = (p || "").toLowerCase();
	if (v === "x" || v === "twitter" || v === "x-twitter") return "x";
	if (v === "linkedin") return "linkedin";
	if (v === "discord") return "discord";
	if (v === "slack") return "slack";
	return;
};

const getInitials = (name: string): string =>
	name
		.split(" ")
		.map(word => word[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);

const ConnectedAccountBadge: React.FC<{
	account: ConnectedAccount;
	onRemove: (accountId: string) => Promise<void> | void;
}> = ({ account, onRemove }) => {
	const [imgError, setImgError] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const shouldShowFallback =
		imgError ||
		!account.profile_image_url ||
		["null", "undefined"].includes(account.profile_image_url);

	const handleRemove = async () => {
		try {
			setIsLoading(true);
			await onRemove(account.id);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-gray-50 py-[1px] pl-1 pr-2 transition-colors hover:border-gray-400">
			{shouldShowFallback ? (
				<div className="flex h-[30px] w-[30px] items-center justify-center rounded-full border border-gray-300 bg-white">
					<span className="text-sm font-medium text-gray-700">
						{getInitials(account.name)}
					</span>
				</div>
			) : (
				<Image
					width={30}
					height={30}
					alt={account.name}
					src={account.profile_image_url}
					onError={() => setImgError(true)}
					className="rounded-full border border-gray-300 bg-white"
				/>
			)}

			<span className="text-sm">
				{account.handle && !["null", "undefined"].includes(account.handle)
					? account.handle
					: account.name}
			</span>

			<button
				disabled={isLoading}
				onClick={handleRemove}
				aria-label={`Remove ${account.name}`}
				className="p-1 text-gray-400 transition-colors hover:text-gray-600 disabled:opacity-50"
			>
				{isLoading ? (
					<FaSpinner className="h-4 w-4 animate-spin" />
				) : (
					<FaTimes className="h-4 w-4" />
				)}
			</button>
		</div>
	);
};

const SocialAccountItem: React.FC<{
	account: SocialAccount;
	onConnect: (platformId: string) => void;
	onRemoveAccount: (accountId: string) => void;
}> = ({ account, onRemoveAccount, onConnect }) => {
	const { organization } = useOrganizationStore();
	const [isCollapsed, setIsCollapsed] = React.useState(true);

	const socialCount = (organization?.socials ?? []).length;

	const getIcon = (iconName: string) => {
		switch (iconName) {
			case "x-twitter": {
				return <XIcon className="h-6 w-6 text-gray-600" />;
			}
			case "linkedin": {
				return <FaLinkedinIn className="h-6 w-6 text-gray-600" />;
			}
			case "slack": {
				return <FaSlack className="h-6 w-6 text-gray-600" />;
			}
			case "discord": {
				return <FaDiscord className="h-6 w-6 text-gray-600" />;
			}
			default: {
				return <FaLinkedinIn className="h-6 w-6 text-gray-600" />;
			}
		}
	};

	const socialLimitUI = useLimitUI({
		warningThreshold: 80,
		currentCount: socialCount,
		limitType: "social_integrations",
		limitId: FEATURE_LIMITS.SOCIAL_ACCOUNTS,
	});

	return (
		<div className="overflow-hidden rounded-2xl border border-gray-200">
			<div className="border-b border-gray-200 bg-gray-50 px-6 py-5">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<div className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-300 bg-white">
							{getIcon(account.icon)}
						</div>
						<div>
							<h3 className="text-md font-semibold text-gray-900">
								{account.name}
							</h3>
							<p className="text-sm text-gray-600">{account.description}</p>
						</div>
					</div>
					<FeatureLimitWrapper
						limitId={FEATURE_LIMITS.SOCIAL_ACCOUNTS}
						currentCount={socialCount}
						fallback={
							<LimitTooltip
								limitType="social_integrations"
								maxLimit={socialLimitUI.limit}
								currentUsage={socialCount}
								position="bottom"
							>
								<div className="inline-block cursor-pointer">
									<Button
										disabled
										variant="outline"
										className="pointer-events-none border-gray-300 bg-white px-6 text-gray-700 hover:border-gray-900 hover:text-gray-900"
									>
										Connect
									</Button>
								</div>
							</LimitTooltip>
						}
					>
						<LimitTooltip
							limitType="social_integrations"
							maxLimit={socialLimitUI.limit}
							currentUsage={socialCount}
							position="bottom"
						>
							<Button
								variant="outline"
								onClick={() => onConnect(account.id)}
								className="border-gray-300 bg-white px-6 text-gray-700 hover:border-gray-900 hover:text-gray-900"
							>
								Connect
							</Button>
						</LimitTooltip>
					</FeatureLimitWrapper>
				</div>
			</div>

			{account.connectedAccounts.length > 0 ? (
				<div className="px-6 py-3">
					<div className="flex items-center justify-between">
						<Button
							variant="ghost"
							onClick={() => setIsCollapsed(p => !p)}
							className="flex items-center space-x-3 text-base text-gray-600 hover:text-arch-black"
						>
							{isCollapsed ? (
								<FaChevronUp size={14} />
							) : (
								<FaChevronDown size={14} />
							)}
							Connected Accounts
						</Button>
						<span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-500">
							{account.connectedAccounts.length} account
							{account.connectedAccounts.length > 1 && "s"}
						</span>
					</div>

					{!isCollapsed && (
						<div className="mt-2 flex flex-wrap gap-2">
							{account.connectedAccounts.map(accumulator => (
								<ConnectedAccountBadge
									key={accumulator.id}
									account={accumulator}
									onRemove={id => onRemoveAccount(id)}
								/>
							))}
						</div>
					)}
				</div>
			) : (
				<div className="px-6 py-5 text-center">
					<p className="text-sm text-gray-500">No accounts connected yet</p>
				</div>
			)}
		</div>
	);
};

const SocialConnectionInterface: React.FC = () => {
	const { organization, removeSocial } = useOrganizationStore();
	const [platformModal, setPlatformModal] = useState<Platform | undefined>();

	// Build UI accounts from organization.socials
	// Build the list by grouping org socials into the scaffold
	const accounts = useMemo<SocialAccount[]>(() => {
		// group socials by normalized platform
		const grouped: Record<string, ConnectedAccount[]> = {};

		(organization?.socials ?? []).forEach((s: OrganizationSocial) => {
			const pid = normalizePlatform(s.platform);
			if (!pid) return; // skip unknown platforms
			if (!grouped[pid]) grouped[pid] = [];
			grouped[pid].push({
				platform: pid,
				id: String(s.id),
				name: String(s.name),
				handle: String(s.handle),
				profile_image_url: String(s.profile_image_url),
			});
		});

		// If you want one scaffold card per platform but include all connected accounts:
		return socialAccounts.map(card => ({
			...card,
			connectedAccounts: grouped[card.id] ?? [], // now includes all accounts, not just first
		}));
	}, [organization?.socials]);

	const handleConnect = (platformId: string) => {
		if (!organization) return;
		setPlatformModal(platformId as Platform);
	};

	const handleRemoveAccount = async (accountId: string) => {
		try {
			// Call the API disconnect
			const result = await disconnectIntegration(accountId);

			if (!result.success) {
				toast.error("Disconnection failed", {
					description: result.message,
				});
				return;
			}

			// If success, remove from local store
			removeSocial(organization.id, accountId);

			// Re-init limits & flags
			initializeFeatureFlags();
			initializeFeatureLimits();

			toast.success("Integration disconnected", {
				description:
					result.message ||
					`Disconnected ${result.details?.platform ?? "integration"}`,
			});
		} catch (error: any) {
			toast.error("Unexpected error", {
				description: error?.message || "Could not disconnect integration.",
			});
		}
	};
	return (
		<div className="space-y-4">
			{platformModal && (
				<OAuthModalV2
					isOpen={!!platformModal}
					org_id={organization.id}
					platform={platformModal as Platform}
					onClose={() => setPlatformModal(undefined)}
				/>
			)}
			{accounts.map(account => (
				<SocialAccountItem
					key={account.id}
					account={account}
					onConnect={handleConnect}
					onRemoveAccount={handleRemoveAccount}
				/>
			))}
		</div>
	);
};

export default SocialConnectionInterface;
