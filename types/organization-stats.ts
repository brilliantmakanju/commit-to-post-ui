import { z } from "zod";

// Schema definitions
export const RepositoryStatsSchema = z.object({
	total_repos: z.number(),
	active_repos: z.number(),
	downgraded_repos: z.number(),
	private_repos: z.number(),
	public_repos: z.number(),
});

export const IntegrationStatsSchema = z.object({
	total_socials: z.number(),
	active_socials: z.number(),
	downgraded_socials: z.number(),
	by_platform: z.record(z.number()),
	token_expired: z.number(),
});

export const PostStatsSchema = z.object({
	total_posts: z.number(),
	active_posts: z.number(),
	published_posts: z.number(),
	scheduled_posts: z.number(),
	drafted_posts: z.number(),
	by_platform: z.record(z.number()),
	by_status: z.record(z.number()),
	recent_posts_30d: z.number(),
	posts_with_media: z.number(),
});

export const GitHubStatsSchema = z.object({
	github_connected: z.boolean(),
	github_installation_id: z.number().nullable(),
	github_status: z.string(),
});

export const OrganizationStatsSchema = z.object({
	organization_id: z.string(),
	organization_name: z.string(),
	is_downgraded: z.boolean(),
	activity_score: z.number(),
	repositories: RepositoryStatsSchema,
	integrations: IntegrationStatsSchema,
	posts: PostStatsSchema,
	github: GitHubStatsSchema,
});

export const SummaryStatsSchema = z.object({
	total_organizations: z.number(),
	total_repos: z.number(),
	active_repos: z.number(),
	total_socials: z.number(),
	active_socials: z.number(),
	total_posts: z.number(),
	published_posts: z.number(),
	downgraded_organizations: z.number(),
	github_connected_orgs: z.number(),
	total_activity_score: z.number(),
	posts_by_platform: z.record(z.number()),
	socials_by_platform: z.record(z.number()),
});

export const OrganizationStatsResponseSchema = z.object({
	success: z.boolean(),
	summary: SummaryStatsSchema,
	organizations: z.array(OrganizationStatsSchema),
	total_organizations: z.number(),
});

// Inferred types
export type RepositoryStats = z.infer<typeof RepositoryStatsSchema>;
export type IntegrationStats = z.infer<typeof IntegrationStatsSchema>;
export type PostStats = z.infer<typeof PostStatsSchema>;
export type GitHubStats = z.infer<typeof GitHubStatsSchema>;
export type OrganizationStats = z.infer<typeof OrganizationStatsSchema>;
export type SummaryStats = z.infer<typeof SummaryStatsSchema>;
export type OrganizationStatsResponse = z.infer<
	typeof OrganizationStatsResponseSchema
>;
