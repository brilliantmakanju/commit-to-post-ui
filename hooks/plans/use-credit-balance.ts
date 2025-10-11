"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { deductCredits, fetchCreditBalance } from "@/server-actions/credits";
import type {
	BillingIntervalValue,
	CreditBalance,
	PlanChangeTypeValue,
	SubscriptionStatusValue,
} from "@/server-actions/types/credit-types";
import { canAffordSafely, parseCredits } from "@/utils/credit-utils";
import useUserStore from "@/zustand/useuser-store";

// ============================================================================
// TYPES
// ============================================================================

interface UseCreditBalanceOptions {
	/** Auto-refresh interval in milliseconds (default: 0 = no auto-refresh) */
	refetchInterval?: number;
	/** Whether to sync with Zustand store automatically */
	syncWithStore?: boolean;
	/** Whether to show toast notifications for credit changes */
	showNotifications?: boolean;
	/** Enable verbose logging for debugging */
	enableLogging?: boolean;
}

interface UseCreditBalanceReturn {
	// Balance data
	credits: number;
	lifetimeCredits: number;
	billingType: string;
	userPlan: string;
	lastUpdated: string | undefined;

	// Subscription information
	subscriptionStatus: string | undefined;
	hasActiveSubscription: boolean;
	isInGracePeriod: boolean;
	billingInterval: string | undefined;
	daysUntilRenewal: number | undefined;
	subscriptionStartDate: string | undefined;
	subscriptionEndDate: string | undefined;

	// Pending changes
	pendingPlanChange: string | undefined;
	pendingPlanEffectiveDate: string | undefined;
	pendingPlanChangeType: string | undefined;

	// Loading and error states
	isLoading: boolean;
	isRefetching: boolean;
	isDeducting: boolean;
	hasSynced: boolean;
	error: string | undefined;

	// Actions
	refetch: () => Promise<unknown>;
	forceRefresh: () => Promise<unknown>;
	deductCredits: (amount: number, description?: string) => Promise<unknown>;

	// Utility functions
	hasCredits: (amount?: number) => boolean;
	canAfford: (amount: number) => boolean;
	getBalance: () => number;

	// Quick actions (use store data)
	quick: {
		hasCredits: (amount?: number) => boolean;
		canAfford: (amount: number) => boolean;
		getBalance: () => number;
		optimisticDeduct: (amount: number) => void;
		optimisticAdd: (amount: number) => void;
	};

