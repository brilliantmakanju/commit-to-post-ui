"use client";

/* eslint-disable import/no-unresolved */
import { Filter } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

interface CommitFilterSettings {
	ignored_keywords: string;
	prefix_filter: string;
}

interface RepoCommitFiltersCardProps {
	settings: CommitFilterSettings;
	loading?: boolean;
	onChange: <K extends keyof CommitFilterSettings>(
		key: K,
		value: CommitFilterSettings[K],
	) => void;
}

export const RepoCommitFiltersCard = ({
	settings,
	onChange,
	loading = true,
}: RepoCommitFiltersCardProps) => {
	if (loading) {
		return (
			<Card className="border-zinc-800 bg-zinc-900 text-zinc-100">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-lg">
						<Filter className="h-5 w-5 text-zinc-400" />
						<Skeleton className="h-6 w-36 bg-zinc-800" />
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					<Skeleton className="h-20 w-full rounded-md bg-zinc-800" />
					<Skeleton className="h-20 w-full rounded-md bg-zinc-800" />
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="border-zinc-800 bg-zinc-900 text-zinc-100 shadow-sm">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-lg font-semibold text-zinc-100">
					<Filter className="h-5 w-5 text-purple-400" />
					Commit Filters
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Ignore Keywords */}
				<div className="space-y-2">
					<Label className="text-sm font-medium text-zinc-100">
						Ignore Commit Keywords
					</Label>
					<Input
						value={settings.ignored_keywords}
						onChange={event_ =>
							onChange("ignored_keywords", event_.target.value)
						}
						className="border-zinc-700 bg-zinc-800 text-zinc-100 placeholder-zinc-500"
						placeholder="wip, temp, draft, test"
					/>
					<p className="text-xs text-zinc-400">
						Skip commits containing these keywords (comma-separated)
					</p>
				</div>

				{/* Prefix Filter */}
				<div className="space-y-2">
					<Label className="text-sm font-medium text-zinc-100">
						Commit Prefix Filter
					</Label>
					<Input
						value={settings.prefix_filter}
						onChange={event_ => onChange("prefix_filter", event_.target.value)}
						className="border-zinc-700 bg-zinc-800 text-zinc-100 placeholder-zinc-500"
						placeholder="feat, fix, chore"
					/>
					<p className="text-xs text-zinc-400">
						Only process commits with these prefixes (comma-separated)
					</p>
				</div>
			</CardContent>
		</Card>
	);
};
