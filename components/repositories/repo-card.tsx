"use client";
import Link from "next/link";
import {
	FaDiscord,
	FaGithub,
	FaLinkedin,
	FaSlack,
	FaTwitter,
} from "react-icons/fa";

import { Badge } from "@/components/ui/badge";

interface SocialIntegration {
	id: string;
	connected: boolean;
	display_name: string;
	handle?: string;
	profile_image_url?: string;
	profile_url?: string;
	connected_by: string;
	connected_at: string;
	details?: any;
	token_expiry?: string;
	is_token_expired: boolean;
}

interface SocialConnections {
	connected_integrations: {
		twitter?: SocialIntegration[];
		linkedin?: SocialIntegration[];
		slack?: SocialIntegration[];
		discord?: SocialIntegration[];
	};
	summary: string;
	total_count: number;
}

interface RepositorySettings {
	ai_enabled: boolean;
	tracked_branch: string;
	ai_tone: string;
	auto_publish: boolean;
	manual_approval: boolean;
	connected_integration_ids: string[];
}

interface RepositoryStats {
	pending_posts: number;
	webhook_status: string;
	last_synced: string;
}

interface Repository {
	id: string;
	name: string;
	full_name: string;
	description?: string;
	status: "connected" | "paused" | "disconnected";
	connected_by: string;
	social_connections: SocialConnections;
	settings: RepositorySettings;
	stats: RepositoryStats;
}

interface RepositoryCardProps {
	repository: Repository;
}

const XIcon: React.FC<{ className?: string }> = ({ className }) => (
	<svg viewBox="0 0 24 24" className={className} fill="currentColor">
		<path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932L18.901 1.153ZM17.61 20.644h2.039L6.486 3.24H4.298L17.61 20.644Z" />
	</svg>
);
export function RepositoryCard({ repository: repo }: RepositoryCardProps) {
	const getStatusBadge = (status: Repository["status"]) => {
		switch (status) {
			case "connected": {
				return (
					<Badge className="border-green-500/30 bg-green-500/10 text-xs font-medium text-green-400">
						Connected
					</Badge>
				);
			}
			case "paused": {
				return (
					<Badge className="border-yellow-500/30 bg-yellow-500/10 text-xs font-medium text-yellow-400">
						Paused
					</Badge>
				);
			}
			case "disconnected": {
				return (
					<Badge className="border-red-500/30 bg-red-500/10 text-xs font-medium text-red-400">
						Disconnected
					</Badge>
				);
			}
			default: {
				return (
					<Badge className="border-zinc-600 bg-zinc-800 text-xs font-medium text-zinc-300">
						{status}
					</Badge>
				);
			}
		}
	};

	const getSocialConnections = () => {
		const connections = repo.social_connections?.connected_integrations || {};
		const connectedPlatforms: string[] = [];

		Object.entries(connections).forEach(([platform, integrations]) => {
			if (Array.isArray(integrations) && integrations.length > 0) {
				const hasConnected = integrations.some(
					integration => integration.connected,
				);
				if (hasConnected) {
					connectedPlatforms.push(platform);
				}
			}
		});

		return connectedPlatforms;
	};

	const getSocialIcons = () => {
		const connectedPlatforms = getSocialConnections();

		if (connectedPlatforms.length === 0) {
			return (
				<div className="flex items-center gap-1.5">
					<div className="h-2 w-2 rounded-full bg-zinc-600"></div>
					<span className="text-xs text-zinc-500">No connections</span>
				</div>
			);
		}

		const iconMap: Record<string, JSX.Element> = {
			twitter: <XIcon className="h-3.5 w-3.5 text-zinc-500" />,
			slack: <FaSlack className="h-3.5 w-3.5 text-purple-400" />,
			discord: <FaDiscord className="h-3.5 w-3.5 text-indigo-400" />,
			linkedin: <FaLinkedin className="h-3.5 w-3.5 text-blue-400" />,
		};

		return (
			<div className="flex items-center gap-1.5">
				{connectedPlatforms.slice(0, 3).map(platform => (
					<span key={platform} title={`${platform} connected`}>
						{iconMap[platform]}
					</span>
				))}
				{connectedPlatforms.length > 3 && (
					<span className="rounded-full bg-zinc-800/50 px-1.5 py-0.5 text-xs text-zinc-400">
						+{connectedPlatforms.length - 3}
					</span>
				)}
				<span className="ml-1 text-xs text-zinc-500">
					{repo.social_connections?.total_count || 0}
				</span>
			</div>
		);
	};

	return (
		<Link href={`/repositories/${repo.id}`}>
			<div className="group w-full cursor-pointer rounded-2xl border border-zinc-800/50 bg-zinc-900/30 px-6 py-5 text-zinc-100 backdrop-blur-xl transition-all duration-300 hover:border-zinc-700/50 hover:bg-zinc-800/40">
				{/* Header */}
				<div className="mb-4 flex items-start justify-between">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800/50">
							<FaGithub className="h-5 w-5 text-zinc-300" />
						</div>
						<div>
							<h3 className="text-base font-semibold text-zinc-100 transition-colors group-hover:text-white">
								{repo.name}
							</h3>
							<p className="font-mono text-sm text-zinc-500">
								{repo.full_name}
							</p>
						</div>
					</div>
				</div>

				{/* Content */}
				<div className="space-y-3">
					{/* Social Connections */}
					<div className="flex items-center justify-between">
						<span className="text-sm text-zinc-400">Platforms</span>
						{getSocialIcons()}
					</div>

					{/* Branch */}
					<div className="flex items-center justify-between">
						<span className="text-sm text-zinc-400">Branch</span>
						<div className="flex items-center gap-1.5">
							<span className="font-mono text-sm text-zinc-300">
								{repo.settings?.tracked_branch || "main"}
							</span>
						</div>
					</div>

					{/* AI Tone */}
					<div className="flex items-center justify-between">
						<span className="text-sm text-zinc-400">AI Tone</span>
						<span className="text-sm capitalize text-zinc-300">
							{repo.settings?.ai_tone || "professional"}
						</span>
					</div>
				</div>

				{/* Footer */}
				<div className="mt-4 flex items-center justify-between border-t border-zinc-800/30 pt-3">
					{getStatusBadge(repo.status)}
				</div>
			</div>
		</Link>
	);
}
