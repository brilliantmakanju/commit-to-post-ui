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
		const base = "text-xs px-2 py-0.5 rounded-full border font-medium";

		// Add 'pointer-events-none' to prevent interaction that might trigger hover effects.
		const commonClasses = `${base} pointer-events-none`;

		switch (status) {
			case "connected": {
				return (
					<Badge
						className={`${commonClasses} border-green-500 bg-green-100 text-green-800`}
					>
						Connected
					</Badge>
				);
			}
			case "paused": {
				return (
					<Badge
						className={`${commonClasses} border-yellow-500 bg-yellow-100 text-yellow-800`}
					>
						Paused
					</Badge>
				);
			}
			case "disconnected": {
				return (
					<Badge
						className={`${commonClasses} border-red-500 bg-red-100 text-red-800`}
					>
						Disconnected
					</Badge>
				);
			}
			default: {
				return (
					<Badge
						className={`${commonClasses} border-gray-300 bg-gray-100 text-gray-700`}
					>
						{status}
					</Badge>
				);
			}
		}
	};

	const getChannelIcons = (channels: string[]) => {
		if (channels.length === 0)
			return <span className="text-xs text-gray-500">None</span>;

		const iconMap: Record<string, JSX.Element> = {
			linkedin: <Linkedin className="h-4 w-4 text-gray-600" />,
			twitter: <Twitter className="h-4 w-4 text-gray-600" />,
			slack: <FaSlack className="h-4 w-4 text-gray-600" />,
			discord: <FaDiscord className="h-4 w-4 text-gray-600" />,
		};

		return (
			<div className="flex items-center gap-1">
				{channels.slice(0, 5).map(channel => (
					<span key={channel}>{iconMap[channel]}</span>
				))}
				{channels.length > 5 && (
					<span className="ml-1 text-xs text-gray-500">
						+{channels.length - 5}
					</span>
				)}
			</div>
		);
	};

	return (
		<Link href={`/repositories/${repo.id}`} className="block">
			<Card className="group relative flex flex-col justify-between rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-lg">
				<CardHeader className="border-b border-gray-100 px-5 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="flex h-9 w-9 items-center justify-center rounded-md bg-gray-100">
								<Github className="h-5 w-5 text-gray-600" />
							</div>
							<div>
								<p className="text-sm font-semibold text-gray-900">
									{repo.name}
								</p>
								<p className="text-xs capitalize text-gray-500">{repo.tone}</p>
							</div>
						</div>
						{getStatusBadge(repo.status)}
					</div>
				</CardHeader>

				<CardContent className="flex flex-col justify-between gap-4 px-5 py-4">
					<div className="space-y-3 text-sm text-gray-700">
						<div className="flex items-center justify-between">
							<span className="text-gray-500">AI Enabled</span>
							<span className="font-medium">
								{repo.ai_enabled ? "Yes" : "No"}
							</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-gray-500">Platforms</span>
							{getChannelIcons(repo.channels_to_post)}
						</div>
						<div className="flex items-center justify-between">
							<span className="text-gray-500">Branch</span>
							<span className="font-mono text-sm">{repo.tracked_branch}</span>
						</div>
					</div>
				</CardContent>

				<div
					className="flex items-center justify-end gap-2 border-t border-gray-100 px-5 py-3"
					onClick={event_ => event_.stopPropagation()}
				>
					<Link href={`/repositories/${repo.id}?page=posts`}>
						<Button
							size="sm"
							variant="ghost"
							className="text-sm text-gray-600 hover:bg-gray-100"
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
							className="text-sm text-gray-600 hover:bg-gray-100"
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
