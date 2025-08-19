/* eslint-disable import/no-unresolved */
"use client";
import { useState } from "react";

import FeatureLimitWrapper from "@/components/feature-flag/feature-limit-wrapper";
import LimitTooltip from "@/components/feature-flag/limit-tooltip";
import { Heading, Span } from "@/components/general/micro/typography";
import { CreateOrganizationModal } from "@/components/organization/create-organization";
import WorkspaceSelection from "@/components/workspace/selection";
import { useLimitUI } from "@/hooks/use-limit-ui";
import { FEATURE_LIMITS } from "@/lib/constants/feature-limits";
import useOrganizationStore from "@/zustand/useorganization-store";

const WorkSpaceSelection = () => {
	const { organizations } = useOrganizationStore();
	const [createModalOpen, setCreateModalOpen] = useState(false);

	const orgCount = organizations.length;

	// use workspaces limit, not social accounts
	const workspaceLimitUI = useLimitUI({
		warningThreshold: 80,
		currentCount: orgCount,
		limitType: "workspaces",
		limitId: FEATURE_LIMITS.WORKSPACES,
	});

	return (
		<div className="min-h-full w-full px-4 py-5 sm:px-8 lg:px-20">
			<div className="mb-[2rem]">
				<Heading className="mb-4 text-5xl font-light text-arch-black lg:text-6xl">
					😶‍🌫️ Welcome back
				</Heading>
				<Span className="text-base text-gray-600 lg:text-lg">
					Choose a workspace to continue
				</Span>
			</div>

			<WorkspaceSelection />

			<div className="mt-16 flex w-full items-center justify-between border-t border-gray-200 pt-8">
				<FeatureLimitWrapper
					limitId={FEATURE_LIMITS.WORKSPACES}
					currentCount={orgCount}
					fallback={
						<LimitTooltip
							maxLimit={workspaceLimitUI.limit}
							currentUsage={orgCount}
							limitType="workspaces"
							position="bottom"
						>
							<div className="inline-block cursor-pointer">
								<button
									disabled
									className="text-base text-arch-black transition-colors hover:text-gray-600"
								>
									+ Create workspace
								</button>
							</div>
						</LimitTooltip>
					}
				>
					<LimitTooltip
						maxLimit={workspaceLimitUI.limit}
						currentUsage={orgCount}
						limitType="workspaces"
						position="bottom"
					>
						<button
							onClick={() => setCreateModalOpen(true)}
							className="text-base text-arch-black transition-colors hover:text-gray-600"
						>
							+ Create workspace
						</button>
					</LimitTooltip>
				</FeatureLimitWrapper>
			</div>

			<CreateOrganizationModal
				open={createModalOpen}
				onOpenChange={setCreateModalOpen}
			/>
		</div>
	);
};

export default WorkSpaceSelection;
