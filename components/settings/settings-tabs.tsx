"use client";

import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
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
	general: "General Settings",
	billing: "Billing Settings",
	profile: "Profile Settings",
} as const;

export function SettingsTabs() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const [mounted, setMounted] = useState(false);
	const [socialCode, setSocialCode] = useState("");
	const [activeTab, setActiveTab] = useState("general");
	const [codeConnecting, setCodeConnecting] = useState(false);

	const { data: ownershipData, isLoading } = useOrganizationOwnership();
	const isOwner = ownershipData?.isOwner;

	useEffect(() => {
		const tab = searchParams.get("tab");
		const code = searchParams.get("code");

		if (code) {
			setSocialCode(code);
			setCodeConnecting(true);
		}

		if (isOwner) {
			setActiveTab(tab && tab in tabTitles ? tab : "general");
		} else {
			setActiveTab("profile");
		}

		setMounted(true);
	}, [searchParams, isOwner]);

	const handleTabChange = (value: string) => {
		setActiveTab(value);
		router.push(`/settings?tab=${value}`, { scroll: false });
	};

	if (!mounted || isLoading) return <LogoutModal showByDefault />;

	return (
		<div className="w-full rounded-lg p-6">
			<h1 className="text-2xl font-semibold">Settings</h1>
			<p className="mb-5 text-sm text-gray-400">
				Manage your {isOwner ? "account and organization" : "account"} settings
			</p>

			<Tabs
				value={activeTab}
				className="w-full"
				onValueChange={handleTabChange}
			>
				<TabsList className="rounded-lg bg-gray-800 p-2">
					{isOwner && <TabsTrigger value="general">General</TabsTrigger>}
					<TabsTrigger value="profile">Profile</TabsTrigger>
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
					closeModal={setCodeConnecting}
					code={socialCode}
					connecting={codeConnecting}
				/>
			)}
		</div>
	);
}
