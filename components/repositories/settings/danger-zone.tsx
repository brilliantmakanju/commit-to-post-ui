/* eslint-disable import/no-unresolved */
"use client";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

interface RepoDangerZoneCardProps {
	onDisconnect: () => void;
	loading?: boolean;
	disabled?: boolean;
}

export const RepoDangerZoneCard = ({
	onDisconnect,
	loading = true,
	disabled = false,
}: RepoDangerZoneCardProps) => {
	if (loading) {
		return (
			<Card className="border-red-200 bg-red-50 dark:border-red-700 dark:bg-red-900/10">
				<CardHeader>
					<CardTitle className="text-lg text-red-800 dark:text-red-400">
						<Skeleton className="h-5 w-28 bg-red-100 dark:bg-red-700/30" />
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<Skeleton className="h-12 w-full rounded-md sm:w-2/3" />
						<Skeleton className="h-10 w-24 rounded-md" />
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="border-red-200 bg-red-50 dark:border-red-700 dark:bg-red-900/10">
			<CardHeader>
				<CardTitle className="text-lg text-red-800 dark:text-red-400">
					Danger Zone
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<Label className="text-sm font-medium text-red-800 dark:text-red-400">
							Disconnect Repository
						</Label>
						<p className="mt-1 text-xs text-gray-700 dark:text-red-200/70">
							This will stop tracking commits and remove all settings. This
							action cannot be undone.
						</p>
					</div>
					<Button
						variant="destructive"
						size="sm"
						onClick={onDisconnect}
						disabled={disabled}
					>
						<Trash2 className="mr-2 h-4 w-4" />
						Disconnect
					</Button>
				</div>
			</CardContent>
		</Card>
	);
};
