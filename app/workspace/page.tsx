/* eslint-disable import/no-unresolved */
"use client";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";

import FeatureLimitWrapper from "@/components/feature-flag/feature-limit-wrapper";
import LimitTooltip from "@/components/feature-flag/limit-tooltip";
import { Heading, Span } from "@/components/general/micro/typography";
import PlanSelector from "@/components/landing/pricing/v4/payment-selector";
import { CreateOrganizationModal } from "@/components/organization/create-organization";
import WorkspaceSelection from "@/components/workspace/selection";
import { syncUserData } from "@/components/wrappers/loaders/authenticated-layout";
import { useLimitUI } from "@/hooks/use-limit-ui";
import { FEATURE_LIMITS } from "@/lib/constants/feature-limits";
import usePlanSelectorStore from "@/zustand/use-plan-selector-store";
import useOrganizationStore from "@/zustand/useorganization-store";
import useUserStore from "@/zustand/useuser-store";

const WorkSpaceSelection = () => {
	const { organizations } = useOrganizationStore();
	const [createModalOpen, setCreateModalOpen] = useState(false);

	const { isOpen, close, type, currentPlanId, currentInterval } =
		usePlanSelectorStore();

	const hasSyncedRef = useRef(false);
	const { data: session, status } = useSession();
	const { setUser, hasHydratedUser } = useUserStore();

	const orgCount = organizations.length;

	// use workspaces limit
	const workspaceLimitUI = useLimitUI({
		warningThreshold: 80,
		currentCount: orgCount,
		limitType: "workspaces",
		limitId: FEATURE_LIMITS.WORKSPACES,
	});

	// Memoized sync function to prevent recreations
	const syncUserStoreData = useCallback(
		(userData: any) => {
			if (hasSyncedRef.current) return; // Prevent multiple syncs

			try {
				const syncedData = syncUserData(userData);
				setUser(syncedData);
				hasSyncedRef.current = true;
			} catch {}
		},
		[setUser],
	);

	// Single effect to handle user store synchronization
	useEffect(() => {
		if (
			status === "authenticated" &&
			session?.user &&
			!hasHydratedUser &&
			!hasSyncedRef.current
		) {
			syncUserStoreData(session.user);
		}
	}, [status, session?.user, hasHydratedUser, syncUserStoreData]);

	return (
		<>
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
			<PlanSelector
				open={isOpen}
				type={type || "upgrade"}
				currentPlanId={currentPlanId || ""}
				onOpenChange={open => {
					if (!open) close();
				}}
				currentInterval={currentInterval}
			/>
		</>
	);
};

export default WorkSpaceSelection;
