"use server";
import { z } from "zod";

// eslint-disable-next-line import/no-unresolved
import { apiClient } from "@/lib/utils/api-client";

// Define a schema for the billing history query parameters.
const fetchBillingHistorySchema = z.object({
	offset: z.number().int().nonnegative().default(0),
	limit: z.number().int().positive().max(100).default(10),
	page: z.number().int().positive().optional(),
	status: z.enum(["all", "paid", "failed", "pending"]).default("all"),
});

// Types
export type BillingHistoryParams = z.infer<typeof fetchBillingHistorySchema>;

// API call - Updated to match the expected URL format
export const fetchBillingHistory = async ({
	status = "all",
	offset = 0,
	limit = 10,
	page,
}: BillingHistoryParams) => {
	try {
		// Validate incoming params
		const validatedParams = fetchBillingHistorySchema.parse({
			status,
			offset,
			limit,
			page,
		});

		// Build query string to match the API format: limit=10&offset=10&page=2&status=all
		const queryParams: Record<string, string> = {
			limit: validatedParams.limit.toString(),
			offset: validatedParams.offset.toString(),
			status: validatedParams.status,
		};

		// Add page parameter if provided
		if (validatedParams.page) {
			queryParams.page = validatedParams.page.toString();
		}

		const queryString = new URLSearchParams(queryParams).toString();

		const response = await apiClient.get(
			`/api/v1/managements/billing/history/?${queryString}`,
		);

		// Explicitly check for errors
		if (response.status !== 200) {
			throw new Error(
				`Failed to fetch billing history (status ${response.status}).`,
			);
		}

		// Expecting { success: boolean, data: { billing_history: [...] } }
		const data = await response.data;

		if (!data.success) {
			throw new Error(
				data.error?.message || "Failed to fetch billing history.",
			);
		}

		return data.data; // this should contain billing_history, etc.
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errorMessages = error.errors.map(error_ => ({
				field: error_.path.join("."),
				message: error_.message,
			}));
			throw new Error(`Validation failed: ${JSON.stringify(errorMessages)}`);
		}

		if (error instanceof Error) {
			throw new TypeError(`Billing history fetch failed: ${error.message}`);
		}

		throw new Error(
			"Unexpected error occurred while fetching billing history.",
		);
	}
};

// Alternative function to fetch using the next URL directly
export const fetchBillingHistoryByUrl = async (url: string) => {
	try {
		// Extract just the path and query string from the full URL
		const urlObject = new URL(url);
		const pathAndQuery = `${urlObject.pathname}${urlObject.search}`;

		const response = await apiClient.get(pathAndQuery);

		if (response.status !== 200) {
			throw new Error(
				`Failed to fetch billing history (status ${response.status}).`,
			);
		}

		const data = await response.data;

		if (!data.success) {
			throw new Error(
				data.error?.message || "Failed to fetch billing history.",
			);
		}

		return data.data;
	} catch (error) {
		if (error instanceof Error) {
			throw new TypeError(`Billing history fetch failed: ${error.message}`);
		}
		throw new Error(
			"Unexpected error occurred while fetching billing history.",
		);
	}
};
