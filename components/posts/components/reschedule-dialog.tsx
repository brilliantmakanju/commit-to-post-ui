/* eslint-disable import/no-unresolved */
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PostItem } from "@/types";

interface RescheduleDialogProps {
	reschedulingPosts: PostItem[];
	newScheduleDate: Date | undefined;
	newScheduleTime: string;
	onDateChange: (date: Date | undefined) => void;
	onTimeChange: (time: string) => void;
	onClose: () => void;
	onConfirm: () => void;
	isLoading: boolean;
}

export default function RescheduleDialog({
	reschedulingPosts,
	newScheduleDate,
	newScheduleTime,
	onDateChange,
	onTimeChange,
	onClose,
	onConfirm,
	isLoading,
}: RescheduleDialogProps) {
	return (
		<Dialog
			open={reschedulingPosts.length > 0}
			onOpenChange={open => !open && onClose()}
		>
			<DialogContent className="w-[95vw] rounded-xl border border-zinc-800/50 bg-zinc-900/95 text-zinc-300 backdrop-blur-md sm:w-auto">
				<DialogHeader className="pb-6">
					<DialogTitle className="text-xl font-light text-zinc-100">
						Reschedule Posts
					</DialogTitle>
					<DialogDescription className="text-zinc-400">
						Select new date and time for {reschedulingPosts.length} post(s)
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-6 py-4">
					<div className="grid gap-3">
						<Label className="text-sm font-medium text-zinc-300">Date</Label>
						<Calendar
							initialFocus
							mode="single"
							selected={newScheduleDate}
							onSelect={onDateChange}
							className="w-full rounded-lg"
							disabled={date => {
								const today = new Date();
								today.setHours(0, 0, 0, 0);
								const thirtyDaysFromNow = new Date(today);
								thirtyDaysFromNow.setDate(today.getDate() + 30);
								return date < today || date > thirtyDaysFromNow;
							}}
						/>
					</div>
					<div className="grid gap-3">
						<Label htmlFor="time" className="text-sm font-medium text-zinc-300">
							Time
						</Label>
						<Input
							id="time"
							type="time"
							value={newScheduleTime}
							onChange={event_ => onTimeChange(event_.target.value)}
							className="col-span-3 rounded-lg border-zinc-800/50 bg-zinc-900/50 text-zinc-300 transition-all duration-200 focus:border-zinc-700/50"
						/>
					</div>
				</div>
				<DialogFooter className="flex-col gap-3 sm:flex-row">
					<Button
						variant="outline"
						onClick={onClose}
						className="w-full border-zinc-700/50 bg-zinc-800/50 text-zinc-300 transition-all duration-300 hover:border-zinc-600/70 hover:bg-zinc-700/70 hover:text-zinc-100 sm:w-auto"
					>
						Cancel
					</Button>
					<Button
						onClick={onConfirm}
						disabled={isLoading}
						className="w-full border-zinc-700/50 bg-zinc-700/50 text-zinc-100 transition-all duration-300 hover:border-zinc-600/70 hover:bg-zinc-600/70 hover:shadow-lg hover:shadow-black/20 disabled:opacity-50 sm:w-auto"
					>
						{isLoading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Rescheduling...
							</>
						) : (
							"Confirm"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
