/* eslint-disable import/no-unresolved */
"use client";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Heading, Span } from "@/components/general/micro/typography";
import { CreateOrganizationModal } from "@/components/organization/create-organization";
import WorkspaceSelection from "@/components/workspace/selection";
import { syncUserData } from "@/components/wrappers/loaders/authenticated-layout";
import { hasWorkspaceAccess } from "@/lib/utils/feature-flag-utils";
import useOrganizationStore from "@/zustand/useorganization-store";
import useUserStore from "@/zustand/useuser-store";

const WorkSpaceSelection = () => {
	const { organizations } = useOrganizationStore();
	const [createModalOpen, setCreateModalOpen] = useState(false);

	const hasSyncedRef = useRef(false);
	const { data: session, status } = useSession();
	const { setUser, hasHydratedUser, plan, credits } = useUserStore();

	const orgCount = organizations.length;

	// NEW: Check if user has workspace access (studio plan + credits)
	const userPlan = plan;
	const userCredits = credits || 0;
	const canAccessWorkspace = hasWorkspaceAccess(
		userPlan,
		!!session?.user,
		userCredits,
	);

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
					{canAccessWorkspace && (
						<button
							onClick={() => setCreateModalOpen(true)}
							className="text-base text-arch-black transition-colors hover:text-gray-600"
						>
							+ Create workspace
						</button>
					)}
				</div>

				<CreateOrganizationModal
					open={createModalOpen}
					onOpenChange={setCreateModalOpen}
				/>
			</div>

			{/* <PlanSelector
				open={isOpen}
				type={type || "upgrade"}
				currentPlanId={currentPlanId || ""}
				onOpenChange={open => {
					if (!open) close();
				}}
				currentInterval={currentInterval}
			/> */}
		</>
	);
};

export default WorkSpaceSelection;
