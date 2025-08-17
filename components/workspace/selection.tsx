"use client";
import { useQueryClient } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import React, { useCallback, useMemo, useState } from "react";

// eslint-disable-next-line import/no-unresolved
import {
	debugGroup,
	debugLog,
	useFetchOrganizations,
	// eslint-disable-next-line import/no-unresolved
} from "@/hooks/core/repo/use-organization-hook";
import {
	createEncryptedCookie,
	deleteCookie,
	// eslint-disable-next-line import/no-unresolved
} from "@/lib/cookies/create-cookies";
import { getDecryptedCookie } from "@/lib/cookies/getcookies";
// eslint-disable-next-line import/no-unresolved
import useOrganizationStore from "@/zustand/useorganization-store";

import { Span } from "../general/micro/typography";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import WorkspaceSkeletonLoader from "./loader";

// Helper function to get workspace initials
const getWorkspaceInitials = (name: string) => {
	const words = name.trim().split(/\s+/);

	if (words.length === 1) {
		// Single word: take first character
		return words[0][0].toUpperCase();
	} else if (words.length === 2) {
		// Two words: take first character of each
		return (words[0][0] + words[1][0]).toUpperCase();
	} else {
		// More than two words: take first character of first word only
		return words[0][0].toUpperCase();
	}
};

