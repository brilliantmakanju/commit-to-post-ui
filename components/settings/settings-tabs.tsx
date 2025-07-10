"use client";

import { GitBranch, SettingsIcon, User } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useOrganizationOwnership from "@/hooks/settings/use-ownership";

import { LogoutModal } from "../auth/modals/logout-modal";

const GeneralSettings = dynamic(
	() => import("@/components/settings/general-settings"),
	{ ssr: false },
);
const ProfileSettings = dynamic(
	() => import("@/components/settings/profile-settings"),
	{ ssr: false },
);
const SocialConnectCallback = dynamic(
	() => import("./general-settings/connection-organization"),
	{ ssr: false },
);

const tabTitles = {
	general: "Organization Settings",
	profile: "Profile Settings",
} as const;

export function SettingsTabs() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const [mounted, setMounted] = useState(false);
	const [socialCode, setSocialCode] = useState("");
	const [socialType, setSocialType] = useState<
		"github" | "linkedin" | "twitter" | "slack" | "discord"
	>("linkedin");
	const [activeTab, setActiveTab] = useState("general");
	const [codeConnecting, setCodeConnecting] = useState(false);

	const { data: ownershipData, isLoading } = useOrganizationOwnership();
	const isOwner = ownershipData?.isOwner;

	useEffect(() => {
		const rawParams = globalThis.location.search;

		// Fix the malformed query string
		const fixedSearch = rawParams.replace("/&", "&"); // turns ?github=true/&code=... into ?github=true&code=...
		const fixedParams = new URLSearchParams(fixedSearch);

		const code = fixedParams.get("code");
		const github = fixedParams.get("github") === "true";
		const tab = fixedParams.get("tab");

		if (code) {
			if (github) {
				setSocialCode(code);
				setSocialType("github");
				setCodeConnecting(true);
			} else {
				setSocialCode(code);
				setCodeConnecting(true);
				setSocialType("linkedin");
			}
		}

		if (isOwner) {
			setActiveTab(tab && tab in tabTitles ? tab : "general");
		} else {
			setActiveTab("profile");
		}

		setMounted(true);
	}, [isOwner]);
	const handleTabChange = (value: string) => {
		setActiveTab(value);
		router.push(`/settings?tab=${value}`, { scroll: false });
	};

	if (!mounted || isLoading) return <LogoutModal showByDefault />;

	return (
		<div className="w-full rounded-lg bg-[#0A0A0A] p-4 text-white sm:p-6">
			<div className="mb-2 flex items-center">
				<SettingsIcon className="mr-2 h-5 w-5 text-[#4F46E5]" />
				<h1 className="text-2xl font-semibold text-white">Settings</h1>
			</div>
			<p className="mb-6 text-sm text-zinc-400">
				Manage your {isOwner ? "account and organization" : "account"} settings
			</p>

			<Tabs
				value={activeTab}
				className="w-full"
				onValueChange={handleTabChange}
			>
				<TabsList className="mb-6 rounded-lg border border-[#232323] bg-[#121212] p-1">
					{isOwner && (
						<TabsTrigger
							value="general"
							className="flex items-center text-zinc-400 data-[state=active]:bg-[#1E1E1E] data-[state=active]:text-white"
						>
							<GitBranch className="mr-2 h-4 w-4" />
							Organization
						</TabsTrigger>
					)}
					<TabsTrigger
						value="profile"
						className="flex items-center text-zinc-400 data-[state=active]:bg-[#1E1E1E] data-[state=active]:text-white"
					>
						<User className="mr-2 h-4 w-4" />
						Profile
					</TabsTrigger>
				</TabsList>

				{isOwner && (
					<TabsContent value="general">
						<GeneralSettings />
					</TabsContent>
				)}
				<TabsContent value="profile">
					<ProfileSettings />
				</TabsContent>
			</Tabs>

			{codeConnecting && (
				<SocialConnectCallback
					type={socialType}
					closeModal={setCodeConnecting}
					code={socialCode}
					connecting={codeConnecting}
				/>
			)}
		</div>
	);
}
