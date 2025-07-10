"use client";

import { formatDistanceToNow } from "date-fns";
import { CheckCircle2, Clock, Eye, XCircle } from "lucide-react";
import { useState } from "react";

// eslint-disable-next-line import/no-unresolved
import { Badge } from "@/components/ui/badge";
// eslint-disable-next-line import/no-unresolved
import { Button } from "@/components/ui/button";
// eslint-disable-next-line import/no-unresolved
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface WebhookLog {
	id: string;
	timestamp: string;
	event_type: string;
	status: "success" | "failed";
	error_message: string | undefined;
}
interface WebhookTableProps {
	logs: WebhookLog[];
	isLoading?: boolean;
}

const getEventTypeLabel = (eventType: string) => {
	switch (eventType) {
		case "push": {
			return "Push";
		}
		case "pull_request": {
			return "Pull Request";
		}
		case "release": {
			return "Release";
		}
		default: {
			return eventType.charAt(0).toUpperCase() + eventType.slice(1);
		}
	}
};

export function WebhookTable({ logs, isLoading = false }: WebhookTableProps) {
	const [timeFormat, setTimeFormat] = useState<"relative" | "absolute">(
		"relative",
	);
	const [filter, setFilter] = useState<"all" | "success" | "failed">("all");

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "success": {
				return <CheckCircle2 className="h-4 w-4 text-green-600" />;
			}
			case "failed": {
				return <XCircle className="h-4 w-4 text-red-600" />;
			}
			default: {
				return <Clock className="h-4 w-4 text-gray-500" />;
			}
		}
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "success": {
				return (
					<Badge
						variant="outline"
						className="border-green-200 bg-green-50 text-green-700"
					>
						Success
					</Badge>
				);
			}
			case "failed": {
				return (
					<Badge
						variant="outline"
						className="border-red-200 bg-red-50 text-red-700"
					>
						Failed
					</Badge>
				);
			}
			default: {
				return (
					<Badge
						variant="outline"
						className="border-gray-200 bg-gray-50 text-gray-700"
					>
						Unknown
					</Badge>
				);
			}
		}
	};

	const formatTime = (timestamp: string) => {
		const date = new Date(timestamp);
		if (timeFormat === "relative") {
			return formatDistanceToNow(date, { addSuffix: true });
		}
		return date.toLocaleString();
	};

	const filteredLogs = logs.filter(log => {
		if (filter === "all") return true;
		return log.status === filter;
	});

	const successCount = logs.filter(log => log.status === "success").length;
	const failedCount = logs.filter(log => log.status === "failed").length;

	if (isLoading) {
		return (
			<Card className="border-gray-200">
				<CardHeader>
					<div className="flex items-center justify-between">
						<Skeleton className="h-6 w-32" />
						<Skeleton className="h-8 w-24" />
					</div>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{Array.from({ length: 5 }).map((_, index) => (
							<div key={index} className="flex items-center space-x-4">
								<Skeleton className="h-4 w-4" />
								<Skeleton className="h-4 w-24" />
								<Skeleton className="h-4 w-32" />
								<Skeleton className="h-4 w-20" />
								<Skeleton className="h-4 w-16" />
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="h-[600px] border-gray-200">
			<CardHeader>
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<CardTitle className="text-lg text-gray-900">Webhook Logs</CardTitle>
					<div className="flex flex-col gap-2 sm:flex-row">
						<div className="flex items-center space-x-2">
							<Button
								variant={filter === "all" ? "default" : "outline"}
								size="sm"
								onClick={() => setFilter("all")}
								className={
									filter === "all"
										? "bg-black text-white"
										: "border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50"
								}
							>
								All ({logs.length})
							</Button>
							<Button
								variant={filter === "success" ? "default" : "outline"}
								size="sm"
								onClick={() => setFilter("success")}
								className={
									filter === "success"
										? "bg-black text-white"
										: "border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50"
								}
							>
								Success ({successCount})
							</Button>
							<Button
								variant={filter === "failed" ? "default" : "outline"}
								size="sm"
								onClick={() => setFilter("failed")}
								className={
									filter === "failed"
										? "bg-black text-white"
										: "border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50"
								}
							>
								Failed ({failedCount})
							</Button>
						</div>
						<div className="flex items-center space-x-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() =>
									setTimeFormat(
										timeFormat === "relative" ? "absolute" : "relative",
									)
								}
								className="border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50"
							>
								<Clock className="mr-2 h-4 w-4" />
								{timeFormat === "relative" ? "Relative" : "Absolute"}
							</Button>
						</div>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				{filteredLogs.length === 0 ? (
					<div className="py-8 text-center">
						<div className="mb-4 text-gray-400">
							<Eye className="mx-auto h-12 w-12" />
						</div>
						<h3 className="mb-2 text-lg font-medium text-gray-900">
							No webhook logs
						</h3>
						<p className="text-gray-500">
							{filter === "all"
								? "Webhook logs will appear here"
								: `No ${filter} webhook events found`}
						</p>
					</div>
				) : (
					<>
						<div className="overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead className="w-16">Status</TableHead>
										<TableHead>Event Type</TableHead>
										<TableHead>Time</TableHead>
										<TableHead>Error</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredLogs.map(log => (
										<TableRow key={log.id}>
											<TableCell>
												<div className="flex items-center space-x-2">
													{getStatusIcon(log.status)}
													{getStatusBadge(log.status)}
												</div>
											</TableCell>
											<TableCell>
												<span className="font-medium text-gray-900">
													{getEventTypeLabel(log.event_type)}
												</span>
											</TableCell>
											<TableCell>
												<span className="text-sm text-gray-600">
													{formatTime(log.timestamp)}
												</span>
											</TableCell>
											<TableCell>
												{log.error_message ? (
													<span className="block max-w-xs truncate text-sm text-red-600">
														{log.error_message}
													</span>
												) : (
													<span className="text-sm text-gray-400">-</span>
												)}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>

						{/* {totalPages > 1 && (
							<div className="mt-6">
								<Pagination>
									<PaginationContent>
										<PaginationItem>
											<PaginationPrevious
												href="#"
												onClick={event_ => {
													event_.preventDefault();
													if (currentPage > 1) onPageChange(currentPage - 1);
												}}
												className={
													currentPage <= 1
														? "pointer-events-none opacity-50"
														: ""
												}
											/>
										</PaginationItem>

										{Array.from(
											{ length: totalPages },
											(_, index) => index + 1,
										).map(page => {
											if (
												page === 1 ||
												page === totalPages ||
												(page >= currentPage - 1 && page <= currentPage + 1)
											) {
												return (
													<PaginationItem key={page}>
														<PaginationLink
															href="#"
															onClick={event_ => {
																event_.preventDefault();
																onPageChange(page);
															}}
															isActive={currentPage === page}
														>
															{page}
														</PaginationLink>
													</PaginationItem>
												);
											} else if (
												page === currentPage - 2 ||
												page === currentPage + 2
											) {
												return (
													<PaginationItem key={page}>
														<PaginationEllipsis />
													</PaginationItem>
												);
											}
											return;
										})}

										<PaginationItem>
											<PaginationNext
												href="#"
												onClick={event_ => {
													event_.preventDefault();
													if (currentPage < totalPages)
														onPageChange(currentPage + 1);
												}}
												className={
													currentPage >= totalPages
														? "pointer-events-none opacity-50"
														: ""
												}
											/>
										</PaginationItem>
									</PaginationContent>
								</Pagination>
							</div>
						)} */}
					</>
				)}
			</CardContent>
		</Card>
	);
}
