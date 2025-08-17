/* eslint-disable import/no-unresolved */
"use client";
import { useSession } from "next-auth/react";
import { useState } from "react";

import { Heading, Span } from "@/components/general/micro/typography";
import { CreateOrganizationModal } from "@/components/organization/create-organization";
import WorkspaceSelection from "@/components/workspace/selection";

const WorkSpaceSelection = () => {
	const { data } = useSession();
	const [createModalOpen, setCreateModalOpen] = useState(false);

	return (
		<div className="min-h-full w-full px-4 py-5 sm:px-8 lg:px-20">
			<div className="mb-16">
				<Heading className="mb-4 text-5xl font-light text-arch-black lg:text-6xl">
					😶‍🌫️ Welcome back
				</Heading>
				<Span className="text-base text-gray-600 lg:text-lg">
					Choose a workspace to continue
				</Span>
			</div>

			<WorkspaceSelection />

			<div className="mt-16 flex w-full items-center justify-between border-t border-gray-200 pt-8">
				<button
					onClick={() => setCreateModalOpen(true)}
					className="text-base text-arch-black transition-colors hover:text-gray-600"
				>
					+ Create workspace
				</button>
				<Span className="text-sm text-gray-400">{data?.user.email}</Span>
			</div>

			<CreateOrganizationModal
				open={createModalOpen}
				onOpenChange={setCreateModalOpen}
			/>
		</div>
	);
};

export default WorkSpaceSelection;
