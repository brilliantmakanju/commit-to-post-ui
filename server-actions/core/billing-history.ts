"use server";
import { z } from "zod";

import { apiClient } from "@/lib/utils/api-client";

// Schema for billing summary
const billingSummarySchema = z.object({
	user_id: z.string(),
	current_plan: z.string(),
	billing_type: z.string(),
	subscription_status: z.string().nullable(),
	is_active_subscription: z.boolean(),
	is_in_grace_period: z.boolean(),
	billing_interval: z.string().nullable(),
	current_price_id: z.string().nullable(),
	credits_balance: z.number(),
	lifetime_credits_purchased: z.number(),
	credit_usage_30_days: z.number(),
	subscription_start_date: z.string().nullable(),
	subscription_end_date: z.string().nullable(),
	upcoming_renewal: z.string().nullable(),
	payment_grace_period_end: z.string().nullable(),
	pending_plan_change: z
		.object({
			new_plan: z.string(),
			effective_date: z.string().nullable(),
			change_type: z.string(),
		})
		.nullable(),
	paddle_customer_id: z.string().nullable(),
	paddle_subscription_id: z.string().nullable(),
});

// Schema for credit transaction
const creditTransactionSchema = z.object({
	id: z.number(),
	description: z.string(),
	amount: z.number(),
	balance_after: z.number(),
	transaction_type: z.string(),
	transaction_type_display: z.string(),
	user_email: z.string(),
	paddle_transaction_id: z.string().nullable(),
	related_subscription_id: z.string().nullable(),
	created_at: z.string(),
});

// Schema for credit history response
const creditHistoryResponseSchema = z.object({
	total_count: z.number(),
	limit: z.number(),
	offset: z.number(),
	transactions: z.array(creditTransactionSchema),
});

// Schema for usage record
const usageRecordSchema = z.object({
	id: z.number(),
	quantity: z.number(),
	usage_type: z.string(),
	usage_type_display: z.string(),
	unit_cost: z.number().nullable(),
	total_cost: z.number().nullable(),
	billed: z.boolean(),
	billing_period: z.string(),
	metadata: z.record(z.any()),
	created_at: z.string(),
});

// Schema for usage history response
const usageHistoryResponseSchema = z.object({
	total_count: z.number(),
	total_usage: z.number(),
	total_cost: z.number(),
	limit: z.number(),
	offset: z.number(),
	records: z.array(usageRecordSchema),
});

// Schema for plan change
const planChangeSchema = z.object({
	id: z.number(),
	old_plan: z.string(),
	new_plan: z.string(),
	old_price_id: z.string().nullable(),
	new_price_id: z.string().nullable(),
	change_type: z.string(),
	change_type_display: z.string(),
	old_price: z.number().nullable(),
	new_price: z.number().nullable(),
	scheduled_date: z.string(),
	effective_date: z.string(),
	is_scheduled: z.boolean(),
	is_processed: z.boolean(),
	reason: z.string(),
	metadata: z.record(z.any()),
	created_at: z.string(),
});

// Schema for plan changes response
const planChangesResponseSchema = z.object({
	total_count: z.number(),
	limit: z.number(),
	offset: z.number(),
	changes: z.array(planChangeSchema),
});

// Fetch billing summary
export const fetchBillingSummary = async () => {
	try {
		const response = await apiClient.get(
			"/api/v1/managements/billing/summary/",
		);
		console.log(response, "Response");

		if (response.status !== 200) {
			throw new Error(
				`Failed to fetch billing summary (status ${response.status}).`,
			);
		}

		const data = billingSummarySchema.parse(response.data);
		return { success: true, data };
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errorMessages = error.errors.map(error_ => ({
				field: error_.path.join("."),
				message: error_.message,
			}));
			throw new Error(`Validation failed: ${JSON.stringify(errorMessages)}`);
		}
		if (error instanceof Error) {
			throw new TypeError(`Failed to fetch billing summary: ${error.message}`);
		}
		throw new Error("Unexpected error while fetching billing summary");
	}
};

// Fetch credit history with pagination
export const fetchCreditHistory = async ({
	limit = 50,
	offset = 0,
	type,
}: {
	limit?: number;
	offset?: number;
	type?: string;
} = {}) => {
	try {
		const queryParams = new URLSearchParams({
			limit: limit.toString(),
			offset: offset.toString(),
		});

		if (type) {
			queryParams.append("type", type);
		}

		const response = await apiClient.get(
			`/api/v1/managements/billing/credit_history/?${queryParams.toString()}`,
		);

		if (response.status !== 200) {
			throw new Error(
				`Failed to fetch credit history (status ${response.status}).`,
			);
		}

		const data = creditHistoryResponseSchema.parse(response.data);
		return { success: true, data };
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errorMessages = error.errors.map(error_ => ({
				field: error_.path.join("."),
				message: error_.message,
			}));
			throw new Error(`Validation failed: ${JSON.stringify(errorMessages)}`);
		}
		if (error instanceof Error) {
			throw new TypeError(`Failed to fetch credit history: ${error.message}`);
		}
		throw new Error("Unexpected error while fetching credit history");
	}
};

// Fetch usage history with pagination
export const fetchUsageHistory = async ({
	limit = 50,
	offset = 0,
	usage_type,
	billing_period,
	billed_only = false,
}: {
	limit?: number;
	offset?: number;
	usage_type?: string;
	billing_period?: string;
	billed_only?: boolean;
} = {}) => {
	try {
		const queryParams = new URLSearchParams({
			limit: limit.toString(),
			offset: offset.toString(),
		});

		if (usage_type) queryParams.append("usage_type", usage_type);
		if (billing_period) queryParams.append("billing_period", billing_period);
		if (billed_only) queryParams.append("billed_only", "true");

		const response = await apiClient.get(
			`/api/v1/managements/billing/usage_history/?${queryParams.toString()}`,
		);

		if (response.status !== 200) {
			throw new Error(
				`Failed to fetch usage history (status ${response.status}).`,
			);
		}

		const data = usageHistoryResponseSchema.parse(response.data);
		return { success: true, data };
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errorMessages = error.errors.map(error_ => ({
				field: error_.path.join("."),
				message: error_.message,
			}));
			throw new Error(`Validation failed: ${JSON.stringify(errorMessages)}`);
		}
		if (error instanceof Error) {
			throw new TypeError(`Failed to fetch usage history: ${error.message}`);
		}
		throw new Error("Unexpected error while fetching usage history");
	}
};

// Fetch plan changes with pagination
export const fetchPlanChanges = async ({
	limit = 50,
	offset = 0,
}: {
	limit?: number;
	offset?: number;
} = {}) => {
	try {
		const queryParams = new URLSearchParams({
			limit: limit.toString(),
			offset: offset.toString(),
		});

		const response = await apiClient.get(
			`/api/v1/managements/billing/plan_changes/?${queryParams.toString()}`,
		);

		if (response.status !== 200) {
			throw new Error(
				`Failed to fetch plan changes (status ${response.status}).`,
			);
		}

		const data = planChangesResponseSchema.parse(response.data);
		return { success: true, data };
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errorMessages = error.errors.map(error_ => ({
				field: error_.path.join("."),
				message: error_.message,
			}));
			throw new Error(`Validation failed: ${JSON.stringify(errorMessages)}`);
		}
		if (error instanceof Error) {
			throw new TypeError(`Failed to fetch plan changes: ${error.message}`);
		}
		throw new Error("Unexpected error while fetching plan changes");
	}
};
