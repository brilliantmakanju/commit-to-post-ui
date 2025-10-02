// eslint-disable-next-line import/no-unresolved
import { FlattenedPostGroup, Platform, PostGroup, PostItem } from "@/types";

/**
 * Transforms the nested API response into a flattened structure
 * that existing components can consume without breaking changes
 */
export function transformPostGroupsResponse(
	apiResponse: PostGroup[],
): FlattenedPostGroup[] {
	return apiResponse.map(group => {
		// Flatten posts from all platforms into a single array
		const flattenedPosts: PostItem[] = [];

		Object.entries(group.posts).forEach(([platformKey, platformData]) => {
			if (platformData && platformData.posts) {
				const postsWithPlatform = platformData.posts.map(post => ({
					...post,
					platform: normalizePlatformKey(platformKey) as Platform,
				}));
				flattenedPosts.push(...postsWithPlatform);
			}
		});

		// Sort posts by created_at to maintain consistent ordering
		flattenedPosts.sort(
			(a, b) =>
				new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
		);

		return {
			group_id: group.group_id,
			group_name: group.group_name,
			group_description: group.group_description,
			posts: flattenedPosts,
			latest_created_at: group.latest_created_at,
			total_posts: group.total_posts,
			platforms: group.platforms,
			source_commit_message: group.source_commit_message,
			repository: group.repository,
		};
	});
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
 * Helper function to get posts by status across all platforms in a group
 */
export function getPostsByStatus(
	group: PostGroup,
	status: "published" | "scheduled" | "drafted",
): PostItem[] {
	const allPosts: PostItem[] = [];

	Object.entries(group.posts).forEach(([platformKey, platformData]) => {
		if (platformData && platformData.posts) {
			const filteredPosts = platformData.posts
				.filter(post => post.status === status)
				.map(post => ({
					...post,
					platform: normalizePlatformKey(platformKey) as Platform,
				}));
			allPosts.push(...filteredPosts);
		}
	});

	return allPosts;
}

/**
 * Helper function to get all posts from a group regardless of platform
 */
export function getAllPostsFromGroup(group: PostGroup): PostItem[] {
	const allPosts: PostItem[] = [];

	Object.entries(group.posts).forEach(([platformKey, platformData]) => {
		if (platformData && platformData.posts) {
			const postsWithPlatform = platformData.posts.map(post => ({
				...post,
				platform: normalizePlatformKey(platformKey) as Platform,
			}));
			allPosts.push(...postsWithPlatform);
		}
	});

	return allPosts.sort(
		(a, b) =>
			new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
	);
}

/**
 * Helper function to check if a group has posts with a specific status
 */
export function groupHasStatus(
	group: PostGroup,
	status: "published" | "scheduled" | "drafted",
): boolean {
	return Object.values(group.posts).some(platformData =>
		platformData?.posts?.some(post => post.status === status),
	);
}

/**
 * Helper function to count posts by status in a group
 */
export function countPostsByStatus(
	group: PostGroup,
	status: "published" | "scheduled" | "drafted",
): number {
	let count = 0;

	Object.values(group.posts).forEach(platformData => {
		if (platformData?.posts) {
			count += platformData.posts.filter(post => post.status === status).length;
		}
	});

	return count;
}
