import { z } from "zod";

// Validation schemas
export const creditBalanceSchema = z.object({
	credits: z.number(),
	user_plan: z.string(),
	last_updated: z.string(),
	billing_type: z.string(),
	payment_provider: z.string(),
	lifetime_credits_purchased: z.number(),
});

export const deductCreditsSchema = z.object({
	amount: z.number().positive(),
	description: z.string().optional(),
});

export const deductCreditsResponseSchema = z.object({
	success: z.boolean(),
	new_balance: z.number(),
	description: z.string(),
	credits_deducted: z.number(),
});

// Types
export type CreditBalance = z.infer<typeof creditBalanceSchema>;
export type DeductCreditsRequest = z.infer<typeof deductCreditsSchema>;
export type DeductCreditsResponse = z.infer<typeof deductCreditsResponseSchema>;
