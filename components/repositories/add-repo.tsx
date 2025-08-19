/* eslint-disable import/no-unresolved */
"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

import ConnectRepoOnboarding from "../onboarding/v2/screens/connect-repo";

interface AddRepositoryModalProps {
	open: boolean;
	onSuccess: () => void;
	onOpenChange: (open: boolean) => void;
}

export function AddRepositoryModal({
	open,
	onOpenChange,
}: AddRepositoryModalProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="flex max-h-[700px] flex-col items-start justify-start gap-3 sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>Add New Repository</DialogTitle>
					<DialogDescription>
						Connect your Git repository to start generating social media posts
					</DialogDescription>
				</DialogHeader>
				<div className="w-full">
					<ConnectRepoOnboarding />
				</div>
			</DialogContent>
		</Dialog>
	);
}
