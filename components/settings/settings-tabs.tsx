"use client";

import { GitBranch, SettingsIcon, User } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaCreditCard } from "react-icons/fa";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useOrganizationStore from "@/zustand/useorganization-store";

import BillingSettings from "./billing-settings";

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

	const { organization } = useOrganizationStore();
	const isOwner = organization.is_owner;

	const [socialCode, setSocialCode] = useState("");
	const [activeTab, setActiveTab] = useState("general");
	const [codeConnecting, setCodeConnecting] = useState(false);
	const [socialType, setSocialType] = useState<
		"github" | "linkedin" | "twitter" | "slack" | "discord"
	>("linkedin");

	useEffect(() => {
		const rawParams = globalThis.location.search;

		// Fix the malformed query string
		const fixedSearch = rawParams.replace("/&", "&"); // turns ?github=true/&code=... into ?github=true&code=...
		const fixedParams = new URLSearchParams(fixedSearch);

		const code = fixedParams.get("code");
		const tab = fixedParams.get("tab");

		if (code) {
			setSocialCode(code);
			setSocialType("github");
			setCodeConnecting(true);
		}

		if (isOwner) {
			setActiveTab(tab && tab in tabTitles ? tab : "general");
		} else {
			setActiveTab("profile");
		}
	}, [isOwner]);
	const handleTabChange = (value: string) => {
		setActiveTab(value);
		router.push(`/settings?tab=${value}`, { scroll: false });
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-4 sm:p-6 lg:p-8">
			{/* Header */}
			<div className="mb-8">
				<div className="mb-2 flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800/50 backdrop-blur-sm">
						<SettingsIcon className="h-5 w-5 text-zinc-300" />
					</div>
					<div>
						<h1 className="text-2xl font-semibold text-zinc-100">Settings</h1>
						<p className="text-sm text-zinc-400">
							Manage your {isOwner ? "account and organization" : "account"}{" "}
							settings
						</p>
					</div>
				</div>
			</div>

			{/* Tabs */}
			<Tabs
				value={activeTab}
				className="w-full"
				onValueChange={handleTabChange}
			>
				<TabsList className="mb-8 grid w-full grid-cols-3 rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-1 backdrop-blur-xl">
					{isOwner && (
						<TabsTrigger
							value="general"
							className="flex items-center gap-2 rounded-lg text-zinc-400 transition-all duration-200 data-[state=active]:bg-zinc-800/50 data-[state=active]:text-zinc-100 data-[state=active]:shadow-sm"
						>
							<GitBranch className="h-4 w-4" />
							Organization
						</TabsTrigger>
					)}
					<TabsTrigger
						value="profile"
						className="flex items-center gap-2 rounded-lg text-zinc-400 transition-all duration-200 data-[state=active]:bg-zinc-800/50 data-[state=active]:text-zinc-100 data-[state=active]:shadow-sm"
					>
						<User className="h-4 w-4" />
						Profile
					</TabsTrigger>
					<TabsTrigger
						value="billing"
						className="flex items-center gap-2 rounded-lg text-zinc-400 transition-all duration-200 data-[state=active]:bg-zinc-800/50 data-[state=active]:text-zinc-100 data-[state=active]:shadow-sm"
					>
						<FaCreditCard className="h-4 w-4" />
						Billing
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
				<TabsContent value="billing">
					<BillingSettings />
				</TabsContent>
			</Tabs>

			{codeConnecting && (
				<SocialConnectCallback
					type={socialType}
					code={socialCode}
					connecting={codeConnecting}
					closeModal={setCodeConnecting}
				/>
			)}
		</div>
	);
}
