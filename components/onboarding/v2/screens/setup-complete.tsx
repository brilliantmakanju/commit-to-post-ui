/* eslint-disable import/no-unresolved */
"use client";
import React, { useMemo } from "react";

import { CardStack } from "@/components/landing/micro/v2/v3/social-card";
import { ConnectedAccount, SocialAccount } from "@/types";
import useOrganizationStore, {
	OrganizationSocial,
} from "@/zustand/useorganization-store";

// normalize org platform strings to our scaffold ids
const normalizePlatform = (p?: string) => {
	const v = (p || "").toLowerCase();
	if (v === "x" || v === "twitter" || v === "x-twitter") return "x";
	if (v === "linkedin") return "linkedin";
	if (v === "discord") return "discord";
	if (v === "slack") return "slack";
	return;
};

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

const SetupCompleteScreen = () => {
	const { organization } = useOrganizationStore();

	// Build the list by grouping org socials into the scaffold
	const accounts = useMemo<SocialAccount[]>(() => {
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

		return socialAccounts.map(card => ({
			...card,
			connectedAccounts: grouped[card.id] ?? [],
		}));
	}, [organization?.socials]);

	// Only keep valid platforms that actually have connected accounts
	// const connectedPlatforms = useMemo<Platform[]>(() => {
	// 	const validPlatforms = new Set<Platform>([
	// 		"linkedin",
	// 		"twitter",
	// 		"slack",
	// 		"discord",
	// 	]);

	// 	return accounts
	// 		.filter(accumulator => accumulator.connectedAccounts.length > 0)
	// 		.map(accumulator => accumulator.id)
	// 		.filter((id): id is Platform => validPlatforms.has(id as Platform));
	// }, [accounts]);

	return (
		<div className="flex min-h-[250px] w-full items-center justify-center bg-white px-4">
			<div className="max-w-sm space-y-3 text-center">
				{/* Confirmation Text */}
				<p className="text-base font-light text-arch-black">
					Ready to share commits from your terminal 😶‍🌫️
				</p>

				{/* Context for Sample Posts */}
				<p className="text-sm text-arch-dark">
					Posts from your connected socials:
				</p>

				{/* Sample Posts via CardStack */}
				<div className="w-full">
					<CardStack platforms={["linkedin", "twitter", "slack", "discord"]} />
				</div>

				{/* Action Button */}
				{/* <button
					className="border-2 border-arch-black bg-arch-black px-5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white hover:text-arch-black"
					onClick={() => (globalThis.location.href = "/dashboard")}
				>
					<FaRocket className="mr-1 inline h-4 w-4" /> Start Sharing
				</button> */}
			</div>
		</div>
	);
};

export default SetupCompleteScreen;
