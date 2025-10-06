"use client";
import { useSession } from "next-auth/react";
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
import { hasWorkspaceAccess } from "@/lib/utils/feature-flag-utils";
import useUserStore from "@/zustand/useuser-store";

import { CreateOrganizationModal } from "../organization/create-organization";
import { Button } from "../ui/button";

const WorkspaceTopNav = () => {
	const [createModalOpen, setCreateModalOpen] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const { data: session } = useSession();
	const { plan, credits } = useUserStore();

	// NEW: Check if user has workspace access (studio plan + credits)
	const userPlan = plan;
	const userCredits = credits || 0;
	const canAccessWorkspace = hasWorkspaceAccess(
		userPlan,
		!!session?.user,
		userCredits,
	);

	const renderWorkspaceAction = () => {
		return (
			<>
				{canAccessWorkspace && (
					<Button
						variant="default"
						className="w-full"
						onClick={() => setCreateModalOpen(true)}
					>
						Create a new workspace
					</Button>
				)}
			</>
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
