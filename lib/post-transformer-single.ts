// eslint-disable-next-line import/no-unresolved
import { Platform, PostItem } from "@/types";

export interface PostDetailResponse {
	type: "grouped_post" | "commit_group" | "standalone_post";
	current_post_id: string;
	group_id?: string;
	group_name?: string;
	group_description?: string;
	source_commit_message?: string;
	posts?: Record<string, PlatformPostData>;
	post?: PostItem; // For standalone posts
	total_posts?: number;
	platforms?: string[];
	repository?: {
		id: string;
		name: string;
		full_name: string;
	};
}

export interface PlatformPostData {
	posts: PostItem[];
	count: number;
	original_post_id: string | undefined;
	platform_display: string;
	has_scheduled: boolean;
	has_published: boolean;
	has_drafted: boolean;
}

export interface TransformedPostDetail {
	type: "grouped_post" | "commit_group" | "standalone_post";
	current_post_id: string;
	current_post: PostItem | undefined;
	group_id?: string;
	group_name?: string;
	group_description?: string;
	source_commit_message?: string;
	all_posts: PostItem[];
	posts_by_platform: Record<Platform, PostItem[]>;
	original_posts: PostItem[]; // One per platform
	variant_posts: PostItem[]; // All non-original posts
	total_posts: number;
	platforms: Platform[];
	repository?: {
		id: string;
		name: string;
		full_name: string;
	};
	status_summary: {
		scheduled_count: number;
		published_count: number;
		drafted_count: number;
	};
}

/**
 * Transform the post detail API response into a structure optimized for frontend consumption
 */
export function transformPostDetailResponse(
	apiResponse: PostDetailResponse,
): TransformedPostDetail {
	let allPosts: PostItem[] = [];
	let postsByPlatform: Record<Platform, PostItem[]> = {} as Record<
		Platform,
		PostItem[]
	>;
	let originalPosts: PostItem[] = [];
	let variantPosts: PostItem[] = [];

	if (apiResponse.type === "standalone_post" && apiResponse.post) {
		// Handle standalone post
		const post = apiResponse.post;
		allPosts = [post];
		postsByPlatform[post.platform as Platform] = [post];
		originalPosts = [post];
	} else if (apiResponse.posts) {
		// Handle grouped posts or commit groups
		Object.entries(apiResponse.posts).forEach(([platformKey, platformData]) => {
			const normalizedPlatform = normalizePlatformKey(platformKey) as Platform;

			if (platformData?.posts) {
				const platformPosts = platformData.posts.map(post => ({
					...post,
					platform: normalizedPlatform,
				}));

				allPosts.push(...platformPosts);
				postsByPlatform[normalizedPlatform] = platformPosts;

				// Find original and variant posts
				const originalPost = platformPosts.find(p => p.is_original);
				if (originalPost) {
					originalPosts.push(originalPost);
				}

				const variants = platformPosts.filter(p => !p.is_original);
				variantPosts.push(...variants);
			}
		});
	}

	// Sort all posts by creation date (newest first)
	allPosts.sort(
		(a, b) =>
			new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
	);

	// Find the current post
	const currentPost =
		allPosts.find(p => p.id === apiResponse.current_post_id) || undefined;

	// Calculate status summary
	const statusSummary = {
		scheduled_count: allPosts.filter(p => p.status === "scheduled").length,
		published_count: allPosts.filter(p => p.status === "published").length,
		drafted_count: allPosts.filter(p => p.status === "drafted").length,
	};

	return {
		type: apiResponse.type,
		current_post_id: apiResponse.current_post_id,
		current_post: currentPost,
		group_id: apiResponse.group_id,
		group_name: apiResponse.group_name,
		group_description: apiResponse.group_description,
		source_commit_message: apiResponse.source_commit_message,
		all_posts: allPosts,
		posts_by_platform: postsByPlatform,
		original_posts: originalPosts,
		variant_posts: variantPosts,
		// eslint-disable-next-line unicorn/explicit-length-check
		total_posts: apiResponse.total_posts || allPosts.length,
		platforms: (apiResponse.platforms || Object.keys(postsByPlatform)).map(
			p => normalizePlatformKey(p) as Platform,
		),
		repository: apiResponse.repository,
		status_summary: statusSummary,
	};
}

