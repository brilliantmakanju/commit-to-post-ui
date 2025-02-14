"use client";

import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useOrganizationOwnership from "@/hooks/settings/use-ownership";

// Dynamically import UI components
const BillingSettings = dynamic(
	() => import("@/components/settings/billing-settings"),
	{ ssr: false },
);
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

function LoadingState() {
	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<Skeleton className="h-8 w-[200px] bg-gray-100/80" />
				<Skeleton className="h-4 w-[300px] bg-gray-100/80" />
			</div>
			<div className="space-y-4">
				<Skeleton className="h-10 w-[400px] bg-gray-100/80" />
				<div className="space-y-8">
					<Skeleton className="h-[200px] w-full bg-gray-50/80" />
					<Skeleton className="h-[200px] w-full bg-gray-50/80" />
				</div>
			</div>
		</div>
	);
}

export function SettingsTabs() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const [mounted, setMounted] = useState(false);
	const [socialCode, setSocialCode] = useState("");
	const [activeTab, setActiveTab] = useState("general");
	const [codeConnecting, setCodeConnecting] = useState(false);

	const { data: ownershipData, isLoading } = useOrganizationOwnership();
	const isOwner = ownershipData?.isOwner;

	useEffect(() => {
		const handleConnection = async () => {
			const tab = searchParams.get("tab");
			const code = searchParams.get("code");

			if (code) {
				setSocialCode(code);
				setCodeConnecting(true);
			}

			if (isOwner === true) {
				if (tab && tab in tabTitles) {
					setActiveTab(tab);
				} else {
					setActiveTab("general");
					router.push("/settings?tab=general", { scroll: false });
				}
			} else if (isOwner === false) {
				setActiveTab("profile");
				router.push("/settings?tab=profile", { scroll: false });
			}

			setMounted(true);
		};

		handleConnection();
	}, [searchParams, isOwner, router, pathname]);

	const handleTabChange = (value: string) => {
		setActiveTab(value);
		router.push(`/settings?tab=${value}`, { scroll: false });
	};

	// Show loading state only during initial load
	if (!mounted || isLoading) {
		return <LoadingState />;
	}

	// If not an owner, show profile view only
	if (!isOwner) {
		return (
			<div className="w-full px-5">
				<h1 className="text-2xl font-semibold">Settings</h1>
				<p className="text-sm text-muted-foreground">
					Manage your account settings
				</p>
				<div className="container mx-auto">
					<Tabs value="profile" onValueChange={handleTabChange}>
						<TabsList>
							<TabsTrigger value="profile">Profile</TabsTrigger>
						</TabsList>
						<TabsContent value="profile">
							<ProfileSettings />
						</TabsContent>
					</Tabs>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full">
			<h1 className="text-2xl font-semibold">Settings</h1>
			<p className="mb-5 text-sm text-muted-foreground">
				Manage your {isOwner ? "account and organization" : "account"} settings
			</p>
			<div className="flex w-full flex-col items-start justify-start gap-6">
				<Tabs
					value={activeTab}
					className="w-full"
					onValueChange={handleTabChange}
				>
					<TabsList>
						{isOwner && (
							<>
								<TabsTrigger value="general">General</TabsTrigger>
								<TabsTrigger value="billing">Billing</TabsTrigger>
							</>
						)}
						<TabsTrigger value="profile">Profile</TabsTrigger>
					</TabsList>

					<>
						{isOwner && (
							<>
								<TabsContent value="general">
									<GeneralSettings />
								</TabsContent>
								<TabsContent value="billing">
									<BillingSettings />
								</TabsContent>
							</>
						)}
						<TabsContent value="profile">
							<ProfileSettings />
						</TabsContent>
					</>
				</Tabs>
			</div>

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
