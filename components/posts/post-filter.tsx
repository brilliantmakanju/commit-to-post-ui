"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface FilterState {
	date: Date | undefined;
	platform: string;
	status: string;
}

interface PostFiltersProps {
	filters: FilterState;
	showFullDate: boolean;
	onFilterChange: (
		key: keyof FilterState,
		value: string | Date | undefined,
	) => void;
	onToggleFullDate: () => void;
	disabled: boolean;
}

export default function PostFilters({
	filters,
	showFullDate,
	onFilterChange,
	onToggleFullDate,
	disabled,
}: PostFiltersProps) {
	return (
		<div className="mb-6 flex flex-wrap gap-4 sm:grid sm:grid-cols-3">
			<Popover>
				<PopoverTrigger disabled={disabled} asChild>
					<Button
						variant="outline"
						disabled={disabled}
						className="w-full justify-start border-zinc-800 bg-transparent text-left font-normal text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100"
					>
						<CalendarIcon className="mr-2 h-4 w-4" />
						{filters.date ? (
							format(filters.date, "PPP")
						) : (
							<span>Pick a date</span>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent
					className="w-auto border border-zinc-800 bg-zinc-950 p-0"
					align="start"
				>
					<Calendar
						mode="single"
						selected={filters.date}
						onSelect={date => onFilterChange("date", date)}
						initialFocus
						disabled={date => {
							const today = new Date();
							today.setHours(0, 0, 0, 0);
							const checkDate = new Date(date);
							checkDate.setHours(0, 0, 0, 0);
							return checkDate > today;
						}}
						className="bg-zinc-950 text-zinc-200"
					/>
				</PopoverContent>
			</Popover>
			<Select
				disabled={disabled}
				onValueChange={value => onFilterChange("platform", value)}
			>
				<SelectTrigger className="w-full border-zinc-800 bg-transparent text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100">
					<SelectValue placeholder="Select platform" />
				</SelectTrigger>
				<SelectContent className="border border-zinc-800 bg-zinc-950 text-zinc-300">
					<SelectItem
						value="all"
						className="focus:bg-zinc-900 focus:text-zinc-100"
					>
						All Platforms
					</SelectItem>
					<SelectItem
						value="linkedin"
						className="focus:bg-zinc-900 focus:text-zinc-100"
					>
						LinkedIn
					</SelectItem>
					<SelectItem
						value="twitter"
						disabled
						className="focus:bg-zinc-900 focus:text-zinc-100"
					>
						Twitter ( Coming Soon )
					</SelectItem>
				</SelectContent>
			</Select>
			<Select
				disabled={disabled}
				onValueChange={value => onFilterChange("status", value)}
			>
				<SelectTrigger className="w-full border-zinc-800 bg-transparent text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100">
					<SelectValue placeholder="Select status" />
				</SelectTrigger>
				<SelectContent className="border border-zinc-800 bg-zinc-950 text-zinc-300">
					<SelectItem
						value="all"
						className="focus:bg-zinc-900 focus:text-zinc-100"
					>
						All Statuses
					</SelectItem>
					<SelectItem
						value="drafted"
						className="focus:bg-zinc-900 focus:text-zinc-100"
					>
						Drafted
					</SelectItem>
					<SelectItem
						value="scheduled"
						className="focus:bg-zinc-900 focus:text-zinc-100"
					>
						Scheduled
					</SelectItem>
					<SelectItem
						value="published"
						className="focus:bg-zinc-900 focus:text-zinc-100"
					>
						Published
					</SelectItem>
				</SelectContent>
			</Select>
		</div>
	);
}
