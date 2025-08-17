"use client";
import React, { useState } from "react";

import {
	MobileNav,
	MobileNavHeader,
	MobileNavMenu,
	MobileNavToggle,
	Navbar,
	NavbarButton,
	NavbarLogo,
	NavBody,
	NavItems,
	// eslint-disable-next-line import/no-unresolved
} from "@/components/ui/resizable-navbar";

import { CreateOrganizationModal } from "../organization/create-organization";
import { Button } from "../ui/button";

const WorkspaceTopNav = () => {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [createModalOpen, setCreateModalOpen] = useState(false);

	// Determine what to show in the auth area
	const renderAuthContent = () => {
		return (
			<NavbarButton
				variant="secondary"
				className="w-full bg-transparent hover:bg-transparent"
			>
				<Button
					variant="default"
					className="w-full"
					onClick={() => setCreateModalOpen(true)}
				>
					Create a new workspace
				</Button>
			</NavbarButton>
		);
	};
	return (
		<>
			<Navbar>
				{/* Desktop Navigation */}
				<NavBody>
					<NavbarLogo />
					<div className="flex items-center gap-4">{renderAuthContent()}</div>
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
							{renderAuthContent()}
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
