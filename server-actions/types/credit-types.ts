import { z } from "zod";

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

export const BILLING_TYPES = {
	SUBSCRIPTION: "subscription",
	PAY_PER_USE: "pay_per_use",
	CREDITS: "credits",
	HYBRID: "hybrid",
} as const;

export const SUBSCRIPTION_STATUSES = {
	ACTIVE: "active",
	CANCELED: "canceled",
	PAUSED: "paused",
	PAYMENT_FAILED: "payment_failed",
	PAST_DUE: "past_due",
	INACTIVE: "inactive",
} as const;

export const BILLING_INTERVALS = {
	ONE_TIME: "one_time",
	MONTHLY: "monthly",
	ANNUAL: "annual",
	LIFETIME: "lifetime",
} as const;

export const PAYMENT_PROVIDERS = {
	PADDLE: "paddle",
} as const;

export const PLAN_CHANGE_TYPES = {
	UPGRADE: "upgrade",
	DOWNGRADE: "downgrade",
	INTERVAL_CHANGE: "interval_change",
	BILLING_TYPE_CHANGE: "billing_type_change",
} as const;

export type BillingTypeValue =
	(typeof BILLING_TYPES)[keyof typeof BILLING_TYPES];
export type SubscriptionStatusValue =
	(typeof SUBSCRIPTION_STATUSES)[keyof typeof SUBSCRIPTION_STATUSES];
export type BillingIntervalValue =
	(typeof BILLING_INTERVALS)[keyof typeof BILLING_INTERVALS];
export type PaymentProviderValue =
	(typeof PAYMENT_PROVIDERS)[keyof typeof PAYMENT_PROVIDERS];
export type PlanChangeTypeValue =
	(typeof PLAN_CHANGE_TYPES)[keyof typeof PLAN_CHANGE_TYPES];

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const positiveNumber = z.number().min(0, "Must be non-negative");

/**
 * ISO datetime string - allows timezone offsets like +00:00
 * Transforms to lowercase if needed
 */
const isoDateTimeString = z
	.string()
	.refine(
		value =>
			// ISO 8601 regex that handles timezone offsets
			/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}([+-]\d{2}:\d{2}|Z)?$/.test(value),
		"Invalid ISO datetime format",
	)
	.optional();

/**
 * Plan validation - basic, pro, studio, or ltd (case-insensitive, normalized to lowercase)
 */
const planString = z
	.string()
	.transform(value => value.toLowerCase())
	.refine(
		value => ["basic", "pro", "studio", "ltd"].includes(value),
		"Invalid plan",
	);

/**
 * Subscription status - optional (no explicit null)
 */
const subscriptionStatusOrUndefined = z
	.enum([
		SUBSCRIPTION_STATUSES.ACTIVE,
		SUBSCRIPTION_STATUSES.CANCELED,
		SUBSCRIPTION_STATUSES.PAUSED,
		SUBSCRIPTION_STATUSES.PAYMENT_FAILED,
		SUBSCRIPTION_STATUSES.PAST_DUE,
		SUBSCRIPTION_STATUSES.INACTIVE,
	])
	.optional();

/**
 * Billing interval - optional (no explicit null)
 */
const billingIntervalOrUndefined = z
	.enum([
		BILLING_INTERVALS.ONE_TIME,
		BILLING_INTERVALS.MONTHLY,
		BILLING_INTERVALS.ANNUAL,
		BILLING_INTERVALS.LIFETIME,
	])
	.optional();

/**
 * Plan change type - optional (no explicit null)
 */
const planChangeTypeOrUndefined = z
	.enum([
		PLAN_CHANGE_TYPES.UPGRADE,
		PLAN_CHANGE_TYPES.DOWNGRADE,
		PLAN_CHANGE_TYPES.INTERVAL_CHANGE,
		PLAN_CHANGE_TYPES.BILLING_TYPE_CHANGE,
	])
	.optional();

/**
 * Days until renewal - non-negative integer or undefined
 */
const daysUntilRenewalOrUndefined = z.number().int().min(0).optional();

