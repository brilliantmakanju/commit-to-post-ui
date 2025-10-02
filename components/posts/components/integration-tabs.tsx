/* eslint-disable import/no-unresolved */
import { Loader2, Minus, Plus } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PostItem } from "@/types";

import { ConnectedIntegration } from "../../repositories/settings/channel-settings";

interface IntegrationTabsProps {
	currentPost: PostItem;
	activeTab: string;
	onTabChange: (tab: string) => void;
	availableSocials: ConnectedIntegration[];
	selectedSocials: Set<string>;
	onSocialSelect: (socialId: string) => void;
	onSelectAllSocials: () => void;
	onAddAllIntegrations: () => void;
	onCancelAllIntegrations: () => void;
	onCancelIntegration: (integrationId: string) => void;
	onSaveIntegration: () => void;
	isAddingIntegrations: boolean;
	isRemovingIntegrations: boolean;
	removingIntegrationIds: Set<string>;
}

export default function IntegrationTabs({
	currentPost,
	activeTab,
	onTabChange,
	availableSocials,
	selectedSocials,
	onSocialSelect,
	onSelectAllSocials,
	onAddAllIntegrations,
	onCancelAllIntegrations,
	onCancelIntegration,
	onSaveIntegration,
	isAddingIntegrations,
	isRemovingIntegrations,
	removingIntegrationIds,
}: IntegrationTabsProps) {
	const [imgError, setImgError] = useState(false);

	return (
		<Tabs
			value={activeTab}
			onValueChange={onTabChange}
			className="flex h-full flex-col"
		>
			<TabsList
				className={`grid w-full flex-shrink-0 rounded-lg border border-zinc-800/50 bg-zinc-900/50 p-1 ${
					currentPost.status === "published" ? "grid-cols-1" : "grid-cols-3"
				}`}
			>
				{/* Always show Posted */}
				<TabsTrigger
					value="posted"
					className="text-[10px] text-zinc-400 data-[state=active]:bg-zinc-100 data-[state=active]:text-zinc-900 sm:text-xs"
				>
					<span className="hidden sm:inline">Posted</span>
					<span className="sm:hidden">Post</span>
					<span className="ml-1">
						({currentPost.posted_integrations_data.length})
					</span>
				</TabsTrigger>

				{/* Only show if NOT published */}
				{currentPost.status !== "published" && (
					<>
						<TabsTrigger
							value="pending"
							className="text-[10px] text-zinc-400 data-[state=active]:bg-zinc-100 data-[state=active]:text-zinc-900 sm:text-xs"
						>
							<span className="hidden sm:inline">Pending</span>
							<span className="sm:hidden">Pend</span>
							<span className="ml-1">
								({currentPost.pending_integrations_data.length})
							</span>
						</TabsTrigger>

						<TabsTrigger
							value="add"
							className="text-[10px] text-zinc-400 data-[state=active]:bg-zinc-100 data-[state=active]:text-zinc-900 sm:text-xs"
						>
							Add
						</TabsTrigger>
					</>
				)}
			</TabsList>

			<div className="mt-4 flex-1 overflow-hidden">
				<div className="h-full overflow-y-auto">
					<TabsContent
						value="posted"
						className="scrollbar-hide m-0 h-full space-y-3"
					>
						{currentPost.posted_integrations_data.length === 0 ? (
							<div className="py-8 text-center text-zinc-500 sm:py-12">
								<div className="text-sm">No published integrations</div>
							</div>
						) : (
							<div className="space-y-3">
								{currentPost.posted_integrations_data.map(integration => (
									<div
										key={integration.id}
										className="flex items-center justify-between rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 sm:p-4"
									>
										<div className="flex min-w-0 flex-1 items-center gap-3">
											<div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-xs font-medium text-zinc-900 sm:h-8 sm:w-8 sm:text-sm">
												{integration.name.charAt(0)}
											</div>
											<div className="min-w-0 flex-1">
												<div className="truncate text-sm font-medium text-zinc-100">
													{integration.name}
												</div>
												<div className="truncate text-xs text-zinc-400">
													{integration.handle}
												</div>
											</div>
										</div>
										<Badge className="flex-shrink-0 border-emerald-500/30 bg-emerald-500/20 text-emerald-300">
											Published
										</Badge>
									</div>
								))}
							</div>
						)}
					</TabsContent>

					<TabsContent value="pending" className="scrollbar-hide m-0 h-full">
						{/* Pending integrations header with Cancel All button */}
						{currentPost.pending_integrations_data.length > 0 && (
							<div className="mb-4 flex items-center justify-between">
								<span className="text-sm text-zinc-400">
									Pending Integrations
								</span>
								{/* <Button
									size="sm"
									variant="outline"
									onClick={onCancelAllIntegrations}
									disabled={isRemovingIntegrations}
									className="border-red-800/50 bg-red-900/50 text-red-300 transition-all duration-300 hover:border-red-700/70 hover:bg-red-800/70 hover:text-red-100 disabled:opacity-50"
								>
									{isRemovingIntegrations ? (
										<Loader2 className="mr-1 h-3 w-3 animate-spin" />
									) : (
										<Minus className="mr-1 h-3 w-3" />
									)}
									Cancel All
								</Button> */}
							</div>
						)}
						{currentPost.pending_integrations_data.length === 0 ? (
							<div className="py-8 text-center text-zinc-500 sm:py-12">
								<div className="text-sm">No pending integrations</div>
							</div>
						) : (
							<div className="space-y-3">
								{currentPost.pending_integrations_data.map(integration => {
									const shouldShowFallback =
										imgError ||
										!integration.profile_image_url ||
										["null", "undefined"].includes(
											integration.profile_image_url,
										);
									return (
										<div
											key={integration.id}
											className="flex items-center justify-between rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 sm:p-4"
										>
											{/* Left side: icon + name + handle */}
											<div className="flex min-w-0 flex-1 items-center gap-3">
												{shouldShowFallback ? (
													<div
														className={
															"flex h-[25px] w-[25px] items-center justify-center rounded-full border border-zinc-700/50 bg-zinc-700 text-xs font-medium text-zinc-100"
														}
													>
														{integration.name
															.split(" ")
															.map(word => word[0])
															.join("")
															.toUpperCase()
															.slice(0, 2)}
													</div>
												) : (
													<Image
														width={30}
														height={30}
														alt={integration.name}
														src={integration.profile_image_url!}
														onError={() => setImgError(true)}
														className={
															'bg-zinc-800/30" rounded-full border border-zinc-700/50'
														}
													/>
												)}

												<div className="min-w-0 flex-1">
													<div className="truncate text-sm font-medium text-zinc-100">
														{integration.name}
													</div>
													<div className="truncate text-xs text-zinc-400">
														{integration.handle}
													</div>
												</div>
											</div>

											{/* Right side: status + cancel */}
											<div className="flex items-center gap-2">
												<Button
													onClick={() => onCancelIntegration(integration.id)}
													disabled={
														isRemovingIntegrations ||
														removingIntegrationIds.has(integration.id)
													}
													className="rounded-md border border-zinc-700/50 bg-zinc-800/40 px-2 py-1 text-xs text-zinc-400 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
												>
													Cancel
												</Button>
											</div>
										</div>
									);
								})}
							</div>
						)}
					</TabsContent>

					<TabsContent
						value="add"
						className="scrollbar-hide m-0 h-full flex-1 space-y-4 overflow-y-auto"
					>
						{/* Add integrations header with Select All and Add All buttons */}
						{availableSocials.length > 0 && (
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Checkbox
										id="select-all-socials"
										checked={
											selectedSocials.size > 0 &&
											selectedSocials.size === availableSocials.length
										}
										onCheckedChange={onSelectAllSocials}
										className="border-zinc-600 data-[state=checked]:border-zinc-600 data-[state=checked]:bg-zinc-700"
									/>
									<Label
										htmlFor="select-all-socials"
										className="text-sm text-zinc-400"
									>
										Select All ({selectedSocials.size}/{availableSocials.length}
										)
									</Label>
								</div>
								{/* <Button
									size="sm"
									variant="outline"
									onClick={onAddAllIntegrations}
									disabled={
										availableSocials.length === 0 ||
										isAddingIntegrations ||
										isRemovingIntegrations
									}
									className="border-emerald-600/30 bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 disabled:opacity-50"
								>
									{isAddingIntegrations ? (
										<Loader2 className="mr-1 h-3 w-3 animate-spin" />
									) : (
										<Plus className="mr-1 h-3 w-3" />
									)}
									Add All
								</Button> */}
							</div>
						)}
						{availableSocials.length === 0 ? (
							<div className="py-8 text-center text-zinc-500 sm:py-12">
								<div className="text-sm">
									No available social connections to add
								</div>
								<div className="mt-1 text-xs text-zinc-600">
									All social connections for this platform are already used
								</div>
							</div>
						) : (
							availableSocials.map((social: any) => {
								const shouldShowFallback =
									imgError ||
									!social.profile_image_url ||
									["null", "undefined"].includes(social.profile_image_url);
								return (
									<div
										key={social.id}
										className="flex cursor-pointer items-center justify-between rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 hover:bg-zinc-800/40 sm:p-4"
										onClick={() => onSocialSelect(social.id)}
									>
										<div className="flex min-w-0 flex-1 items-center gap-3">
											<Checkbox
												checked={selectedSocials.has(social.id)}
												className="flex-shrink-0 border-zinc-600 data-[state=checked]:bg-zinc-700"
											/>
											{shouldShowFallback ? (
												<div
													className={
														"flex h-[25px] w-[25px] items-center justify-center rounded-full border border-zinc-700/50 bg-zinc-700 text-xs font-medium text-zinc-100"
													}
												>
													{social.display_name
														.split(" ")
														.map((word: any) => word[0])
														.join("")
														.toUpperCase()
														.slice(0, 2)}
												</div>
											) : (
												<Image
													width={30}
													height={30}
													alt={social.display_name}
													src={social.profile_image_url!}
													onError={() => setImgError(true)}
													className={
														'bg-zinc-800/30" rounded-full border border-zinc-700/50'
													}
												/>
											)}
											<div className="min-w-0 flex-1">
												<div className="truncate text-sm font-medium text-zinc-100">
													{social.display_name}
												</div>
												<div className="truncate text-xs text-zinc-400">
													{social.handle}
												</div>
											</div>
										</div>
										<span className="flex-shrink-0 text-xs capitalize text-zinc-500">
											{social.platform}
										</span>
									</div>
								);
							})
						)}
					</TabsContent>
				</div>
			</div>
		</Tabs>
	);
}
