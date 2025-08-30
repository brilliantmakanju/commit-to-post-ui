/* eslint-disable import/no-unresolved */
"use client";
import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import {
	FaCheck,
	FaExclamationCircle,
	FaExclamationTriangle,
	FaFilter,
	FaPlus,
	FaSpinner,
} from "react-icons/fa";

// shadcn/ui imports
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
// eslint-disable-next-line import/no-unresolved
import {
	fetchBillingHistory,
	fetchBillingHistoryByUrl,
} from "@/server-actions/core/billing-history";

// Status badge styling
const getStatusBadgeClass = (status: string) =>
	status === "paid"
		? "border border-green-700/50 bg-green-800/30 text-green-300"
		: "border border-red-700/50 bg-red-800/30 text-red-300";

const BillingHistory = () => {
	// State management
	const [billingData, setBillingData] = useState({
		billing_history: [],
		pagination: {
			total_count: 0,
			has_more: false,
			remaining_count: 0,
			next: undefined as string | undefined,
			previous: undefined as string | undefined,
			current_page: 1,
			total_pages: 1,
		},
		summary: {
			total_transactions: 0,
			successful_payments: 0,
			failed_payments: 0,
		},
	});
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [loadingMore, setLoadingMore] = useState(false);
	const [error, setError] = useState<string | undefined>();
	const [historyFilter, setHistoryFilter] = useState<"all" | "paid" | "failed">(
		"all",
	);

	// Track current offset to prevent duplicate loading
	const [currentOffset, setCurrentOffset] = useState(0);

	// Fetch helper
	const loadBillingHistory = async ({
		status,
		offset,
		limit,
		page,
		append = false,
	}: {
		status: "all" | "paid" | "failed";
		offset: number;
		limit: number;
		page?: number;
		append?: boolean;
	}) => {
		try {
			const data = await fetchBillingHistory({ status, offset, limit, page });

			setBillingData(previous => {
				if (append) {
					// When appending, merge the new items with existing ones
					// Use a Set to prevent duplicates based on item ID
					const existingIds = new Set(
						previous.billing_history.map((item: any) => item.id),
					);
					const newItems = data.billing_history.filter(
						(item: any) => !existingIds.has(item.id),
					);

					return {
						...data, // Use new pagination data
						billing_history: [
							...previous.billing_history,
							...newItems, // Only add truly new items
						],
						// Keep the previous summary when appending
						summary: previous.summary,
					};
				} else {
					// Complete replacement
					return data;
				}
			});

			setError(undefined);
		} catch (error_) {
			setError(error_ instanceof Error ? error_.message : "Unknown error");
		}
	};

	// Initial load
	useEffect(() => {
		const loadInitialData = async () => {
			setLoading(true);
			setCurrentOffset(0); // Reset offset
			await loadBillingHistory({
				status: historyFilter,
				offset: 0,
				limit: 50,
				page: 1, // Add page parameter for initial load
				append: false,
			});
			setLoading(false);
		};
		loadInitialData();
	}, [historyFilter]);

	// Handle filter changes
	const handleFilterChange = async (newFilter: "all" | "paid" | "failed") => {
		if (newFilter === historyFilter) return;

		setHistoryFilter(newFilter);
		setCurrentOffset(0); // Reset offset when changing filters
		setLoading(true);
		await loadBillingHistory({
			status: newFilter,
			offset: 0,
			limit: 50,
			page: 1, // Start from page 1
			append: false,
		});
		setLoading(false);
	};

	// Load more functionality - Use the next URL from API response
	const loadMoreHistory = async () => {
		if (
			loadingMore ||
			!billingData.pagination?.has_more ||
			!billingData.pagination?.next
		)
			return;

		setLoadingMore(true);

		try {
			// Use the next URL directly from the API response
			const data = await fetchBillingHistoryByUrl(billingData.pagination.next);

			setBillingData(previous => {
				// Filter out duplicates based on item ID
				const existingIds = new Set(
					previous.billing_history.map((item: any) => item.id),
				);
				const newItems = data.billing_history.filter(
					(item: any) => !existingIds.has(item.id),
				);

				return {
					...data, // Use new pagination data
					billing_history: [
						...previous.billing_history,
						...newItems, // Only add truly new items
					],
					// Keep the original summary since it represents the total
					summary: previous.summary,
				};
			});

			setError(undefined);
		} catch (error_) {
			setError(error_ instanceof Error ? error_.message : "Unknown error");
		}

		setLoadingMore(false);
	};

	// Refresh functionality
	const refreshData = async () => {
		setRefreshing(true);
		setCurrentOffset(0); // Reset offset

		// Always refresh with just the initial 10 items to prevent stale data
		await loadBillingHistory({
			status: historyFilter,
			offset: 0,
			limit: 50,
			page: 1, // Start from page 1
			append: false,
		});

		setRefreshing(false);
	};

	// Loading skeleton
	const LoadingSkeleton = () => (
		<>
			{Array.from({ length: 6 }).map((_, index) => (
				<TableRow
					key={index}
					className="border-zinc-800/30 hover:bg-zinc-800/20"
				>
					<TableCell className="px-2 py-2.5">
						<div className="h-4 w-20 animate-pulse rounded bg-zinc-700/50"></div>
					</TableCell>
					<TableCell className="px-2 py-2.5">
						<div className="h-4 w-32 animate-pulse rounded bg-zinc-700/50"></div>
					</TableCell>
					<TableCell className="px-2 py-2.5">
						<div className="h-4 w-16 animate-pulse rounded bg-zinc-700/50"></div>
					</TableCell>
					<TableCell className="px-2 py-2.5">
						<div className="h-6 w-16 animate-pulse rounded-full bg-zinc-700/50"></div>
					</TableCell>
				</TableRow>
			))}
		</>
	);

	// Error state
	const ErrorState = () => (
		<TableRow>
			<TableCell colSpan={4} className="px-2 py-8 text-center">
				<div className="flex flex-col items-center gap-3">
					<FaExclamationCircle className="h-8 w-8 text-red-400" />
					<div>
						<p className="mb-2 text-sm text-zinc-300">
							Failed to load billing history
						</p>
						<p className="mb-3 text-xs text-zinc-500">{error}</p>
						<button
							onClick={refreshData}
							className="inline-flex items-center gap-2 rounded-lg border border-zinc-700/50 bg-zinc-800/50 px-3 py-1.5 text-xs transition-colors hover:bg-zinc-700/50"
						>
							<RefreshCw className="h-3 w-3" />
							Try Again
						</button>
					</div>
				</div>
			</TableCell>
		</TableRow>
	);

	// Empty state
	const EmptyState = () => (
		<TableRow className="h-full">
			<TableCell
				colSpan={4}
				className="border-zinc-800/30 text-center transition-colors hover:bg-none"
			>
				<div className="flex flex-col items-center gap-3">
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800/50">
						<FaFilter className="h-5 w-5 text-zinc-500" />
					</div>
					<div>
						<p className="text-sm text-zinc-300">No billing history found</p>
						<p className="text-xs text-zinc-500">
							{historyFilter === "all"
								? "No transactions yet"
								: `No ${historyFilter} transactions found`}
						</p>
					</div>
				</div>
			</TableCell>
		</TableRow>
	);

	const filteredHistory: any = billingData.billing_history || [];
	const hasMoreHistory = billingData.pagination?.has_more || false;
	const remainingCount = billingData.pagination?.remaining_count || 0;

	return (
		<div className="w-full rounded-2xl border border-zinc-800/50 bg-zinc-900/30 px-5 py-4 text-zinc-100 backdrop-blur-xl transition-all duration-300 hover:border-zinc-700/50 hover:bg-zinc-800/40">
			{/* Header */}
			<div className="mb-4 flex items-center justify-between">
				<div className="flex items-center gap-3">
					<h3 className="text-lg font-semibold">Billing History</h3>
					{billingData.summary?.total_transactions > 0 && (
						<span className="rounded-full border border-zinc-700/50 bg-zinc-800/50 px-2 py-0.5 text-xs text-zinc-400">
							{billingData.summary.total_transactions} total
						</span>
					)}
				</div>
				<div className="flex items-center gap-2">
					{refreshing && (
						<FaSpinner className="h-3.5 w-3.5 animate-spin text-zinc-400" />
					)}
					<button
						onClick={refreshData}
						disabled={refreshing || loading}
						className="rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-1.5 transition-colors hover:bg-zinc-700/40 disabled:opacity-50"
						title="Refresh"
					>
						<RefreshCw className="h-3 w-3 text-zinc-400" />
					</button>
					<FaFilter className="h-3.5 w-3.5 text-zinc-400" />
					<select
						value={historyFilter}
						onChange={event_ =>
							handleFilterChange(
								event_.target.value as "all" | "paid" | "failed",
							)
						}
						disabled={loading}
						className="rounded-lg border border-zinc-700/50 bg-zinc-800/50 px-3 py-1 text-sm text-zinc-100 focus:border-zinc-600/70 focus:outline-none disabled:opacity-50"
					>
						<option value="all">All</option>
						<option value="paid">Paid</option>
						<option value="failed">Failed</option>
					</select>
				</div>
			</div>

			{/* Summary Stats */}
			{billingData.summary && billingData.summary.total_transactions > 0 && (
				<div className="mb-4 grid grid-cols-3 gap-3">
					<div className="rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-3">
						<div className="text-xs text-zinc-400">Total</div>
						<div className="text-lg font-semibold">
							{billingData.summary.total_transactions}
						</div>
					</div>
					<div className="rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-3">
						<div className="text-xs text-zinc-400">Successful</div>
						<div className="text-lg font-semibold text-green-400">
							{billingData.summary.successful_payments}
						</div>
					</div>
					<div className="rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-3">
						<div className="text-xs text-zinc-400">Failed</div>
						<div className="text-lg font-semibold text-red-400">
							{billingData.summary.failed_payments}
						</div>
					</div>
				</div>
			)}

			{/* Table with shadcn/ui components */}
			<div className="overflow-x-auto">
				<Table className="h-[300px] max-h-[300px] w-full">
					<TableHeader>
						<TableRow className="border-zinc-800/50 hover:bg-transparent">
							<TableHead className="h-auto px-2 py-2 text-left text-sm font-medium text-zinc-400">
								Date
							</TableHead>
							<TableHead className="h-auto px-2 py-2 text-left text-sm font-medium text-zinc-400">
								Description
							</TableHead>
							<TableHead className="h-auto px-2 py-2 text-left text-sm font-medium text-zinc-400">
								Amount
							</TableHead>
							<TableHead className="h-auto px-2 py-2 text-left text-sm font-medium text-zinc-400">
								Status
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody className="scrollbar-hide h-[400px] max-h-[400px] overflow-hidden overflow-y-auto">
						{loading ? (
							<LoadingSkeleton />
						) : error ? (
							<ErrorState />
						) : filteredHistory.length === 0 ? (
							<EmptyState />
						) : (
							filteredHistory.map((item: any, index: any) => {
								return (
									<TableRow
										key={`${item.id || index}-${item.date}`}
										className="border-zinc-800/30 transition-colors hover:bg-zinc-800/20"
									>
										<TableCell className="px-2 py-2.5 text-sm text-zinc-300">
											{item.date}
										</TableCell>
										<TableCell className="px-2 py-2.5 text-sm text-zinc-300">
											{item.description}
										</TableCell>
										<TableCell className="px-2 py-2.5 text-sm font-medium text-zinc-300">
											{item.amount}
										</TableCell>
										<TableCell className="px-2 py-2.5">
											<span
												className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadgeClass(item.status)}`}
											>
												{item.status === "paid" ? (
													<FaCheck className="h-2.5 w-2.5" />
												) : (
													<FaExclamationTriangle className="h-2.5 w-2.5" />
												)}
												{item.status === "paid" ? "Paid" : "Failed"}
											</span>
										</TableCell>
									</TableRow>
								);
							})
						)}
					</TableBody>
				</Table>
			</div>

			{/* Load More Button - Fixed logic */}
			{hasMoreHistory && !loading && !error && (
				<div className="mt-4 text-center">
					<button
						onClick={loadMoreHistory}
						disabled={loadingMore}
						className="mx-auto flex items-center gap-2 rounded-lg border border-zinc-700/50 bg-zinc-800/30 px-4 py-2 text-sm font-medium text-zinc-100 transition-all duration-200 hover:border-zinc-600/70 hover:bg-zinc-700/40 disabled:opacity-50"
					>
						{loadingMore ? (
							<FaSpinner className="h-3 w-3 animate-spin" />
						) : (
							<FaPlus className="h-3 w-3" />
						)}
						{loadingMore
							? "Loading..."
							: `Load More (${remainingCount} remaining)`}
					</button>
				</div>
			)}
		</div>
	);
};

export default BillingHistory;