/**
 * Normalizes platform keys from the API response to match our Platform type
 */
function normalizePlatformKey(platformKey: string): string {
	const platformMap: Record<string, string> = {
		twitter: "twitter",
		x: "twitter", // Handle both twitter and x
		linkedin: "linkedin",
		discord: "discord",
		slack: "slack",
	};
	return platformMap[platformKey.toLowerCase()] || platformKey;
}

/**
 * Get posts by status from the transformed data
 */
export function getPostsByStatus(
	transformedData: TransformedPostDetail,
	status: "published" | "scheduled" | "drafted",
): PostItem[] {
	return transformedData.all_posts.filter(post => post.status === status);
}

/**
 * Get posts by platform from the transformed data
 */
export function getPostsByPlatform(
	transformedData: TransformedPostDetail,
	platform: Platform,
): PostItem[] {
	return transformedData.posts_by_platform[platform] || [];
}

/**
 * Check if the post detail has variants (multiple posts for same content)
 */
export function hasVariants(transformedData: TransformedPostDetail): boolean {
	return (
		transformedData.type !== "standalone_post" &&
		transformedData.all_posts.length > 1
	);
}

/**
 * Get the original post for a specific platform
 */
export function getOriginalPostForPlatform(
	transformedData: TransformedPostDetail,
	platform: Platform,
): PostItem | undefined {
	return (
		transformedData.original_posts.find(p => p.platform === platform) ||
		undefined
	);
}

/**
 * Get all variant posts for a specific platform
 */
export function getVariantPostsForPlatform(
	transformedData: TransformedPostDetail,
	platform: Platform,
): PostItem[] {
	return transformedData.variant_posts.filter(p => p.platform === platform);
}

/**
 * Check if any posts in the detail are scheduled
 */
export function hasScheduledPosts(
	transformedData: TransformedPostDetail,
): boolean {
	return transformedData.status_summary.scheduled_count > 0;
}

/**
 * Check if any posts in the detail are published
 */
export function hasPublishedPosts(
	transformedData: TransformedPostDetail,
): boolean {
	return transformedData.status_summary.published_count > 0;
}

/**
 * Get related posts (excluding the current post)
 */
export function getRelatedPosts(
	transformedData: TransformedPostDetail,
): PostItem[] {
	return transformedData.all_posts.filter(
		p => p.id !== transformedData.current_post_id,
	);
}

/**
 * Get posts that would be affected by a status change to the current post
 */
export function getAffectedPostsByStatusChange(
	transformedData: TransformedPostDetail,
	newStatus: "published" | "scheduled" | "drafted",
): PostItem[] {
	if (
		!transformedData.current_post ||
		transformedData.type === "standalone_post"
	) {
		return [];
	}

	const currentPlatform = transformedData.current_post.platform;
	const relatedPosts = getRelatedPosts(transformedData);

	if (newStatus === "published" || newStatus === "scheduled") {
		// Other platform posts would be affected (set to draft or unscheduled)
		return relatedPosts.filter(p => p.platform !== currentPlatform);
	}

	return [];
}

/**
 * Prepare data for bulk operations
 */
export function prepareBulkOperationData(
	transformedData: TransformedPostDetail,
	selectedPostIds: string[],
): {
	valid_post_ids: string[];
	affected_posts: PostItem[];
	platforms_affected: Platform[];
} {
	const validPostIds = selectedPostIds.filter(id =>
		transformedData.all_posts.some(p => p.id === id),
	);

	const affectedPosts = transformedData.all_posts.filter(p =>
		validPostIds.includes(p.id),
	);

	const platformsAffected = [
		...new Set(affectedPosts.map(p => p.platform as Platform)),
	];

	return {
		valid_post_ids: validPostIds,
		affected_posts: affectedPosts,
		platforms_affected: platformsAffected,
	};
}
