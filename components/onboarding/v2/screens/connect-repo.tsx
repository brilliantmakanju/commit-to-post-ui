/* eslint-disable import/no-unresolved */
"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import useRetrieveConnectedRepos from "@/hooks/core/repo/get-repo-hook";
import { useLimitUI } from "@/hooks/use-limit-ui";
import { FEATURE_LIMITS } from "@/lib/constants/feature-limits";
import { connectGithubRepoBatch } from "@/server-actions/user-actions/connect-git-repo";
import { getGitHubRepos } from "@/server-actions/user-actions/get-repos";
import useOrganizationStore from "@/zustand/useorganization-store";

// Import new components
import { ProgressIndicator } from "./repos/progress-indicator";
import { RepoConfiguration } from "./repos/repo-config";
import { RepoSelection } from "./repos/repo-selection";
import ConnectRepoSocialOnboarding from "./repos/social-selection";
import { GitHubReposResponse, RepoSetting } from "./repos/type";
import { WebhookSetup } from "./repos/webhook-setup";

// Utility function
const getPlanLimits = (plan: any) => {
	switch (plan) {
		case "basic": {
			return { maxRepos: 1, maxSelection: 1 };
		}
		case "pro": {
			return { maxRepos: 5, maxSelection: 4 };
		}
		case "studio": {
			return { maxRepos: 300, maxSelection: 20 };
		}
		default: {
			return { maxRepos: 1, maxSelection: 1 };
		}
	}
};

