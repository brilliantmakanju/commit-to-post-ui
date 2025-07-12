"use client";

/* eslint-disable import/no-unresolved */
import { Sparkles } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";

interface AISettings {
	ai_tone: string;
	ai_enabled: boolean;
	tracked_branch: string;
}

interface RepoAISettingsCardProps {
	settings: AISettings;
	loading?: boolean;
	onChange: <K extends keyof AISettings>(key: K, value: AISettings[K]) => void;
}

export const RepoAISettingsCard = ({
	settings,
	loading = true,
	onChange,
}: RepoAISettingsCardProps) => {
	if (loading) {
		return (
			<Card className="border-zinc-800 bg-zinc-900 text-zinc-100">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-lg">
						<Sparkles className="h-5 w-5 text-zinc-400" />
						<Skeleton className="h-6 w-32 bg-zinc-800" />
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					<Skeleton className="h-14 w-full rounded-md bg-zinc-800" />
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
					<Sparkles className="h-5 w-5 text-indigo-400" />
					AI Settings
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-8">
				{/* AI Toggle */}
				{/* <div className="flex items-start justify-between gap-4">
					<div className="space-y-1">
						<Label className="text-sm font-medium text-zinc-100">
							Enable AI Rewrite
						</Label>
						<p className="max-w-xs text-xs text-zinc-400">
							Use AI to transform commit messages into social media posts
						</p>
					</div>
					<Switch
						checked={settings.ai_enabled}
						onCheckedChange={checked => onChange("ai_enabled", checked)}
					/>
				</div> */}

				{/* AI Tone Preset */}
				{settings.ai_enabled && (
					<div className="space-y-2">
						<Label className="text-sm font-medium text-zinc-100">
							AI Tone Preset
						</Label>
						<Select
							value={settings.ai_tone}
							onValueChange={value => onChange("ai_tone", value)}
						>
							<SelectTrigger className="border-zinc-700 bg-zinc-800 text-zinc-100">
								<SelectValue placeholder="Select tone" />
							</SelectTrigger>
							<SelectContent className="border-zinc-700 bg-zinc-900 text-zinc-100">
								<SelectItem value="chill">Chill</SelectItem>
								<SelectItem value="casual">Casual</SelectItem>
								<SelectItem value="technical">Technical</SelectItem>
								<SelectItem value="educational">Educational</SelectItem>
								<SelectItem value="enthusiastic">Enthusiastic</SelectItem>
								<SelectItem value="professional">Professional</SelectItem>
							</SelectContent>
						</Select>
						<p className="text-xs text-zinc-400">
							Default tone for AI-generated posts
						</p>
					</div>
				)}

				{/* Tracked Branch */}
				<div className="space-y-2">
					<Label className="text-sm font-medium text-zinc-100">
						Tracked Branch
					</Label>
					<Input
						value={settings.tracked_branch}
						onChange={event_ => onChange("tracked_branch", event_.target.value)}
						className="border-zinc-700 bg-zinc-800 text-zinc-100 placeholder-zinc-500"
						placeholder="main"
					/>
					<p className="text-xs text-zinc-400">
						The branch to monitor for new commits
					</p>
				</div>
			</CardContent>
		</Card>
	);
};
