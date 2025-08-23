"use client";

import { UUID } from "node:crypto";

import { useQueryClient } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { SocialConnection as SocialConnectionList } from "@/components/onboarding/v2/screens/repos/social-connection";
import ConnectRepoSocialOnboarding from "@/components/onboarding/v2/screens/repos/social-selection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import useRepoDetails from "@/hooks/core/repo/get-repo-detail-hook";
import {
	connectRepoSocial,
	disconnectRepoSocial,
} from "@/server-actions/core/repo/social-connect";

// Updated Types to match new API response
type Platform = "linkedin" | "slack" | "discord" | "twitter";

export interface ConnectedIntegration {
	id: string;
	connected: boolean;
	display_name: string;
	handle: string | null;
	connected_by: string;
	connected_at: string;
	profile_url: string | null;
	profile_image_url: string | null;
	details: {
		webhook_url?: string;
	} | null;
	is_token_expired: boolean;
	token_expiry: string | null;
}

interface SocialConnections {
	connected_integrations: {
		slack: ConnectedIntegration[];
		twitter: ConnectedIntegration[];
		discord: ConnectedIntegration[];
		linkedin: ConnectedIntegration[];
	};
	summary: string;
	total_count: number;
}

export interface SocialConnectionItem {
	id: UUID;
	name: string;
	handle: string;
	selected: boolean;
	profile_image_url: string;
	platform: "linkedin" | "x-twitter" | "slack" | "discord";
}

interface RepoChannelSettingsCardProps {
	repo_id: UUID;
	loading?: boolean;
	socialConnections: SocialConnections;
	localSettings: {
		default_hashtags: string;
		hashtag_automation: boolean;
		connected_integration_ids?: string[];
	};
	onChange: (
		key: string,
		value: string | boolean | SocialConnections[] | string[],
	) => void;
	getSocialIcon: (
		platform: Platform,
		connected: boolean,
		expired?: boolean,
	) => React.ReactNode;
	getSocialLabel: (platform: Platform) => string;
}

