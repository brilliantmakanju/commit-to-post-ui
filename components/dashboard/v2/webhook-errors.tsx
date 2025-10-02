"use client";
// eslint-disable-next-line import/no-unresolved
import { Badge } from "@/components/ui/badge";
// eslint-disable-next-line import/no-unresolved
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
	// eslint-disable-next-line import/no-unresolved
} from "@/components/ui/table";
import useRetrieveMetrics from "@/hooks/core/metric";

const getStatusColor = (status: number) => {
	if (status >= 500) return "bg-red-500/20 text-red-400 border-red-500/30";
	if (status >= 400)
		return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
	return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
};

export const WebhookErrors = () => {
	const { webhookErrors: data } = useRetrieveMetrics();
	// const data = webhookErrorsData;

	if (data.length === 0) {
		return (
			<div className="flex h-40 items-center justify-center text-center">
				<div>
					<p className="text-sm font-medium text-green-400">
						All systems operational.
					</p>
					<p className="mt-1 text-xs text-muted-foreground">
						No webhook errors in the last 7 days.
					</p>
				</div>
			</div>
		);
	}

	return (
		<Table>
			<TableHeader>
				<TableRow className="border-zinc-800 hover:bg-transparent">
					<TableHead className="text-start font-medium text-zinc-300">
						Repo
					</TableHead>
					<TableHead className="text-start font-medium text-zinc-300">
						Status
					</TableHead>
					<TableHead className="text-start font-medium text-zinc-300">
						Time
					</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{data.map((error, index) => (
					<TableRow
						key={`${error.status}_${error.time}_${index}`}
						className="group border-zinc-800/50 hover:bg-zinc-900/30"
					>
						<TableCell className="max-w-[120px] truncate font-mono text-sm">
							{error.repo}
						</TableCell>
						<TableCell className="text-start">
							<Badge variant="outline" className={getStatusColor(error.status)}>
								{error.status}
							</Badge>
						</TableCell>
						<TableCell className="text-start text-xs text-muted-foreground">
							{error.time}
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
};

export const WebhookErrorsSkeleton = () => {
	return (
		<div className="w-full space-y-3 p-2">
			{Array.from({ length: 3 }).map((_, index) => (
				<div key={index} className="flex items-center space-x-4">
					<Skeleton className="h-4 w-24" />
					<div className="flex-1">
						<Skeleton className="h-5 w-12" />
					</div>
					<Skeleton className="h-4 w-12" />
				</div>
			))}
		</div>
	);
};
