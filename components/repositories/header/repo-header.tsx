"use client";

import {
	AlertTriangle,
	ArrowLeft,
	CheckCircle2,
	Loader2,
	Pause,
	Play,
	XCircle,
} from "lucide-react";
import Link from "next/link";
import {
	FaDiscord,
	FaGithub,
	FaLinkedin,
	FaSlack,
	FaTwitter,
} from "react-icons/fa";

// eslint-disable-next-line import/no-unresolved
import { Button } from "@/components/ui/button";
// eslint-disable-next-line import/no-unresolved
import useRepoDetails from "@/hooks/core/repo/get-repo-detail-hook";

import RepoHeaderSkeleton from "./repo-header-skeleton";

interface RepoHeaderProps {
	repo_id: string;
	onTogglePause: () => void;
}

const statusMap = {
	success: {
		icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
		label: "Webhook working fine",
	},
	failed: {
		icon: <XCircle className="h-4 w-4 text-red-500" />,
		label: "Webhook has errors",
	},
	pending: {
		icon: <Loader2 className="h-4 w-4 animate-spin text-yellow-400" />,
		label: "Webhook hasn't been triggered yet",
	},
	missing: {
		icon: <AlertTriangle className="h-4 w-4 text-orange-500" />,
		label: "Webhook not set up",
	},
} satisfies Record<string, { icon: JSX.Element; label: string }>;

const socialIcons = {
	slack: FaSlack,
	// twitter: FaTwitter,
	discord: FaDiscord,
	linkedin: FaLinkedin,
};

export function RepoHeader({ repo_id, onTogglePause }: RepoHeaderProps) {
	const {
		repoDetails: repository,
		isLoadingRepoDetails,
		isError,
	} = useRepoDetails(repo_id);

	if (isLoadingRepoDetails) {
		return <RepoHeaderSkeleton />;
	}

	if (isError || !repository) {
		return (
			<div className="flex flex-col items-center justify-center gap-3 py-10 text-center text-red-400">
				<AlertTriangle className="h-6 w-6" />
				<h2 className="text-base font-semibold">
					Repo does not exists Failed to load repository
				</h2>
			</div>
		);
	}

	const webhookStatus = repository.last_webhook.status as
		| "success"
		| "failed"
		| "pending"
		| "missing";

	return (
		<header className="flex flex-col justify-between gap-6 border-b border-zinc-800 pb-6 sm:flex-row sm:items-start sm:gap-6">
			{/* LEFT BLOCK */}
			<div className="flex flex-col gap-4">
				<div className="flex items-center gap-3">
					<Link href="/repositories" passHref>
						<Button size="sm" variant="ghost" className="text-neutral-400">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back
						</Button>
					</Link>

					<div className="flex items-center gap-2">
						<div className="rounded-full bg-zinc-900 p-2 ring-1 ring-zinc-800">
							<FaGithub className="h-5 w-5 text-white" />
						</div>
						<h1 className="text-xl font-semibold leading-none text-white">
							{repository.name}
						</h1>
					</div>
				</div>

				<div className="flex items-center gap-2 text-sm text-zinc-400">
					{statusMap[webhookStatus]?.icon}
					<span>{statusMap[webhookStatus]?.label}</span>
				</div>
			</div>

			{/* RIGHT BLOCK */}
			<div className="flex flex-col items-start gap-4 sm:items-end">
				<Button
					size="sm"
					variant="outline"
					onClick={onTogglePause}
					className="border-neutral-700 bg-black text-white"
					title={
						repository.status === "connected"
							? "Pause tracking"
							: "Resume tracking"
					}
				>
					{repository.status === "connected" ? (
						<>
							<Pause className="mr-2 h-4 w-4" />
							Pause
						</>
					) : (
						<>
							<Play className="mr-2 h-4 w-4" />
							Resume
						</>
					)}
				</Button>

				{/* SOCIAL ICONS */}
				<div className="flex flex-wrap items-center justify-end gap-3 text-sm text-neutral-400">
					{Object.entries(repository.social_connections).map(
						([platform, connected]) => {
							const Icon = socialIcons[platform as keyof typeof socialIcons];
							if (!Icon) return;

							return (
								<div
									key={platform}
									className="flex items-center gap-1"
									title={`${platform.charAt(0).toUpperCase() + platform.slice(1)}: ${connected ? "Connected" : "Not connected"}`}
								>
									<Icon
										className={`h-4 w-4 ${
											connected ? "text-green-500" : "text-zinc-600"
										}`}
									/>
									{connected ? (
										<CheckCircle2 className="h-3 w-3 text-green-500" />
									) : (
										<XCircle className="h-3 w-3 text-zinc-600" />
									)}
								</div>
							);
						},
					)}
				</div>
			</div>
		</header>
	);
}
