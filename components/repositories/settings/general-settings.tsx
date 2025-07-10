/* eslint-disable import/no-unresolved */
"use client";

import { Pause, Play, Settings } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

interface RepoGeneralSettingsCardProps {
	name?: string;
	loading?: boolean;
	description?: string;
	connected_by?: string;
	status?: "connected" | "paused";
}

export const RepoGeneralSettingsCard = ({
	name,
	description,
	connected_by,
	loading = true,
	status = "paused",
}: RepoGeneralSettingsCardProps) => {
	const isConnected = status === "connected";
	if (loading) {
		return (
			<Card className="border-zinc-800 bg-zinc-900">
				<CardHeader>
					<CardTitle className="flex items-center text-lg text-zinc-100">
						<Settings className="mr-2 h-5 w-5" />
						<Skeleton className="h-6 w-40 bg-zinc-800" />
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
						<Skeleton className="h-16 w-full rounded-md bg-zinc-800" />
						<Skeleton className="h-16 w-full rounded-md bg-zinc-800" />
					</div>
					<Skeleton className="h-20 w-full rounded-md" />
					<Separator className="bg-zinc-800" />
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-3">
							<Skeleton className="h-5 w-5 rounded-full bg-zinc-800" />
							<div className="space-y-2">
								<Skeleton className="h-4 w-32 bg-zinc-800" />
								<Skeleton className="h-3 w-48 bg-zinc-800" />
							</div>
						</div>
						<Skeleton className="h-6 w-16 rounded-md bg-zinc-800" />
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="border-zinc-800 bg-zinc-900 text-zinc-100 shadow-sm">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-lg font-semibold text-zinc-100">
					<Settings className="h-5 w-5 text-zinc-400" />
					General Settings
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
					<div className="space-y-1">
						<Label className="text-xs uppercase tracking-wide text-zinc-500">
							Repository Name
						</Label>
						<p className="text-sm text-zinc-100">{name}</p>
					</div>
					<div className="space-y-1">
						<Label className="text-xs uppercase tracking-wide text-zinc-500">
							Connected By
						</Label>
						<p className="text-sm text-zinc-100">{connected_by}</p>
					</div>
				</div>

				<div className="space-y-1">
					<Label className="text-xs uppercase tracking-wide text-zinc-500">
						Description
					</Label>
					<p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-100">
						{description || "No description provided."}
					</p>
				</div>

				<Separator className="bg-zinc-800" />

				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-3">
						{isConnected ? (
							<Play className="h-5 w-5 text-green-500" />
						) : (
							<Pause className="h-5 w-5 text-zinc-500" />
						)}
						<div className="space-y-1">
							<p className="text-xs font-medium text-zinc-400">
								Repository Status
							</p>
							<p className="text-xs text-zinc-500">
								{isConnected
									? "Actively tracking commits"
									: "Tracking is currently paused"}
							</p>
						</div>
					</div>
					<Badge
						variant="outline"
						className={
							isConnected
								? "border-green-600 bg-green-100/10 text-green-400"
								: "border-zinc-700 bg-zinc-800 text-zinc-400"
						}
					>
						{isConnected ? "Active" : "Paused"}
					</Badge>
				</div>
			</CardContent>
		</Card>
	);
};
