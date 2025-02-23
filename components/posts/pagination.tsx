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
				isCurrent ? "bg-gray-800 text-white" : "text-gray-500",
			)}
		>
			{page}
		</span>
	);

	return (
		<div className="mt-6 flex flex-wrap items-center justify-center gap-4">
			<Button
				variant="outline"
				size="sm"
				onClick={() => onPageChange(currentPage - 1)}
				disabled={currentPage === 1 || disabled}
				className={cn(
					"border-gray-200 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-700",
					"disabled:border-gray-100 disabled:bg-gray-50 disabled:text-gray-400",
				)}
			>
				<ChevronLeft className="mr-2 h-4 w-4" />
				Previous
			</Button>

			<div className="flex items-center gap-2 text-sm">
				{renderPageNumber(1, currentPage === 1)}
				{currentPage > 2 && <span className="text-gray-500">...</span>}
				{currentPage !== 1 &&
					currentPage !== totalPages &&
					renderPageNumber(currentPage, true)}
				{currentPage < totalPages - 1 && (
					<span className="text-gray-500">...</span>
				)}
				{renderPageNumber(totalPages, currentPage === totalPages)}
			</div>

			<Button
				variant="outline"
				size="sm"
				onClick={() => onPageChange(currentPage + 1)}
				disabled={currentPage === totalPages || disabled}
				className={cn(
					"border-gray-200 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-700",
					"disabled:border-gray-100 disabled:bg-gray-50 disabled:text-gray-400",
				)}
			>
				Next
				<ChevronRight className="ml-2 h-4 w-4" />
			</Button>
		</div>
	);
}