const ConnectRepoOnboarding = () => {
	const queryClient = useQueryClient();
	const { data: session } = useSession();

	// State management
	const [openSocialConnect, setOpenSocialConnect] = useState<boolean>(false);
	const [selectedRepoForSocial, setSelectedRepoForSocial] = useState<
		string | undefined
	>();
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedRepo, setSelectedRepo] = useState<string[]>([]);
	const [currentStep, setCurrentStep] = useState(1);
	const [repoSettings, setRepoSettings] = useState<Record<string, RepoSetting>>(
		{},
	);
	const [webhookProgress, setWebhookProgress] = useState(0);
	const [webhookStatus, setWebhookStatus] = useState<
		"idle" | "setting-up" | "success" | "error"
	>("idle");

	// Data fetching
	const { totalRepositories, isLoadingRepos: isLoadingConnectedRepo } =
		useRetrieveConnectedRepos();

	const githubConnected = useOrganizationStore(
		state =>
			state.organization.github_installation_status === "active" &&
			!!state.organization.github_installation_id,
	);

	const { data: gitHubData, isLoading: isLoadingRepos } = useQuery({
		queryKey: ["gitRepos"],
		queryFn: async () => {
			const result = await getGitHubRepos();
			if (!result.success) {
				toast.error("Connection failed", {
					description: "Failed to fetch repos.",
				});
				return;
			}
			return result.data as GitHubReposResponse;
		},
		enabled: githubConnected,
	});

	// Computed values
	const repositories = useMemo(() => {
		const repos = gitHubData?.repos || [];
		return repos.map(repo => ({
			...repo,
			connection_status: repo.is_connected
				? repo.status === "paused"
					? "paused"
					: "connected"
				: repo.status === "disconnected"
					? "disconnected"
					: undefined,
		}));
	}, [gitHubData?.repos]);

	const planLimits = useMemo(
		() => getPlanLimits(session?.user.plan),
		[session?.user.plan],
	);
	const remainingSlots = Math.max(0, planLimits.maxRepos - totalRepositories);
	const maxSelectionAllowed = Math.min(planLimits.maxSelection, remainingSlots);

	const repoLimitUI = useLimitUI({
		warningThreshold: 80,
		limitType: "repositories",
		currentCount: totalRepositories,
		limitId: FEATURE_LIMITS.REPOSITORIES,
	});

	const shouldShowUpgradePrompt = repoLimitUI.isAtLimit;

	const selectedRepoNames = useMemo(() => {
		return selectedRepo
			.filter(repoId => !!repoId && repoSettings[repoId])
			.map(
				repoId => repositories.find(r => r.id.toString() === repoId)?.full_name,
			)
			.filter(Boolean)
			.join(", ");
	}, [selectedRepo, repoSettings, repositories]);

	// Event handlers
	const handleRepoSelection = (repoId: string) => {
		setSelectedRepo(previous => {
			const alreadySelected = previous.includes(repoId);
			return alreadySelected
				? previous.filter(id => id !== repoId)
				: [...previous, repoId];
		});

		const repo = repositories.find(r => r.id.toString() === repoId);
		if (repo && !repoSettings[repoId]) {
			setRepoSettings(previous => ({
				...previous,
				[repoId]: {
					branch: repo.default_branch,
					tone: "professional",
					aiEnabled: true,
					socials: [],
				},
			}));
		}
	};

	const handleOpenSocialConnect = (repoId: string) => {
		setSelectedRepoForSocial(repoId);
		setOpenSocialConnect(true);
	};

	const handleCloseSocialConnect = () => {
		setOpenSocialConnect(false);
		setSelectedRepoForSocial(undefined);
	};

	const handleUpdateRepoSettings = (
		repoId: string,
		updates: Partial<RepoSetting>,
	) => {
		setRepoSettings(previous => ({
			...previous,
			[repoId]: {
				...previous[repoId],
				...updates,
			},
		}));
	};

	const handleSocialSelect = (repoId: string, selectedSocials: any) => {
		setRepoSettings(previous => ({
			...previous,
			[repoId]: {
				...previous[repoId],
				socials: selectedSocials.map((social: any) => ({
					id: social.id,
					name: social.name,
					handle: social.handle,
					platform: social.platform,
					profile_image_url: social.profile_image_url,
				})),
			},
		}));
	};

	const handleNext = () => {
		if (currentStep === 1 && selectedRepo.length === 0) {
			toast.error("No repository selected", {
				description: "Please select at least one repository.",
			});
			return;
		}

		if (currentStep === 2) {
			for (const repoId of selectedRepo) {
				const setting = repoSettings[repoId];
				if (!setting?.branch?.trim()) {
					toast.error("Branch required", {
						description: `Please specify a branch to track for repo ID: ${repoId}`,
					});
					return;
				}
			}
		}

		setCurrentStep(currentStep + 1);
	};

	const handleBack = () => {
		if (currentStep > 1 && webhookStatus !== "success") {
			setCurrentStep(currentStep - 1);
		} else {
			setCurrentStep(1);
		}
	};

	const handleWebhookSetup = async () => {
		try {
			setWebhookStatus("setting-up");
			setWebhookProgress(0);

			const repoPayloads = selectedRepo.map(repoId => {
				const setting = repoSettings[repoId];
				if (!setting) {
					throw new Error(`Missing settings for repo ID: ${repoId}`);
				}
				return {
					repo_id: repoId,
					tone: setting.tone,
					branch: setting.branch,
					socials: setting.socials,
					aiEnabled: setting.aiEnabled,
				};
			});

			const response = await connectGithubRepoBatch(repoPayloads);

			if (!response.success) {
				setWebhookStatus("error");
				toast.error("Connection failed", {
					description:
						response.message || "Some repositories failed to connect.",
					className: "border-red-500 text-red-900 bg-red-50",
					duration: 7000,
					closeButton: true,
				});
				return;
			}

			// Simulate webhook progress
			await new Promise<void>(resolve => {
				const interval = setInterval(() => {
					setWebhookProgress(previous => {
						const next = previous + 20;
						if (next >= 100) {
							clearInterval(interval);
							setWebhookStatus("success");
							resolve();
							return 100;
						}
						return next;
					});
				}, 500);
			});

			toast.success("Repositories connected!", {
				duration: 5000,
				closeButton: true,
			});

			setSelectedRepo([]);
			setRepoSettings({});
			queryClient.invalidateQueries({ queryKey: ["connected_repos"] });
		} catch (error: any) {
			setWebhookStatus("error");
			toast.error(error?.message || "Failed to setup repos.", {
				duration: 7000,
				closeButton: true,
			});
		}
	};

	const existingSocials = useMemo(() => {
		if (
			!selectedRepoForSocial ||
			!repoSettings[selectedRepoForSocial]?.socials
		) {
			return [];
		}
		return repoSettings[selectedRepoForSocial].socials.map((social: any) => ({
			id: social.id,
			selected: true,
			name: social.name,
			handle: social.handle,
			platform: social.platform,
			profile_image_url: social.profile_image_url,
		}));
	}, [selectedRepoForSocial, repoSettings]);

	const renderStepContent = () => {
		switch (currentStep) {
			case 1: {
				return (
					<RepoSelection
						searchQuery={searchQuery}
						repositories={repositories}
						selectedRepo={selectedRepo}
						onSearchChange={setSearchQuery}
						onRepoSelect={handleRepoSelection}
						maxSelectionAllowed={maxSelectionAllowed}
						shouldShowUpgradePrompt={shouldShowUpgradePrompt}
						isLoading={isLoadingRepos || isLoadingConnectedRepo}
					/>
				);
			}

			case 2: {
				return (
					<RepoConfiguration
						selectedRepo={selectedRepo}
						repositories={repositories}
						repoSettings={repoSettings}
						webhookStatus={webhookStatus}
						existingSocials={existingSocials}
						onSocialSelect={handleSocialSelect}
						openSocialConnect={openSocialConnect}
						selectedRepoForSocial={selectedRepoForSocial}
						onOpenSocialConnect={handleOpenSocialConnect}
						onCloseSocialConnect={handleCloseSocialConnect}
						onUpdateRepoSettings={handleUpdateRepoSettings}
						SocialOnboardingComponent={ConnectRepoSocialOnboarding}
					/>
				);
			}

			case 3: {
				return (
					<WebhookSetup
						webhookStatus={webhookStatus}
						webhookProgress={webhookProgress}
						selectedRepoNames={selectedRepoNames}
					/>
				);
			}

			default: {
				return;
			}
		}
	};

	return (
		<div className="">
			<ProgressIndicator
				onBack={handleBack}
				onNext={handleNext}
				currentStep={currentStep}
				onSetup={handleWebhookSetup}
				webhookStatus={webhookStatus}
				selectedRepoCount={selectedRepo.length}
				isLoading={isLoadingRepos || isLoadingConnectedRepo}
			/>

			<div className="scrollbar-hide h-full w-full overflow-hidden overflow-y-auto lg:h-[530px]">
				{renderStepContent()}
			</div>
		</div>
	);
};

export default ConnectRepoOnboarding;
