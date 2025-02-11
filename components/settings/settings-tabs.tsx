"use client";

import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

// import { TeamMembers } from "@/components/settings/team-members"
import { BillingSettings } from "@/components/settings/billing-settings";
import { GeneralSettings } from "@/components/settings/general-settings";
import { ProfileSettings } from "@/components/settings/profile-settings";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { connectAccountSchema } from "@/resolvers/organizations/organization-schema";
import { checkOrganizationOwnership } from "@/server-actions/organizations/check-owner-ship";
import { postLinkedInConnection } from "@/server-actions/organizations/post-linkedin-connection";

import SocialConnectCallback from "./general-settings/connection-organization";

const tabTitles = {
	general: "General Settings",
	// "team-members": "Team Members",
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

const onConnectAccount = async (
	values: z.infer<typeof connectAccountSchema>,
) => {
	try {
		const response = await postLinkedInConnection(values);

		if (response.success) {
			toast.success("Your LinkedIn account has been connected successfully.");
			return response;
		} else {
			toast.error(response.message);
		}
	} catch {
		toast.error("Linkedin connection failed.");
	}
};

export function SettingsTabs() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const [mounted, setMounted] = useState(false);
	const [socialCode, setSocialCode] = useState("");
	const [activeTab, setActiveTab] = useState("general");
	const [codeConnecting, setCodeConnecting] = useState(false);

	const { data: ownershipData, isLoading } = useQuery({
		queryKey: ["organization-ownership"],
		queryFn: async () => {
			const result = await checkOrganizationOwnership();
			return {
				isOwner: (result.success && result.is_owner) || false,
			};
		},
		staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
		refetchOnWindowFocus: false,
	});

	const isOwner = ownershipData?.isOwner;

	// useEffect(() => {
	// 	const tab = searchParams.get("tab");
	// 	const code = searchParams.get("code");

	// 	if (code) {
	// 		const connectionRequest = await onConnectAccount({
	// 			code,
	// 		});

	// 		if (connectionRequest?.success) {
	// 			const nextSearchParams = new URLSearchParams(searchParams.toString());
	// 			nextSearchParams.delete("code");

	// 			router.replace(`${pathname}?${nextSearchParams}`);
	// 		}
	// 	}

	// 	if (code) {
	// 		try {
	// 			const connectionRequest = await onConnectAccount({ code });

	// 			if (connectionRequest?.success) {
	// 				const nextSearchParams = new URLSearchParams(searchParams.toString());
	// 				nextSearchParams.delete("code");

	// 				router.replace(`${pathname}?${nextSearchParams}`);
	// 			}
	// 		} catch (error) {
	// 			console.error("Failed to connect account:", error);
	// 		}
	// 		return;
	// 	}

	// 	if (isOwner === true) {
	// 		if (tab && tab in tabTitles) {
	// 			setActiveTab(tab);
	// 		} else {
	// 			setActiveTab("general");
	// 			router.push("/settings?tab=general", { scroll: false });
	// 		}
	// 	} else if (isOwner === false) {
	// 		// Default to profile tab for non-owners and error cases
	// 		setActiveTab("profile");
	// 		router.push("/settings?tab=profile", { scroll: false });
	// 	}

	// 	setMounted(true);
	// }, [searchParams, isOwner, router]);

	useEffect(() => {
		const handleConnection = async () => {
			const tab = searchParams.get("tab");
			const code = searchParams.get("code");

			if (code) {
				setSocialCode(code);
				setCodeConnecting(true);
				// return;
			}

			if (isOwner === true) {
				if (tab && tab in tabTitles) {
					setActiveTab(tab);
				} else {
					setActiveTab("general");
					router.push("/settings?tab=general", { scroll: false });
				}
			} else if (isOwner === false) {
				// Default to profile tab for non-owners and error cases
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
								{/* <TabsTrigger value="team-members">Team Members</TabsTrigger> */}
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
								{/* <TabsContent value="team-members">
                                    <TeamMembers />
                                </TabsContent> */}
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
