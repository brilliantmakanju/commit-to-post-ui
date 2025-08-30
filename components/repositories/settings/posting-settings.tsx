"use client";

/* eslint-disable import/no-unresolved */
import { Send } from "lucide-react";
import { useEffect } from "react";

import FeatureLimitWrapper from "@/components/feature-flag/feature-limit-wrapper";
import LimitTooltip from "@/components/feature-flag/limit-tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useLimitUI } from "@/hooks/use-limit-ui";
import { FEATURE_LIMITS } from "@/lib/constants/feature-limits";

interface PostingSettings {
	posting_strategy: string;
	preferred_post_time: string;
	manual_approval: boolean;
}

interface RepoPostingSettingsCardProps {
	settings: PostingSettings;
	loading?: boolean;
	onChange: <K extends keyof PostingSettings>(
		key: K,
		value: PostingSettings[K],
	) => void;
}

function handlePostingStrategyChange(
	value: string | undefined,
	settings: PostingSettings,
	onChange: <K extends keyof PostingSettings>(
		key: K,
		value: PostingSettings[K],
	) => void,
) {
	if (!value) return;

	onChange("posting_strategy", value);
}

export const RepoPostingSettingsCard = ({
	settings,
	onChange,
	loading = true,
}: RepoPostingSettingsCardProps) => {
	const analyticsLimitUI = useLimitUI({
		currentCount: 1,
		warningThreshold: 80,
		limitType: "analytics",
		limitId: FEATURE_LIMITS.ADVANCED_ANALYTICS,
	});

	useEffect(() => {
		if (
			settings.posting_strategy === "manual" &&
			settings.manual_approval === false
		) {
			onChange("manual_approval", true);
		}
	}, [settings.posting_strategy, settings.manual_approval, onChange]);
	if (loading) {
		return (
			<Card className="border-zinc-800 bg-zinc-900 text-zinc-100">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-lg">
						<Send className="h-5 w-5 text-zinc-400" />
						<Skeleton className="h-6 w-40 bg-zinc-800" />
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					<Skeleton className="h-20 w-full rounded-md bg-zinc-800" />
					<Skeleton className="h-20 w-full rounded-md bg-zinc-800" />
					<Skeleton className="h-16 w-full rounded-md bg-zinc-800" />
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="border-zinc-800 bg-zinc-900 text-zinc-100 shadow-sm">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-lg font-semibold text-zinc-100">
					<Send className="h-5 w-5 text-purple-400" />
					Posting Settings
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Posting Strategy */}
				{/* <div className="space-y-2">
					<Label className="text-sm font-medium text-zinc-100">
						Posting Strategy
					</Label>
					<Select
						value={settings.posting_strategy}
						onValueChange={value =>
							handlePostingStrategyChange(value, settings, onChange)
						}
					>
						<SelectTrigger className="border-zinc-700 bg-zinc-800 text-zinc-100">
							<SelectValue placeholder="Select strategy" />
						</SelectTrigger>
						<SelectContent className="border-zinc-700 bg-zinc-900 text-zinc-100">
							<SelectItem value="eod">End of Day</SelectItem>
							<SelectItem value="immediate">Immediate</SelectItem>
							<SelectItem value="scheduled">Scheduled</SelectItem>
							<SelectItem value="manual">Manual Approval</SelectItem>
						</SelectContent>
					</Select>

					<p className="text-xs text-zinc-400">
						When to publish generated posts
					</p>
				</div> */}

				{/* Preferred Time */}
				{/* {settings.posting_strategy === "scheduled" && (
					<div className="space-y-2">
						<Label className="text-sm font-medium text-zinc-100">
							Preferred Post Time
						</Label>
						<TimePicker
							placeholder="Select preferred time"
							value={settings.preferred_post_time || "01:30"}
							className="border-gray-300 focus:border-gray-400"
							onChange={value => onChange("preferred_post_time", value)}
						/>
						<p className="text-xs text-zinc-400">
							Default time for scheduled posts
						</p>
					</div>
				)} */}

				{/* Manual Approval */}
				{/* {settings.posting_strategy === "manual" && ( */}
				<div className="flex items-center justify-between">
					<div>
						<Label className="text-sm font-medium text-zinc-100">
							Manual Approval
						</Label>
						<p className="mt-1 text-xs text-zinc-400">
							Require manual approval before publishing posts
						</p>
					</div>
					<FeatureLimitWrapper
						limitId={FEATURE_LIMITS.ADVANCED_ANALYTICS}
						currentCount={1}
						fallback={
							<LimitTooltip
								position="left"
								currentUsage={1}
								limitType="analytics"
								maxLimit={analyticsLimitUI.limit}
							>
								<div className="cursor-not-allowed opacity-50">
									<Switch checked={false} />
								</div>
							</LimitTooltip>
						}
					>
						<LimitTooltip
							position="left"
							currentUsage={1}
							limitType="analytics"
							maxLimit={analyticsLimitUI.limit}
						>
							<Switch
								checked={settings.manual_approval}
								onCheckedChange={checked =>
									onChange("manual_approval", checked)
								}
							/>
						</LimitTooltip>
					</FeatureLimitWrapper>
				</div>
				{/* )} */}

				{/* Future Feature (optional) */}
				{/* 
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<Label className="text-sm font-medium text-zinc-100">
							Daily Post Frequency Limit
						</Label>
						<Badge variant="secondary" className="text-xs text-zinc-400">Coming Soon</Badge>
					</div>
					<Input
						placeholder="e.g. Max 2 posts/day"
						className="border-zinc-700 bg-zinc-800 text-zinc-500"
						disabled
					/>
				</div>
				*/}
			</CardContent>
		</Card>
	);
};