/**
 * Coerce nullish values to undefined for ESLint compliance
 */
const coerceUndefined = <T extends z.ZodTypeAny>(schema: T): z.ZodType => {
	return schema
		.nullable()
		.transform(value => (value === undefined ? undefined : value));
};

/**
 * Validate ISO datetime strings with proper precision and timezone
 * Supports: `2025-10-10T23:54:17Z`, `2025-10-10T23:54:17.908896+00:00`
 */
const isoDateTimeStrict = z
	.string()
	.refine(
		value =>
			/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(
				value,
			),
		"Invalid ISO 8601 datetime format",
	);

/**
 * Main credit balance schema - handles nullable fields by coercing to undefined
 */
export const creditBalanceSchema = z
	.object({
		// Credit/Balance Information
		credits: positiveNumber,
		lifetime_credits_purchased: positiveNumber,

		// Billing Configuration
		billing_type: z.enum([
			BILLING_TYPES.SUBSCRIPTION,
			BILLING_TYPES.PAY_PER_USE,
			BILLING_TYPES.CREDITS,
			BILLING_TYPES.HYBRID,
		]),
		payment_provider: z.enum([PAYMENT_PROVIDERS.PADDLE]),
		user_plan: planString,

		// Subscription Status
		subscription_status: subscriptionStatusOrUndefined,
		has_active_subscription: z.boolean(),
		is_in_grace_period: z.boolean(),

		// Subscription Dates - coerce null to undefined
		subscription_start_date: isoDateTimeStrict.optional(),
		subscription_end_date: isoDateTimeStrict.optional(),
		billing_interval: billingIntervalOrUndefined,
		days_until_renewal: daysUntilRenewalOrUndefined,

		// Pending Changes - all optional
		pending_plan_change: planString.optional(),
		pending_plan_effective_date: isoDateTimeStrict.optional(),
		pending_plan_change_type: planChangeTypeOrUndefined,

		// Timestamps - strict ISO validation
		last_updated: isoDateTimeStrict,
		billing_updated_at: isoDateTimeStrict,
	})
	.transform(data => ({
		...data,
		// Coerce null-like values to undefined for ESLint and runtime consistency
		subscription_start_date: data.subscription_start_date || undefined,
		subscription_end_date: data.subscription_end_date || undefined,
		pending_plan_change: data.pending_plan_change || undefined,
		pending_plan_effective_date: data.pending_plan_effective_date || undefined,
		days_until_renewal: data.days_until_renewal || undefined,
	}));

export const deductCreditsSchema = z.object({
	amount: z.number().positive("Amount must be greater than 0"),
	description: z.string().optional(),
});

export const deductCreditsResponseSchema = z.object({
	success: z.boolean(),
	new_balance: positiveNumber,
	description: z.string(),
	credits_deducted: positiveNumber,
});

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type CreditBalance = z.infer<typeof creditBalanceSchema>;
export type DeductCreditsRequest = z.infer<typeof deductCreditsSchema>;
export type DeductCreditsResponse = z.infer<typeof deductCreditsResponseSchema>;

/**
 * Parsed billing state for internal use
 */
export interface ParsedBillingState {
	creditsBalance: number;
	lifetimeCredits: number;
	billingType: BillingTypeValue;
	paymentProvider: PaymentProviderValue;
	userPlan: string;
	subscriptionStatus: SubscriptionStatusValue | undefined;
	hasActiveSubscription: boolean;
	isInGracePeriod: boolean;
	subscriptionStartDate: Date | undefined;
	subscriptionEndDate: Date | undefined;
	billingInterval: BillingIntervalValue | undefined;
	daysUntilRenewal: number | undefined;
	pendingPlanChange: string | undefined;
	pendingPlanEffectiveDate: Date | undefined;
	pendingPlanChangeType: PlanChangeTypeValue | undefined;
	lastUpdated: Date;
	billingUpdatedAt: Date;
}

/**
 * Public API type for hooks (matches Zustand store structure for backward compatibility)
 * Uses only undefined, never null, for ESLint compliance
 */
