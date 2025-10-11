"use server";

import { z } from "zod";

import { apiClient } from "@/lib/utils/api-client";

import {
	CreditBalance,
	creditBalanceSchema,
	DeductCreditsRequest,
	DeductCreditsResponse,
	deductCreditsResponseSchema,
	deductCreditsSchema,
} from "./types/credit-types";

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Custom error class for credit-related operations
 */
class CreditBalanceError extends Error {
	constructor(
		message: string,
		public readonly code: string,
		public readonly statusCode?: number,
	) {
		super(message);
		this.name = "CreditBalanceError";
		Object.setPrototypeOf(this, CreditBalanceError.prototype);
	}
}

/**
 * Parse error response and extract meaningful message and code
 */
function parseErrorResponse(error: unknown): {
	message: string;
	code: string;
} {
	if (error instanceof z.ZodError) {
		const details = error.errors
			.map(error_ => `${error_.path.join(".")}: ${error_.message}`)
			.join("; ");
		return {
			message: `Validation error: ${details}`,
			code: "VALIDATION_ERROR",
		};
	}

	if (error instanceof CreditBalanceError) {
		return {
			message: error.message,
			code: error.code,
		};
	}

	if (error instanceof Error) {
		return {
			message: error.message,
			code: "UNKNOWN_ERROR",
		};
	}

	return {
		message: "An unexpected error occurred",
		code: "UNKNOWN_ERROR",
	};
}

// ============================================================================
// RESPONSE NORMALIZATION
// ============================================================================

/**
 * Normalize API response data before validation
 * - Converts null values to undefined
 * - Lowercases string enum values
 * - Handles timezone-aware ISO datetime strings
 */