const WorkspaceSelection = () => {
	const router = useRouter();
	const { data } = useSession();
	const queryClient = useQueryClient();
	const { isLoading } = useFetchOrganizations();
	const [showAll, setShowAll] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [isSwitching, setIsSwitching] = useState(false);

	const [lastSwitchedOrgId, setLastSwitchedOrgId] = useState<
		string | undefined
	>();

	const { organizations, organization, setOrganization } =
		useOrganizationStore();

	// Helper function to truncate description
	const truncateDescription = (
		description: string | undefined,
		maxLength: number = 80,
	) => {
		if (!description) return "No description for this workspace";
		if (description.length <= maxLength) return description;
		return description.slice(0, Math.max(0, maxLength)).trim() + "...";
	};

	// Sort and filter organizations
	const sortedAndFilteredOrganizations = useMemo(() => {
		let filtered = organizations;

		// Apply search filter if there's a query
		if (searchQuery.trim()) {
			filtered = organizations.filter(
				org =>
					org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					org.description?.toLowerCase().includes(searchQuery.toLowerCase()),
			);
		}

		// Sort: current workspace first, then alphabetically
		return filtered.sort((a, b) => {
			// Current workspace always comes first
			if (a.id === organization.id) return -1;
			if (b.id === organization.id) return 1;

			// Then sort alphabetically by name
			return a.name.localeCompare(b.name);
		});
	}, [organizations, searchQuery, organization.id]);

	// Group workspaces by ownership status
	const groupedWorkspaces = useMemo(() => {
		const owned = sortedAndFilteredOrganizations.filter(org => org.is_owner);
		const member = sortedAndFilteredOrganizations.filter(org => !org.is_owner);

		return { owned, member };
	}, [sortedAndFilteredOrganizations]);

	// Clear search handler
	const clearSearch = () => {
		setSearchQuery("");
	};

	// Background refresh function - non-blocking
	const backgroundRefresh = useCallback(async () => {
		debugGroup("BACKGROUND_REFRESH", () => {
			debugLog("BACKGROUND", "Starting background refresh of cached queries");

			const keys = [
				"posts",
				"gitRepos",
				"repo_details",
				"notifications",
				"connected_repos",
				"top_repo_metrics",
				"dashboard_metrics",
				"repo_webhook_ping",
				"repo_super_details",
				"retrieving_webhooks",
				"recent_notifications",
				"dashboard_heatmap_data",
				"upcoming_posts_metrics",
				"dashboard_channel_data",
				"organization-ownership",
				"upcoming_posts_metrics",
				"dashboard_webhook_errors",
				"retrieving_social_status",
				"retrieving_billing_portal",
				"unread_notification_counts",
			];

			// Fire and forget - don't await
			Promise.allSettled(
				keys.map(key => {
					debugLog("BACKGROUND", `Fetching query: ${key}`);
					return queryClient
						.fetchQuery({ queryKey: [key] })
						.then(() => {
							debugLog("BACKGROUND", `✅ Successfully refreshed: ${key}`);
							return queryClient.invalidateQueries({ queryKey: [key] });
						})
						.catch(error => {
							debugLog("BACKGROUND", `❌ Failed to refresh: ${key}`, error);
						});
				}),
			).then(results => {
				const successful = results.filter(r => r.status === "fulfilled").length;
				const failed = results.filter(r => r.status === "rejected").length;
				debugLog(
					"BACKGROUND",
					`Background refresh completed: ${successful} successful, ${failed} failed`,
				);
			});
		});
	}, [queryClient]);

	// Team switching handler with proper error handling and loading states
	const handleTeamChange = useCallback(
		async (team: (typeof organizations)[0]) => {
			if (isSwitching || !team) return;

			try {
				setIsSwitching(true);
				setLastSwitchedOrgId(team.id);

				// Update cookies first to ensure persistence
				await deleteCookie("organization");
				await createEncryptedCookie("organization", {
					id: team.id,
					name: team.name,
					domain: team.domains[0],
					is_owner: team.is_owner,
					description: team.description,
					github_installation_id: team.github_installation_id,
					github_installation_status: team.github_installation_status,
				});

				// Then update store
				setOrganization(team);
				backgroundRefresh();

				const sessionData = await getDecryptedCookie("user_state");
				const isNewUser = sessionData?.new_user || false;

				if (isNewUser) {
					router.push("/start");
				} else {
					router.push("/dashboard");
				}

				// Clear the switching flag after a brief delay to prevent race conditions
				setTimeout(() => {
					setLastSwitchedOrgId(undefined);
				}, 1000);
			} catch {
				// Revert on error
				setLastSwitchedOrgId(undefined);
				// You might want to show a toast notification here
			} finally {
				setIsSwitching(false);
			}
		},
		[backgroundRefresh, isSwitching, router, setOrganization],
	);

	// Show skeleton loader when loading
	if (isLoading) {
		return <WorkspaceSkeletonLoader />;
	}

	const totalResults = sortedAndFilteredOrganizations.length;
	const hasResults = sortedAndFilteredOrganizations.length > 0;
	const isSearchActive = searchQuery.trim().length > 0;
	const shouldShowSearch = organizations.length > 3;

	return (
		<div className="w-full">
			<div className="mb-8">
				<Span className="text-lg font-medium text-arch-black">
					Workspaces for {data?.user.email}
				</Span>
			</div>

			{/* Search Input - Only show if more than 3 workspaces */}
			{shouldShowSearch && (
				<div className="mb-6">
					<div className="relative">
						<Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
						<Input
							placeholder="Search workspaces..."
							value={searchQuery}
							onChange={event_ => setSearchQuery(event_.target.value)}
							className="border-2 border-gray-300 bg-transparent py-3 pl-12 pr-12 text-arch-dark transition-colors focus:border-arch-black focus:ring-0"
						/>
						{/* Clear button - Only show when there's search text */}
						{isSearchActive && (
							<button
								onClick={clearSearch}
								className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
								aria-label="Clear search"
							>
								<X className="h-5 w-5" />
							</button>
						)}
					</div>

					{/* Search Results Info - Only show when searching */}
					{isSearchActive && (
						<div className="mt-3">
							<Span className="text-sm text-gray-500">
								{hasResults
									? `Found ${totalResults} workspace${totalResults === 1 ? "" : "s"}`
									: "No workspaces found"}
							</Span>
						</div>
					)}
				</div>
			)}

			{/* Workspace List with Grouping */}
			{hasResults ? (
				<>
					<div className="w-full space-y-6">
						{/* Owned Workspaces Section */}
						{groupedWorkspaces.owned.length > 0 && (
							<div>
								<div className="mb-3">
									<Span className="text-sm font-medium uppercase tracking-wide text-gray-600">
										Your Workspaces ({groupedWorkspaces.owned.length})
									</Span>
								</div>
								<div className="w-full overflow-hidden rounded-xl border-2 border-gray-200">
									{groupedWorkspaces.owned
										.slice(
											0,
											showAll
												? undefined
												: Math.max(
														1,
														3 -
															groupedWorkspaces.member.filter(
																(_, index) => index < 3,
															).length,
													),
										)
										.map((workspace, index, array) => {
											const isActive = workspace.id === organization.id;
											const isSwitchingThis =
												lastSwitchedOrgId === workspace.id;

											return (
												<div
													key={workspace.id}
													className={`group flex w-full items-center justify-between px-8 py-4 transition-colors ${
														isActive
															? "border-l-4 border-l-arch-black bg-gray-50"
															: "hover:bg-gray-50"
													} ${
														index === array.length - 1
															? ""
															: "border-b border-gray-200"
													}`}
												>
													<div className="flex items-center space-x-8">
														<div
															className={`flex h-16 w-16 items-center justify-center rounded-xl border-2 ${
																isActive
																	? "border-arch-black bg-arch-black text-white"
																	: "border-gray-300 bg-transparent text-arch-dark"
															} text-lg font-semibold`}
														>
															{getWorkspaceInitials(workspace.name)}
														</div>
														<div className="flex flex-col">
															<div className="flex items-center space-x-3">
																<h3 className="text-xl font-medium text-arch-black">
																	{workspace.name}
																</h3>
																{isActive && (
																	<span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
																		Current
																	</span>
																)}
																<span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
																	Owner
																</span>
															</div>
															<Span className="mt-2 text-base text-gray-500">
																{truncateDescription(workspace.description)}
															</Span>
															<Button
																variant="outline"
																disabled={isSwitching}
																onClick={() => handleTeamChange(workspace)}
																className={
																	"mt-2 flex w-[110px] border-2 border-gray-300 bg-transparent px-8 py-3 text-arch-dark transition-colors hover:border-arch-black hover:bg-arch-black hover:text-white md:hidden"
																}
															>
																{isSwitchingThis ? "Opening..." : "Open"}
															</Button>
														</div>
													</div>
													<Button
														variant="outline"
														disabled={isSwitching}
														onClick={() => handleTeamChange(workspace)}
														className={
															"hidden border-2 border-gray-300 bg-transparent px-8 py-3 text-arch-dark transition-colors hover:border-arch-black hover:bg-arch-black hover:text-white md:flex"
														}
													>
														{isSwitchingThis ? "Opening..." : "Open"}
													</Button>
												</div>
											);
										})}
								</div>
							</div>
						)}

						{/* Member Workspaces Section */}
						{groupedWorkspaces.member.length > 0 && (
							<div>
								<div className="mb-3">
									<Span className="text-sm font-medium uppercase tracking-wide text-gray-600">
										Member Workspaces ({groupedWorkspaces.member.length})
									</Span>
								</div>
								<div className="w-full overflow-hidden rounded-xl border-2 border-gray-200">
									{groupedWorkspaces.member
										.slice(
											0,
											showAll
												? undefined
												: Math.max(
														1,
														3 -
															groupedWorkspaces.owned.filter(
																(_, index) => index < 3,
															).length,
													),
										)
										.map((workspace, index, array) => {
											const isActive = workspace.id === organization.id;
											const isSwitchingThis =
												lastSwitchedOrgId === workspace.id;

											return (
												<div
													key={workspace.id}
													className={`group flex w-full items-center justify-between px-8 py-4 transition-colors ${
														isActive
															? "border-l-4 border-l-arch-black bg-gray-50"
															: "hover:bg-gray-50"
													} ${
														index === array.length - 1
															? ""
															: "border-b border-gray-200"
													}`}
												>
													<div className="flex items-center space-x-8">
														<div
															className={`flex h-16 w-16 items-center justify-center rounded-xl border-2 ${
																isActive
																	? "border-arch-black bg-arch-black text-white"
																	: "border-gray-300 bg-transparent text-arch-dark"
															} text-lg font-semibold`}
														>
															{getWorkspaceInitials(workspace.name)}
														</div>
														<div className="flex flex-col">
															<div className="flex items-center space-x-3">
																<h3 className="text-xl font-medium text-arch-black">
																	{workspace.name}
																</h3>
																{isActive && (
																	<span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
																		Current
																	</span>
																)}
																<span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
																	Member
																</span>
															</div>
															<Span className="mt-2 text-base text-gray-500">
																{truncateDescription(workspace.description)}
															</Span>
															<Button
																variant="outline"
																disabled={isSwitching}
																onClick={() => handleTeamChange(workspace)}
																className={
																	"mt-2 flex w-[110px] border-2 border-gray-300 bg-transparent px-8 py-3 text-arch-dark transition-colors hover:border-arch-black hover:bg-arch-black hover:text-white md:hidden"
																}
															>
																{isSwitchingThis ? "Opening..." : "Open"}
															</Button>
														</div>
													</div>
													<Button
														variant="outline"
														disabled={isSwitching}
														onClick={() => handleTeamChange(workspace)}
														className={
															"hidden border-2 border-gray-300 bg-transparent px-8 py-3 text-arch-dark transition-colors hover:border-arch-black hover:bg-arch-black hover:text-white md:flex"
														}
													>
														{isSwitchingThis ? "Opening..." : "Open"}
													</Button>
												</div>
											);
										})}
								</div>
							</div>
						)}
					</div>

					{/* Show More/Less Button - Only show when not searching and have more than 3 workspaces */}
					{!isSearchActive && sortedAndFilteredOrganizations.length > 3 && (
						<div className="mt-6 flex justify-center">
							<Button
								variant="ghost"
								onClick={() => setShowAll(!showAll)}
								className="text-arch-dark hover:text-arch-black hover:underline"
							>
								{showAll
									? "Show Less"
									: `Show More (${sortedAndFilteredOrganizations.length - 3} more)`}
							</Button>
						</div>
					)}
				</>
			) : (
				/* No Results State */
				<div className="flex flex-col items-center justify-center rounded-xl border-2 border-gray-200 py-16">
					<div className="mb-4 rounded-full bg-gray-100 p-4">
						<Search className="h-8 w-8 text-gray-400" />
					</div>
					<h3 className="mb-2 text-lg font-medium text-arch-black">
						No workspaces found
					</h3>
					<Span className="text-center text-gray-500">
						Try adjusting your search or create a new workspace
					</Span>
				</div>
			)}
		</div>
	);
};

export default WorkspaceSelection;