export interface PublicBillingInfo {
	credits: number;
	lifetime_credits_purchased: number;
	billing_type: BillingTypeValue;
	payment_provider: PaymentProviderValue;
	user_plan: string;
	subscription_status: SubscriptionStatusValue | undefined;
	has_active_subscription: boolean;
	is_in_grace_period: boolean;
	subscription_start_date: string | undefined;
	subscription_end_date: string | undefined;
	billing_interval: BillingIntervalValue | undefined;
	days_until_renewal: number | undefined;
	pending_plan_change: string | undefined;
	pending_plan_effective_date: string | undefined;
	pending_plan_change_type: PlanChangeTypeValue | undefined;
	last_updated: string;
	billing_updated_at: string;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isBillingType(value: unknown): value is BillingTypeValue {
	return Object.values(BILLING_TYPES).includes(value as BillingTypeValue);
}

export function isSubscriptionStatus(
	value: unknown,
): value is SubscriptionStatusValue {
	return Object.values(SUBSCRIPTION_STATUSES).includes(
		value as SubscriptionStatusValue,
	);
}

export function isBillingInterval(
	value: unknown,
): value is BillingIntervalValue {
	return Object.values(BILLING_INTERVALS).includes(
		value as BillingIntervalValue,
	);
}

export function isValidPlan(
	value: unknown,
): value is "basic" | "pro" | "studio" | "ltd" {
	return ["basic", "pro", "studio", "ltd"].includes(value as string);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Parse ISO date string safely
 * Returns undefined for nullish or invalid dates
 */
export function parseIsoDate(dateString: string | undefined): Date | undefined {
	if (!dateString) return undefined;
	try {
		const date = new Date(dateString);
		if (Number.isNaN(date.getTime())) return undefined;
		return date;
	} catch {
		return undefined;
	}
}

/**
 * Convert API response to parsed billing state
 */
export function parseBillingResponse(data: CreditBalance): ParsedBillingState {
	return {
		creditsBalance: data.credits,
		lifetimeCredits: data.lifetime_credits_purchased,
		billingType: data.billing_type,
		paymentProvider: data.payment_provider,
		userPlan: data.user_plan,
		subscriptionStatus: data.subscription_status,
		hasActiveSubscription: data.has_active_subscription,
		isInGracePeriod: data.is_in_grace_period,
		subscriptionStartDate: parseIsoDate(data.subscription_start_date),
		subscriptionEndDate: parseIsoDate(data.subscription_end_date),
		billingInterval: data.billing_interval,
		daysUntilRenewal: data.days_until_renewal,
		pendingPlanChange: data.pending_plan_change,
		pendingPlanEffectiveDate: parseIsoDate(data.pending_plan_effective_date),
		pendingPlanChangeType: data.pending_plan_change_type,
		lastUpdated: new Date(data.last_updated),
		billingUpdatedAt: new Date(data.billing_updated_at),
	};
}

/**
 * Convert CreditBalance to PublicBillingInfo (backward compatible format)
 * Uses undefined instead of null for ESLint compliance
 */
export function toPublicBillingInfo(data: CreditBalance): PublicBillingInfo {
	return {
		credits: data.credits,
		lifetime_credits_purchased: data.lifetime_credits_purchased,
		billing_type: data.billing_type,
		payment_provider: data.payment_provider,
		user_plan: data.user_plan,
		subscription_status: data.subscription_status,
		has_active_subscription: data.has_active_subscription,
		is_in_grace_period: data.is_in_grace_period,
		subscription_start_date: data.subscription_start_date,
		subscription_end_date: data.subscription_end_date,
		billing_interval: data.billing_interval,
		days_until_renewal: data.days_until_renewal,
		pending_plan_change: data.pending_plan_change,
		pending_plan_effective_date: data.pending_plan_effective_date,
		pending_plan_change_type: data.pending_plan_change_type,
		last_updated: data.last_updated,
		billing_updated_at: data.billing_updated_at,
	};
}