export const RepoChannelSettingsCard = ({
	onChange,
	repo_id,
	localSettings,
	socialConnections,
	loading = true,
}: RepoChannelSettingsCardProps) => {
	const queryClient = useQueryClient();

	const { repoDetails: repository, isLoadingRepoDetails } =
		useRepoDetails(repo_id);
	const [isSaving, setIsSaving] = useState<boolean>(false);
	const [isConnecting, setIsConnecting] = useState<boolean>(false);
	const [socials, setSocials] = useState<SocialConnectionItem[]>([]);
	const [removingIndex, setRemovingIndex] = useState<boolean>(false);
	const [openSocialConnect, setOpenSocialConnect] = useState<boolean>(false);

	// Modal close
	const handleCloseSocialConnect = () => {
		setOpenSocialConnect(false);
	};

	// Convert connected integrations to the format expected by the component
	useEffect(() => {
		if (socialConnections && socials.length === 0) {
			const result: SocialConnectionItem[] = [];
			const connectedIds = localSettings.connected_integration_ids || [];

			Object.entries(socialConnections.connected_integrations).forEach(
				([platform, integrations]) => {
					integrations.forEach(integration => {
						let mappedPlatform: "linkedin" | "x-twitter" | "slack" | "discord";
						switch (platform as Platform) {
							case "twitter": {
								mappedPlatform = "x-twitter";
								break;
							}
							case "linkedin": {
								mappedPlatform = "linkedin";
								break;
							}
							case "slack": {
								mappedPlatform = "slack";
								break;
							}
							case "discord": {
								mappedPlatform = "discord";
								break;
							}
							default: {
								return;
							}
						}

						const isSelected = connectedIds.includes(integration.id);
						result.push({
							platform: mappedPlatform,
							id: integration.id as UUID,
							name: integration.display_name,
							handle: integration.handle || "",
							selected: isSelected,
							profile_image_url: integration.profile_image_url || "",
						});
					});
				},
			);

			setSocials(result);
		}
	}, [
		socialConnections,
		localSettings.connected_integration_ids,
		socials.length,
	]);

	// Updated Save function - connects selected social integrations
	const handleSaveSocials = async () => {
		setIsSaving(true);

		try {
			const selectedIntegrationIds = socials
				.filter(social => social.selected)
				.map(social => social.id);

			if (selectedIntegrationIds.length === 0) {
				toast.error("Please select at least one social account to connect");
				setIsSaving(false);
				return;
			}

			// Call the API to connect selected socials
			const response = await connectRepoSocial(repo_id, selectedIntegrationIds);

			if (response.success) {
				queryClient.invalidateQueries({ queryKey: ["repo_details", repo_id] });
				queryClient.fetchQuery({ queryKey: ["repo_details", repo_id] });
				toast.success(
					response.message || "Social connections saved successfully",
				);

				// Update parent state with connected integration IDs
				onChange("connected_integration_ids", selectedIntegrationIds);

				// Update local socials state to reflect the saved state
				// This ensures UI consistency
				setSocials(currentSocials =>
					currentSocials.map(social => ({
						...social,
						selected: selectedIntegrationIds.includes(social.id),
					})),
				);
			} else {
				toast.error(response.message || "Failed to save social connections");
			}
		} catch {
			toast.error(
				"An unexpected error occurred while saving social connections",
			);
		} finally {
			setIsSaving(false);
		}
	};

	// Add / update socials from modal selection
	const handleSocialSelect = async (repoId: string, selectedSocials: any[]) => {
		if (!selectedSocials) return;

		// Start loading state
		setIsConnecting(true);

		try {
			// Update local state with selected socials
			const mapped = selectedSocials.map(social => ({
				id: social.id,
				name: social.name,
				handle: social.handle,
				platform: social.platform,
				selected: social.selected,
				profile_image_url: social.profile_image_url,
			}));

			setSocials(mapped);
		} catch {
			toast.error("Failed to update social selection");
		}
		setIsConnecting(false);
	};

	// Remove a social from list
	const handleRemoveSocial = async (index: number) => {
		const socialToRemove = socials[index];
		if (!socialToRemove) return;

		// Start loading for this specific index
		setRemovingIndex(true);

		try {
			// Call backend to disconnect the social
			const response = await disconnectRepoSocial(repo_id, socialToRemove.id);
			if (response.success) {
				queryClient.invalidateQueries({ queryKey: ["repo_details", repo_id] });
				queryClient.fetchQuery({ queryKey: ["repo_details", repo_id] });
				toast.success(response.message);

				// Remove from local state - create new array without the removed item
				const updatedSocials = socials.filter(
					(_, socialIndex) => socialIndex !== index,
				);

				// Update the socials state immediately
				setSocials(updatedSocials);

				// Calculate updated connected integration IDs from the remaining socials
				// Only include IDs of socials that are still selected after removal
				const updatedConnectedIds = updatedSocials
					.filter(social => social.selected)
					.map(social => social.id);

				// Update parent state with the new connected integration IDs
				onChange("connected_integration_ids", updatedConnectedIds);
			} else {
				toast.error(response.message);
			}
		} catch {
			toast.error("Failed to disconnect social connection");
		} finally {
			// Stop loading
			setRemovingIndex(false);
		}
	};

	// Check if there are unsaved changes
	const hasUnsavedChanges = () => {
		const currentSelectedIds = socials.filter(s => s.selected).map(s => s.id);
		const savedIds = localSettings.connected_integration_ids || [];

		return (
			JSON.stringify(currentSelectedIds.sort()) !==
			JSON.stringify(savedIds.sort())
		);
	};

	// ------------------
	// Loading Skeleton
	// ------------------
	if (loading || isLoadingRepoDetails) {
		return (
			<Card className="border-zinc-800 bg-zinc-900 text-zinc-100">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-lg">
						<Users className="h-5 w-5 text-zinc-400" />
						<Skeleton className="h-6 w-32 bg-zinc-800" />
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					<Skeleton className="h-20 w-full rounded-md bg-zinc-800" />
					<Skeleton className="h-6 w-32 bg-zinc-800" />
					<Skeleton className="h-24 w-full rounded-md bg-zinc-800" />
				</CardContent>
			</Card>
		);
	}

	// ------------------
	// Main UI
	// ------------------
	return (
		<>
			<ConnectRepoSocialOnboarding
				repo={{
					id: repo_id,
					name: repository.name,
				}}
				open={openSocialConnect}
				existingSocials={socials}
				onSocialSelect={handleSocialSelect}
				onOpenChange={handleCloseSocialConnect}
			/>

			<Card className="border-zinc-800 bg-zinc-900 text-zinc-100">
				<CardHeader>
					<CardTitle className="flex items-center justify-between gap-2 text-lg font-semibold text-zinc-100">
						<div className="flex w-full items-start justify-start gap-2">
							<Users className="h-5 w-5 text-blue-400" />
							<div className="flex flex-col">
								<span>Channel Settings</span>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<Button
								onClick={handleSaveSocials}
								disabled={isSaving || !hasUnsavedChanges()}
								className="border border-green-700/50 bg-green-800/30 px-6 py-2 text-green-100 hover:border-green-600/70 hover:bg-green-700/40 disabled:cursor-not-allowed disabled:opacity-50"
							>
								<span className="flex items-center gap-2">
									{isSaving ? (
										<>
											<div className="h-4 w-4 animate-spin rounded-full border-2 border-green-300 border-t-transparent" />
											Saving...
										</>
									) : (
										"Save"
									)}
								</span>
							</Button>
							<Button
								onClick={() => setOpenSocialConnect(true)}
								disabled={isConnecting || isSaving}
								className="border border-zinc-700/50 bg-zinc-800/30 px-6 py-2 text-zinc-100 hover:border-zinc-600/70 hover:bg-zinc-700/40 disabled:cursor-not-allowed disabled:opacity-50"
							>
								<span className="flex items-center gap-2">
									{isConnecting ? (
										<>
											<div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-transparent" />
											Loading...
										</>
									) : (
										"Connect"
									)}
								</span>
							</Button>
						</div>
					</CardTitle>
				</CardHeader>
				<CardContent className="flex w-full flex-col items-start justify-start gap-3">
					<SocialConnectionList
						socials={socials}
						loading={isConnecting}
						removingLoader={removingIndex}
						onRemoveSocial={handleRemoveSocial}
						connectedIntegrationIds={localSettings.connected_integration_ids}
					/>
					{/* Hashtag Automation */}
					<div className="flex w-full items-center justify-between">
						<div>
							<Label className="text-sm font-medium text-zinc-100">
								Hashtag Automation
							</Label>
							<p className="mt-1 text-xs text-zinc-400">
								Automatically add relevant hashtags to posts
							</p>
						</div>
						<Switch
							checked={localSettings.hashtag_automation}
							onCheckedChange={checked =>
								onChange("hashtag_automation", checked)
							}
						/>
					</div>

					<Separator className="bg-zinc-800" />

					{/* Default Hashtags */}
					{localSettings.hashtag_automation && (
						<div className="w-full space-y-2">
							<Label className="text-sm font-medium text-zinc-100">
								Default Hashtags
							</Label>
							<Textarea
								value={localSettings.default_hashtags}
								onChange={event_ =>
									onChange("default_hashtags", event_.target.value)
								}
								className="min-h-[80px] border-zinc-700 bg-zinc-800 text-zinc-100 placeholder-zinc-400"
								placeholder="#coding #development #opensource"
							/>
							<p className="text-xs text-zinc-400">
								Default hashtags to include in posts
							</p>
						</div>
					)}
				</CardContent>
			</Card>
		</>
	);
};
