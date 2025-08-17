import React from "react";

// eslint-disable-next-line import/no-unresolved
import { TooltipProvider } from "@/components/ui/tooltip";

import { RepoConfigCard } from "./repo-config-card";
import { GitHubRepo, RepoSetting } from "./type";

interface RepoConfigurationProps {
	selectedRepo: string[];
	repositories: GitHubRepo[];
	repoSettings: Record<string, RepoSetting>;
	webhookStatus: "idle" | "setting-up" | "success" | "error";
	openSocialConnect: boolean;
	selectedRepoForSocial: string | undefined;
	onOpenSocialConnect: (repoId: string) => void;
	onCloseSocialConnect: () => void;
	onUpdateRepoSettings: (repoId: string, updates: Partial<RepoSetting>) => void;
	onSocialSelect: (repoId: string, selectedSocials: any) => void;
	existingSocials: any[];
	SocialOnboardingComponent: React.ComponentType<any>;
}

export const RepoConfiguration: React.FC<RepoConfigurationProps> = ({
	selectedRepo,
	repositories,
	repoSettings,
	webhookStatus,
	openSocialConnect,
	selectedRepoForSocial,
	onOpenSocialConnect,
	onCloseSocialConnect,
	onUpdateRepoSettings,
	onSocialSelect,
	existingSocials,
	SocialOnboardingComponent,
}) => {
	return (
		<TooltipProvider>
			<div className="space-y-3">
				<SocialOnboardingComponent
					open={openSocialConnect}
					onOpenChange={onCloseSocialConnect}
					repo={
						selectedRepoForSocial
							? {
									id: selectedRepoForSocial,
									name:
										repositories.find(
											r => r.id.toString() === selectedRepoForSocial,
										)?.name || "",
								}
							: undefined
					}
					onSocialSelect={onSocialSelect}
					existingSocials={existingSocials}
				/>
				<div className="space-y-3">
					{selectedRepo
						.filter(repoId => !!repoId && repoSettings[repoId])
						.map(repoId => {
							const repo = repositories.find(r => r.id.toString() === repoId);
							const settings = repoSettings[repoId];

							if (!repo || !settings) return;

							return (
								<RepoConfigCard
									key={repoId}
									repo={repo}
									settings={settings}
									webhookStatus={webhookStatus}
									onOpenSocialConnect={onOpenSocialConnect}
									onUpdateSettings={updates =>
										onUpdateRepoSettings(repoId, updates)
									}
								/>
							);
						})}
				</div>
			</div>
		</TooltipProvider>
	);
};
