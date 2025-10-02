/* eslint-disable import/no-unresolved */
"use client";

import { AlertCircle, Lock } from "lucide-react";
import Link from "next/link";
import React from "react";

import FeatureLimitWrapper from "@/components/feature-flag/feature-limit-wrapper";
import LimitTooltip from "@/components/feature-flag/limit-tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import useRetrieveTones from "@/hooks/core/repo/get-tones";
import { FEATURE_LIMITS } from "@/lib/constants/feature-limits";
import { cn } from "@/lib/utils";

import { SlideInPanel } from "./slide-in-panel";

interface GeneratorSidebarProps {
	isOpen: boolean;
	disabled?: boolean;
	onClose: () => void;
	isGenerating: boolean;
	selectedTones: Set<string>;
	generateVariants: () => void;
	userPlan?: "basic" | "pro" | "studio";
	setSelectedTones: (ids: Set<string>) => void;
	availableCredits?: number; // User's current credit balance
}

// Minimalist tone descriptions
const TONE_DESCRIPTIONS: Record<string, string> = {
	friendly: "Warm and trustworthy",
	minimalist: "Concise and direct",
	educational: "Clear and informative",
	inspiring: "Uplifting and empowering",
	startup: "Innovative and growth-focused",
	supportive: "Empathetic and encouraging",
	casual: "Conversational and approachable",
	motivational: "Action-oriented and energizing",
	professional: "Polished business communication",
	technical: "Precise language with clear explanations",
};

// Define which tones are available on basic plan
const BASIC_PLAN_TONES = new Set(["professional"]);

// Cost per tone variant (1 credit per tone)
const CREDIT_COST_PER_TONE = 1;

