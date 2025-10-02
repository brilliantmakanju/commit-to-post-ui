// eslint-disable-next-line import/no-unresolved
import { PostItem, PostStatus } from "@/types";

export type Platform = "twitter" | "linkedin" | "discord";

export interface SocialAccount {
	id: string;
	platform: Platform;
	name: string;
	verified: boolean;
	isActive: boolean;
}

export interface ToneOption {
	id: string;
	label: string;
	description: string;
}

// Post version type used in the UI components
export interface PostVersion {
	id: string;
	tone?: string;
	image?: string;
	content: string;
	createdAt: string;
	isOriginal: boolean;
	isGenerated: boolean;
	displayName?: string; // New field for proper display names like "Original", "v1", "v2", etc.

	status?: PostStatus;
	scheduled_publish_time?: string;
	posted_integrations_data?: any[];
	planned_integrations_data?: any[];
	pending_integrations_data?: any[];
}
// Updated interface to use PostItem instead of PostVersion
export interface CreatePostModalProps {
	isOpen?: boolean;
	onClose?: () => void;
	platform?: Platform;
	posts: PostItem[]; // Changed from PostVersion[] to PostItem[]
	selectedPost: PostItem;
	onDeletePost?: (postId: string) => void;
	onUpdatePost?: (postId: string, content: string, image?: string) => void;
}
