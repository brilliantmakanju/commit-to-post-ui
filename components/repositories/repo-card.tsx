import { Eye, Github, Linkedin, Settings, Twitter } from "lucide-react";
import Link from "next/link";
import { FaDiscord, FaSlack } from "react-icons/fa";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { Button } from "../ui/button";

interface Repository {
	id: string;
	name: string;
	tone: string;
	created_at: string;
	description: string;
	ai_enabled: boolean;
	tracked_branch: string;
	channels_to_post: string[];
	status: "connected" | "paused" | "disconnected";
}

interface RepositoryCardProps {
	repository: Repository;
}

export function RepositoryCard({ repository: repo }: RepositoryCardProps) {
	const getStatusBadge = (status: Repository["status"]) => {
		const base =
			"text-xs px-2 py-0.5 rounded-full border font-medium pointer-events-none";

		switch (status) {
			case "connected": {
				return (
					<Badge
						className={`${base} border-zinc-600 bg-zinc-800 text-zinc-200`}
					>
						Connected
					</Badge>
				);
			}
			case "paused": {
				return (
					<Badge
						className={`${base} border-zinc-600 bg-zinc-800 text-zinc-300`}
					>
						Paused
					</Badge>
				);
			}
			case "disconnected": {
				return (
					<Badge
						className={`${base} border-zinc-600 bg-zinc-800 text-zinc-400`}
					>
						Disconnected
					</Badge>
				);
			}
			default: {
				return (
					<Badge
						className={`${base} border-zinc-600 bg-zinc-800 text-zinc-300`}
					>
						{status}
					</Badge>
				);
			}
		}
	};

	const getChannelIcons = (channels: string[]) => {
		if (channels.length === 0)
			return <span className="text-xs text-zinc-500">None</span>;

		const iconMap: Record<string, JSX.Element> = {
			linkedin: <Linkedin className="h-4 w-4 text-zinc-400" />,
			twitter: <Twitter className="h-4 w-4 text-zinc-400" />,
			slack: <FaSlack className="h-4 w-4 text-zinc-400" />,
			discord: <FaDiscord className="h-4 w-4 text-zinc-400" />,
		};

		return (
			<div className="flex items-center gap-1">
				{channels.slice(0, 5).map(channel => (
					<span key={channel}>{iconMap[channel]}</span>
				))}
				{channels.length > 5 && (
					<span className="ml-1 text-xs text-zinc-500">
						+{channels.length - 5}
					</span>
				)}
			</div>
		);
	};

	return (
		<Link href={`/repositories/${repo.id}`} className="block">
			<Card className="group relative flex flex-col justify-between rounded-lg border border-zinc-800/50 bg-zinc-900/30 backdrop-blur-sm transition-all hover:border-zinc-700/50 hover:bg-zinc-900/50">
				<CardHeader className="border-b border-zinc-800/50 px-5 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="flex h-9 w-9 items-center justify-center rounded-md bg-zinc-800/50">
								<Github className="h-5 w-5 text-zinc-400" />
							</div>
							<div>
								<p className="text-sm font-semibold text-zinc-100">
									{repo.name}
								</p>
								<p className="text-xs capitalize text-zinc-500">{repo.tone}</p>
							</div>
						</div>
						{getStatusBadge(repo.status)}
					</div>
				</CardHeader>

				<CardContent className="flex flex-col justify-between gap-4 px-5 py-4">
					<div className="space-y-3 text-sm">
						<div className="flex items-center justify-between">
							<span className="text-zinc-500">AI Enabled</span>
							<span className="font-medium text-zinc-300">
								{repo.ai_enabled ? "Yes" : "No"}
							</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-zinc-500">Platforms</span>
							{getChannelIcons(repo.channels_to_post)}
						</div>
						<div className="flex items-center justify-between">
							<span className="text-zinc-500">Branch</span>
							<span className="font-mono text-sm text-zinc-300">
								{repo.tracked_branch}
							</span>
						</div>
					</div>
				</CardContent>

				<div
					className="flex items-center justify-end gap-2 border-t border-zinc-800/50 px-5 py-3"
					onClick={event_ => event_.stopPropagation()}
				>
					<Link href={`/repositories/${repo.id}?page=posts`}>
						<Button
							size="sm"
							variant="ghost"
							className="text-sm text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
							onClick={event_ => event_.stopPropagation()}
						>
							<Eye className="mr-2 h-4 w-4" />
							View Posts
						</Button>
					</Link>
					<Link href={`/repositories/${repo.id}?page=settings`}>
						<Button
							size="sm"
							variant="ghost"
							className="text-sm text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
							onClick={event_ => event_.stopPropagation()}
						>
							<Settings className="mr-2 h-4 w-4" />
							Settings
						</Button>
					</Link>
				</div>
			</Card>
		</Link>
	);
}
