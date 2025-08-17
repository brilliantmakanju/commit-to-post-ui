"use client";
import { UUID } from "node:crypto";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { FaDiscord, FaLinkedinIn, FaSlack } from "react-icons/fa";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import useOrganizationStore from "@/zustand/useorganization-store";

// --- Types
interface Social {
	id: UUID;
	name: string;
	handle: string;
	selected: boolean;
	profile_image_url: string;
	platform: "linkedin" | "x-twitter" | "slack" | "discord";
}
interface ConnectRepoSocialOnboardingProps {
	open: boolean;
	existingSocials?: Social[];
	repo?: { id: string; name: string };
	onOpenChange: (open: boolean) => void;
	onSocialSelect?: (repoId: string, selectedSocials: Social[]) => void;
}

// --- Platform helpers
const XIcon: React.FC<{ className?: string }> = ({ className }) => (
	<svg viewBox="0 0 24 24" className={className} fill="currentColor">
		<path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932L18.901 1.153ZM17.61 20.644h2.039L6.486 3.24H4.298L17.61 20.644Z" />
	</svg>
);

// Normalize platform names to standard format
const normalizePlatform = (platform: string): Social["platform"] => {
	const normalized = platform.toLowerCase().trim();

	// Handle all Twitter/X variants
	if (
		["x", "twitter", "x-twitter", "xtwitter", "twitterx"].includes(normalized)
	) {
		return "x-twitter";
	}

	// Handle other platforms
	switch (normalized) {
		case "linkedin": {
			return "linkedin";
		}
		case "slack": {
			return "slack";
		}
		case "discord": {
			return "discord";
		}
		default: {
			// Default to the original value if it's already a valid platform
			if (
				["linkedin", "x-twitter", "slack", "discord"].includes(
					normalized as any,
				)
			) {
				return normalized as Social["platform"];
			}
			// Fallback to linkedin for unknown platforms
			return "linkedin";
		}
	}
};

// Check if two platforms are the same (accounting for Twitter/X variants)
const isSamePlatform = (platform1: string, platform2: string): boolean => {
	return normalizePlatform(platform1) === normalizePlatform(platform2);
};

const getIcon = (platform: string) => {
	const normalizedPlatform = normalizePlatform(platform);

	switch (normalizedPlatform) {
		case "linkedin": {
			return <FaLinkedinIn className="h-4 w-4" />;
		}
		case "x-twitter": {
			return <XIcon className="h-4 w-4" />;
		}
		case "slack": {
			return <FaSlack className="h-4 w-4" />;
		}
		case "discord": {
			return <FaDiscord className="h-4 w-4" />;
		}
		default: {
			return <FaLinkedinIn className="h-4 w-4" />;
		}
	}
};

