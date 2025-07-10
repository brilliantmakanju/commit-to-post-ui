/* eslint-disable import/no-unresolved */
"use client";
import { Grid3X3, List, Search } from "lucide-react";

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
	searchQuery: string;
	onSearchChange: (query: string) => void;
	sortBy: string;
	onSortChange: (sort: string) => void;
	viewMode: "grid" | "stacked";
	onViewModeChange: (mode: "grid" | "stacked") => void;
}

export function RepositoryFilter({
	searchQuery,
	onSearchChange,
	sortBy,
	onSortChange,
	viewMode,
	onViewModeChange,
}: RepositoryFilterProps) {
	return (
		<div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
			<div className="max-w-md flex-1">
				<div className="relative">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
					<Input
						placeholder="Search repositories..."
						className="border-gray-300 pl-10 focus:border-gray-400"
						value={searchQuery}
						onChange={event_ => onSearchChange(event_.target.value)}
					/>
				</div>
			</div>
			<div className="flex items-center space-x-3">
				<Select value={sortBy} onValueChange={onSortChange}>
					<SelectTrigger className="w-40 border-gray-300">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="name">Alphabetical</SelectItem>
						<SelectItem value="latest">Latest Commit</SelectItem>
						<SelectItem value="oldest">Oldest Commit</SelectItem>
					</SelectContent>
				</Select>
				{/* <div className="flex items-center rounded-md border border-gray-300">
					<Button
						variant={viewMode === "grid" ? "default" : "ghost"}
						size="sm"
						onClick={() => onViewModeChange("grid")}
						className={`rounded-r-none ${
							viewMode === "grid"
								? "bg-black text-white"
								: "text-gray-600 hover:bg-gray-50"
						}`}
					>
						<Grid3X3 className="h-4 w-4" />
					</Button>
					<Button
						variant={viewMode === "stacked" ? "default" : "ghost"}
						size="sm"
						onClick={() => onViewModeChange("stacked")}
						className={`rounded-l-none ${
							viewMode === "stacked"
								? "bg-black text-white"
								: "text-gray-600 hover:bg-gray-50"
						}`}
					>
						<List className="h-4 w-4" />
					</Button>
				</div> */}
			</div>
		</div>
	);
}
