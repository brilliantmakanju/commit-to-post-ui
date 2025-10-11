"use client";

import {
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	Download,
	RefreshCw,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
	FaCheck,
	FaClock,
	FaExclamationCircle,
	FaExclamationTriangle,
	FaSpinner,
} from "react-icons/fa";

import {
	fetchCreditHistory,
	fetchPlanChanges,
} from "@/server-actions/core/billing-history";

interface CreditTransaction {
	id: number;
	description: string;
	amount: number;
	balance_after: number;
	transaction_type: string;
	transaction_type_display: string;
	user_email: string;
	paddle_transaction_id: string | null;
	related_subscription_id: string | null;
	created_at: string;
}

interface PlanChange {
	id: number;
	old_plan: string;
	new_plan: string;
	old_price_id: string | null;
	new_price_id: string | null;
	change_type: string;
	change_type_display: string;
	old_price: number | null;
	new_price: number | null;
	scheduled_date: string;
	effective_date: string;
	is_scheduled: boolean;
	is_processed: boolean;
	reason: string;
	metadata: Record<string, unknown>;
	created_at: string;
}

interface BillingHistoryProps {
	onAggregatesChange?: (aggregates: {
		debits: number;
		credits: number;
		bonuses: number;
		upgrades: number;
		downgrades: number;
		totalChanges: number;
	}) => void;
}

const formatDate = (dateString: string): string => {
	return new Date(dateString).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
};

const formatCurrency = (amount: number): string =>
	`$${Number(amount).toFixed(2)}`;

const LoadingSkeleton: React.FC = () => (
	<>
		{Array.from({ length: 6 }).map((_, index) => (
			<tr key={index} className="border-b border-zinc-800/50">
				{Array.from({ length: 5 }).map((_, index) => (
					<td key={index} className="px-4 py-3">
						<div className="h-4 w-24 animate-pulse rounded bg-zinc-800/50"></div>
					</td>
				))}
			</tr>
		))}
	</>
);

interface ErrorStateProps {
	errorMessage: string;
	onRetry: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ errorMessage, onRetry }) => (
	<div className="flex flex-col items-center gap-4 rounded-2xl border border-zinc-800/50 bg-zinc-900/30 px-6 py-16 backdrop-blur-md">
		<FaExclamationCircle className="h-12 w-12 text-red-400" />
		<div className="text-center">
			<p className="mb-1 text-lg font-semibold text-zinc-100">
				Failed to load data
			</p>
			<p className="mb-4 text-sm text-zinc-400">{errorMessage}</p>
			<button
				onClick={onRetry}
				className="inline-flex items-center gap-2 rounded-lg border border-zinc-800/50 bg-zinc-900/30 px-4 py-2 text-sm font-medium text-zinc-100 transition-all hover:bg-zinc-800/40"
			>
				<RefreshCw className="h-4 w-4" />
				Try Again
			</button>
		</div>
	</div>
);

