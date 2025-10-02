/* eslint-disable import/no-unresolved */
"use client";
import { format } from "date-fns";
import { CalendarDays, CalendarIcon, Clock } from "lucide-react";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar as ShadCalendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerProps {
	value?: Date;
	onChange: (date: Date | undefined) => void;
	disabled?: boolean;
	variant?: "inline" | "popover"; // New prop to control display type
	placeholder?: string;
	className?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
	value,
	onChange,
	disabled = false,
	variant = "popover", // Default to popover
	placeholder = "Pick a date",
	className,
}) => {
	const calendarDisabled = disabled
		? true
		: (date: Date) => {
				const today = new Date();
				today.setHours(0, 0, 0, 0);
				const thirtyDaysFromNow = new Date(today);
				thirtyDaysFromNow.setDate(today.getDate() + 30);
				return date < today || date > thirtyDaysFromNow;
			};

	const calendarComponent = (
		<ShadCalendar
			mode="single"
			initialFocus
			selected={value}
			disabled={calendarDisabled}
			onSelect={date => {
				onChange(date);
			}}
			className={cn(
				"w-full rounded-md border border-zinc-700/40 bg-zinc-900/30 p-3",
				variant === "popover" && "w-auto p-0",
			)}
		/>
	);

	if (variant === "inline") {
		return <div className={className}>{calendarComponent}</div>;
	}

	// Popover variant
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					className={cn(
						"w-full justify-start border border-zinc-700 bg-zinc-800 text-left font-normal text-white hover:bg-transparent hover:text-white disabled:cursor-not-allowed disabled:opacity-50",

						!value && "text-zinc-400",
						disabled && "cursor-not-allowed opacity-50",
						className,
					)}
					disabled={disabled}
				>
					<CalendarIcon className="mr-2 h-4 w-4" />
					{value ? format(value, "PPP") : <span>{placeholder}</span>}
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className="w-auto border-zinc-700 bg-zinc-900 p-0"
				align="start"
			>
				{calendarComponent}
			</PopoverContent>
		</Popover>
	);
};

interface TimePickerProps {
	value: string;
	onChange: (time: string) => void;
}

export const TimePicker: React.FC<TimePickerProps> = ({ value, onChange }) => {
	const [hour, minute] = value ? value.split(":") : ["12", "00"];
	const isPm = Number.parseInt(hour) >= 12;

	const displayHour = (() => {
		const h = Number.parseInt(hour);
		if (h === 0) return "12";
		if (h > 12) return String(h - 12).padStart(2, "0");
		return String(h).padStart(2, "0");
	})();

	const updateTime = (h12: string, m: string, pm: boolean) => {
		let h24 = Number.parseInt(h12);
		if (pm && h24 !== 12) h24 += 12;
		if (!pm && h24 === 12) h24 = 0;
		onChange(`${String(h24).padStart(2, "0")}:${m}`);
	};

	const hours = Array.from({ length: 12 }, (_, index) =>
		(index === 0 ? 12 : index).toString().padStart(2, "0"),
	);

	const minutes = Array.from({ length: 60 }, (_, index) =>
		index.toString().padStart(2, "0"),
	);

	return (
		<div className="rounded-xl bg-gradient-to-br from-gray-900/50 to-gray-800/50 p-6">
			<div className="mb-4 flex items-center justify-center">
				<Clock className="mr-2 h-5 w-5 text-blue-400" />
				<span className="text-sm font-medium text-gray-300">Select Time</span>
			</div>

			<div className="flex items-center justify-center gap-3">
				<div className="relative">
					<select
						value={displayHour}
						onChange={event_ => updateTime(event_.target.value, minute, isPm)}
						className="h-12 w-16 rounded-lg border border-white/20 bg-gray-800/80 p-2 text-center font-mono text-lg text-white backdrop-blur-sm transition-all duration-200 hover:bg-gray-700/80 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						{hours.map(h => (
							<option key={h} value={h} className="bg-gray-800">
								{h}
							</option>
						))}
					</select>
					<div className="absolute -bottom-6 left-1/2 -translate-x-1/2 transform text-xs text-gray-400">
						Hour
					</div>
				</div>

				<div className="flex flex-col items-center">
					<span className="animate-pulse text-2xl font-bold text-blue-400">
						:
					</span>
				</div>

				<div className="relative">
					<select
						value={minute}
						onChange={event_ =>
							updateTime(displayHour, event_.target.value, isPm)
						}
						className="h-12 w-16 rounded-lg border border-white/20 bg-gray-800/80 p-2 text-center font-mono text-lg text-white backdrop-blur-sm transition-all duration-200 hover:bg-gray-700/80 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						{minutes.map(m => (
							<option key={m} value={m} className="bg-gray-800">
								{m}
							</option>
						))}
					</select>
					<div className="absolute -bottom-6 left-1/2 -translate-x-1/2 transform text-xs text-gray-400">
						Min
					</div>
				</div>

				<div className="relative">
					<select
						value={isPm ? "PM" : "AM"}
						onChange={event_ =>
							updateTime(displayHour, minute, event_.target.value === "PM")
						}
						className="h-12 w-16 rounded-lg border border-white/20 bg-gray-800/80 p-2 text-center text-lg font-medium text-white backdrop-blur-sm transition-all duration-200 hover:bg-gray-700/80 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						<option value="AM" className="bg-gray-800">
							AM
						</option>
						<option value="PM" className="bg-gray-800">
							PM
						</option>
					</select>
					<div className="absolute -bottom-6 left-1/2 -translate-x-1/2 transform text-xs text-gray-400">
						Period
					</div>
				</div>
			</div>
		</div>
	);
};

