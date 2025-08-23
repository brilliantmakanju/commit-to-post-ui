import { UUID } from "node:crypto";

type HeroBannerTopProps = {
	// The icon to display in the banner, it defaults to null
	icon?: any | null;

	// The title text to be displayed in the banner
	title?: string;

	// The content text to be displayed alongside the title
	content?: string;

	// Custom styles for the title text
	titleStyles?: string;

	// Custom styles for the content text
	contentStyles?: string;

	// Custom styles for the container
	customStyles?: string;

	// Variant for different designs
	variant?: "outline" | "default"; // Can add more variants as needed
};

export interface HeroTimerData {
	heroTitle: string;
	heroDescription: string;
	launchTimeInSeconds: number;
}

export type FooterProps = {
	companyName?: string;
	tagline?: string;
	sections?: {
		title: string;
		links: { label: string; href: string }[];
	}[];
	legalLinks?: { label: string; href: string }[];
	copyright?: string;
};

export type AuthModalProps = {
	trigger: any;
};

export interface Notification {
	id: UUID;
	organization: string;
	title: string;
	message: string;
	triggered_by: string;
	is_read: boolean;
	created_at: string;
}

export type AuthView =
	| "login"
	| "signup"
	| "check-email"
	| "verifying"
	| undefined;

export type ActivityItem = {
	time: string;
	repo?: string;
	details: string;
	platform?: "LinkedIn" | "Slack" | "Discord";
	status: "posted" | "scheduled" | "failed" | "drafted";
	grouped?: {
		status: "posted" | "scheduled" | "failed" | "drafted";
		platform: "LinkedIn" | "Slack" | "Discord";
	}[];
};

export type PostStatus = "published" | "scheduled" | "drafted";

export interface ConnectedAccount {
	id: string;
	name: string;
	handle: string;
	platform: string;
	profile_image_url: string;
}

export interface SocialAccount {
	id: string;
	name: string;
	icon: string;
	description: string;
	connectedAccounts: ConnectedAccount[];
}

export type Platform = "linkedin" | "slack" | "discord" | "x";

export interface PostItem {
	id: string;
	content: string;
	created_at: string;
	updated_at: string;
	is_deleted: boolean;
	status: PostStatus;
	image_urls: string[];
	organization: string;
	is_inactive: boolean;
	video_url: string | null;
	post_group: string | null;
	original_status: string | null;
	actual_publish_time: string | null;
	scheduled_publish_time: string | null;

	posted_integrations_data: ConnectedAccount[];
	planned_integrations_data: ConnectedAccount[];
	pending_integrations_data: ConnectedAccount[];

	// Optional shortcut (if you still want aliasing in UI)
	platform: Platform;
}

export interface PostGroup {
	group_id: string;
	posts: PostItem[];
	latest_created_at: string;
}
