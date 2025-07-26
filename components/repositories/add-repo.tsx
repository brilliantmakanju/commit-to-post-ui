/* eslint-disable import/no-unresolved */
"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
	Check,
	ExternalLink,
	Github,
	Info,
	Loader2,
	Pause,
	PauseCircleIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaStar } from "react-icons/fa";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGithubConnectedStatus } from "@/hooks/settings/use-github-connected";
import { cn } from "@/lib/utils";
import { connectGithubRepoBatch } from "@/server-actions/user-actions/connect-git-repo";
import { getGitHubRepos } from "@/server-actions/user-actions/get-repos";
import useUserStore from "@/zustand/useuser-store";

interface AddRepositoryModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess: () => void;
}

interface GitHubRepo {
	id: number;
	name: string;
	full_name: string;
	private: boolean;
	description: string | null;
	stargazers_count: number;
	language: string | null;
	updated_at: string;
	permissions: {
		admin: boolean;
		maintain: boolean;
		push: boolean;
		triage: boolean;
		pull: boolean;
	};
	owner: {
		login: string;
		id: number;
	};
	html_url: string;
	default_branch: string;
	is_connected: boolean;
	connected_repo_id: number | null;
	status: string | null;
	connected_by_user_id: number | null;
}

interface GitHubReposResponse {
	repos: GitHubRepo[];
	page: number;
	has_next: boolean;
}

type RepoSetting = {
	tone: string;
	branch: string;
	aiEnabled: boolean;
};

