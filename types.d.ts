import { UUID } from "node:crypto";

type HeroBannerTopProps = {
	// The icon to display in the banner, it defaults to undefined
	icon?: any | undefined;

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

export type Platform = "linkedin" | "slack" | "discord" | "twitter" | "x";

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
	video_url: string | undefined;
	post_group: string | undefined;
	original_status: string | undefined;
	actual_publish_time: string | undefined;
	scheduled_publish_time: string | undefined;
	posted_integrations_data: ConnectedAccount[];
	planned_integrations_data: ConnectedAccount[];
	pending_integrations_data: ConnectedAccount[];
	// New fields from API response
	repository: string;
	posted_channels: string[];
	planned_channels: string[];
	pending_integrations_data: ConnectedAccount[];
	is_grouped: boolean;
	is_edited: boolean;
	priority: boolean;
	source_commit_message: string | undefined;
	is_original: boolean;
	platform_order: number;
	posting_summary: {
		platform: string;
		total_posted: number;
		total_planned: number;
		is_complete: boolean;
		remaining: number;
		integration_details: any[];
	};
	tone?: string;
	// Platform derived from the API structure
	platform: Platform;
}

export interface PlatformPosts {
	posts: PostItem[];
	count: number;
	original_post_id: string;
	platform_display: string;
	has_scheduled: boolean;
	has_published: boolean;
	has_drafted: boolean;
}

export interface Repository {
	id: string;
	name: string;
	full_name: string;
}

export interface PostGroup {
	group_id: string;
	group_name: string;
	group_description: string;
	posts: {
		[key: string]: PlatformPosts; // twitter, discord, linkedin, etc.
	};
	latest_created_at: string;
	total_posts: number;
	platforms: string[];
	source_commit_message: string | undefined;
	repository: Repository;
}

// Flattened interface for easier component usage
export interface FlattenedPostGroup {
	group_id: string;
	group_name: string;
	group_description: string;
	posts: PostItem[];
	latest_created_at: string;
	total_posts: number;
	platforms: string[];
	source_commit_message: string | undefined;
	repository: Repository;
}

export interface CloudinaryUploadResult {
	url: string;
	width: number;
	bytes: number;
	format: string;
	height: number;
	public_id: string;
	secure_url: string;
}

export interface UploadState {
	id: string;
	file: File;
	progress?: number;
	previewUrl: string;
	cloudinaryUrl?: string;
	status: "uploading" | "completed" | "failed";
}
