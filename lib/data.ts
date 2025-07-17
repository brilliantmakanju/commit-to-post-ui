import type { ChartConfig } from "@/components/ui/chart";

const generateHeatmapData = () => {
	const data: { [key: string]: number } = {};
	const today = new Date();
	for (let index = 0; index < 365; index++) {
		const date = new Date(today);
		date.setDate(today.getDate() - index);
		const dateString = date.toISOString().split("T")[0];
		if (Math.random() > 0.6) {
			// 40% chance of having activity
			data[dateString] = Math.floor(Math.random() * 10) + 1;
		}
	}
	return data;
};

export const activityHeatmapData = generateHeatmapData();

export const repoCardData = [
	{
		name: "ghost-devlog",
		postsThisWeek: 12,
		channelDistribution: { linkedIn: 5, slack: 4, discord: 3 },
	},
	{
		name: "aicommit",
		postsThisWeek: 8,
		channelDistribution: { linkedIn: 2, slack: 6, discord: 0 },
	},
	{
		name: "design-system",
		postsThisWeek: 5,
		channelDistribution: { linkedIn: 1, slack: 1, discord: 3 },
	},
];

export type UpcomingPost = {
	platform: ["LinkedIn" | "Slack" | "Discord"];
	status: "Scheduled" | "Draft";
	content: string;
	repo: string;
	date: string;
};

export const channelDistributionData = [
	{ platform: "LinkedIn", posts: 45, fill: "hsl(var(--chart-1))" },
	{ platform: "Slack", posts: 30, fill: "hsl(var(--chart-2))" },
	{ platform: "Discord", posts: 25, fill: "hsl(var(--chart-3))" },
];

export const channelDistributionConfig = {
	posts: {
		label: "Posts",
	},
	LinkedIn: {
		label: "LinkedIn",
	},
	Slack: {
		label: "Slack",
	},
	Discord: {
		label: "Discord",
	},
} satisfies ChartConfig;

export type WebhookError = {
	repo: string;
	error: string;
	time: string;
	status: number;
};
export const webhookErrorsData: WebhookError[] = [
	{
		repo: "ghost-repo",
		error: "Connection timed out",
		time: "2m ago",
		status: 504,
	},
	{
		repo: "aicommit-web",
		error: "Invalid API token for Slack",
		time: "1h ago",
		status: 401,
	},
	{
		repo: "finance-app-li",
		error: "Upstream service unavailable",
		time: "3h ago",
		status: 503,
	},
];

export const reminderScenarios = [
	{
		repoName: "ghost-repo",
		lastCommit: "2023-10-20T10:00:00Z",
		posts: "0",
		webhookStatus: "active",
		daysSinceLastPost: 5,
	},
	{
		repoName: "finance-app-li",
		lastCommit: "2023-10-25T18:00:00Z",
		posts: "25",
		webhookStatus: "active",
		linkedInTokenExpiry: "3 days",
	},
];
