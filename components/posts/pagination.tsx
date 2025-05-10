"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	disabled: boolean;
}

export default function Pagination({
	currentPage,
	totalPages,
	onPageChange,
	disabled,
}: PaginationProps) {
	if (totalPages <= 1) return;

	const renderPageNumber = (page: number, isCurrent = false) => (
		<span
			key={page}
			className={cn(
				"rounded-md px-3 py-1.5 font-medium",
				isCurrent ? "bg-zinc-900 text-white" : "text-zinc-400",
			)}
		>
			{page}
		</span>
	);

	return (
		<div className="mt-8 flex flex-wrap items-center justify-center gap-4">
			<Button
				variant="outline"
				size="sm"
				onClick={() => onPageChange(currentPage - 1)}
				disabled={currentPage === 1 || disabled}
				className={cn(
					"border-zinc-800 text-zinc-900 transition-colors hover:bg-zinc-900 hover:text-zinc-100",
					"disabled:border-zinc-800 disabled:bg-transparent disabled:text-zinc-700",
				)}
			>
				<ChevronLeft className="mr-2 h-4 w-4" />
				Previous
			</Button>

			<div className="flex items-center gap-2 text-sm">
				{renderPageNumber(1, currentPage === 1)}
				{currentPage > 2 && <span className="text-zinc-500">...</span>}
				{currentPage !== 1 &&
					currentPage !== totalPages &&
					renderPageNumber(currentPage, true)}
				{currentPage < totalPages - 1 && (
					<span className="text-zinc-500">...</span>
				)}
				{totalPages > 1 &&
					renderPageNumber(totalPages, currentPage === totalPages)}
			</div>

			<Button
				variant="outline"
				size="sm"
				onClick={() => onPageChange(currentPage + 1)}
				disabled={currentPage === totalPages || disabled}
				className={cn(
					"border-zinc-800 text-zinc-900 transition-colors hover:bg-zinc-900 hover:text-zinc-100",
					"disabled:border-zinc-800 disabled:bg-transparent disabled:text-zinc-700",
				)}
			>
				Next
				<ChevronRight className="ml-2 h-4 w-4" />
			</Button>
		</div>
	);
}
