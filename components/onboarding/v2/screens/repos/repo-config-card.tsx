/* eslint-disable import/no-unresolved */
import { Info } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";

import { SocialConnection } from "./social-connection";
import { GitHubRepo, RepoSetting } from "./type";

const getInitials = (name: string): string => {
	return name
		.split(" ")
		.map(word => word[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
};

interface RepoConfigCardProps {
	repo: GitHubRepo;
	settings: RepoSetting;
	webhookStatus: "idle" | "setting-up" | "success" | "error";
	onOpenSocialConnect: (repoId: string) => void;
	onUpdateSettings: (updates: Partial<RepoSetting>) => void;
}

export const RepoConfigCard: React.FC<RepoConfigCardProps> = ({
	repo,
	settings,
	webhookStatus,
	onOpenSocialConnect,
	onUpdateSettings,
}) => {
	const handleRemoveSocial = (index: number) => {
		const newSocials = settings.socials.filter((_, index_) => index_ !== index);
		onUpdateSettings({ socials: newSocials });
	};

	return (
		<div className="overflow-hidden rounded-2xl border border-gray-200">
			{/* Header Section */}
			<div className="border-b border-gray-200 bg-gray-50 px-6 py-5">
				<div className="flex items-center justify-between">
					<div className="flex items-start gap-4 md:items-center">
						<div className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-300 bg-white">
							{getInitials(repo?.name || "DA")}
						</div>
						<div>
							<h3 className="text-lg font-semibold text-gray-900">
								{repo?.name}
							</h3>
							<p className="mt-0.5 text-sm text-gray-600">{repo?.full_name}</p>
							<Button
								variant="outline"
								onClick={() => onOpenSocialConnect(repo.id.toString())}
								className="mt-2 flex border-gray-300 bg-white px-6 text-gray-700 hover:border-gray-900 hover:text-gray-900 md:hidden"
							>
								Connect social
							</Button>
						</div>
					</div>
					<Button
						variant="outline"
						onClick={() => onOpenSocialConnect(repo.id.toString())}
						className="hidden border-gray-300 bg-white px-6 text-gray-700 hover:border-gray-900 hover:text-gray-900 md:flex"
					>
						Connect social
					</Button>
				</div>
			</div>

			<div className="flex w-full flex-col items-start justify-start gap-4 px-6 py-5">
				{/* Branch Configuration */}
				<div className="w-full space-y-2">
					<div className="flex items-center space-x-2">
						<Label
							htmlFor={`branch-${repo.id}`}
							className="font-medium text-arch-black"
						>
							Branch to Track
						</Label>
						<Tooltip>
							<TooltipTrigger>
								<Info className="h-4 w-4 text-gray-600" />
							</TooltipTrigger>
							<TooltipContent>
								<p>
									Commits pushed to this branch will trigger post generation
								</p>
							</TooltipContent>
						</Tooltip>
					</div>
					<Input
						id={`branch-${repo.id}`}
						value={settings.branch}
						placeholder={repo?.default_branch}
						onChange={event_ =>
							onUpdateSettings({ branch: event_.target.value })
						}
						disabled={
							webhookStatus === "setting-up" || webhookStatus === "success"
						}
					/>
				</div>

				{/* Tone Configuration */}
				{settings.aiEnabled && (
					<div className="w-full space-y-2">
						<div className="flex items-center space-x-2">
							<Label
								htmlFor={`tone-${repo.id}`}
								className="font-medium text-arch-black"
							>
								Default Tone
							</Label>
							<Tooltip>
								<TooltipTrigger>
									<Info className="h-4 w-4 text-gray-600" />
								</TooltipTrigger>
								<TooltipContent>
									<p>Writing style for generated posts from this repository</p>
								</TooltipContent>
							</Tooltip>
						</div>
						<Select
							value={settings.tone}
							disabled={
								webhookStatus === "setting-up" || webhookStatus === "success"
							}
							onValueChange={value => onUpdateSettings({ tone: value })}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="professional">Professional</SelectItem>
								<SelectItem value="casual">Casual</SelectItem>
								<SelectItem value="enthusiastic">Enthusiastic</SelectItem>
							</SelectContent>
						</Select>
					</div>
				)}

				<SocialConnection
					socials={settings.socials}
					onRemoveSocial={handleRemoveSocial}
				/>
			</div>
		</div>
	);
};