const getPlatformLabel = (platform: string) => {
	const normalizedPlatform = normalizePlatform(platform);

	switch (normalizedPlatform) {
		case "linkedin": {
			return "LinkedIn";
		}
		case "x-twitter": {
			return "X (Twitter)";
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

const SocialItem: React.FC<{
	social: any;
	toggleSocial: (id: string) => void;
}> = ({ social, toggleSocial }) => {
	const [imgError, setImgError] = useState(false);

	const shouldShowFallback =
		imgError ||
		!social.profile_image_url ||
		["null", "undefined", ""].includes(social.profile_image_url);

	return (
		<div
			onClick={() => toggleSocial(social.id)}
			className={`flex cursor-pointer items-center gap-3 rounded p-3 transition-colors ${
				social.selected
					? "border border-arch-black bg-arch-black text-arch-white"
					: "border border-gray-600 bg-arch-white text-arch-black hover:border-arch-black"
			}`}
		>
			<div
				className={`flex h-8 w-8 items-center justify-center rounded border p-1 ${
					social.selected
						? "border-arch-white bg-arch-white text-arch-black"
						: "border-gray-600 bg-arch-white text-gray-600"
				}`}
			>
				{shouldShowFallback ? (
					<div className="flex h-[30px] w-[30px] items-center justify-center">
						<span className="text-sm font-medium text-gray-700">
							{getIcon(social.platform)}
						</span>
					</div>
				) : (
					<Image
						width={30}
						height={30}
						alt={social.name}
						src={social.profile_image_url}
						className="rounded-full border border-gray-300 bg-white"
						onError={() => setImgError(true)}
					/>
				)}
			</div>

			<span className="text-sm">
				{social.handle && !["null", "undefined", ""].includes(social.handle)
					? social.handle
					: social.name}
			</span>
		</div>
	);
};

// --- Component
const ConnectRepoSocialOnboarding = ({
	open,
	repo,
	onOpenChange,
	onSocialSelect,
	existingSocials = [],
}: ConnectRepoSocialOnboardingProps) => {
	const { organization } = useOrganizationStore();
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedFilters, setSelectedFilters] = useState<string[]>(["all"]);

	// Normalize organization.socials into Social[]
	const socialsFromOrg = useMemo<Social[]>(() => {
		return (organization?.socials ?? []).map((s: any) => ({
			id: s.id,
			name: String(s.name),
			handle: String(s.handle),
			profile_image_url: String(s.profile_image_url),
			platform: normalizePlatform(s.platform),
			selected: existingSocials.some(
				existing =>
					isSamePlatform(existing.platform, s.platform) &&
					existing.name === s.name,
			),
		}));
	}, [organization?.socials, existingSocials]);

	const [socials, setSocials] = useState<Social[]>(socialsFromOrg);

	// Keep socials in sync if existingSocials changes
	useEffect(() => {
		setSocials(socialsFromOrg);
	}, [socialsFromOrg]);

	// Filtering logic
	const handleFilterToggle = (filterKey: string) => {
		if (filterKey === "all") {
			setSelectedFilters(["all"]);
		} else {
			setSelectedFilters(previous => {
				const withoutAll = previous.filter(f => f !== "all");
				if (previous.includes(filterKey)) {
					const updated = withoutAll.filter(f => f !== filterKey);
					return updated.length === 0 ? ["all"] : updated;
				}
				return [...withoutAll, filterKey];
			});
		}
	};

	const platforms = [
		{ key: "all", label: "All" },
		{ key: "x-twitter", label: "X (Twitter)" },
		{ key: "linkedin", label: "LinkedIn" },
		{ key: "discord", label: "Discord" },
		{ key: "slack", label: "Slack" },
	];

	// Get unique normalized platforms from socials
	const availablePlatformKeys = new Set(
		socials.map(s => normalizePlatform(s.platform)),
	);
	const filteredPlatforms = platforms.filter(
		p => p.key === "all" || availablePlatformKeys.has(p.key as any),
	);

	// Toggle social selection
	const toggleSocial = (id: string) => {
		setSocials(previous => {
			const updated = previous.map(s =>
				s.id === id ? { ...s, selected: !s.selected } : s,
			);
			if (onSocialSelect && repo) {
				onSocialSelect(
					repo.id,
					updated.filter(s => s.selected),
				);
			}
			return updated;
		});
	};

	// Apply search + filters
	const filteredSocials = socials.filter(s => {
		const matchesSearch = s.name
			.toLowerCase()
			.includes(searchTerm.toLowerCase());
		const matchesFilter =
			selectedFilters.includes("all") ||
			selectedFilters.some(filter => isSamePlatform(filter, s.platform));
		return matchesSearch && matchesFilter;
	});

	// Group by normalized platform
	const groupedSocials = filteredSocials.reduce(
		(groups, s) => {
			const normalizedPlatform = normalizePlatform(s.platform);
			if (!groups[normalizedPlatform]) groups[normalizedPlatform] = [];
			groups[normalizedPlatform].push(s);
			return groups;
		},
		{} as Record<string, Social[]>,
	);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="flex max-h-[80vh] flex-col border border-gray-600 bg-arch-white px-0 shadow-lg sm:max-w-md">
				<div className="flex-shrink-0 border-b border-gray-600 px-6 py-4">
					<DialogHeader>
						<DialogTitle className="text-xl font-normal text-arch-black">
							{repo
								? `Connect Social Accounts for ${repo.name}`
								: "Connect Social Accounts"}
						</DialogTitle>
					</DialogHeader>
				</div>

				<div className="flex flex-1 flex-col overflow-hidden">
					<div className="flex-shrink-0 space-y-4 p-6">
						<Input
							value={searchTerm}
							className="border-gray-600"
							placeholder="Search accounts..."
							onChange={event_ => setSearchTerm(event_.target.value)}
						/>
						<div className="flex flex-wrap gap-2">
							{filteredPlatforms.map(platform => (
								<button
									key={platform.key}
									onClick={() => handleFilterToggle(platform.key)}
									className={`rounded border px-3 py-1 text-sm transition-colors ${
										selectedFilters.includes(platform.key)
											? "border-arch-black bg-arch-black text-arch-white"
											: "border-gray-600 bg-arch-white text-arch-black hover:border-arch-black"
									}`}
								>
									{platform.label}
								</button>
							))}
						</div>
					</div>

					<div className="flex-1 overflow-y-auto px-6 pb-6">
						<div className="space-y-4">
							{Object.entries(groupedSocials).map(([platform, items]) => (
								<div key={platform} className="space-y-2">
									<h3 className="text-sm font-medium uppercase tracking-wide text-gray-600">
										{getPlatformLabel(platform)}
									</h3>
									<div className="space-y-2">
										{items.map(social => (
											<SocialItem
												key={social.id}
												social={social}
												toggleSocial={toggleSocial}
											/>
										))}
									</div>
								</div>
							))}

							{Object.keys(groupedSocials).length === 0 && (
								<div className="py-8 text-center text-gray-600">
									<p className="text-sm">No social accounts found</p>
								</div>
							)}
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default ConnectRepoSocialOnboarding;
