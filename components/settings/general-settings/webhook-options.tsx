"use client";

import {
	Check,
	ChevronsUpDown,
	Edit2,
	Info,
	Loader2,
	Save,
	Terminal,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import useRetrieveOrganizationTone from "@/hooks/organization/use-organization-tone";
import { useCheckAccess } from "@/hooks/plans/use-billing";
import useRetrieveWebhookSettings from "@/hooks/settings/use-webhook-settings";
import { cn } from "@/lib/utils";
import { updateBranch } from "@/server-actions/organizations/update-hook-options";
import { updateTones } from "@/server-actions/organizations/update-tone";

type BranchState = {
	name: string;
	isEditing: boolean;
};

function retrieveTone(
	tones: string | undefined,
	available_tones: { value: string; display: string }[] | undefined,
): string[] {
	if (!tones || !available_tones) return [];

	const toneArray = tones.split(",").map(t => t.trim());

	const result = toneArray.reduce((accumulator: string[], tone) => {
		const found = available_tones.find(item => item.value === tone);
		if (found) {
			accumulator.push(found.value);
		}
		return accumulator;
	}, []);

	return result.length > 0 ? result : [available_tones[0].value];
}

const WebHookOptions: React.FC = () => {
	const { branch: branchData, refetchWebhook } = useRetrieveWebhookSettings();
	const { selected_tone, shuffle_tone, available_tones } =
		useRetrieveOrganizationTone();

	const [open, setOpen] = useState(false);
	const [selectedTones, setSelectedTones] = useState<string[]>([]);
	const [availableTones, setAvailableTones] = useState<
		{ value: string; display: string }[]
	>([]);
	const [useHashtags, setUseHashtags] = useState(false);
	const [branch, setBranch] = useState<BranchState>({
		name: "",
		isEditing: false,
	});
	const [isLoading, setIsLoading] = useState(false);
	const [shuffleAll, setShuffleAll] = useState(false);
	const hasAccess = useCheckAccess();

	useEffect(() => {
		setBranch({
			name: branchData || "",
			isEditing: false,
		});
		const retrievedTones = retrieveTone(selected_tone, available_tones);
		setSelectedTones(retrievedTones);
		setShuffleAll(shuffle_tone || false);
		setAvailableTones(available_tones || []);
	}, [branchData, selected_tone, shuffle_tone, available_tones]);

	const handleToneSelect = useCallback(
		async (tone: string) => {
			if (hasAccess) {
				setIsLoading(true);
				try {
					// Prevent deselecting the last tone
					if (selectedTones[0] === tone) {
						setIsLoading(false);
						return;
					}

					const result = await updateTones(tone, shuffleAll);
					if (result.success) {
						setSelectedTones([tone]);
						toast.success("Tones updated successfully");
					} else {
						toast.error("Failed to update tones");
					}
				} catch {
					toast.error("An error occurred while updating tones");
				} finally {
					setIsLoading(false);
				}
			} else {
				toast.info(
					"Sorry you need to upgrade to a pro subscription to use this feature",
				);
			}
		},
		[selectedTones, shuffleAll, hasAccess],
	);

	const handleHashtagToggle = useCallback(() => {
		// Feature is disabled, so this function does nothing
		return;
	}, []);

	const handleBranchEdit = () => {
		setBranch(previous => ({ ...previous, isEditing: true }));
	};

	const handleBranchSave = async () => {
		setIsLoading(true);
		try {
			const result = await updateBranch(branch.name);
			if (result.success) {
				setBranch(previous => ({ ...previous, isEditing: false }));
				toast.success("Branch name updated successfully");
				refetchWebhook();
			} else {
				toast.error("Failed to update branch name");
			}
		} catch {
			toast.error("An error occurred while updating branch name");
		} finally {
			setIsLoading(false);
		}
	};

	const handleBranchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setBranch(previous => ({ ...previous, name: event.target.value }));
	};

	const handleShuffleChange = async (checked: boolean) => {
		if (hasAccess) {
			setIsLoading(true);
			try {
				const result = await updateTones(selectedTones[0], checked);
				if (result.success) {
					setShuffleAll(checked);
					toast.success(
						checked
							? "Shuffle all tones enabled"
							: "Shuffle all tones disabled",
					);
				} else {
					toast.error("Failed to update shuffle setting");
				}
			} catch {
				toast.error("An error occurred while updating shuffle setting");
			} finally {
				setIsLoading(false);
			}
		} else {
			toast.info(
				"Sorry you need to upgrade to a pro subscription to use this feature",
			);
		}
	};

	return (
		<Card className="mt-6 w-full border border-zinc-800 bg-zinc-900">
			<CardHeader className="space-y-1 border-b border-zinc-800">
				<div className="flex items-center">
					<Terminal className="mr-2 h-5 w-5 text-[#4F46E5]" />
					<CardTitle className="text-xl font-bold text-white">
						AI Settings
					</CardTitle>
				</div>
				<CardDescription className="text-zinc-400">
					Customize your AI&apos;s configuration and preferences
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6 pt-6">
				<div className="space-y-4">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
						<h3 className="mb-2 text-lg font-medium text-white sm:mb-0">
							Branch Name
						</h3>
						<div className="flex h-10 items-center space-x-2">
							{branch.isEditing ? (
								<div className="flex w-full sm:w-auto">
									<Input
										value={branch.name}
										onChange={handleBranchChange}
										className="flex-grow rounded-r-none border-zinc-800 bg-zinc-900 text-white"
										disabled={isLoading}
									/>
									<Button
										onClick={handleBranchSave}
										className="rounded-l-none border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700"
										disabled={isLoading}
									>
										{isLoading ? (
											<Loader2 className="h-4 w-4 animate-spin" />
										) : (
											<Save className="h-4 w-4" />
										)}
									</Button>
								</div>
							) : (
								<>
									<span className="min-w-[100px] font-medium text-zinc-300">
										{branch.name}
									</span>
									<Button
										onClick={handleBranchEdit}
										variant="outline"
										size="sm"
										className="border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700"
										disabled={isLoading}
									>
										<Edit2 className="h-4 w-4" />
									</Button>
								</>
							)}
						</div>
					</div>
				</div>

				<div className="space-y-4">
					<h3 className="text-lg font-medium text-white">AI Tone</h3>
					<div className="grid grid-cols-1 space-y-2 sm:space-x-4 md:grid-cols-3">
						<div className="flex-grow">
							<Popover open={open} onOpenChange={setOpen}>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										role="combobox"
										aria-expanded={open}
										className="w-full justify-between border-zinc-700 bg-zinc-800 text-white"
										disabled={isLoading}
									>
										{isLoading ? (
											<span className="flex items-center">
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												Loading...
											</span>
										) : selectedTones.length > 0 ? (
											<span className="truncate">
												{selectedTones
													.map(
														t =>
															availableTones.find(at => at.value === t)
																?.display || t,
													)
													.join(", ")}
											</span>
										) : (
											"Select tones..."
										)}
										<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-full border-zinc-700 bg-zinc-800 p-0">
									<Command className="bg-zinc-800">
										<CommandInput
											placeholder="Search tones..."
											className="border-zinc-700 text-white"
										/>
										<CommandList>
											<CommandEmpty className="text-zinc-400">
												No tone found.
											</CommandEmpty>
											<CommandGroup>
												{availableTones.map(tone => (
													<CommandItem
														key={tone.value}
														onSelect={() => handleToneSelect(tone.value)}
														className="text-zinc-300 aria-selected:bg-zinc-700 aria-selected:text-white"
													>
														<Check
															className={cn(
																"mr-2 h-4 w-4",
																selectedTones.includes(tone.value)
																	? "opacity-100"
																	: "opacity-0",
															)}
														/>
														{tone.display}
													</CommandItem>
												))}
											</CommandGroup>
										</CommandList>
									</Command>
								</PopoverContent>
							</Popover>
						</div>
						<div className="flex items-center space-x-2">
							<Switch
								id="hashtags"
								disabled={true}
								checked={useHashtags}
								onCheckedChange={handleHashtagToggle}
								className="data-[state=checked]:bg-zinc-700"
							/>
							<Label htmlFor="hashtags" className="text-zinc-300">
								Use Hashtags
							</Label>
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<Info className="h-4 w-4 cursor-help text-zinc-500" />
									</TooltipTrigger>
									<TooltipContent className="border border-zinc-700 bg-zinc-800 text-white">
										<p>
											Coming soon! This feature is currently under development.
										</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</div>
						<div className="flex items-center space-x-2">
							<Switch
								id="shuffle"
								checked={hasAccess ? shuffleAll : false}
								onCheckedChange={handleShuffleChange}
								className="data-[state=checked]:bg-zinc-700"
								disabled={isLoading || !hasAccess}
							/>
							<Label htmlFor="shuffle" className="text-zinc-300">
								Shuffle All Tones
							</Label>
						</div>
					</div>
				</div>

				<div>
					<h3 className="mb-2 text-lg font-medium text-white">
						Current Settings
					</h3>
					<pre className="overflow-x-auto rounded border border-zinc-800 bg-zinc-950 p-2 text-sm text-zinc-300">
						{JSON.stringify(
							{
								branchName: branch.name,
								preferences: {
									tones: selectedTones,
								},
								shuffleAll,
							},
							undefined,
							2,
						)}
					</pre>
				</div>

				<div className="rounded-md border border-[#232323] bg-[#1A1A1A] p-3 text-sm text-zinc-400">
					<p className="mb-2 font-medium">Plan Restrictions:</p>
					<ul className="list-inside space-y-1">
						<li className="flex items-start">
							<span className="mr-2 text-[#4F46E5]">•</span>
							<span>Basic: Can only use the Professional tone</span>
						</li>
						<li className="flex items-start">
							<span className="mr-2 text-[#4F46E5]">•</span>
							<span>Basic: Can select all tones</span>
						</li>
					</ul>
				</div>
			</CardContent>
		</Card>
	);
};

export default WebHookOptions;