function normalizeApiResponse(data: unknown): unknown {
	if (!data || typeof data !== "object") {
		return data;
	}

	const object = data as Record<string, unknown>;

	return {
		credits: object.credits,
		lifetime_credits_purchased: object.lifetime_credits_purchased,
		billing_type: object.billing_type,
		payment_provider: object.payment_provider,
		// Normalize plan to lowercase
		user_plan:
			typeof object.user_plan === "string"
				? object.user_plan.toLowerCase()
				: object.user_plan,
		// Normalize subscription status to lowercase
		subscription_status:
			typeof object.subscription_status === "string"
				? object.subscription_status.toLowerCase()
				: object.subscription_status === undefined
					? undefined
					: undefined,
		has_active_subscription: object.has_active_subscription,
		is_in_grace_period: object.is_in_grace_period,
		// Convert null dates to undefined
		subscription_start_date:
			object.subscription_start_date === undefined
				? undefined
				: object.subscription_start_date || undefined,
		subscription_end_date:
			object.subscription_end_date === undefined
				? undefined
				: object.subscription_end_date || undefined,
		// Normalize billing interval to lowercase
		billing_interval:
			typeof object.billing_interval === "string"
				? object.billing_interval.toLowerCase()
				: object.billing_interval === undefined
					? undefined
					: undefined,
		// Convert null days to undefined
		days_until_renewal:
			object.days_until_renewal === undefined
				? undefined
				: object.days_until_renewal || undefined,
		// Convert null pending plan to undefined
		pending_plan_change:
			object.pending_plan_change === undefined
				? undefined
				: typeof object.pending_plan_change === "string"
					? object.pending_plan_change.toLowerCase()
					: object.pending_plan_change || undefined,
		// Convert null date to undefined
		pending_plan_effective_date:
			object.pending_plan_effective_date === undefined
				? undefined
				: object.pending_plan_effective_date || undefined,
		// Normalize plan change type to lowercase
		pending_plan_change_type:
			typeof object.pending_plan_change_type === "string"
				? object.pending_plan_change_type.toLowerCase()
				: object.pending_plan_change_type === undefined
					? undefined
					: undefined,
		// Ensure timestamps are valid ISO strings
		last_updated: object.last_updated,
		billing_updated_at: object.billing_updated_at,
	};
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Fetch current credit balance and comprehensive billing information for authenticated user
 * Returns all subscription, payment, and credit-related data in a single request
 *
 * Normalizes the response to convert nulls to undefined and lowercase enums
 *
 * @throws {CreditBalanceError} If the API request fails or response validation fails
 * @returns {Promise<CreditBalance>} Complete billing state from server
 */
export const fetchCreditBalance = async (): Promise<CreditBalance> => {
	try {
		const response = await apiClient.get(
			"/api/v1/managements/credits/balance/",
		);

		if (response.status !== 200) {
			throw new CreditBalanceError(
				"Failed to retrieve credit balance. Please try again.",
				"FETCH_FAILED",
				response.status,
			);
		}

		// Normalize response data before validation
		const normalizedData = normalizeApiResponse(response.data);

		// Validate normalized response against schema to ensure type safety
		const validatedData = creditBalanceSchema.parse(normalizedData);

		return validatedData;
	} catch (error) {
		const { message, code } = parseErrorResponse(error);

		if (error instanceof CreditBalanceError) {
			throw error;
		}

		throw new CreditBalanceError(
			message,
			code,
			error instanceof CreditBalanceError ? error.statusCode : undefined,
		);
	}
};

/**
 * Deduct credits from user's account for a transaction
 * This is used when a user spends credits on a feature or service
 *
 * @param {DeductCreditsRequest} data - Amount and optional description
 * @throws {CreditBalanceError} If validation fails or deduction cannot be processed
 * @returns {Promise<DeductCreditsResponse>} Confirmation with new balance and details
 */
export const deductCredits = async (
	data: DeductCreditsRequest,
): Promise<DeductCreditsResponse> => {
	try {
		// Validate incoming request data
		const validatedRequest = deductCreditsSchema.parse(data);

		const response = await apiClient.post(
			"/api/v1/managements/credits/deduct/",
			validatedRequest,
		);

		if (response.status !== 200) {
			// Handle specific error cases
			if (response.status === 402) {
				throw new CreditBalanceError(
					response.data?.error || "Insufficient credits for this transaction",
					"INSUFFICIENT_CREDITS",
					402,
				);
			}

			if (response.status === 400) {
				throw new CreditBalanceError(
					response.data?.error || "Invalid deduction request",
					"INVALID_REQUEST",
					400,
				);
			}

			throw new CreditBalanceError(
				"Failed to process credit deduction",
				"DEDUCTION_FAILED",
				response.status,
			);
		}

		// Validate response structure
		const validatedResponse = deductCreditsResponseSchema.parse(response.data);

		return validatedResponse;
	} catch (error) {
		const { message, code } = parseErrorResponse(error);

		if (error instanceof CreditBalanceError) {
			throw error;
		}

		throw new CreditBalanceError(
			message,
			code,
			error instanceof CreditBalanceError ? error.statusCode : undefined,
		);
	}
};

/**
 * Add credits to user's account (admin/system operation)
 * Typically used for bonuses, refunds, or promotional credits
 *
 * @param {number} amount - Number of credits to add (must be positive)
 * @param {string} reason - Description of why credits are being added
 * @throws {CreditBalanceError} If the operation fails or inputs are invalid
 * @returns {Promise<DeductCreditsResponse>} Confirmation with new balance
 */
export const addCreditsToAccount = async (
	amount: number,
	reason: string = "Account credit",
): Promise<DeductCreditsResponse> => {
	try {
		// Validate inputs
		if (!Number.isFinite(amount) || amount <= 0) {
			throw new CreditBalanceError(
				"Amount must be a positive number",
				"INVALID_AMOUNT",
				400,
			);
		}

		const trimmedReason = reason.trim();
		if (trimmedReason.length === 0) {
			throw new CreditBalanceError(
				"Reason is required for adding credits",
				"MISSING_REASON",
				400,
			);
		}

		const response = await apiClient.post("/api/v1/managements/credits/add/", {
			amount,
			reason: trimmedReason,
		});

		if (response.status !== 200) {
			throw new CreditBalanceError(
				"Failed to add credits to account",
				"ADD_CREDITS_FAILED",
				response.status,
			);
		}

		// Validate response structure
		const validatedResponse = deductCreditsResponseSchema.parse(response.data);

		return validatedResponse;
	} catch (error) {
		const { message, code } = parseErrorResponse(error);

		if (error instanceof CreditBalanceError) {
			throw error;
		}

		throw new CreditBalanceError(
			message,
			code,
			error instanceof CreditBalanceError ? error.statusCode : undefined,
		);
	}
};

/**
 * Refresh billing information from server
 * Force-fetches current state without using cache
 * Use this when you explicitly need fresh data
 *
 * @throws {CreditBalanceError} If the refresh fails
 * @returns {Promise<CreditBalance>} Fresh billing state from server
 */
export const refreshBillingState = async (): Promise<CreditBalance> => {
	return fetchCreditBalance();
};

/**
 * Check billing status without loading full credit balance
 * Lighter endpoint for checking subscription status
 *
 * @throws {CreditBalanceError} If the request fails
 * @returns {Promise<Pick<CreditBalance, 'subscription_status' | 'has_active_subscription' | 'is_in_grace_period'>>}
 */
export const checkBillingStatus = async (): Promise<
	Pick<
		CreditBalance,
		"subscription_status" | "has_active_subscription" | "is_in_grace_period"
	>
> => {
	try {
		const response = await apiClient.get(
			"/api/v1/managements/credits/billing-status/",
		);

		if (response.status !== 200) {
			throw new CreditBalanceError(
				"Failed to check billing status",
				"STATUS_CHECK_FAILED",
				response.status,
			);
		}

		// Normalize response before validation
		const normalizedData = {
			subscription_status:
				typeof response.data.subscription_status === "string"
					? response.data.subscription_status.toLowerCase()
					: response.data.subscription_status === undefined
						? undefined
						: undefined,
			has_active_subscription: response.data.has_active_subscription,
			is_in_grace_period: response.data.is_in_grace_period,
		};

		const billingStatusSchema = z.object({
			subscription_status: z
				.enum([
					"active",
					"past_due",
					"canceled",
					"paused",
					"payment_failed",
					"inactive",
				])
				.optional(),
			has_active_subscription: z.boolean(),
			is_in_grace_period: z.boolean(),
		});

		const validatedResponse = billingStatusSchema.parse(normalizedData);

		return validatedResponse;
	} catch (error) {
		const { message, code } = parseErrorResponse(error);

		if (error instanceof CreditBalanceError) {
			throw error;
		}

		throw new CreditBalanceError(
			message,
			code,
			error instanceof CreditBalanceError ? error.statusCode : undefined,
		);
	}
};
