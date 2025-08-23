/* eslint-disable import/no-unresolved */
"use client";

import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";

interface PaginationControlsProps {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}

export default function PaginationControls({
	currentPage,
	totalPages,
	onPageChange,
}: PaginationControlsProps) {
	if (totalPages <= 1) return;

	const handlePreviousPage = (event: React.MouseEvent) => {
		event.preventDefault();
		if (currentPage > 1) {
			onPageChange(currentPage - 1);
		}
	};

	const handleNextPage = (event: React.MouseEvent) => {
		event.preventDefault();
		if (currentPage < totalPages) {
			onPageChange(currentPage + 1);
		}
	};

	const handlePageClick = (page: number) => {
		return (event: React.MouseEvent) => {
			event.preventDefault();
			onPageChange(page);
		};
	};

	return (
		<div className="mt-8">
			<Pagination>
				<PaginationContent className="flex items-center justify-center gap-1">
					<PaginationItem>
						<PaginationPrevious
							href="#"
							onClick={handlePreviousPage}
							className={`rounded-xl px-3 py-2 text-sm font-medium transition-all duration-300 ${
								currentPage <= 1
									? "pointer-events-none text-zinc-600 opacity-30"
									: "text-zinc-400 hover:bg-zinc-800/30 hover:text-zinc-200"
							} `}
						/>
					</PaginationItem>

					{Array.from({ length: totalPages }, (_, index) => index + 1).map(
						page => {
							if (
								page === 1 ||
								page === totalPages ||
								(page >= currentPage - 1 && page <= currentPage + 1)
							) {
								return (
									<PaginationItem key={page}>
										<PaginationLink
											href="#"
											onClick={handlePageClick(page)}
											className={`rounded-xl px-3 py-2 text-sm font-medium transition-all duration-300 ${
												currentPage === page
													? "bg-white text-black"
													: "text-zinc-400 hover:bg-zinc-800/30 hover:text-zinc-200"
											} `}
										>
											{page}
										</PaginationLink>
									</PaginationItem>
								);
							} else if (page === currentPage - 2 || page === currentPage + 2) {
								return (
									<PaginationItem key={page}>
										<PaginationEllipsis className="px-2 text-zinc-500" />
									</PaginationItem>
								);
							}
							return;
						},
					)}

					<PaginationItem>
						<PaginationNext
							href="#"
							onClick={handleNextPage}
							className={`rounded-xl px-3 py-2 text-sm font-medium transition-all duration-300 ${
								currentPage >= totalPages
									? "pointer-events-none text-zinc-600 opacity-30"
									: "text-zinc-400 hover:bg-zinc-800/30 hover:text-zinc-200"
							} `}
						/>
					</PaginationItem>
				</PaginationContent>
			</Pagination>
		</div>
	);
}