interface DateTimePickerProps {
	value?: {
		date: Date | undefined;
		time: string;
	};
	onChange: (dateTime: { date: Date | undefined; time: string }) => void;
	placeholder?: string;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
	value = { date: undefined, time: "12:00" },
	onChange,
	placeholder = "Select date and time",
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [activeTab, setActiveTab] = useState<"date" | "time">("date");

	const formatDateTime = () => {
		if (!value.date) return placeholder;

		const dateString = value.date.toLocaleDateString();
		const [hour, minute] = value.time.split(":");
		const h = Number.parseInt(hour);
		const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
		const period = h >= 12 ? "PM" : "AM";
		const timeString = `${displayHour}:${minute} ${period}`;

		return `${dateString} at ${timeString}`;
	};

	const handleDateChange = (date: Date | undefined) => {
		onChange({ ...value, date });
	};

	const handleTimeChange = (time: string) => {
		onChange({ ...value, time });
	};

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					className="w-full justify-start border-white/10 bg-gradient-to-r from-gray-900/50 to-gray-800/50 text-left font-normal backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:from-gray-800/60 hover:to-gray-700/60"
				>
					<CalendarDays className="mr-3 h-4 w-4 text-blue-400" />
					{value.date ? (
						<span className="text-white">{formatDateTime()}</span>
					) : (
						<span className="text-gray-400">{placeholder}</span>
					)}
					<Clock className="ml-auto h-4 w-4 text-gray-400" />
				</Button>
			</PopoverTrigger>

			<PopoverContent className="w-auto border-white/10 bg-gray-900/95 p-0 shadow-2xl backdrop-blur-md">
				<div className="flex border-b border-white/10">
					<button
						onClick={() => setActiveTab("date")}
						className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 ${
							activeTab === "date"
								? "border-b-2 border-blue-400 bg-blue-400/10 text-blue-400"
								: "text-gray-400 hover:bg-white/5 hover:text-white"
						}`}
					>
						<CalendarDays className="mr-2 inline-block h-4 w-4" />
						Date
					</button>
					<button
						onClick={() => setActiveTab("time")}
						className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 ${
							activeTab === "time"
								? "border-b-2 border-blue-400 bg-blue-400/10 text-blue-400"
								: "text-gray-400 hover:bg-white/5 hover:text-white"
						}`}
					>
						<Clock className="mr-2 inline-block h-4 w-4" />
						Time
					</button>
				</div>

				<div className="min-w-[300px]">
					{activeTab === "date" ? (
						<div className="p-1">
							<ShadCalendar
								mode="single"
								selected={value.date}
								onSelect={handleDateChange}
								initialFocus
								className="text-white"
							/>
						</div>
					) : (
						<TimePicker value={value.time} onChange={handleTimeChange} />
					)}
				</div>

				<div className="border-t border-white/10 bg-gray-800/30 p-3">
					<div className="flex items-center justify-between">
						<span className="text-xs text-gray-400">
							Selected: {formatDateTime()}
						</span>
						<Button
							size="sm"
							onClick={() => setIsOpen(false)}
							className="bg-blue-600 text-white hover:bg-blue-700"
						>
							Done
						</Button>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
};