export function AddRepositoryModal({
	open,
	onSuccess,
	onOpenChange,
}: AddRepositoryModalProps) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [isLoading, setIsLoading] = useState(false);
	const githubConnected = useGithubConnectedStatus();
	const [searchQuery, setSearchQuery] = useState("");
	const [repoFilter, setRepoFilter] = useState("all");
	const [selectedRepo, setSelectedRepo] = useState<string[]>([]);
	const [currentStep, setCurrentStep] = useState(githubConnected ? 2 : 1);

	const [repoSettings, setRepoSettings] = useState<Record<string, RepoSetting>>(
		{},
	);

	const [webhookProgress, setWebhookProgress] = useState(0);
	const [webhookStatus, setWebhookStatus] = useState<
		"idle" | "setting-up" | "success" | "error"
	>("idle");

	const { data: gitHubData, isLoading: isLoadingRepos } = useQuery({
		queryKey: ["gitRepos"],
		queryFn: async () => {
			const result = await getGitHubRepos();
			if (!result.success) {
				toast.error("Connection failed", {
					description: "Failed to fetch repos.",
				});
			}
			return result.data as GitHubReposResponse;
		},
		enabled: githubConnected,
	});

	const repositories = gitHubData?.repos || [];

	// Use real backend data instead of mock status
	const repositoriesWithStatus = repositories.map(repo => ({
		...repo,
		// Determine connection status based on backend fields
		connection_status: repo.is_connected
			? repo.status === "paused"
				? "paused"
				: "connected"
			: repo.status === "disconnected"
				? "disconnected"
				: undefined,
	}));

	const filteredRepos = repositoriesWithStatus.filter(repo => {
		const matchesSearch =
			repo.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			(repo.description &&
				repo.description.toLowerCase().includes(searchQuery.toLowerCase()));

		const matchesFilter = (() => {
			switch (repoFilter) {
				default: {
					return true;
				}
			}
		})();

		return matchesSearch && matchesFilter;
	});

	// Organize repos by their actual connection status
	const connectedRepos = filteredRepos.filter(
		repo => repo.is_connected && repo.status !== "paused",
	);
	const pausedRepos = filteredRepos.filter(
		repo => repo.is_connected && repo.status === "paused",
	);
	const availableRepos = filteredRepos.filter(
		repo => !repo.is_connected && !repo.status,
	);

	const handleConnectGitHub = () => {
		setIsLoading(true);
		router.push(
			`https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GIT_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_SITE_URL}/&scope=repo,admin:repo_hook,read:user&prompt=consent`,
		);
	};

	const handleRepoSelection = (repoId: string) => {
		setSelectedRepo(previous => {
			const alreadySelected = previous.includes(repoId);
			return alreadySelected
				? previous.filter(id => id !== repoId)
				: [...previous, repoId];
		});

		// If repo isn't already in settings, set default
		const repo = repositoriesWithStatus.find(r => r.id.toString() === repoId);
		if (repo && !repoSettings[repoId]) {
			setRepoSettings(previous => ({
				...previous,
				[repoId]: {
					branch: repo.default_branch,
					tone: "professional",
					aiEnabled: true,
				},
			}));
		}
	};

	const handleNext = () => {
		if (currentStep === 2 && !selectedRepo) {
			toast.error("No repository selected", {
				description: "Please select at least one repository.",
			});

			return;
		}

		if (currentStep === 3) {
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

			// Post-success logic
			toast.success("Repositories connected!", {
				description: "Webhook configured successfully.",
				duration: 5000,
				closeButton: true,
			});

			onSuccess();
			onOpenChange(false);
			setCurrentStep(1);
			setSelectedRepo([]);
			setRepoSettings({});
			setWebhookStatus("idle");
			setWebhookProgress(0);

			queryClient.invalidateQueries({ queryKey: ["connected_repos"] });
		} catch (error: any) {
			setWebhookStatus("error");
			toast.error(error?.message || "Failed to setup webhooks.", {
				duration: 7000,
				closeButton: true,
			});
		}
	};

	const getRepoStatusBadge = (repo: GitHubRepo) => {
		if (repo.is_connected && repo.status !== "paused") {
			return (
				<Badge className="bg-green-100 text-green-800 hover:bg-green-100">
					Connected
				</Badge>
			);
		}
		if (repo.is_connected && repo.status === "paused") {
			return <Badge variant="secondary">Paused</Badge>;
		}
		if (repo.status === "disconnected") {
			return <Badge variant="destructive">Disconnected</Badge>;
		}
		return;
	};

	const renderStepContent = () => {
		switch (currentStep) {
			case 1: {
				return (
					<div className="space-y-6">
						<div className="space-y-4 text-center">
							<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
								<Github className="h-8 w-8" />
							</div>
							<div>
								<h3 className="text-lg font-medium">Connect Git Provider</h3>
								<p className="text-sm text-muted-foreground">
									Connect your GitHub account to access your repositories
								</p>
							</div>
						</div>
						<div className="space-y-3">
							<Button
								onClick={handleConnectGitHub}
								disabled={isLoading || githubConnected}
								className="w-full"
								size="lg"
							>
								{isLoading ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Connecting...
									</>
								) : githubConnected ? (
									<>
										<Check className="mr-2 h-4 w-4" />
										Connected to GitHub
									</>
								) : (
									<>
										<Github className="mr-2 h-4 w-4" />
										Connect with GitHub
									</>
								)}
							</Button>
							<div className="grid grid-cols-2 gap-2">
								<Button
									variant="outline"
									disabled
									className="bg-transparent opacity-50"
								>
									<svg
										className="mr-2 h-4 w-4"
										viewBox="0 0 24 24"
										fill="currentColor"
									>
										<path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 4.82 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.16l2.44 7.49h8.1l2.44-7.51A.42.42 0 0 1 18.6 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.16l2.44 7.51 1.22 3.78a.84.84 0 0 1-.3.94z" />
									</svg>
									GitLab (Coming Soon)
								</Button>
								<Button
									variant="outline"
									disabled
									className="bg-transparent opacity-50"
								>
									<svg
										className="mr-2 h-4 w-4"
										viewBox="0 0 24 24"
										fill="currentColor"
									>
										<path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
									</svg>
									Bitbucket (Coming Soon)
								</Button>
							</div>
						</div>
					</div>
				);
			}

			case 2: {
				return (
					<div className="space-y-6">
						<div>
							<h3 className="text-lg font-medium">Select Repository</h3>
							<p className="text-sm text-muted-foreground">
								Choose a repository to connect for automated social media posts
							</p>
						</div>

						<div className="space-y-4">
							<div className="flex gap-2">
								<div className="flex-1">
									<Input
										placeholder="Search repositories..."
										value={searchQuery}
										onChange={event_ => setSearchQuery(event_.target.value)}
									/>
								</div>
							</div>

							<div className="scrollbar-hide max-h-80 space-y-6 overflow-y-auto">
								{isLoadingRepos ? (
									<div className="flex items-center justify-center py-8">
										<Loader2 className="h-6 w-6 animate-spin" />
										<span className="ml-2">Loading repositories...</span>
									</div>
								) : (
									<>
										{/* Available Repositories - Primary Selection */}
										{availableRepos.map(repo => {
											const isSelected = selectedRepo.includes(
												repo.id.toString(),
											);
											const repoSelectLimitReached = selectedRepo.length >= 4;

											// Only disable checkbox if user hit limit and this one isn't already selected
											const shouldDisable =
												repoSelectLimitReached && !isSelected;

											return (
												<div
													key={repo.id}
													className={cn(
														"flex items-center space-x-3 rounded-lg border p-4 transition-all",
														"cursor-pointer hover:bg-muted/50",
														shouldDisable && "cursor-not-allowed opacity-50",
													)}
													onClick={() => {
														if (!shouldDisable) {
															handleRepoSelection(repo.id.toString());
														}
													}}
												>
													<input
														type="checkbox"
														checked={isSelected}
														onChange={() =>
															handleRepoSelection(repo.id.toString())
														}
														disabled={shouldDisable}
														className="form-checkbox h-4 w-4 text-primary"
													/>

													<div className="flex-1">
														<div className="flex items-center space-x-2">
															<Label className="cursor-pointer font-medium">
																{repo.name}
															</Label>

															{repo.private && (
																<Badge variant="secondary" className="text-xs">
																	Private
																</Badge>
															)}
															{repo.language && (
																<Badge variant="outline" className="text-xs">
																	{repo.language}
																</Badge>
															)}
														</div>

														{repo.description && (
															<p className="mt-1 text-sm text-muted-foreground">
																{repo.description}
															</p>
														)}

														<div className="mt-2 flex items-center space-x-3 text-xs text-muted-foreground">
															<span className="flex gap-2">
																<FaStar className="text-yellow-300" />{" "}
																{repo.stargazers_count}
															</span>
															<span>Default: {repo.default_branch}</span>
															<span>
																Updated{" "}
																{new Date(repo.updated_at).toLocaleDateString()}
															</span>
														</div>
													</div>
												</div>
											);
										})}

										{/* Paused Repositories - Reconnection Options */}
										{pausedRepos.length > 0 && (
											<div className="space-y-3">
												<h4 className="text-sm font-medium text-amber-700">
													Paused Repositories
												</h4>
												<p className="text-xs text-muted-foreground">
													These repositories were previously connected but are
													currently paused
												</p>
												{pausedRepos.map(repo => (
													<div
														key={repo.id}
														onClick={() => {
															toast.info("Repository Settings", {
																description:
																	"Redirecting to repository settings...",
															});

															// In real app: navigate to repo settings
															setTimeout(() => {
																globalThis.location.href = `/repositories/${repo.id}/settings`;
															}, 1000);
														}}
														className="flex cursor-pointer items-center space-x-3 rounded-lg border border-amber-200 bg-amber-50/50 p-4 hover:bg-amber-50"
													>
														<div className="flex h-4 w-4 items-center justify-center">
															<PauseCircleIcon className="h-10 w-10 text-amber-700" />
														</div>
														<div className="flex-1">
															<div className="flex items-center justify-between">
																<div className="flex items-center space-x-2">
																	<Label
																		htmlFor={repo.id.toString()}
																		className="cursor-pointer font-medium"
																	>
																		{repo.name}
																	</Label>
																	<Badge variant="secondary">Paused</Badge>
																</div>
															</div>
															{repo.description && (
																<p className="mt-1 text-sm text-muted-foreground">
																	{repo.description}
																</p>
															)}
															<p className="mt-1 text-xs text-amber-700">
																Click to resume tracking this repository
															</p>
														</div>
													</div>
												))}
											</div>
										)}

										{/* Connected Repositories - View Only */}
										{connectedRepos.length > 0 && (
											<div className="space-y-3">
												<h4 className="text-sm font-medium text-green-700">
													Connected Repositories
												</h4>
												<p className="text-xs text-muted-foreground">
													These repositories are already connected and active
												</p>
												{connectedRepos.map(repo => (
													<div
														key={repo.id}
														className="flex items-center space-x-3 rounded-lg border border-green-200 bg-green-50/50 p-4 hover:bg-green-50"
														// onClick={() => {
														// 	toast.info("Repository Settings", {
														// 		description:
														// 			"Redirecting to repository settings...",
														// 	});

														// 	// In real app: navigate to repo settings
														// 	setTimeout(() => {
														// 		globalThis.location.href = `/repositories/${repo.id}/settings`;
														// 	}, 1000);
														// }}
													>
														<div className="flex h-4 w-4 items-center justify-center">
															<Check className="h-3 w-3 text-green-600" />
														</div>
														<div className="flex-1">
															<div className="flex items-center justify-between">
																<div className="flex items-center space-x-2">
																	<span className="font-medium">
																		{repo.name}
																	</span>
																	{getRepoStatusBadge(repo)}
																</div>
																{/* <ExternalLink className="h-4 w-4 text-muted-foreground" /> */}
															</div>
															{/* {repo.description && (
																<p className="mt-1 text-sm text-muted-foreground">
																	{repo.description}
																</p>
															)} */}
															{/* <p className="mt-1 text-xs text-green-700">
																Click to view settings and manage this
																repository
															</p> */}
														</div>
													</div>
												))}
											</div>
										)}

										{/* No Results */}
										{availableRepos.length === 0 &&
											pausedRepos.length === 0 &&
											connectedRepos.length === 0 && (
												<div className="py-8 text-center text-muted-foreground">
													No repositories found matching your criteria
												</div>
											)}
									</>
								)}
							</div>
						</div>
					</div>
				);
			}

			case 3: {
				return (
					<TooltipProvider>
						<div className="space-y-6">
							{selectedRepo
								.filter(repoId => !!repoId && repoSettings[repoId])
								.map(repoId => {
									const repo = repositoriesWithStatus.find(
										r => r.id.toString() === repoId,
									);
									const settings = repoSettings[repoId];
									const isPausedRepo = repo?.connection_status === "paused";

									return (
										<div
											key={repoId}
											className="space-y-6 border-t pt-6 first:border-t-0 first:pt-0"
										>
											<div>
												<h3 className="text-lg font-medium">
													{isPausedRepo
														? "Resume Repository"
														: `Configure ${repo?.name}`}
												</h3>
												<p className="text-sm text-muted-foreground">
													{isPausedRepo
														? `Resume tracking for ${repo?.full_name}`
														: `Set up automated post generation for ${repo?.full_name}`}
												</p>
											</div>

											{/* Branch to Track */}
											<div className="space-y-3">
												<div className="flex items-center space-x-2">
													<Label htmlFor={`branch-${repoId}`}>
														Branch to Track
													</Label>
													<Tooltip>
														<TooltipTrigger>
															<Info className="h-4 w-4 text-muted-foreground" />
														</TooltipTrigger>
														<TooltipContent>
															<p>
																Commits pushed to this branch will trigger post
																generation
															</p>
														</TooltipContent>
													</Tooltip>
												</div>
												<Input
													id={`branch-${repoId}`}
													value={settings.branch}
													onChange={event_ =>
														setRepoSettings(previous => ({
															...previous,
															[repoId]: {
																...previous[repoId],
																branch: event_.target.value,
															},
														}))
													}
													placeholder={repo?.default_branch}
													disabled={
														webhookStatus === "setting-up" ||
														webhookStatus === "success"
													}
												/>
												<p className="text-xs text-muted-foreground">
													Repository default: {repo?.default_branch}
												</p>
											</div>

											{/* AI Post Toggle */}
											{/* <div className="space-y-3">
												<div className="flex items-center justify-between">
													<div className="space-y-0.5">
														<div className="flex items-center space-x-2">
															<Label htmlFor={`ai-enabled-${repoId}`}>
																Enable AI Post Generation
															</Label>
															<Tooltip>
																<TooltipTrigger>
																	<Info className="h-4 w-4 text-muted-foreground" />
																</TooltipTrigger>
																<TooltipContent>
																	<p>
																		Automatically generate posts from commits
																		using AI
																	</p>
																</TooltipContent>
															</Tooltip>
														</div>
														<p className="text-xs text-muted-foreground">
															Turn commits into social media content
														</p>
													</div>
													<Switch
														id={`ai-enabled-${repoId}`}
														checked={settings.aiEnabled}
														onCheckedChange={checked =>
															setRepoSettings(previous => ({
																...previous,
																[repoId]: {
																	...previous[repoId],
																	aiEnabled: checked,
																},
															}))
														}
													/>
												</div>
											</div> */}

											{/* Tone */}
											{settings.aiEnabled && (
												<div className="space-y-3">
													<div className="flex items-center space-x-2">
														<Label htmlFor={`tone-${repoId}`}>
															Default Tone
														</Label>
														<Tooltip>
															<TooltipTrigger>
																<Info className="h-4 w-4 text-muted-foreground" />
															</TooltipTrigger>
															<TooltipContent>
																<p>
																	Writing style for AI-generated posts from this
																	repo
																</p>
															</TooltipContent>
														</Tooltip>
													</div>
													<Select
														value={settings.tone}
														disabled={
															webhookStatus === "setting-up" ||
															webhookStatus === "success"
														}
														onValueChange={value =>
															setRepoSettings(previous => ({
																...previous,
																[repoId]: { ...previous[repoId], tone: value },
															}))
														}
													>
														<SelectTrigger>
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="professional">
																Professional
															</SelectItem>
															<SelectItem value="casual">Casual</SelectItem>
															<SelectItem value="enthusiastic">
																Enthusiastic
															</SelectItem>
														</SelectContent>
													</Select>
													<p className="text-xs text-muted-foreground">
														You can customize this later in repo settings
													</p>
												</div>
											)}
										</div>
									);
								})}
						</div>
					</TooltipProvider>
				);
			}

			case 4: {
				const selectedRepoNames = selectedRepo
					.filter(repoId => !!repoId && repoSettings[repoId])
					.map(
						repoId =>
							repositoriesWithStatus.find(r => r.id.toString() === repoId)
								?.full_name,
					)
					.filter(Boolean) // Remove undefineds
					.join(", ");

				return (
					<div className="space-y-6">
						<div>
							<h3 className="text-lg font-medium">Setting Up Webhook</h3>
							<p className="text-sm text-muted-foreground">
								Configuring automatic commit tracking for{" "}
								<span className="font-medium">{selectedRepoNames}</span>
							</p>
						</div>

						{webhookStatus === "setting-up" && (
							<div className="space-y-4">
								<div className="space-y-2">
									<div className="flex justify-between text-sm">
										<span>Setting up webhook...</span>
										<span>{webhookProgress}%</span>
									</div>
									<div className="h-2 w-full rounded-full bg-muted">
										<div
											className="h-2 rounded-full bg-primary transition-all duration-500"
											style={{ width: `${webhookProgress}%` }}
										/>
									</div>
								</div>
								<div className="text-sm text-muted-foreground">
									{webhookProgress < 40 && "Connecting to GitHub API..."}
									{webhookProgress >= 40 &&
										webhookProgress < 80 &&
										"Installing webhook..."}
									{webhookProgress >= 80 && "Finalizing configuration..."}
								</div>
							</div>
						)}

						{webhookStatus === "success" && (
							<div className="space-y-4 text-center">
								<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
									<Check className="h-8 w-8 text-green-600" />
								</div>
								<div>
									<h4 className="font-medium text-green-900">
										Webhook Configured Successfully!
									</h4>
									<p className="text-sm text-muted-foreground">
										Your repositories are now connected and ready to generate
										posts from commits.
									</p>
								</div>
							</div>
						)}

						{webhookStatus === "idle" && (
							<div className="space-y-4">
								<div className="space-y-3 rounded-lg border p-4">
									<div className="flex items-center justify-between">
										<h4 className="font-medium">Automatic Setup</h4>
										<Badge className="bg-green-100 text-green-800">
											Recommended
										</Badge>
									</div>
									<p className="text-sm text-muted-foreground">
										We&#39;ll automatically install a webhook on your selected
										repositories using the GitHub API.
									</p>
									<Button onClick={handleWebhookSetup} className="w-full">
										Set Up Webhooks Automatically
									</Button>
								</div>
							</div>
						)}
					</div>
				);
			}

			default: {
				return;
			}
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="flex max-h-[700px] flex-col items-start justify-start gap-3 sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>Add New Repository</DialogTitle>
					<DialogDescription>
						Step {currentStep} of 3: Connect your Git repository to start
						generating social media posts
					</DialogDescription>
				</DialogHeader>

				{/* Progress indicator */}
				<div className="mb-6 flex items-center space-x-2">
					{[1, 2, 3].map(step => (
						<div key={step} className="flex items-center">
							<div
								className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
									step <= currentStep
										? "bg-primary text-primary-foreground"
										: "bg-muted text-muted-foreground"
								}`}
							>
								{step < currentStep ? <Check className="h-4 w-4" /> : step}
							</div>
							{step < 3 && (
								<div
									className={`h-0.5 w-8 ${step < currentStep ? "bg-primary" : "bg-muted"}`}
								/>
							)}
						</div>
					))}
				</div>

				<div className="scrollbar-hide h-full w-full overflow-hidden overflow-y-auto px-3">
					{renderStepContent()}
				</div>

				<div className="flex w-full items-center justify-between pt-6">
					<Button
						variant="outline"
						onClick={() =>
							currentStep > 1
								? setCurrentStep(currentStep - 1)
								: onOpenChange(false)
						}
						disabled={isLoading || webhookStatus === "setting-up"}
					>
						{currentStep === 1 ? "Cancel" : "Back"}
					</Button>
					<Button
						onClick={currentStep === 3 ? handleWebhookSetup : handleNext}
						disabled={
							isLoading ||
							webhookStatus === "setting-up" ||
							webhookStatus === "success" ||
							(currentStep === 1 && !githubConnected) ||
							(currentStep === 2 && selectedRepo.length === 0)
						}
					>
						{webhookStatus === "setting-up" ? (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						) : undefined}
						{currentStep === 3 ? "Set Up Repo" : "Next"}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
