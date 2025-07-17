"use client";
import { CheckCircle, Clock, FileText, GitCommit, XCircle } from "lucide-react";
import { FaDiscord, FaLinkedinIn, FaSlack } from "react-icons/fa";

// eslint-disable-next-line import/no-unresolved
import { ActivityItem } from "@/types";

const statusIconMap: { [key: string]: React.ReactNode } = {
	posted: <CheckCircle className="h-5 w-5 text-zinc-400" />,
	scheduled: <Clock className="h-5 w-5 text-zinc-400" />,
	failed: <XCircle className="h-5 w-5 text-red-400" />,
	drafted: <FileText className="h-5 w-5 text-zinc-400" />,
};

const platformIconMap: { [key: string]: React.ReactNode } = {
	LinkedIn: <FaLinkedinIn className="h-4 w-4 text-zinc-400" />,
	Slack: <FaSlack className="h-4 w-4 text-zinc-400" />,
	Discord: <FaDiscord className="h-4 w-4 text-zinc-400" />,
};

export const mockActivityItems: ActivityItem[] = [
	{
		time: "2 mins ago",
		repo: "openai-devkit",
		details: "Fix OAuth redirect URI issue",
		status: "posted",
		grouped: [
			{ status: "posted", platform: "LinkedIn" },
			{ status: "posted", platform: "Slack" },
		],
	},
	{
		time: "10 mins ago",
		repo: "commit-companion",
		details: "Scheduled weekly changelog post",
		status: "scheduled",
		grouped: [
			{ status: "scheduled", platform: "LinkedIn" },
			{ status: "scheduled", platform: "Discord" },
		],
	},
	{
		time: "1 hour ago",
		repo: "dev-notify-bot",
		details: "Webhook failed for project updates",
		status: "failed",
		grouped: [{ status: "failed", platform: "Slack" }],
	},
	{
		time: "3 hours ago",
		repo: "commit-companion",
		details: "Drafting tweet for AI post formatter",
		status: "drafted",
		grouped: [
			{ status: "drafted", platform: "LinkedIn" },
			{ status: "drafted", platform: "Slack" },
		],
	},
	{
		time: "1 day ago",
		repo: "openai-devkit",
		details: "LinkedIn post published from commit",
		status: "posted",
		grouped: [{ status: "posted", platform: "LinkedIn" }],
	},
	{
		time: "3 hours ago",
		repo: "commit-companion",
		details: "Drafting tweet for AI post formatter",
		status: "drafted",
		grouped: [
			{ status: "drafted", platform: "LinkedIn" },
			{ status: "drafted", platform: "Slack" },
		],
	},
	{
		time: "1 day ago",
		repo: "openai-devkit",
		details: "LinkedIn post published from commit",
		status: "posted",
		grouped: [{ status: "posted", platform: "LinkedIn" }],
	},
];

function renderActivityItem(item: ActivityItem, index: number) {
	if (item.grouped && item.grouped.length > 0) {
		return (
			<li key={index} className="flex items-start space-x-4">
				<div className="mt-0.5 flex-shrink-0">
					<GitCommit className="h-5 w-5 text-zinc-400" />
				</div>
				<div className="flex-grow">
					<p className="text-sm">
						<span className="text-zinc-400">Posted from </span>
						<span className="font-semibold text-white">{item.repo}</span> —{" "}
						<span className="text-zinc-400">&quot;{item.details}&quot;</span>
					</p>
					<ul className="mt-2 space-y-2">
						{item.grouped.map((groupItem: any, groupIndex: any) => (
							<li
								key={groupIndex}
								className="flex items-center space-x-3 text-xs text-zinc-400"
							>
								{statusIconMap[groupItem.status]}
								<span className="capitalize">{groupItem.status} to</span>
								{platformIconMap[groupItem.platform]}
								<span className="text-zinc-300">{groupItem.platform}</span>
							</li>
						))}
					</ul>
				</div>
				<p className="flex-shrink-0 text-xs text-zinc-500">{item.time}</p>
			</li>
		);
	}

	return (
		<li key={index} className="flex items-center space-x-4">
			<div className="flex-shrink-0">{statusIconMap[item.status]}</div>
			<div className="flex-grow">
				<p className="text-sm">
					<span className="capitalize text-zinc-300">{item.status}</span> to{" "}
					<span className="font-semibold text-white">{item.platform}</span> from{" "}
					<span className="font-semibold text-white">{item.repo}</span> —{" "}
					<span className="truncate text-zinc-400">
						&quot;{item.details}&quot;
					</span>
				</p>
			</div>
			<p className="flex-shrink-0 text-xs text-zinc-500">{item.time}</p>
		</li>
	);
}

export function ActivityFeed() {
	// const data: any[] = [];
	const data = mockActivityItems;

	if (data.length === 0) {
		return (
			<div className="mt-6 flex h-[354px] items-center justify-center rounded-lg border border-zinc-800">
				<p className="text-sm text-zinc-400">No recent activity to display.</p>
			</div>
		);
	}

	return (
		<div className="h-[400px] w-full overflow-hidden overflow-y-auto pt-3">
			<ul className="h-full space-y-4 overflow-hidden overflow-y-scroll pt-2">
				{data.map(renderActivityItem)}
			</ul>
		</div>
	);
}
