/* eslint-disable unicorn/no-null */
"use client";
import { formatDistanceToNow } from "date-fns";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { useState } from "react";
interface WebhookPingLog {
	id: string;
	client_ip: string;
	received_at: string;
	github_event: string;
	request_size: number;
	http_status: number | null;
	completed_at: string | null;
	response_body: string | null;
	processing_time_ms: number | null;
	status: "processing" | "success" | "failed";
}

interface WebhookTableProps {
	isLoading?: boolean;
	logs: WebhookPingLog[];
}

const getStatusIcon = (status: string, httpStatus?: number | null) => {
	switch (status) {
		case "success": {
			return <CheckCircle2 className="h-3.5 w-3.5 text-zinc-400" />;
		}
		case "failed": {
			return <AlertCircle className="h-3.5 w-3.5 text-red-400" />;
		}
		case "processing": {
			return <Clock className="h-3.5 w-3.5 text-zinc-500" />;
		}
		default: {
			return <Clock className="h-3.5 w-3.5 text-zinc-600" />;
		}
	}
};

const getStatusText = (status: string) => {
	switch (status) {
		case "success": {
			return "Success";
		}
		case "failed": {
			return "Failed";
		}
		case "processing": {
			return "Processing";
		}
		default: {
			return "Unknown";
		}
	}
};

const formatTime = (timestamp: string, format: "relative" | "absolute") => {
	const date = new Date(timestamp);
	if (format === "relative") {
		return formatDistanceToNow(date, { addSuffix: true });
	}
	return date.toLocaleString();
};

const formatEventType = (eventType: string) => {
	return eventType
		.replaceAll("_", " ")
		.replaceAll(/\b\w/g, l => l.toUpperCase());
};

export default function WebhookTable({
	logs,
	isLoading = false,
}: WebhookTableProps) {
	const [timeFormat, setTimeFormat] = useState<"relative" | "absolute">(
		"relative",
	);
	const [filter, setFilter] = useState<
		"all" | "success" | "failed" | "processing"
	>("all");

	if (isLoading) {
		return (
			<div className="rounded-lg border border-zinc-800 bg-zinc-900">
				<div className="border-b border-zinc-800 px-6 py-4">
					<div className="flex items-center justify-between">
						<div className="h-5 w-32 animate-pulse rounded bg-zinc-700"></div>
						<div className="flex space-x-2">
							<div className="h-8 w-16 animate-pulse rounded bg-zinc-700"></div>
							<div className="h-8 w-20 animate-pulse rounded bg-zinc-700"></div>
						</div>
					</div>
				</div>
				<div className="space-y-4 p-6">
					{Array.from({ length: 10 }).map((_, index) => (
						<div key={index} className="flex items-center space-x-4">
							<div className="h-3.5 w-3.5 animate-pulse rounded-full bg-zinc-700"></div>
							<div className="h-4 w-24 animate-pulse rounded bg-zinc-700"></div>
							<div className="h-4 w-32 animate-pulse rounded bg-zinc-700"></div>
							<div className="h-4 w-16 animate-pulse rounded bg-zinc-700"></div>
						</div>
					))}
				</div>
			</div>
		);
	}

	const filteredLogs = logs.filter((log: any) => {
		if (filter === "all") return true;
		return log.status === filter;
	});

	const statusCounts = {
		all: logs.length,
		failed: logs.filter((log: any) => log.status === "failed").length,
		success: logs.filter((log: any) => log.status === "success").length,
		processing: logs.filter((log: any) => log.status === "processing").length,
	};

	return (
		<div className="rounded-lg border border-zinc-800 bg-zinc-900">
			{/* Header */}
			<div className="border-b border-zinc-800 px-6 py-4">
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-medium text-white">Webhook Logs</h2>
					<div className="flex items-center space-x-2">
						{/* Filter buttons */}
						<div className="flex items-center space-x-1">
							{(["all", "success", "failed", "processing"] as const).map(
								status => (
									<button
										key={status}
										onClick={() => setFilter(status)}
										className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
											filter === status
												? "bg-white text-black"
												: "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
										}`}
									>
										{status.charAt(0).toUpperCase() + status.slice(1)} (
										{statusCounts[status]})
									</button>
								),
							)}
						</div>

						{/* Time format toggle */}
						<button
							onClick={() =>
								setTimeFormat(
									timeFormat === "relative" ? "absolute" : "relative",
								)
							}
							className="rounded-md px-3 py-1.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
						>
							<Clock className="mr-1 inline h-4 w-4" />
							{timeFormat === "relative" ? "Relative" : "Absolute"}
						</button>
					</div>
				</div>
			</div>

			{/* Table */}
			<div className="overflow-x-auto">
				{filteredLogs.length === 0 ? (
					<div className="px-6 py-12 text-center">
						<div className="mb-3 text-zinc-600">
							<Clock className="mx-auto h-8 w-8" />
						</div>
						<h3 className="mb-1 text-sm font-medium text-white">
							No webhook logs
						</h3>
						<p className="text-sm text-zinc-400">
							{filter === "all"
								? "Webhook logs will appear here"
								: `No ${filter} events found`}
						</p>
					</div>
				) : (
					<table className="min-w-full divide-y divide-zinc-800">
						<thead className="bg-zinc-800/50">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
									Status
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
									Event
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
									Time
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
									HTTP Status
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
									Duration
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
									Size
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
									IP
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-zinc-800 bg-zinc-900">
							{filteredLogs.map((log: any) => (
								<tr key={log.id} className="hover:bg-zinc-800/30">
									<td className="whitespace-nowrap px-6 py-4">
										<div className="flex items-center space-x-2">
											{getStatusIcon(log.status, log.http_status)}
											<span className="text-sm font-medium text-white">
												{getStatusText(log.status)}
											</span>
										</div>
									</td>
									<td className="whitespace-nowrap px-6 py-4">
										<span className="text-sm text-zinc-200">
											{formatEventType(log.github_event)}
										</span>
									</td>
									<td className="whitespace-nowrap px-6 py-4">
										<span className="text-sm text-zinc-400">
											{formatTime(log.received_at, timeFormat)}
										</span>
									</td>
									<td className="whitespace-nowrap px-6 py-4">
										<span
											className={`text-sm ${
												log.http_status
													? log.http_status >= 200 && log.http_status < 300
														? "text-zinc-300"
														: log.http_status >= 400
															? "text-red-400"
															: "text-zinc-400"
													: "text-zinc-600"
											}`}
										>
											{log.http_status || "—"}
										</span>
									</td>
									<td className="whitespace-nowrap px-6 py-4">
										<span className="text-sm text-zinc-400">
											{log.processing_time_ms
												? `${log.processing_time_ms}ms`
												: "—"}
										</span>
									</td>
									<td className="whitespace-nowrap px-6 py-4">
										<span className="text-sm text-zinc-400">
											{log.request_size
												? `${(log.request_size / 1024).toFixed(1)}KB`
												: "—"}
										</span>
									</td>
									<td className="whitespace-nowrap px-6 py-4">
										<span className="font-mono text-sm text-zinc-400">
											{log.client_ip}
										</span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>
		</div>
	);
}
