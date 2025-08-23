"use client";
import { UUID } from "node:crypto";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";

// eslint-disable-next-line import/no-unresolved
import { RepoHeader } from "@/components/repositories/header/repo-header";
import { RepoTabs } from "@/components/repositories/repo-tabs";
import useRepoSuperDetails from "@/hooks/core/repo/get-repo-super-detail-hook";
import useRepoWebhookPing from "@/hooks/core/repo/get-repo-webhook-pings";
import { fetchPosts } from "@/server-actions/core/get-posts";
import { updateRepoStatus } from "@/server-actions/core/repo/repo-status";

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
		retryOnMount: false,
		refetchOnMount: false,
		refetchOnReconnect: false,
		refetchOnWindowFocus: false,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
		enabled: !!repoId, // Only run query when repoId is available
	});

	const { repoDetails } = useRepoSuperDetails(repoId);

	const handlePostsPageChange = (page: number) => {
		setPostsCurrentPage(page);
	};

	const queryClient = useQueryClient();
	const onTogglePause = async () => {
		if (!repoDetails) return;

		const nextStatus =
			repoDetails.status === "connected" ? "paused" : "connected";

		const result = await updateRepoStatus({
			repoId: repoId,
			status: nextStatus,
		});

		if (result.success) {
			queryClient.invalidateQueries({
				queryKey: ["repo_details", repoId],
			});
			toast.success(result.message);
			queryClient.invalidateQueries({
				queryKey: ["repo_super_details", repoId],
			});
		} else {
			toast.error(result.message);
		}
	};

	const { webhookLogs, isLoading: isGettingLogs } = useRepoWebhookPing(repoId);

	return (
		<section className="flex h-full w-full flex-col gap-4 bg-[#0A0A0A] px-6 py-8">
			<RepoHeader repo_id={repoId} onTogglePause={onTogglePause} />
			<RepoTabs
				repo_id={repoId}
				posts={data?.results ?? []}
				webhookLogs={webhookLogs ?? []}
				postsCurrentPage={postsCurrentPage}
				onPostsPageChange={handlePostsPageChange}
				isLoadingPosts={isLoading || isGettingLogs}
				postsTotalPages={Math.ceil((data?.count ?? 1) / PAGE_SIZE)}
			/>
		</section>
	);
};

export default ViewRepo;
