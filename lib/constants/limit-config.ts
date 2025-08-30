import {
	FaChartLine,
	FaDatabase,
	FaHashtag,
	FaPen,
	FaPlug,
	FaRobot,
	FaShareAlt,
	FaUsers,
} from "react-icons/fa";

// eslint-disable-next-line import/no-unresolved
import { LimitTypeConfig } from "@/types/feature-limits";

export const limitConfig: Record<string, LimitTypeConfig> = {
	repositories: {
		icon: FaDatabase,
		unit: "repositories",
		title: "GitHub Repositories",
		warningTitle: "Repository Limit Warning",
		reachedTitle: "Repository Limit Reached",
	},
	social_integrations: {
		icon: FaPlug,
		unit: "integrations",
		title: "Social Media Integrations",
		warningTitle: "Social Integration Limit Warning",
		reachedTitle: "Social Integration Limit Reached",
	},
	repo_socials: {
		icon: FaShareAlt,
		unit: "repo → social links",
		title: "Repository → Social Connections",
		warningTitle: "Repo → Social Connection Limit Warning",
		reachedTitle: "Repo → Social Connection Limit Reached",
	},
	workspaces: {
		icon: FaUsers,
		unit: "workspaces",
		title: "Workspaces",
		warningTitle: "Workspace Limit Warning",
		reachedTitle: "Workspace Limit Reached",
	},
	posts: {
		icon: FaPen,
		unit: "posts",
		title: "Posts",
		warningTitle: "Post Limit Warning",
		reachedTitle: "Post Limit Reached",
	},
	ai_tones: {
		icon: FaRobot,
		unit: "AI tones",
		title: "AI Tone Presets",
		warningTitle: "AI Tone Limit Warning",
		reachedTitle: "AI Tone Limit Reached",
	},
	hashtag_automation: {
		icon: FaHashtag,
		unit: "automation",
		title: "Hashtag Automation",
		warningTitle: "Hashtag Automation Warning",
		reachedTitle: "Hashtag Automation Restricted",
	},
	analytics: {
		icon: FaChartLine,
		unit: "analytics",
		title: "Advanced Analytics",
		warningTitle: "Analytics Access Warning",
		reachedTitle: "Analytics Access Restricted",
	},
};
