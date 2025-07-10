/* eslint-disable import/no-unresolved */
"use client";

import { Clock } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";

interface TimePickerProps {
	value?: string;
	onChange?: (value: string) => void;
	className?: string;
	placeholder?: string;
}

// Parse the time value (HH:MM format)
const parseTime = (timeString: string) => {
	if (!timeString) return { hours: "09", minutes: "00" };
	const [hours, minutes] = timeString.split(":");
	return { hours: hours.padStart(2, "0"), minutes: minutes.padStart(2, "0") };
};

const formatTime = (h: string, m: string) => {
	const hour24 = Number.parseInt(h);
	const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
	const ampm = hour24 >= 12 ? "PM" : "AM";
	return `${hour12}:${m} ${ampm}`;
};

export function TimePicker({
	value,
	onChange,
	className,
	placeholder = "Select time",
}: TimePickerProps) {
	const [isOpen, setIsOpen] = React.useState(false);
	const { hours, minutes } = parseTime(value || "09:00");

	const handleTimeChange = (newHours: string, newMinutes: string) => {
		const timeString = `${newHours}:${newMinutes}`;
		onChange?.(timeString);
	};

	// Generate hour options (00-23)
	const hourOptions = Array.from({ length: 24 }, (_, index) => {
		const hour = index.toString().padStart(2, "0");
		const hour12 = index === 0 ? 12 : index > 12 ? index - 12 : index;
		const ampm = index >= 12 ? "PM" : "AM";
		return {
			value: hour,
			label: `${hour12} ${ampm}`,
			display: `${hour12.toString().padStart(2, "0")}`,
		};
	});

	// Generate minute options (00, 15, 30, 45)
	const minuteOptions = [
		{ value: "00", label: "00" },
		{ value: "15", label: "15" },
		{ value: "30", label: "30" },
		{ value: "45", label: "45" },
	];

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					className={cn(
						"w-full justify-start border border-zinc-700 bg-zinc-800 text-left font-normal text-white hover:bg-transparent hover:text-white",
						!value && "text-neutral-500",
						className,
					)}
				>
					<Clock className="mr-2 h-4 w-4 text-white/70" />
					{value ? formatTime(hours, minutes) : placeholder}
				</Button>
			</PopoverTrigger>

			<PopoverContent
				className="w-auto rounded-md border border-zinc-700 bg-zinc-800 p-4 shadow-xl"
				align="start"
			>
				<div className="space-y-5">
					{/* Display Selected Time */}
					<div className="text-center">
						<div className="text-3xl font-semibold text-white">
							{formatTime(hours, minutes)}
						</div>
						<p className="mt-1 text-xs text-neutral-500">
							Select your preferred time
						</p>
					</div>

					{/* Hour & Minute Pickers */}
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<label className="text-sm text-neutral-300">Hour</label>
							<Select
								value={hours}
								onValueChange={newHours => handleTimeChange(newHours, minutes)}
							>
								<SelectTrigger className="w-full border border-neutral-700 bg-neutral-900 text-white hover:border-neutral-600">
									<SelectValue />
								</SelectTrigger>
								<SelectContent className="max-h-60 border border-neutral-700 bg-neutral-900 text-white">
									{hourOptions.map(option => (
										<SelectItem
											key={option.value}
											value={option.value}
											className="hover:bg-neutral-800"
										>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<label className="text-sm text-neutral-300">Minute</label>
							<Select
								value={minutes}
								onValueChange={newMinutes =>
									handleTimeChange(hours, newMinutes)
								}
							>
								<SelectTrigger className="w-full border border-neutral-700 bg-neutral-900 text-white hover:border-neutral-600">
									<SelectValue />
								</SelectTrigger>
								<SelectContent className="border border-neutral-700 bg-neutral-900 text-white">
									{minuteOptions.map(option => (
										<SelectItem
											key={option.value}
											value={option.value}
											className="hover:bg-neutral-800"
										>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					{/* Presets */}
					<div className="flex justify-between gap-2 border-t border-neutral-800 pt-3">
						{[
							{ label: "9:00 AM", value: ["09", "00"] },
							{ label: "12:00 PM", value: ["12", "00"] },
							{ label: "5:00 PM", value: ["17", "00"] },
						].map(({ label, value }) => (
							<Button
								key={label}
								variant="ghost"
								size="sm"
								onClick={() => handleTimeChange(value[0], value[1])}
								className="rounded border border-neutral-700 bg-neutral-800 px-3 py-1 text-sm text-white hover:bg-white/20 hover:text-white"
							>
								{label}
							</Button>
						))}
					</div>

					{/* Done Button */}
					<Button
						className="w-full rounded bg-white/10 text-sm font-medium text-white hover:bg-white/20"
						onClick={() => setIsOpen(false)}
					>
						Done
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	);
}
