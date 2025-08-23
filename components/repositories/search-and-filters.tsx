/* eslint-disable import/no-unresolved */
"use client";

import { Search, SortAsc, SortDesc } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface SearchAndFiltersProps {
	searchQuery: string;
	sortBy: string;
	isLoading: boolean;
	onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	onSortChange: (value: string) => void;
}

export default function SearchAndFilters({
	searchQuery,
	sortBy,
	isLoading,
	onSearchChange,
	onSortChange,
}: SearchAndFiltersProps) {
	return (
		<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
			{/* Left Side - Search */}
			<div className="max-w-md flex-1">
				<div className="group relative">
					<div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-100"></div>
					<div className="relative flex items-center">
						<Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 transition-colors duration-200 group-hover:text-zinc-400" />
						<Input
							value={searchQuery}
							disabled={isLoading}
							placeholder="Search your posts..."
							onChange={onSearchChange}
							className="h-12 w-full rounded-xl border border-zinc-800/50 bg-zinc-900/50 pl-12 pr-4 font-medium text-white backdrop-blur-sm transition-all duration-200 placeholder:text-zinc-500 hover:border-zinc-700/50 focus:border-blue-500/50 focus:bg-zinc-900/70"
						/>
					</div>
				</div>
			</div>

			{/* Right Side - Sort */}
			<div className="flex items-center gap-3">
				<span className="whitespace-nowrap text-sm font-medium text-zinc-400">
					Sort by:
				</span>
				<div className="w-40">
					<Select value={sortBy} onValueChange={onSortChange}>
						<SelectTrigger
							disabled={isLoading}
							className="h-12 rounded-xl border border-zinc-800/50 bg-zinc-900/50 text-white backdrop-blur-sm transition-all duration-200 hover:border-zinc-700/50 focus:border-blue-500/50"
						>
							<div className="flex items-center gap-2">
								<SelectValue placeholder="Choose order" />
							</div>
						</SelectTrigger>
						<SelectContent className="rounded-xl border border-zinc-800/50 bg-zinc-900/95 text-white shadow-2xl backdrop-blur-md">
							<SelectItem value="latest" className="rounded-lg">
								<div className="flex w-full items-center gap-2 px-2 py-2">
									<SortDesc className="h-4 w-4 text-zinc-400" />
									<span className="text-sm">Latest First</span>
								</div>
							</SelectItem>

							<SelectItem value="oldest" className="rounded-lg">
								<div className="flex w-full items-center gap-2 px-2 py-2">
									<SortAsc className="h-4 w-4 text-zinc-400" />
									<span className="text-sm">Oldest First</span>
								</div>
							</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>
		</div>
	);
}
