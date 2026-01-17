/* eslint-disable import/no-unresolved */
"use client";

import { AlertCircle, Lock, RotateCcw } from "lucide-react";
import Link from "next/link";
import React, { useEffect } from "react";
import { toast } from "sonner";

import FeatureLimitWrapper from "@/components/feature-flag/feature-limit-wrapper";
import LimitTooltip from "@/components/feature-flag/limit-tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import useRetrieveTemplates from "@/hooks/core/repo/get-templates";
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
	selectedTemplates: Set<string>;
	generateVariants: () => void;
	userPlan?: "basic" | "pro" | "studio";
	setSelectedTones: (ids: Set<string>) => void;
	setSelectedTemplates: (ids: Set<string>) => void;
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
const BASIC_PLAN_TONES = new Set(["casual"]);

export const GeneratorSidebar: React.FC<GeneratorSidebarProps> = ({
	isOpen,
	onClose,
	isGenerating,
	selectedTones,
	setSelectedTones,
	selectedTemplates,
	setSelectedTemplates,
	disabled = false,
	generateVariants,
	userPlan = "basic", // Default to basic for safety
	availableCredits = 0, // Default to 0 for safety
}) => {
	const { tones, isTonesLoading } = useRetrieveTones();
	const { templates, isTemplatesLoading } = useRetrieveTemplates();

	const isBasicPlan = userPlan === "basic";

	// Ensure Professional is selected by default for basic plan if nothing is selected
	useEffect(() => {
		if (isOpen && selectedTones.size === 0) {
			setSelectedTones(new Set(["casual"]));
		}
	}, [isOpen, selectedTones.size, setSelectedTones]);

	// Ensure all templates are selected by default if nothing is selected
	// Removed auto-select logic as per user request

	// Calculate required credits and check if user has enough
	// New logic: 1 credit per generation batch
	const requiredCredits = 1;
	const hasInsufficientCredits = requiredCredits > availableCredits;

	const handleToneChange = (value: string) => {
		if (disabled || isTonesLoading) return;

		// Basic plan restriction check
		if (isBasicPlan && !BASIC_PLAN_TONES.has(value)) {
			return;
		}

		setSelectedTones(new Set([value]));
	};

	const toggleTemplate = (templateId: string) => {
		if (disabled || isTemplatesLoading) return;

		const next = new Set(selectedTemplates);
		if (next.has(templateId)) {
			next.delete(templateId);
		} else {
			if (next.size >= 3) {
				toast.error("You can only select up to 3 styles at once");
				return;
			}
			next.add(templateId);
		}
		setSelectedTemplates(next);
	};

	// Removed selectAllTemplates as per new design requirements

	const deselectAllTemplates = () => {
		if (disabled) return;
		setSelectedTemplates(new Set());
	};

	// Validate and sanitize selections before generating
	const handleGenerateVariants = () => {
		if (hasInsufficientCredits) return;
		if (selectedTones.size === 0 || selectedTemplates.size === 0) return;
		generateVariants();
	};

	// Sort tones: casual first, then alphabetically
	const sortedTones = tones
		? [...tones].sort((a, b) => {
				if (a.value === "casual") return -1;
				if (b.value === "casual") return 1;
				return a.label.localeCompare(b.label);
			})
		: [];

	const currentTone = [...selectedTones][0] || "casual";

	// Sort templates: selected first, then alphabetically
	// const sortedTemplates = templates
	// 	? [...templates].sort((a, b) => {
	// 			const aSelected = selectedTemplates.has(a.value);
	// 			const bSelected = selectedTemplates.has(b.value);
	// 			if (aSelected && !bSelected) return -1;
	// 			if (!aSelected && bSelected) return 1;
	// 			return a.label.localeCompare(b.label);
	// 		})
	// 	: [];

	const isLimitReached = selectedTemplates.size >= 3;

	return (
		<SlideInPanel
			isOpen={isOpen}
			onClose={onClose}
			title="Generate Variants"
			widthClassName="w-full sm:w-[500px]"
		>
			<div className="scrollbar-hide flex h-full flex-col">
				{/* Content */}
				<div className="scrollbar-hide flex-1 space-y-8 overflow-y-auto px-6 py-4">
					{/* Credits display */}
					{/* <Alert className="border-white/10 bg-white/[0.02]">
						<AlertDescription className="text-xs text-white/70">
							<div className="flex items-center justify-between">
								<span>
									<span className="font-medium text-white/80">Credits:</span>{" "}
									{availableCredits} available
								</span>
								<span className="text-white/50">1 credit per generation</span>
							</div>
						</AlertDescription>
					</Alert> */}

					{/* Tone Selection */}
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<label className="text-sm font-medium text-white/90">
								Choose tone
							</label>
							{isBasicPlan && (
								<Badge
									variant="outline"
									className="border-amber-500/30 bg-amber-500/10 text-[10px] text-amber-500"
								>
									Pro only can change
								</Badge>
							)}
						</div>

						<Select
							value={currentTone}
							onValueChange={handleToneChange}
							disabled={disabled || isBasicPlan}
						>
							<SelectTrigger className="w-full border-white/10 bg-white/5 text-white">
								<SelectValue placeholder="Select a tone" />
							</SelectTrigger>
							<SelectContent className="max-h-[300px] border-white/10 bg-zinc-900 text-white">
								{sortedTones.map(tone => {
									const isLocked =
										isBasicPlan && !BASIC_PLAN_TONES.has(tone.value);
									return (
										<SelectItem
											key={tone.value}
											value={tone.value}
											disabled={isLocked}
											className="cursor-pointer focus:bg-white/10 focus:text-white"
										>
											<div className="flex w-full items-center justify-between gap-2">
												<span>{tone.label}</span>
												{isLocked && (
													<Lock className="ml-2 h-3 w-3 text-white/30" />
												)}
											</div>
										</SelectItem>
									);
								})}
							</SelectContent>
						</Select>

						<div className="px-1 text-xs text-white/50">
							{TONE_DESCRIPTIONS[currentTone]}
						</div>
					</div>

					{/* Template Selection */}
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="flex items-baseline gap-2">
								<label className="text-sm font-medium text-white/90">
									Choose styles
								</label>
								<span className="text-[10px] text-white/40">
									{selectedTemplates.size}/3 selected
								</span>
							</div>
							{selectedTemplates.size > 0 && (
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<Button
												variant="ghost"
												size="icon"
												onClick={deselectAllTemplates}
												className="h-6 w-6 rounded-full text-white/40 hover:bg-white/10 hover:text-white/70"
											>
												<RotateCcw className="h-3 w-3" />
											</Button>
										</TooltipTrigger>
										<TooltipContent>
											<p>Clear selection</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							)}
						</div>

						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
							{isTemplatesLoading ? (
								<div className="col-span-1 flex justify-center py-8 sm:col-span-2">
									<div className="h-5 w-5 animate-spin rounded-full border border-white/20 border-t-white" />
								</div>
							) : !templates || templates.length === 0 ? (
								<div className="col-span-1 py-8 text-center text-xs text-white/40 sm:col-span-2">
									No templates available
								</div>
							) : (
								templates.map(template => {
									const isSelected = selectedTemplates.has(template.value);
									const isDisabled = !isSelected && isLimitReached;

									const CardContent = (
										<div
											onClick={() => {
												if (!isDisabled) {
													toggleTemplate(template.value);
												}
											}}
											className={cn(
												"group relative flex h-full cursor-pointer flex-col gap-2 rounded-xl border p-4 transition-all duration-300",
												isSelected
													? "border-blue-500/50 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
													: "border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]",
												isDisabled && "cursor-not-allowed opacity-40 grayscale",
											)}
										>
											<div className="flex items-start justify-between gap-2">
												<span
													className={cn(
														"text-sm font-medium transition-colors",
														isSelected
															? "text-blue-100"
															: "text-white/80 group-hover:text-white",
													)}
												>
													{template.label}
												</span>
												<div
													className={cn(
														"flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all",
														isSelected
															? "border-blue-500 bg-blue-500 text-white"
															: "border-white/20 bg-transparent group-hover:border-white/40",
													)}
												>
													{isSelected && (
														<svg
															viewBox="0 0 24 24"
															fill="none"
															className="h-3 w-3 stroke-current stroke-[3]"
														>
															<path
																d="M20 6L9 17l-5-5"
																strokeLinecap="round"
																strokeLinejoin="round"
															/>
														</svg>
													)}
												</div>
											</div>
											{template.description && (
												<p
													className={cn(
														"line-clamp-2 text-xs leading-relaxed transition-colors",
														isSelected
															? "text-blue-200/70"
															: "text-white/40 group-hover:text-white/50",
													)}
												>
													{template.description}
												</p>
											)}
										</div>
									);

									if (isDisabled) {
										return (
											<TooltipProvider key={template.value}>
												<Tooltip delayDuration={0}>
													<TooltipTrigger asChild>
														<div>{CardContent}</div>
													</TooltipTrigger>
													<TooltipContent>
														<p>Maximum 3 styles selected</p>
													</TooltipContent>
												</Tooltip>
											</TooltipProvider>
										);
									}

									return <div key={template.value}>{CardContent}</div>;
								})
							)}
						</div>
					</div>
				</div>

				{/* Generate button */}
				<div className="border-t border-white/10 bg-zinc-950/50 p-6">
					{hasInsufficientCredits ? (
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
											You need {requiredCredits} credit to generate variants,
											but you only have {availableCredits}.
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
							disabled={
								disabled || selectedTemplates.size === 0 || isGenerating
							}
							className="w-full bg-white text-black hover:bg-white/90 disabled:bg-white/10 disabled:text-white/40"
							size="lg"
						>
							{isGenerating ? (
								<div className="flex items-center gap-2">
									<div className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
									<span>Generating...</span>
								</div>
							) : selectedTemplates.size === 0 ? (
								"Select at least one style"
							) : (
								`Generate (${selectedTemplates.size} credit)`
							)}
						</Button>
					)}
				</div>
			</div>
		</SlideInPanel>
	);
};
