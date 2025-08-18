"use client";
import React, { useState } from "react";

import {
	MobileNav,
	MobileNavHeader,
	MobileNavMenu,
	MobileNavToggle,
	Navbar,
	NavbarLogo,
	NavBody,
	// eslint-disable-next-line import/no-unresolved
} from "@/components/ui/resizable-navbar";
import { useLimitUI } from "@/hooks/use-limit-ui";
import { FEATURE_LIMITS } from "@/lib/constants/feature-limits";
import useOrganizationStore from "@/zustand/useorganization-store";

import FeatureLimitWrapper from "../feature-flag/feature-limit-wrapper";
import LimitTooltip from "../feature-flag/limit-tooltip";
import { CreateOrganizationModal } from "../organization/create-organization";
import { Button } from "../ui/button";

const WorkspaceTopNav = () => {
	const { organizations } = useOrganizationStore();
	const [createModalOpen, setCreateModalOpen] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const orgCount = organizations.length;

	// use workspaces limit, not social accounts
	const workspaceLimitUI = useLimitUI({
		warningThreshold: 80,
		currentCount: orgCount,
		limitType: "workspaces",
		limitId: FEATURE_LIMITS.WORKSPACES,
	});

	const renderWorkspaceAction = () => {
		return (
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
						<div className="w-full bg-transparent hover:bg-transparent">
							<button disabled className="w-full">
								Create a new workspace
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
					<div className="w-full bg-transparent hover:bg-transparent">
						<Button
							variant="default"
							className="w-full"
							onClick={() => setCreateModalOpen(true)}
						>
							Create a new workspace
						</Button>
					</div>
				</LimitTooltip>
			</FeatureLimitWrapper>
		);
	};

	return (
		<>
			<Navbar>
				{/* Desktop Navigation */}
				<NavBody>
					<NavbarLogo />
					<div className="flex items-center gap-4">
						{renderWorkspaceAction()}
					</div>
				</NavBody>

				{/* Mobile Navigation */}
				<MobileNav>
					<MobileNavHeader>
						<NavbarLogo />
						<MobileNavToggle
							isOpen={isMobileMenuOpen}
							onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
						/>
					</MobileNavHeader>

					<MobileNavMenu
						isOpen={isMobileMenuOpen}
						onClose={() => setIsMobileMenuOpen(false)}
					>
						<div className="flex w-full flex-col gap-4">
							{renderWorkspaceAction()}
						</div>
					</MobileNavMenu>
				</MobileNav>
			</Navbar>
			<CreateOrganizationModal
				open={createModalOpen}
				onOpenChange={setCreateModalOpen}
			/>
		</>
	);
};

export default WorkspaceTopNav;
