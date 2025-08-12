/* eslint-disable import/no-unresolved */
"use client";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import useRepoDetails from "@/hooks/core/repo/get-repo-detail-hook";

interface RepoDangerZoneCardProps {
	repo_id: string;
	loading?: boolean;
	disabled?: boolean;
	onDelete: () => void;
}

export const RepoDangerZoneCard = ({
	repo_id,
	onDelete,
	loading = true,
	disabled = true,
}: RepoDangerZoneCardProps) => {
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [confirmationName, setConfirmationName] = useState("");
	const [isDeleting, setIsDeleting] = useState(false);

	const {
		repoDetails: repository,
		isLoadingRepoDetails,
		isError,
	} = useRepoDetails(repo_id);

	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			await onDelete();
		} finally {
			setIsDeleting(false);
			setShowDeleteModal(false);
			setConfirmationName("");
		}
	};

	const isDeleteEnabled = confirmationName === repository?.name && !isDeleting;

	if (loading || isLoadingRepoDetails) {
		return (
			<Card className="border-red-800 bg-red-950/20">
				<CardHeader className="pb-4">
					<CardTitle className="flex items-center gap-2 text-red-400">
						<Skeleton className="h-5 w-5 rounded bg-red-800/30" />
						<Skeleton className="h-6 w-32 bg-red-800/30" />
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
						<div className="space-y-2">
							<Skeleton className="h-4 w-40 bg-red-800/30" />
							<Skeleton className="h-3 w-80 bg-red-800/30" />
							<Skeleton className="h-3 w-60 bg-red-800/30" />
						</div>
						<Skeleton className="h-9 w-28 bg-red-800/30" />
					</div>
				</CardContent>
			</Card>
		);
	}

	if (isError || !repository) {
		return;
	}

	return (
		<>
			<Card className="border-red-800 bg-red-950/20">
				<CardHeader className="pb-4">
					<CardTitle className="flex items-center gap-2 text-red-400">
						<AlertTriangle className="h-5 w-5" />
						Danger Zone
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
						<div className="space-y-1">
							<Label className="text-sm font-medium text-red-400">
								Delete Repository
							</Label>
							<p className="text-sm text-red-200/70">
								Permanently delete this repository and all its data. This action
								cannot be undone.
							</p>
						</div>
						<Button
							variant="destructive"
							size="sm"
							onClick={() => setShowDeleteModal(true)}
							disabled={disabled}
							className="shrink-0"
						>
							<Trash2 className="mr-2 h-4 w-4" />
							Delete Repository
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Delete Confirmation Dialog */}
			<Dialog
				open={showDeleteModal}
				onOpenChange={open => {
					setShowDeleteModal(open);
					if (!open) {
						setConfirmationName("");
					}
				}}
			>
				<DialogContent className="border border-red-800 bg-zinc-950 text-white">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-red-400">
							<Trash2 className="h-5 w-5" />
							Delete Repository
						</DialogTitle>
						<DialogDescription className="text-zinc-400">
							This action cannot be undone. Please type{" "}
							<strong className="font-mono font-semibold text-red-400">
								{repository.name}
							</strong>{" "}
							to confirm.
						</DialogDescription>
					</DialogHeader>

					{isDeleting ? (
						<div className="flex h-32 items-center justify-center">
							<div className="relative">
								<Loader2 className="h-8 w-8 animate-spin text-red-500" />
								<div className="absolute inset-0 h-8 w-8 animate-pulse rounded-full bg-red-500/20"></div>
							</div>
							<span className="ml-3 text-zinc-400">Deleting repository...</span>
						</div>
					) : (
						<div className="space-y-4">
							<div className="space-y-2">
								<Label
									htmlFor="confirm-name"
									className="text-sm font-medium text-white"
								>
									Repository name
								</Label>
								<Input
									id="confirm-name"
									type="text"
									value={confirmationName}
									onChange={event => setConfirmationName(event.target.value)}
									placeholder="Enter repository name"
									className="border-zinc-700 bg-zinc-900 font-mono text-white placeholder:text-zinc-500 focus:border-red-900/50 focus:ring-red-900/20"
									autoComplete="off"
								/>
							</div>

							<DialogFooter>
								<Button
									type="button"
									variant="outline"
									onClick={() => {
										setShowDeleteModal(false);
										setConfirmationName("");
									}}
									disabled={isDeleting}
									className="border-zinc-700 bg-transparent text-zinc-400 hover:bg-zinc-800 hover:text-white"
								>
									Cancel
								</Button>
								<Button
									type="button"
									variant="destructive"
									onClick={handleDelete}
									className="border border-red-900/50 bg-red-900/50 text-white hover:bg-red-900 disabled:border-zinc-700 disabled:bg-zinc-800 disabled:text-zinc-500"
									disabled={!isDeleteEnabled}
								>
									<Trash2 className="mr-2 h-4 w-4" />
									Delete Repository
								</Button>
							</DialogFooter>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
};
