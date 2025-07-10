"use client";
import { UUID } from "node:crypto";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import React, { useMemo, useState } from "react";

// eslint-disable-next-line import/no-unresolved
import { RepoHeader } from "@/components/repositories/header/repo-header";
import { RepoTabs } from "@/components/repositories/repo-tabs";
import useRepoSuperDetails from "@/hooks/core/repo/get-repo-super-detail-hook";
import { fetchPosts } from "@/server-actions/core/get-posts";

interface WebhookLog {
	id: string;
	timestamp: string;
	event_type: string;
	status: "success" | "failed";
	error_message: string | undefined;
}

const mockWebhookLogs: WebhookLog[] = [
	{
		id: "1",
		event_type: "push",
		status: "success",
		error_message: undefined,
		timestamp: "2025-07-06T16:42:00Z",
	},
	{
		id: "2",
		event_type: "pull_request",
		status: "failed",
		error_message: "401 Unauthorized - Invalid webhook signature",
		timestamp: "2025-07-06T16:36:00Z",
	},
	{
		id: "3",
		event_type: "push",
		status: "success",
		error_message: undefined,
		timestamp: "2025-07-06T16:30:00Z",
	},
	{
		id: "4",
		event_type: "release",
		status: "failed",
		error_message: "Timeout - Webhook endpoint did not respond within 30s",
		timestamp: "2025-07-06T15:45:00Z",
	},
	{
		id: "5",
		event_type: "push",
		status: "success",
		error_message: undefined,
		timestamp: "2025-07-06T15:20:00Z",
	},
];

const PAGE_SIZE = 50;

const ViewRepo = () => {
	const params = useParams();
	const repoId = useMemo(() => params?.id as UUID, [params?.id]);

	// Pagination state
	const [postsCurrentPage, setPostsCurrentPage] = useState<number>(1);

	const { data, isLoading } = useQuery({
		queryKey: ["posts", postsCurrentPage],
		queryFn: async () => {
			const result = await fetchPosts({
				repo_id: repoId,
				page_size: postsCurrentPage,
			});
			if (!result.success) {
				throw new Error("Failed to fetch posts");
			}
			return result.data;
		},
		retry: 1,
		enabled: !!repoId,
	});

	const { repoDetails } = useRepoSuperDetails(repoId);

	const handlePostsPageChange = (page: number) => {
		setPostsCurrentPage(page);
	};

	return (
		<section className="flex h-full w-full flex-col gap-4 bg-[#0A0A0A] px-6 py-8">
			<RepoHeader repo_id={params.id as UUID} onTogglePause={() => {}} />
			<RepoTabs
				repo_id={repoId}
				isLoadingPosts={isLoading}
				posts={data?.results ?? []}
				webhookLogs={mockWebhookLogs}
				postsCurrentPage={postsCurrentPage}
				onPostsPageChange={handlePostsPageChange}
				postsTotalPages={Math.ceil((data?.count ?? 1) / PAGE_SIZE)}
			/>
		</section>
	);
};

export default ViewRepo;
