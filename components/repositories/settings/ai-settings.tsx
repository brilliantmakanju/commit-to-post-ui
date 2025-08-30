"use client";

import { Lock, Sparkles } from "lucide-react";

import FeatureLimitWrapper from "@/components/feature-flag/feature-limit-wrapper";
import LimitTooltip from "@/components/feature-flag/limit-tooltip";
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
import useRetrieveTones from "@/hooks/core/repo/get-tones";
import { useLimitUI } from "@/hooks/use-limit-ui";
import { FEATURE_LIMITS } from "@/lib/constants/feature-limits";
import useUserStore from "@/zustand/useuser-store";

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
	onChange,
	loading = true,
}: RepoAISettingsCardProps) => {
	const useStore = useUserStore();
	const { tones, isTonesLoading } = useRetrieveTones();

	const tonesLimitUI = useLimitUI({
		currentCount: 1,
		warningThreshold: 80,
		limitType: "ai_tones",
		limitId: FEATURE_LIMITS.AI_TONES,
	});

	if (loading || isTonesLoading) {
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

	// 🔑 Plan-based tone visibility logic
	let selectableTones: string[] = [];
	if (useStore.plan === "pro") {
		const firstTwo = tones.slice(0, 2);
		const middleIndex = Math.floor(tones.length / 2);
		const middleTwo = tones.slice(middleIndex, middleIndex + 2);
		selectableTones = [
			...firstTwo.map(t => t.value),
			...middleTwo.map(t => t.value),
		];
	} else if (useStore.plan === "studio") {
		selectableTones = tones.map(t => t.value);
	} else {
		// basic → only their current selected tone
		selectableTones = [settings.ai_tone];
	}

	// reorder tones → selected one always first
	const orderedTones = [
		...tones.filter(t => t.value === settings.ai_tone),
		...tones.filter(t => t.value !== settings.ai_tone),
	];

	const toneSelect = (
		<Select
			value={settings.ai_tone}
			onValueChange={value => {
				if (selectableTones.includes(value)) {
					onChange("ai_tone", value);
				}
			}}
		>
			<SelectTrigger className="w-full border-zinc-700 bg-zinc-800 text-zinc-100">
				<SelectValue placeholder="Select tone" />
			</SelectTrigger>
			<SelectContent
				className="max-h-64 min-w-[var(--radix-select-trigger-width)] border-zinc-700 bg-zinc-900 text-zinc-100"
				position="popper"
			>
				{orderedTones.map(tone => {
					const isSelectable = selectableTones.includes(tone.value);
					return (
						<SelectItem
							key={tone.value}
							value={tone.value}
							disabled={!isSelectable}
							className="flex w-full items-center justify-between"
						>
							<span>{tone.label}</span>
						</SelectItem>
					);
				})}
			</SelectContent>
		</Select>
	);

	return (
		<Card className="border-zinc-800 bg-zinc-900 text-zinc-100 shadow-sm">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-lg font-semibold text-zinc-100">
					<Sparkles className="h-5 w-5 text-indigo-400" />
					AI Settings
				</CardTitle>
			</CardHeader>
			<CardContent className="w-full space-y-8">
				{/* AI Tone Preset */}
				{settings.ai_enabled && (
					<div className="flex w-full flex-col items-start justify-start space-y-2">
						<Label className="text-sm font-medium text-zinc-100">
							Tone Preset
						</Label>
						<FeatureLimitWrapper
							limitId={FEATURE_LIMITS.AI_TONES}
							currentCount={1}
							fallback={
								<LimitTooltip
									position="left"
									currentUsage={1}
									limitType="ai_tones"
									maxLimit={tonesLimitUI.limit}
								>
									<div className="w-full cursor-not-allowed">
										<Select disabled>
											<SelectTrigger className="w-full border-zinc-700 bg-zinc-800 text-zinc-500">
												<SelectValue placeholder="Upgrade to unlock" />
											</SelectTrigger>
										</Select>
									</div>
								</LimitTooltip>
							}
						>
							{/* Make sure toneSelect has same structure */}
							<div className="w-full">{toneSelect}</div>
						</FeatureLimitWrapper>
						<p className="text-xs text-zinc-400">Default Tone: Professional</p>
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