	// Raw mutation for advanced use cases
	deductMutation: ReturnType<typeof useMutation>;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CREDIT_BALANCE_QUERY_KEY = ["creditBalance"] as const;
const MINIMUM_CREDIT_THRESHOLD = 1;

// ============================================================================
// MAIN HOOK
// ============================================================================

export function useCreditBalance(
	options: UseCreditBalanceOptions = {},
): UseCreditBalanceReturn {
	const {
		refetchInterval = 0,
		syncWithStore = true,
		showNotifications = true,
		enableLogging = false,
	} = options;

	const { status } = useSession();
	const userStore = useUserStore();
	const queryClient = useQueryClient();

	// Refs to track previous values and prevent infinite loops
	const updateInProgressRef = useRef(false);
	const previousPlanRef = useRef<string | undefined>(undefined);
	const previousCreditsRef = useRef<number | undefined>(undefined);
	const logRef = useRef(enableLogging ? console.log : () => {});

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
		queryKey: CREDIT_BALANCE_QUERY_KEY,
		queryFn: fetchCreditBalance,
		enabled: status === "authenticated",
		refetchOnMount: true,
		refetchOnWindowFocus: true,
		staleTime: 30000, // 30 seconds
		gcTime: 5 * 60 * 1000, // 5 minutes
		retry: 2,
		retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000),
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
				previousCreditsRef.current === undefined ||
				Math.abs(previousCreditsRef.current - newCredits) >=
					MINIMUM_CREDIT_THRESHOLD
			) {
				previousCreditsRef.current = newCredits;
				needsUpdate = true;
				logRef.current?.(
					`Credits changed: ${previousCreditsRef.current} -> ${newCredits}`,
				);
			}

			// Check if plan changed
			if (previousPlanRef.current !== newPlan) {
				previousPlanRef.current = newPlan;
				needsUpdate = true;
				logRef.current?.(
					`Plan changed: ${previousPlanRef.current} -> ${newPlan}`,
				);
			}

			if (needsUpdate) {
				updateInProgressRef.current = true;

				// Batch updates to prevent multiple renders
				Promise.resolve().then(() => {
					try {
						if (
							Math.abs(userStore.credits_balance - newCredits) >=
							MINIMUM_CREDIT_THRESHOLD
						) {
							userStore.updateCredits(newCredits);
						}

						if (userStore.plan !== newPlan) {
							userStore.updatePlan(newPlan);
						}

						setHasSynced(true);
						logRef.current?.("Store sync completed");
					} finally {
						updateInProgressRef.current = false;
					}
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
	]);

	// Handle errors with useEffect
	useEffect(() => {
		if (error && showNotifications) {
			const errorMessage =
				error instanceof Error
					? error.message
					: "Failed to fetch credit balance";
			logRef.current?.(`Error fetching credit balance: ${errorMessage}`);
			toast.error(errorMessage);
		}
	}, [error, showNotifications]);

	// Mutation for deducting credits
	const deductCreditsMutation = useMutation({
		mutationFn: deductCredits,
		onSuccess: (data, variables) => {
			const newBalance = parseCredits(data.new_balance);

			logRef.current?.(
				`Deduction successful: ${variables.amount} credits, new balance: ${newBalance}`,
			);

			// Update query cache immediately
			queryClient.setQueryData(
				CREDIT_BALANCE_QUERY_KEY,
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
				try {
					userStore.updateCredits(newBalance);
					previousCreditsRef.current = newBalance;
				} finally {
					setTimeout(() => {
						updateInProgressRef.current = false;
					}, 100);
				}
			}

			// Show success notification
			if (showNotifications) {
				toast.success(
					`${data.credits_deducted} credits deducted. New balance: ${newBalance.toLocaleString()}`,
				);
			}

			// Refetch to ensure accuracy after a short delay
			setTimeout(() => refetchBalance(), 1000);
		},
		onError: (error: Error, variables) => {
			const errorMessage = error.message || "Failed to deduct credits";
			logRef.current?.(
				`Error deducting ${variables.amount} credits: ${errorMessage}`,
			);

			if (showNotifications) {
				toast.error(errorMessage);
			}
		},
	});

	// Helper function to safely parse credit amount
	const getCurrentCredits = useCallback((): number => {
		const apiCredits = creditData?.credits;
		const storeCredits = userStore.credits_balance;

		// Prioritize fresh API data over store data
		if (apiCredits !== undefined) {
			return parseCredits(apiCredits);
		}

		return parseCredits(storeCredits ?? 0);
	}, [creditData?.credits, userStore.credits_balance]);

	// Check if user has enough credits
	const hasCredits = useCallback(
		(amount: number = MINIMUM_CREDIT_THRESHOLD): boolean => {
			return canAffordSafely(getCurrentCredits(), amount);
		},
		[getCurrentCredits],
	);

	const canAfford = useCallback(
		(amount: number): boolean => {
			return hasCredits(amount);
		},
		[hasCredits],
	);

	const getBalance = useCallback((): number => {
		return getCurrentCredits();
	}, [getCurrentCredits]);

	// Quick actions without full API calls (uses store data)
	const quickActions = {
		hasCredits: (amount: number = MINIMUM_CREDIT_THRESHOLD) =>
			canAffordSafely(userStore.credits_balance, amount),
		canAfford: (amount: number) =>
			canAffordSafely(userStore.credits_balance, amount),
		getBalance: () => parseCredits(userStore.credits_balance),
		optimisticDeduct: (amount: number) => {
			if (syncWithStore && canAffordSafely(userStore.credits_balance, amount)) {
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
		async (amount: number, description: string = "Credit deduction") => {
			const currentBalance = getBalance();

			if (!canAffordSafely(currentBalance, amount)) {
				const error = new Error(
					`Insufficient credits. Required: ${amount.toLocaleString()}, Available: ${currentBalance.toLocaleString()}`,
				);
				logRef.current?.(error.message);
				throw error;
			}

			return deductCreditsMutation.mutateAsync({
				amount,
				description: description.trim(),
			});
		},
		[getBalance, deductCreditsMutation],
	);

	// Force refresh function
	const forceRefresh = useCallback(async () => {
		logRef.current?.("Force refreshing credit balance");
		await queryClient.invalidateQueries({
			queryKey: CREDIT_BALANCE_QUERY_KEY,
		});
		return refetchBalance();
	}, [queryClient, refetchBalance]);

	// Return the hook interface
	return {
		// Balance data
		credits: getBalance(),
		lifetimeCredits: parseCredits(creditData?.lifetime_credits_purchased ?? 0),
		billingType: creditData?.billing_type ?? "credits",
		userPlan: creditData?.user_plan ?? userStore.plan ?? "basic",
		lastUpdated: creditData?.last_updated,

		// Subscription information
		subscriptionStatus:
			creditData?.subscription_status as SubscriptionStatusValue,
		hasActiveSubscription: creditData?.has_active_subscription ?? false,
		isInGracePeriod: creditData?.is_in_grace_period ?? false,
		billingInterval: creditData?.billing_interval as BillingIntervalValue,
		daysUntilRenewal: creditData?.days_until_renewal as number | undefined,
		subscriptionStartDate: creditData?.subscription_start_date as
			| string
			| undefined,
		subscriptionEndDate: creditData?.subscription_end_date as
			| string
			| undefined,

		// Pending changes
		pendingPlanChange: creditData?.pending_plan_change as string | undefined,
		pendingPlanEffectiveDate: creditData?.pending_plan_effective_date as
			| string
			| undefined,
		pendingPlanChangeType:
			creditData?.pending_plan_change_type as PlanChangeTypeValue,

		// Loading states
		isLoading: isLoading || deductCreditsMutation.isPending,
		isRefetching,
		isDeducting: deductCreditsMutation.isPending,
		hasSynced,

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
		// deductMutation: deductCreditsMutation,
		deductMutation: "" as any,
	};
}

// ============================================================================
// SPECIALIZED HOOK FOR LIFETIME ACCESS
// ============================================================================

interface UseLifetimeAccessReturn {
	lifetimeAccess: boolean;
	isLoading: boolean;
	credits: number;
	userPlan: string;
}

export function useLifetimeAccess(): UseLifetimeAccessReturn {
	const { credits, userPlan, isLoading, hasSynced } = useCreditBalance({
		syncWithStore: true,
		showNotifications: false,
	});

	const { status } = useSession();
	const [lifetimeAccess, setLifetimeAccess] = useState(false);

	useEffect(() => {
		if (status === "authenticated" && (hasSynced || !isLoading)) {
			const isLimitedPlan = userPlan === "ltd";
			const hasCreditsAvailable = credits > 0;
			setLifetimeAccess(isLimitedPlan && hasCreditsAvailable);
		}
	}, [userPlan, credits, status, isLoading, hasSynced]);

	return {
		lifetimeAccess,
		isLoading: isLoading && !hasSynced,
		credits,
		userPlan,
	};
}

// ============================================================================
// HOOK FOR QUICK CREDIT CHECKS (NO API CALLS)
// ============================================================================

interface UseQuickCreditCheckReturn {
	credits: number;
	hasCredits: (amount?: number) => boolean;
	canAfford: (amount: number) => boolean;
	getBalance: () => number;
}

export function useQuickCreditCheck(): UseQuickCreditCheckReturn {
	const userStore = useUserStore();

	return {
		credits: parseCredits(userStore.credits_balance),
		hasCredits: (amount: number = MINIMUM_CREDIT_THRESHOLD) =>
			canAffordSafely(userStore.credits_balance, amount),
		canAfford: (amount: number) =>
			canAffordSafely(userStore.credits_balance, amount),
		getBalance: () => parseCredits(userStore.credits_balance),
	};
}