const BillingHistory: React.FC<BillingHistoryProps> = ({
	onAggregatesChange,
}) => {
	const [creditTransactions, setCreditTransactions] = useState<
		CreditTransaction[]
	>([]);
	const [planChangeHistory, setPlanChangeHistory] = useState<PlanChange[]>([]);
	const [activeTab, setActiveTab] = useState<"transactions" | "plans">(
		"transactions",
	);
	const [hasError, setHasError] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [filterType, setFilterType] = useState<string>("all");
	const [showFilterDropdown, setShowFilterDropdown] = useState(false);

	// Pagination states
	const [itemsPerPage] = useState(20);
	const [totalCount, setTotalCount] = useState(0);
	const [currentPage, setCurrentPage] = useState(1);

	const loadData = useCallback(async () => {
		try {
			setHasError(false);
			setErrorMessage("");

			const offset = (currentPage - 1) * itemsPerPage;
			const filterValue = filterType === "all" ? undefined : filterType;

			if (activeTab === "transactions") {
				const creditResult = await fetchCreditHistory({
					limit: itemsPerPage,
					offset,
					type: filterValue,
				});

				if (creditResult.success && creditResult.data) {
					setCreditTransactions(creditResult.data.transactions);
					setTotalCount(creditResult.data.total_count);

					// Calculate aggregates for all transactions (not just current page)
					const allTransactionsResult = await fetchCreditHistory({
						limit: 1000,
						offset: 0,
						type: undefined,
					});

					if (
						allTransactionsResult.success &&
						allTransactionsResult.data &&
						onAggregatesChange
					) {
						const allTransactions = allTransactionsResult.data.transactions;
						const debits = allTransactions
							.filter(t => t.transaction_type === "debit")
							.reduce((sum, t) => sum + t.amount, 0);
						const credits = allTransactions
							.filter(t => t.transaction_type === "credit")
							.reduce((sum, t) => sum + t.amount, 0);
						const bonuses = allTransactions
							.filter(t => t.transaction_type === "bonus")
							.reduce((sum, t) => sum + t.amount, 0);

						onAggregatesChange({
							debits,
							credits,
							bonuses,
							upgrades: 0,
							downgrades: 0,
							totalChanges: 0,
						});
					}
				}
			} else {
				const planResult = await fetchPlanChanges({
					limit: itemsPerPage,
					offset,
				});

				if (planResult.success && planResult.data) {
					setPlanChangeHistory(planResult.data.changes);
					setTotalCount(planResult.data.total_count);

					// Calculate aggregates for all plan changes
					const allChangesResult = await fetchPlanChanges({
						limit: 1000,
						offset: 0,
					});

					if (
						allChangesResult.success &&
						allChangesResult.data &&
						onAggregatesChange
					) {
						const allChanges = allChangesResult.data.changes;
						const upgrades = allChanges.filter(
							c => c.change_type === "upgrade",
						).length;
						const downgrades = allChanges.filter(
							c => c.change_type === "downgrade",
						).length;

						onAggregatesChange({
							debits: 0,
							credits: 0,
							bonuses: 0,
							upgrades,
							downgrades,
							totalChanges: allChanges.length,
						});
					}
				}
			}
		} catch (error) {
			setHasError(true);
			setErrorMessage(
				error instanceof Error ? error.message : "Failed to load billing data",
			);
		}
	}, [filterType, currentPage, itemsPerPage, activeTab, onAggregatesChange]);

	useEffect(() => {
		const initializeData = async () => {
			setIsLoading(true);
			await loadData();
			setIsLoading(false);
		};

		initializeData();
	}, [loadData]);

	// Reset to page 1 when changing filters or tabs
	useEffect(() => {
		setCurrentPage(1);
	}, [filterType, activeTab]);

	const handleRefresh = useCallback(async () => {
		setRefreshing(true);
		await loadData();
		setRefreshing(false);
	}, [loadData]);

	const totalPages = Math.ceil(totalCount / itemsPerPage);

	const exportToCSV = useCallback(() => {
		let csvContent = "";
		let filename = "";

		if (activeTab === "transactions") {
			csvContent = "Date,Description,Amount,Type,Balance After\n";
			creditTransactions.forEach(t => {
				const row = [
					formatDate(t.created_at),
					`"${t.description}"`,
					t.amount,
					t.transaction_type_display,
					t.balance_after,
				].join(",");
				csvContent += row + "\n";
			});
			filename = `credit-transactions-${new Date().toISOString().split("T")[0]}.csv`;
		} else {
			csvContent =
				"Date,From Plan,To Plan,Change Type,Old Price,New Price,Status\n";
			planChangeHistory.forEach(c => {
				const status = c.is_processed
					? "Processed"
					: c.is_scheduled
						? "Scheduled"
						: "Pending";
				const row = [
					formatDate(c.created_at),
					c.old_plan,
					c.new_plan,
					c.change_type_display,
					c.old_price || "N/A",
					c.new_price || "N/A",
					status,
				].join(",");
				csvContent += row + "\n";
			});
			filename = `plan-changes-${new Date().toISOString().split("T")[0]}.csv`;
		}

		const blob = new Blob([csvContent], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = filename;
		link.click();
		URL.revokeObjectURL(url);
	}, [activeTab, creditTransactions, planChangeHistory]);

	if (hasError) {
		return <ErrorState errorMessage={errorMessage} onRetry={handleRefresh} />;
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-end">
				<div className="flex gap-2">
					<button
						onClick={exportToCSV}
						disabled={
							isLoading ||
							(activeTab === "transactions"
								? creditTransactions.length === 0
								: planChangeHistory.length === 0)
						}
						className="flex items-center gap-2 rounded-xl border border-zinc-800/50 bg-zinc-900/30 px-4 py-2.5 text-sm font-medium text-zinc-100 backdrop-blur-md transition-all hover:bg-zinc-800/40 disabled:cursor-not-allowed disabled:opacity-40"
					>
						<Download className="h-4 w-4" />
						Export CSV
					</button>
					<button
						onClick={handleRefresh}
						disabled={refreshing}
						className="flex items-center gap-2 rounded-xl border border-zinc-800/50 bg-zinc-900/30 px-4 py-2.5 text-sm font-medium text-zinc-100 backdrop-blur-md transition-all hover:bg-zinc-800/40 disabled:opacity-50"
					>
						{refreshing ? (
							<FaSpinner className="h-4 w-4 animate-spin" />
						) : (
							<RefreshCw className="h-4 w-4" />
						)}
						Refresh
					</button>
				</div>
			</div>

			{/* Tabs and Filter */}
			<div className="flex items-center justify-between rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-1 backdrop-blur-md">
				<div className="flex gap-1">
					<button
						onClick={() => setActiveTab("transactions")}
						className={`rounded-lg px-6 py-2.5 text-sm font-semibold transition-all ${
							activeTab === "transactions"
								? "bg-zinc-800/50 text-zinc-100 shadow-lg"
								: "text-zinc-400 hover:text-zinc-200"
						}`}
					>
						Transactions
					</button>
					<button
						onClick={() => setActiveTab("plans")}
						className={`rounded-lg px-6 py-2.5 text-sm font-semibold transition-all ${
							activeTab === "plans"
								? "bg-zinc-800/50 text-zinc-100 shadow-lg"
								: "text-zinc-400 hover:text-zinc-200"
						}`}
					>
						Plan Changes
					</button>
				</div>

				{/* {activeTab === "transactions" && (
					<div className="relative">
						<button
							onClick={() => setShowFilterDropdown(!showFilterDropdown)}
							className="flex items-center gap-2 rounded-lg bg-zinc-800/50 px-4 py-2 text-sm font-medium text-zinc-100 transition-all hover:bg-zinc-800/70"
						>
							{filterType === "all"
								? "All Types"
								: filterType.charAt(0).toUpperCase() + filterType.slice(1)}
							<ChevronDown className="h-4 w-4" />
						</button>

						{showFilterDropdown && (
							<div className="absolute right-0 top-full z-50 mt-2 w-36 rounded-xl border border-zinc-800/50 bg-zinc-900/95 p-1 backdrop-blur-md">
								{["all", "debit", "credit", "bonus"].map(option => (
									<button
										key={option}
										onClick={() => {
											setFilterType(option);
											setShowFilterDropdown(false);
										}}
										className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-all ${
											filterType === option
												? "bg-zinc-800/50 text-zinc-100"
												: "text-zinc-400 hover:bg-zinc-800/30 hover:text-zinc-100"
										}`}
									>
										{option === "all"
											? "All Types"
											: option.charAt(0).toUpperCase() + option.slice(1)}
									</button>
								))}
							</div>
						)}
					</div>
				)} */}
			</div>

			{/* Table */}
			<div className="overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-900/30 backdrop-blur-xl">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-zinc-800/50">
							<tr>
								{activeTab === "transactions" ? (
									<>
										<th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
											Date
										</th>
										<th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
											Description
										</th>
										<th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
											Amount
										</th>
										<th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
											Type
										</th>
										<th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
											Balance
										</th>
									</>
								) : (
									<>
										<th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
											Date
										</th>
										<th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
											From Plan
										</th>
										<th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
											To Plan
										</th>
										<th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
											Change Type
										</th>
										<th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
											Pricing
										</th>
										<th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
											Status
										</th>
									</>
								)}
							</tr>
						</thead>
						<tbody className="divide-y divide-zinc-800/50">
							{isLoading ? (
								<LoadingSkeleton />
							) : activeTab === "transactions" ? (
								creditTransactions.length > 0 ? (
									creditTransactions.map(t => (
										<tr
											key={t.id}
											className="transition-colors hover:bg-zinc-800/30"
										>
											<td className="px-6 py-4 text-sm text-zinc-300">
												{formatDate(t.created_at)}
											</td>
											<td className="px-6 py-4 text-sm text-zinc-300">
												{t.description}
											</td>
											<td
												className={`px-6 py-4 text-sm font-semibold ${
													t.transaction_type === "debit"
														? "text-red-400"
														: "text-green-400"
												}`}
											>
												{t.transaction_type === "debit" ? "−" : "+"}
												{formatCurrency(t.amount)}
											</td>
											<td className="px-6 py-4">
												<span
													className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
														t.transaction_type === "debit"
															? "bg-red-500/20 text-red-300"
															: t.transaction_type === "credit"
																? "bg-green-500/20 text-green-300"
																: "bg-blue-500/20 text-blue-300"
													}`}
												>
													{t.transaction_type_display}
												</span>
											</td>
											<td className="px-6 py-4 text-sm font-medium text-zinc-200">
												{formatCurrency(t.balance_after)}
											</td>
										</tr>
									))
								) : (
									<tr>
										<td colSpan={5} className="px-6 py-12 text-center">
											<p className="text-sm text-zinc-500">
												No transactions found
											</p>
										</td>
									</tr>
								)
							) : planChangeHistory.length > 0 ? (
								planChangeHistory.map(c => (
									<tr
										key={c.id}
										className="transition-colors hover:bg-zinc-800/30"
									>
										<td className="px-6 py-4 text-sm text-zinc-300">
											{formatDate(c.created_at)}
										</td>
										<td className="px-6 py-4">
											<span className="inline-block rounded-lg bg-zinc-800/50 px-3 py-1 text-xs font-medium capitalize text-zinc-300">
												{c.old_plan}
											</span>
										</td>
										<td className="px-6 py-4">
											<span className="inline-block rounded-lg bg-zinc-800/50 px-3 py-1 text-xs font-medium capitalize text-zinc-300">
												{c.new_plan}
											</span>
										</td>
										<td className="px-6 py-4">
											<span
												className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
													c.change_type === "upgrade"
														? "bg-green-500/20 text-green-300"
														: "bg-orange-500/20 text-orange-300"
												}`}
											>
												{c.change_type_display}
											</span>
										</td>
										<td className="px-6 py-4">
											{c.old_price !== null && c.new_price !== null ? (
												<div className="flex items-center gap-2 text-sm">
													<span className="text-zinc-500 line-through">
														{formatCurrency(c.old_price)}
													</span>
													<span className="font-semibold text-zinc-200">
														{formatCurrency(c.new_price)}
													</span>
												</div>
											) : (
												<span className="text-sm text-zinc-500">N/A</span>
											)}
										</td>
										<td className="px-6 py-4">
											<div className="flex items-center gap-2">
												{c.is_processed ? (
													<>
														<FaCheck className="h-3.5 w-3.5 text-green-400" />
														<span className="text-xs font-medium text-zinc-400">
															Processed
														</span>
													</>
												) : c.is_scheduled ? (
													<>
														<FaClock className="h-3.5 w-3.5 text-blue-400" />
														<span className="text-xs font-medium text-zinc-400">
															Scheduled
														</span>
													</>
												) : (
													<>
														<FaExclamationTriangle className="h-3.5 w-3.5 text-yellow-400" />
														<span className="text-xs font-medium text-zinc-400">
															Pending
														</span>
													</>
												)}
											</div>
										</td>
									</tr>
								))
							) : (
								<tr>
									<td colSpan={6} className="px-6 py-12 text-center">
										<p className="text-sm text-zinc-500">
											No plan changes found
										</p>
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Pagination */}
			{totalPages > 1 && (
				<div className="flex items-center justify-between rounded-xl border border-zinc-800/50 bg-zinc-900/30 px-6 py-4 backdrop-blur-md">
					<div className="text-sm text-zinc-400">
						Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
						{Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount}{" "}
						entries
					</div>
					<div className="flex items-center gap-2">
						<button
							onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
							disabled={currentPage === 1}
							className="flex items-center gap-1 rounded-lg bg-zinc-800/50 px-3 py-2 text-sm font-medium text-zinc-100 transition-all hover:bg-zinc-800/70 disabled:cursor-not-allowed disabled:opacity-40"
						>
							<ChevronLeft className="h-4 w-4" />
							Previous
						</button>
						<div className="flex items-center gap-1">
							{Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
								let pageNumber;
								if (totalPages <= 5) {
									pageNumber = index + 1;
								} else if (currentPage <= 3) {
									pageNumber = index + 1;
								} else if (currentPage >= totalPages - 2) {
									pageNumber = totalPages - 4 + index;
								} else {
									pageNumber = currentPage - 2 + index;
								}

								return (
									<button
										key={pageNumber}
										onClick={() => setCurrentPage(pageNumber)}
										className={`h-10 w-10 rounded-lg text-sm font-medium transition-all ${
											currentPage === pageNumber
												? "bg-zinc-800/50 text-zinc-100"
												: "bg-zinc-900/30 text-zinc-400 hover:bg-zinc-800/30"
										}`}
									>
										{pageNumber}
									</button>
								);
							})}
						</div>
						<button
							onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
							disabled={currentPage === totalPages}
							className="flex items-center gap-1 rounded-lg bg-zinc-800/50 px-3 py-2 text-sm font-medium text-zinc-100 transition-all hover:bg-zinc-800/70 disabled:cursor-not-allowed disabled:opacity-40"
						>
							Next
							<ChevronRight className="h-4 w-4" />
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default BillingHistory;
