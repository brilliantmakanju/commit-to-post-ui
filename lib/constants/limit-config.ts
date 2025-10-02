import {
	FaCalendarAlt,
	FaHashtag,
	FaImages,
	FaRobot,
	FaUsers,
} from "react-icons/fa";

// eslint-disable-next-line import/no-unresolved
import { LimitTypeConfig } from "@/types/feature-limits";

export const limitConfig: Record<string, LimitTypeConfig> = {
	workspaces: {
		icon: FaUsers,
		unit: "workspaces",
		title: "Workspaces",
		warningTitle: "Team Workspaces Locked",
		reachedTitle: "Studio Pack Required", // Studio is the gate
	},
	ai_tones: {
		icon: FaRobot,
		unit: "advanced tones",
		title: "Multi-Tone Generation",
		warningTitle: "Unlock All Tones",
		reachedTitle: "Pro Pack Required", // Pro/Studio is the gate
	},
	hashtag_automation: {
		icon: FaHashtag,
		unit: "automation",
		title: "Hashtag Automation",
		warningTitle: "Unlock Smart Hashtags",
		reachedTitle: "Pro Pack Required", // Pro/Studio is the gate
	},
	image_upload: {
		icon: FaImages,
		unit: "uploads",
		title: "Image Upload",
		warningTitle: "Unlock Image Uploads",
		reachedTitle: "Pro Pack Required", // Pro/Studio is the gate
	},
	schedule_post: {
		icon: FaCalendarAlt,
		unit: "scheduling",
		title: "Post Scheduling",
		warningTitle: "Unlock Scheduling",
		reachedTitle: "Pro Pack Required", // Pro/Studio is the gate
	},
};