export const GeneratorSidebar: React.FC<GeneratorSidebarProps> = ({
	isOpen,
	onClose,
	disabled = false,
	isGenerating,
	selectedTones,
	setSelectedTones,
	generateVariants,
	userPlan = "basic", // Default to basic for safety
	availableCredits = 0, // Default to 0 for safety
}) => {
	const { tones, isTonesLoading } = useRetrieveTones();
	const isBasicPlan = userPlan === "basic";
	const MAX_SELECTIONS = isBasicPlan ? 1 : 3;

	// Calculate required credits and check if user has enough
	const requiredCredits = selectedTones.size * CREDIT_COST_PER_TONE;
	const hasInsufficientCredits = requiredCredits > availableCredits;
	const canAffordTone = (additionalTones: number = 0) => {
		const totalRequired =
			(selectedTones.size + additionalTones) * CREDIT_COST_PER_TONE;
		return totalRequired <= availableCredits;
	};

	const toggleTone = (toneId: string) => {
		if (disabled || isTonesLoading) return;

		// Check if tone is locked for basic plan
		if (isBasicPlan && !BASIC_PLAN_TONES.has(toneId)) {
			return; // Don't allow selection
		}

		const next = new Set(selectedTones);

		if (next.has(toneId)) {
			// Always allow deselection
			next.delete(toneId);
		} else if (next.size < MAX_SELECTIONS) {
			// Check if user can afford to add another tone
			if (!canAffordTone(1)) {
				// Don't add the tone - insufficient credits
				return;
			}
			next.add(toneId);
		}

		setSelectedTones(next);
	};

	const clearAllTones = () => {
		if (disabled || isTonesLoading) return;
		setSelectedTones(new Set());
	};

	// Handle keyboard navigation
	const handleKeyDown = (event: React.KeyboardEvent, toneId: string) => {
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			toggleTone(toneId);
		}
	};

	// Validate and sanitize selections before generating
	const handleGenerateVariants = () => {
		// Enforce plan limits
		let validatedTones = new Set(selectedTones);

		// For basic plan: only allow professional tone and max 1
		if (isBasicPlan) {
			const filteredTones = [...validatedTones].filter(tone =>
				BASIC_PLAN_TONES.has(tone),
			);
			validatedTones = new Set(filteredTones.slice(0, 1));
		} else {
			// For other plans: max 3 tones
			validatedTones = new Set([...validatedTones].slice(0, 3));
		}

		// Check credits one more time before generation
		const finalRequiredCredits = validatedTones.size * CREDIT_COST_PER_TONE;
		if (finalRequiredCredits > availableCredits) {
			// Insufficient credits - don't proceed
			return;
		}

		// Update selection to validated set if it changed
		if (validatedTones.size !== selectedTones.size) {
			setSelectedTones(validatedTones);
		}

		// Proceed with generation if we have valid tones
		if (validatedTones.size > 0) {
			generateVariants();
		}
	};

	// Sort tones: professional first, then selected, then alphabetically
	const sortedTones = tones
		? [...tones].sort((a, b) => {
				// Professional always comes first
				if (a.value === "professional") return -1;
				if (b.value === "professional") return 1;

				const aSelected = selectedTones.has(a.value);
				const bSelected = selectedTones.has(b.value);

				// Then sort by selection status
				if (aSelected && !bSelected) return -1;
				if (!aSelected && bSelected) return 1;

				// Finally alphabetically
				return a.label.localeCompare(b.label);
			})
		: [];

	// Loading state
	if (isTonesLoading) {
		return (
			<SlideInPanel
				isOpen={isOpen}
				onClose={onClose}
				title="Generate Variants"
				widthClassName="w-full sm:w-[400px]"
			>
				<div className="flex h-64 items-center justify-center">
					<div className="h-5 w-5 animate-spin rounded-full border border-white/20 border-t-white" />
				</div>
			</SlideInPanel>
		);
	}

	// Error state
	if (!tones || tones.length === 0) {
		return (
			<SlideInPanel
				isOpen={isOpen}
				onClose={onClose}
				title="Generate Variants"
				widthClassName="w-full sm:w-[400px]"
			>
				<div className="flex h-64 items-center justify-center">
					<div className="text-center text-white/60">
						<div className="mb-2 text-sm">Unable to load tones</div>
						<div className="text-xs">Please refresh and try again</div>
					</div>
				</div>
			</SlideInPanel>
		);
	}

	const isMaxReached = selectedTones.size >= MAX_SELECTIONS;

	return (
		<SlideInPanel
			isOpen={isOpen}
			onClose={onClose}
			title="Generate Variants"
			widthClassName="w-full sm:w-[400px]"
		>
			<div className="scrollbar-hide flex h-full flex-col">
				{/* Content */}
				<div className="scrollbar-hide flex-1 overflow-y-auto px-6 py-4">
					{/* Info and tip at the top */}
					<div className="mb-6 space-y-3">
						{/* Credits display */}
						<Alert className="border-white/10 bg-white/[0.02]">
							<AlertDescription className="text-xs text-white/70">
								<div className="flex items-center justify-between">
									<span>
										<span className="font-medium text-white/80">Credits:</span>{" "}
										{availableCredits} available
									</span>
									<span className="text-white/50">
										1 credit per tone variant
									</span>
								</div>
							</AlertDescription>
						</Alert>

						{MAX_SELECTIONS === 3 && (
							<Alert className="border-white/10 bg-white/[0.02]">
								<AlertDescription className="text-xs text-white/70">
									<span className="font-medium text-white/80">Info:</span>{" "}
									Select up to {MAX_SELECTIONS} tones to create focused,
									high-quality variants
								</AlertDescription>
							</Alert>
						)}

						{isBasicPlan && (
							<Alert className="border-amber-500/20 bg-amber-500/[0.05]">
								<AlertDescription className="text-xs text-amber-200/90">
									<span className="font-medium">Basic Plan:</span> Only
									Professional tone available. Upgrade to Pro for access to all{" "}
									{tones?.length || 10} tones.
								</AlertDescription>
							</Alert>
						)}

						{/* Insufficient credits warning */}
						{hasInsufficientCredits && selectedTones.size > 0 && (
							<Alert className="border-red-500/20 bg-red-500/[0.05]">
								<AlertCircle className="h-4 w-4 text-red-400" />
								<AlertDescription className="text-xs text-red-200/90">
									<span className="font-medium">Insufficient Credits:</span> You
									need {requiredCredits} credit
									{requiredCredits === 1 ? "" : "s"} but only have{" "}
									{availableCredits}.{" "}
									<Link href="/refill" className="underline hover:text-red-100">
										Refill now
									</Link>
								</AlertDescription>
							</Alert>
						)}

						{isMaxReached && !isBasicPlan && (
							<Alert className="border-white/20 bg-white/[0.03]">
								<AlertDescription className="text-xs text-white/80">
									Maximum selections reached. Deselect a tone to choose another.
								</AlertDescription>
							</Alert>
						)}
					</div>

					{/* Header with selection count */}
					<div className="mb-6 flex items-center justify-between">
						<div className="flex items-center gap-2 p-1">
							<div className="text-sm text-white/90">
								{selectedTones.size}/{MAX_SELECTIONS} selected
							</div>
							{selectedTones.size > 0 && (
								<div className="flex items-center gap-1">
									{Array.from({ length: selectedTones.size }, (_, index) => (
										<div
											key={index}
											className="h-1.5 w-1.5 rounded-full bg-white/70"
										/>
									))}
									{Array.from(
										{ length: MAX_SELECTIONS - selectedTones.size },
										(_, index) => (
											<div
												key={index + selectedTones.size}
												className="h-1.5 w-1.5 rounded-full bg-white/20"
											/>
										),
									)}
								</div>
							)}
						</div>
						{selectedTones.size > 0 && (
							<Button
								variant="ghost"
								size="sm"
								onClick={clearAllTones}
								disabled={disabled}
								className="h-auto p-0 text-xs text-white/50 hover:bg-transparent hover:text-white/70"
							>
								Clear all
							</Button>
						)}
					</div>

					{/* Tone options with keyboard navigation */}
					<div className="scrollbar-hide space-y-3 overflow-y-auto overflow-x-hidden p-1">
						{sortedTones.map(tone => {
							const isSelected = selectedTones.has(tone.value);
							const isLockedForPlan =
								isBasicPlan && !BASIC_PLAN_TONES.has(tone.value);
							const canAffordThisTone = isSelected || canAffordTone(1);
							const isDisabled =
								disabled ||
								(isMaxReached && !isSelected) ||
								isLockedForPlan ||
								!canAffordThisTone;

							// For locked tones (plan restriction), wrap in FeatureLimitWrapper
							if (isLockedForPlan) {
								return (
									<div key={tone.value} className="relative">
										<FeatureLimitWrapper
											limitId={FEATURE_LIMITS.AI_TONES}
											currentCount={1}
											fallback={
												<LimitTooltip
													position="bottom"
													currentUsage={1}
													limitType="ai_tones"
													maxLimit={1}
												>
													<div className="relative cursor-not-allowed">
														<Button
															variant="ghost"
															disabled
															className={cn(
																"h-auto w-full justify-start p-4 text-left transition-all",
																"rounded-lg border border-white/5 bg-white/[0.005] opacity-60",
															)}
														>
															<div className="flex w-full items-start justify-between">
																<div className="flex-1 text-left">
																	<div className="mb-1 flex items-center gap-2">
																		<span className="text-sm font-medium text-white/60">
																			{tone.label}
																		</span>
																	</div>
																	<div className="text-xs text-white/40">
																		{TONE_DESCRIPTIONS[tone.value] ||
																			"Custom tone style"}
																	</div>
																</div>
															</div>
														</Button>
														<div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-black/10">
															<Lock className="h-4 w-4 text-white/30" />
														</div>
													</div>
												</LimitTooltip>
											}
										>
											{/* This won't render for basic plan users */}
											<div />
										</FeatureLimitWrapper>
									</div>
								);
							}

							// For tones with insufficient credits, show tooltip
							if (!canAffordThisTone && !isSelected) {
								return (
									<div key={tone.value} className="relative">
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<div className="relative cursor-not-allowed">
														<Button
															variant="ghost"
															disabled
															className={cn(
																"h-auto w-full justify-start p-4 text-left transition-all",
																"rounded-lg border border-white/5 bg-white/[0.005] opacity-50",
															)}
														>
															<div className="flex w-full items-start justify-between">
																<div className="flex-1 text-left">
																	<div className="mb-1 flex items-center gap-2">
																		<span className="text-sm font-medium text-white/60">
																			{tone.label}
																		</span>
																		<Badge
																			variant="outline"
																			className="h-4 border-red-500/30 bg-red-500/10 px-1.5 text-[10px] text-red-200/80"
																		>
																			<AlertCircle className="mr-1 h-2.5 w-2.5" />
																			No credits
																		</Badge>
																	</div>
																	<div className="text-xs text-white/40">
																		{TONE_DESCRIPTIONS[tone.value] ||
																			"Custom tone style"}
																	</div>
																</div>
															</div>
														</Button>
													</div>
												</TooltipTrigger>
												<TooltipContent
													side="bottom"
													className="max-w-xs border-red-500/20 bg-zinc-900 text-white"
												>
													<div className="space-y-2 p-1">
														<p className="text-sm font-medium">
															Insufficient Credits
														</p>
														<p className="text-xs text-white/70">
															You need {selectedTones.size + 1} credit
															{selectedTones.size + 1 === 1 ? "" : "s"} but only
															have {availableCredits}.
														</p>
														<Link
															href="/refill"
															className="inline-flex items-center text-xs text-blue-400 hover:text-blue-300 hover:underline"
														>
															Refill credits →
														</Link>
													</div>
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									</div>
								);
							}

							// Regular tone selection (available for user's plan and sufficient credits)
							return (
								<div key={tone.value} className="relative">
									<Button
										variant="ghost"
										onClick={() => toggleTone(tone.value)}
										onKeyDown={event_ => handleKeyDown(event_, tone.value)}
										disabled={isDisabled}
										tabIndex={isDisabled ? -1 : 0}
										className={cn(
											"h-auto w-full justify-start p-4 text-left transition-all hover:bg-white/[0.02]",
											"rounded-lg border focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-0",
											isSelected
												? "border-white/30 bg-white/5"
												: isDisabled
													? "border-white/5 bg-white/[0.005] opacity-40"
													: "border-white/10 hover:border-white/20",
											isDisabled && "cursor-not-allowed",
										)}
										title={
											isDisabled && !disabled
												? "Maximum tones selected. Deselect another to choose this one."
												: undefined
										}
									>
										<div className="flex w-full items-start justify-between">
											<div className="flex-1 text-left">
												<div className="mb-1 flex items-center gap-2">
													<span className="text-sm font-medium text-white">
														{tone.label}
													</span>
													{isSelected && (
														<Badge
															variant="outline"
															className="h-4 border-white/30 bg-white/10 px-1.5 text-[10px] text-white/60"
														>
															#{[...selectedTones].indexOf(tone.value) + 1}
														</Badge>
													)}
												</div>
												<div className="text-xs text-white/60">
													{TONE_DESCRIPTIONS[tone.value] || "Custom tone style"}
												</div>
											</div>
											{isSelected && (
												<div className="mt-1 h-2 w-2 rounded-full bg-white" />
											)}
										</div>
									</Button>
									{isDisabled &&
										!disabled &&
										!isLockedForPlan &&
										canAffordThisTone && (
											<div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-black/20">
												<Badge
													variant="secondary"
													className="bg-black/80 text-xs text-white/90"
												>
													Max selections reached
												</Badge>
											</div>
										)}
								</div>
							);
						})}
					</div>
				</div>

				{/* Generate button */}
				<div className="border-t border-white/10 p-6">
					{hasInsufficientCredits && selectedTones.size > 0 ? (
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<div className="w-full">
										<Button
											disabled
											className="w-full bg-white/10 text-white/40"
											size="lg"
										>
											<AlertCircle className="mr-2 h-4 w-4" />
											Insufficient Credits
										</Button>
									</div>
								</TooltipTrigger>
								<TooltipContent
									side="top"
									className="max-w-xs border-red-500/20 bg-zinc-900 text-white"
								>
									<div className="space-y-2 p-1">
										<p className="text-sm font-medium">Not Enough Credits</p>
										<p className="text-xs text-white/70">
											You need {requiredCredits} credit
											{requiredCredits === 1 ? "" : "s"} to generate{" "}
											{selectedTones.size} variant
											{selectedTones.size === 1 ? "" : "s"}, but you only have{" "}
											{availableCredits}.
										</p>
										<Link
											href="/refill"
											className="inline-flex items-center text-xs text-blue-400 hover:text-blue-300 hover:underline"
										>
											Refill credits →
										</Link>
									</div>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					) : (
						<Button
							onClick={handleGenerateVariants}
							disabled={disabled || selectedTones.size === 0 || isGenerating}
							className="w-full bg-white text-black hover:bg-white/90 disabled:bg-white/10 disabled:text-white/40"
							size="lg"
						>
							{isGenerating ? (
								<div className="flex items-center gap-2">
									<div className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
									<span>Generating {selectedTones.size} variants...</span>
								</div>
							) : selectedTones.size === 0 ? (
								"Select tones to generate"
							) : (
								`Generate ${selectedTones.size} variant${selectedTones.size === 1 ? "" : "s"} (${requiredCredits} credit${requiredCredits === 1 ? "" : "s"})`
							)}
						</Button>
					)}
					{selectedTones.size > 0 &&
						!isGenerating &&
						!hasInsufficientCredits && (
							<div className="mt-2 text-center text-xs text-white/50">
								This will create {selectedTones.size} new version
								{selectedTones.size === 1 ? "" : "s"} and use {requiredCredits}{" "}
								credit
								{requiredCredits === 1 ? "" : "s"}
							</div>
						)}
				</div>
			</div>
		</SlideInPanel>
	);
};
