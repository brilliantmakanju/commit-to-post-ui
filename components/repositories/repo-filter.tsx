/* eslint-disable import/no-unresolved */
"use client";
import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface RepositoryFilterProps {
	sortBy: string;
	searchQuery: string;
	isLoading?: boolean;
	resultCount?: number;
	onClearFilters?: () => void;
	viewMode: "grid" | "stacked";
	onSortChange: (sort: string) => void;
	onSearchChange: (query: string) => void;
	onViewModeChange: (mode: "grid" | "stacked") => void;
}

export function RepositoryFilter({
	sortBy,
	searchQuery,
	resultCount,
	onSortChange,
	onSearchChange,
	isLoading = false,
}: RepositoryFilterProps) {
	const hasActiveFilters = searchQuery.length > 0 || sortBy !== "latest";

	return (
		<div className="space-y-4">
			{/* Main Filter Row */}
			<div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
				{/* Search Input */}
				<div className="max-w-md flex-1">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-zinc-500" />
						<Input
							value={searchQuery}
							disabled={isLoading}
							placeholder="Search repositories..."
							onChange={event_ => onSearchChange(event_.target.value)}
							className="border-zinc-700 bg-zinc-900/50 pl-10 text-zinc-200 placeholder:text-zinc-500 focus:border-zinc-500 focus:bg-zinc-900/80"
						/>
						{searchQuery && (
							<Button
								size="sm"
								variant="ghost"
								disabled={isLoading}
								onClick={() => onSearchChange("")}
								className="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2 transform p-0 text-zinc-500 hover:bg-zinc-300"
							>
								<X className="h-3 w-3" />
							</Button>
						)}
					</div>
				</div>

				{/* Controls */}
				<div className="flex items-center space-x-3">
					{/* Sort Dropdown */}
					<Select
						value={sortBy}
						onValueChange={onSortChange}
						disabled={isLoading}
					>
						<SelectTrigger className="w-40 border-zinc-700 bg-zinc-900/50 text-zinc-200 focus:border-zinc-500">
							<SelectValue />
						</SelectTrigger>
						<SelectContent className="border-zinc-700 bg-zinc-900">
							<SelectItem value="latest" className="text-zinc-200">
								Newest first
							</SelectItem>
							<SelectItem value="name" className="text-zinc-200">
								A-Z (Repo name)
							</SelectItem>
							<SelectItem value="oldest" className="text-zinc-200">
								Oldest first
							</SelectItem>
						</SelectContent>
					</Select>

					{/* View Mode Toggle */}
					{/* <div className="flex items-center rounded-lg border border-zinc-700 bg-zinc-900/50 p-1">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => onViewModeChange("grid")}
							disabled={isLoading}
							className={`h-8 w-8 p-0 ${
								viewMode === "grid"
									? "bg-white text-black hover:bg-zinc-100"
									: "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
							}`}
						>
							<Grid3X3 className="h-4 w-4" />
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => onViewModeChange("stacked")}
							disabled={isLoading}
							className={`h-8 w-8 p-0 ${
								viewMode === "stacked"
									? "bg-white text-black hover:bg-zinc-100"
									: "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
							}`}
						>
							<List className="h-4 w-4" />
						</Button>
					</div> */}
				</div>
			</div>

			<div className="flex w-full items-center justify-between">
				{/* Active Filters Pills */}
				{hasActiveFilters && !isLoading && (
					<div className="flex flex-wrap gap-2">
						{searchQuery && (
							<div className="flex items-center space-x-2 rounded-full bg-zinc-800/50 px-3 py-1 text-sm">
								<span className="text-zinc-300">Repo name:</span>
								<span className="text-zinc-100">{searchQuery}</span>
								<Button
									size="sm"
									variant="ghost"
									onClick={() => onSearchChange("")}
									className="h-4 w-4 p-0 text-zinc-500 hover:bg-zinc-300"
								>
									<X className="h-3 w-3" />
								</Button>
							</div>
						)}
						{sortBy !== "latest" && (
							<div className="flex items-center space-x-2 rounded-full bg-zinc-800/50 px-3 py-1 text-sm">
								<span className="text-zinc-300">Sort by:</span>
								<span className="text-zinc-100">
									{sortBy === "name" ? "A-Z" : "Oldest first"}
								</span>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => onSortChange("latest")}
									className="h-4 w-4 p-0 text-zinc-500 hover:bg-zinc-300"
								>
									<X className="h-3 w-3" />
								</Button>
							</div>
						)}
					</div>
				)}

				{/* Status Row */}
				<div className="flex items-center justify-between">
					{/* Results Count & Loading */}
					<div className="flex items-center space-x-3">
						{!isLoading && resultCount !== undefined && (
							<div className="text-sm text-zinc-400">
								{resultCount} connected{" "}
								{resultCount === 1 ? "repository" : "repositories"} found
							</div>
						)}
					</div>

					{/* Clear Filters */}
					{hasActiveFilters && !isLoading && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => {
								onSearchChange("");
								onSortChange("latest");
							}}
							className="text-zinc-500 hover:bg-zinc-300"
						>
							<X className="mr-2 h-4 w-4" />
							Clear filters
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}
