import { format } from "date-fns";
import {
	CalendarIcon,
	CalendarPlus2Icon as CalendarIcon2,
	Clock,
} from "lucide-react";

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
						className="w-full justify-start bg-transparent text-left font-normal"
					>
						<CalendarIcon className="mr-2 h-4 w-4" />
						{filters.date ? (
							format(filters.date, "PPP")
						) : (
							<span>Pick a date</span>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="start">
					<Calendar
						mode="single"
						selected={filters.date}
						onSelect={date => onFilterChange("date", date)}
						initialFocus
						disabled={date => {
							const today = new Date();
							today.setHours(0, 0, 0, 0); // normalize today's time to midnight
							const checkDate = new Date(date);
							checkDate.setHours(0, 0, 0, 0); // normalize the date being checked
							return checkDate > today;
						}}
					/>
				</PopoverContent>
			</Popover>
			<Select
				disabled={disabled}
				onValueChange={value => onFilterChange("platform", value)}
			>
				<SelectTrigger className="w-full">
					<SelectValue placeholder="Select platform" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">All Platforms</SelectItem>
					<SelectItem value="linkedin">LinkedIn</SelectItem>
					<SelectItem value="twitter" disabled>
						Twitter ( Coming Soon )
					</SelectItem>
				</SelectContent>
			</Select>
			<Select
				disabled={disabled}
				onValueChange={value => onFilterChange("status", value)}
			>
				<SelectTrigger className="w-full">
					<SelectValue placeholder="Select status" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">All Statuses</SelectItem>
					<SelectItem value="drafted">Drafted</SelectItem>
					<SelectItem value="scheduled">Scheduled</SelectItem>
					<SelectItem value="published">Published</SelectItem>
				</SelectContent>
			</Select>
			{/* <Button
				variant="outline"
				size="sm"
				onClick={onToggleFullDate}
				className="w-full items-center justify-start bg-transparent text-left"
			>
				{showFullDate ? (
					<Clock className="mr-2 h-4 w-4" />
				) : (
					<CalendarIcon2 className="mr-2 h-4 w-4" />
				)}
				{showFullDate ? "Show Relative Date" : "Show Full Date"}
			</Button> */}
		</div>
	);
}
