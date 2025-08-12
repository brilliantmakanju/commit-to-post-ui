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
import { useState } from "react";
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
	twitter: FaTwitter,
	discord: FaDiscord,
	linkedin: FaLinkedin,
};

export function RepoHeader({ repo_id, onTogglePause }: RepoHeaderProps) {
	const [isToggling, setIsToggling] = useState(false);

	const {
		repoDetails: repository,
		isLoadingRepoDetails,
		isError,
	} = useRepoDetails(repo_id);

	const handleTogglePause = async () => {
		setIsToggling(true);
		try {
			onTogglePause();
		} finally {
			setIsToggling(false);
		}
	};

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
		<header className="border-b border-zinc-800 pb-8">
			{/* Back Navigation */}
			<div className="mb-6">
				<Link href="/repositories" passHref>
					<Button size="sm" variant="ghost" className="text-neutral-400">
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back
					</Button>
				</Link>
			</div>

			{/* Main Header Content */}
			<div className="flex items-center justify-between">
				{/* Repository Info */}
				<div className="flex items-center gap-4">
					<div className="rounded-lg bg-zinc-900 p-3 ring-1 ring-zinc-800">
						<FaGithub className="h-6 w-6 text-white" />
					</div>
					<div>
						<h1 className="mb-1 text-2xl font-medium text-white">
							{repository.name}
						</h1>
						<div className="flex items-center gap-6">
							{/* Social Connections */}
							<div className="flex items-center gap-3">
								{Object.entries(repository.social_connections).map(
									([platform, connected]) => {
										const Icon =
											socialIcons[platform as keyof typeof socialIcons];
										if (!Icon) return;

										return (
											<div
												key={platform}
												className="flex items-center gap-1.5"
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
					</div>
				</div>

				{/* Actions */}
				<div className="flex items-center gap-4">
					<Button
						size="sm"
						variant="outline"
						onClick={handleTogglePause}
						disabled={isToggling}
						className="w-[90px] text-arch-dark"
						title={
							repository.status === "connected"
								? "Pause tracking"
								: "Resume tracking"
						}
					>
						{isToggling ? (
							<>
								<Loader2 className="mr-1 h-4 w-4 animate-spin" />
								{repository.status === "connected"
									? "Pausing..."
									: "Resuming..."}
							</>
						) : repository.status === "connected" ? (
							<>
								<Pause className="mr-1 h-4 w-4" />
								Pause
							</>
						) : (
							<>
								<Play className="mr-1 h-4 w-4" />
								Resume
							</>
						)}
					</Button>
				</div>
			</div>
		</header>
	);
}
