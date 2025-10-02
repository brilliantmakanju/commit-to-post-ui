"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// eslint-disable-next-line import/no-unresolved
import { deductCredits, fetchCreditBalance } from "@/server-actions/credits";
// eslint-disable-next-line import/no-unresolved
import { type CreditBalance } from "@/server-actions/types/credit-types";
// eslint-disable-next-line import/no-unresolved
import { canAffordSafely, parseCredits } from "@/utils/credit-utils";
// eslint-disable-next-line import/no-unresolved
import useUserStore from "@/zustand/useuser-store";

interface UseCreditBalanceOptions {
	// Auto-refresh interval in milliseconds (default: 5 minutes)
	refetchInterval?: number;
	// Whether to sync with Zustand store automatically
	syncWithStore?: boolean;
	// Whether to show toast notifications for credit changes
	showNotifications?: boolean;
}

export function useCreditBalance(options: UseCreditBalanceOptions = {}) {
	const {
		refetchInterval = 0,
		syncWithStore = true,
		showNotifications = true,
	} = options;

	const { status } = useSession();
	const userStore = useUserStore();
	const queryClient = useQueryClient();

	// Refs to track previous values and prevent infinite loops
	const updateInProgressRef = useRef(false);
	const previousPlanRef = useRef<string | null>(null);
	const previousCreditsRef = useRef<number | null>(null);

	// Local state to track if we've synced
	const [hasSynced, setHasSynced] = useState(false);

	// Query to fetch credit balance
	const {
		error,
		isLoading,
		isRefetching,
		data: creditData,
		refetch: refetchBalance,
	} = useQuery({
		queryKey: ["creditBalance"],
		queryFn: fetchCreditBalance,
		enabled: true,
		refetchOnMount: true,
		refetchOnWindowFocus: true,
		// retry: 3,
		// retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
	});

	// Safe sync with store - only update if values have actually changed
	useEffect(() => {
		if (
			creditData &&
			syncWithStore &&
			!updateInProgressRef.current &&
			status === "authenticated"
		) {
			const newCredits = parseCredits(creditData.credits);
			const newPlan = creditData.user_plan || "basic";

			let needsUpdate = false;

			// Check if credits changed significantly (avoid floating point issues)
			if (
				previousCreditsRef.current === null ||
				Math.abs(previousCreditsRef.current - newCredits) >= 1
			) {
				previousCreditsRef.current = newCredits;
				needsUpdate = true;
			}

			// Check if plan changed
			if (previousPlanRef.current !== newPlan) {
				previousPlanRef.current = newPlan;
				needsUpdate = true;
			}

			if (needsUpdate) {
				updateInProgressRef.current = true;

				// Batch updates to prevent multiple renders
				Promise.resolve().then(() => {
					if (Math.abs(userStore.credits - newCredits) >= 1) {
						userStore.updateCredits(newCredits);
					}
					if (userStore.plan !== newPlan) {
						userStore.updatePlan(newPlan);
					}

					setHasSynced(true);
					updateInProgressRef.current = false;
				});
			}
		}
	}, [
		creditData?.credits,
		creditData?.user_plan,
		syncWithStore,
		status,
		creditData,
		userStore,
	]); // Removed userStore from dependencies

	// Handle errors with useEffect
	useEffect(() => {
		if (error && showNotifications) {
			console.error("Error fetching credit balance:", error);
			toast.error("Failed to fetch credit balance");
		}
	}, [error, error?.message, showNotifications]); // More specific dependency

	// Mutation for deducting credits
	const deductCreditsMutation = useMutation({
		mutationFn: deductCredits,
		onSuccess: (data, variables) => {
			const newBalance = parseCredits(data.new_balance);

			// Update query cache immediately
			queryClient.setQueryData(
				["creditBalance"],
				(old: CreditBalance | undefined) => {
					if (!old) return old;
					return {
						...old,
						credits: newBalance,
					};
				},
			);

			// Sync with Zustand store
			if (syncWithStore) {
				updateInProgressRef.current = true;
				userStore.updateCredits(newBalance);
				previousCreditsRef.current = newBalance;
				setTimeout(() => {
					updateInProgressRef.current = false;
				}, 100);
			}

			// Show success notification
			if (showNotifications) {
				toast.success(
					`${data.credits_deducted} credits deducted. New balance: ${newBalance.toLocaleString()}`,
				);
			}

			// Refetch to ensure accuracy
			setTimeout(() => refetchBalance(), 1000);
		},
		onError: (error: Error, variables) => {
			console.error("Error deducting credits:", error);
			if (showNotifications) {
				toast.error(error.message || "Failed to deduct credits");
			}
		},
	});

	// Helper functions with safety checks
	const hasCredits = useCallback(
		(amount: number = 1): boolean => {
			const currentCredits = creditData?.credits ?? userStore.credits ?? 0;
			return canAffordSafely(currentCredits, amount);
		},
		[creditData?.credits, userStore.credits],
	);

	const canAfford = useCallback(
		(amount: number): boolean => {
			return hasCredits(amount);
		},
		[hasCredits],
	);

	const getBalance = useCallback((): number => {
		// Prioritize fresh API data over store data
		const balance = creditData?.credits ?? userStore.credits ?? 0;
		return parseCredits(balance);
	}, [creditData?.credits, userStore.credits]);

	// Quick actions without full API calls (uses store data)
	const quickActions = {
		hasCredits: (amount: number = 1) =>
			canAffordSafely(userStore.credits, amount),
		canAfford: (amount: number) => canAffordSafely(userStore.credits, amount),
		getBalance: () => parseCredits(userStore.credits),
		// Optimistic updates for immediate UI feedback
		optimisticDeduct: (amount: number) => {
			if (syncWithStore && canAffordSafely(userStore.credits, amount)) {
				userStore.deductCredits(amount);
			}
		},
		optimisticAdd: (amount: number) => {
			if (syncWithStore) {
				userStore.addCredits(amount);
			}
		},
	};

	// Main deduct function with validation
	const deductCreditsWithValidation = useCallback(
		async (amount: number, description?: string) => {
			const currentBalance = getBalance();

			if (!canAffordSafely(currentBalance, amount)) {
				throw new Error(
					`Insufficient credits. Required: ${amount.toLocaleString()}, Available: ${currentBalance.toLocaleString()}`,
				);
			}

			return deductCreditsMutation.mutateAsync({
				amount,
				description: description || "Credit deduction",
			});
		},
		[getBalance, deductCreditsMutation],
	);

	// Force refresh function
	const forceRefresh = useCallback(async () => {
		await queryClient.invalidateQueries({ queryKey: ["creditBalance"] });
		return refetchBalance();
	}, [queryClient, refetchBalance]);

	// Return the hook interface
	return {
		// Balance data
		credits: getBalance(),
		lifetimeCredits: parseCredits(creditData?.lifetime_credits_purchased ?? 0),
		billingType: creditData?.billing_type ?? "credits",
		userPlan: creditData?.user_plan ?? userStore.plan ?? "basic",
		lastUpdated: creditData?.last_updated ?? undefined,

		// Loading states
		isLoading: isLoading || deductCreditsMutation.isPending,
		isRefetching,
		isDeducting: deductCreditsMutation.isPending,
		hasSynced, // New: indicates if initial sync completed

		// Error state
		error: error?.message ?? deductCreditsMutation.error?.message ?? undefined,

		// Actions
		refetch: refetchBalance,
		forceRefresh,
		deductCredits: deductCreditsWithValidation,

		// Utility functions
		hasCredits,
		canAfford,
		getBalance,

		// Quick actions for immediate UI feedback
		quick: quickActions,

		// Raw mutation for advanced use cases
		deductMutation: deductCreditsMutation,
	};
}

// Specialized hook for lifetime access checking
export function useLifetimeAccess() {
	const { credits, userPlan, isLoading, hasSynced } = useCreditBalance({
		syncWithStore: true,
		showNotifications: false,
	});
	const { status } = useSession();

	const [lifetimeAccess, setLifetimeAccess] = useState(false);

	useEffect(() => {
		if (status === "authenticated" && (!isLoading || hasSynced)) {
			const isLtdPlan = userPlan === "ltd";
			const hasCreditsAvailable = credits > 0;
			setLifetimeAccess(isLtdPlan && hasCreditsAvailable);
		}
	}, [userPlan, credits, status, isLoading, hasSynced]);

	return {
		lifetimeAccess,
		isLoading: isLoading && !hasSynced,
		credits,
		userPlan,
	};
}

// Hook for quick credit checks without API calls
export function useQuickCreditCheck() {
	const userStore = useUserStore();

	return {
		credits: parseCredits(userStore.credits),
		hasCredits: (amount: number = 1) =>
			canAffordSafely(userStore.credits, amount),
		canAfford: (amount: number) => canAffordSafely(userStore.credits, amount),
		getBalance: () => parseCredits(userStore.credits),
	};
}
