"use server";
import { z } from "zod";

// eslint-disable-next-line import/no-unresolved
import { apiClient } from "@/lib/utils/api-client";

import {
	CreditBalance,
	creditBalanceSchema,
	DeductCreditsRequest,
	DeductCreditsResponse,
	deductCreditsResponseSchema,
	deductCreditsSchema,
} from "./types/credit-types";

// API functions
export const fetchCreditBalance = async (): Promise<CreditBalance> => {
	try {
		const response = await apiClient.get(
			"/api/v1/managements/credits/balance/",
		);

		if (response.status !== 200) {
			throw new Error(
				"The request to retrieve credit balance was unsuccessful.",
			);
		}

		// Validate the response data
		const validatedData = creditBalanceSchema.parse(response.data);
		return validatedData;
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errorMessages = error.errors.map(error_ => ({
				field: error_.path.join("."),
				message: error_.message,
			}));
			throw new Error(`Validation failed: ${JSON.stringify(errorMessages)}`);
		}

		if (error instanceof Error) {
			throw new TypeError(`Failed to fetch credit balance: ${error.message}`);
		}

		throw new Error(
			"An unexpected error occurred while fetching credit balance. Please try again later.",
		);
	}
};

export const deductCredits = async (
	data: DeductCreditsRequest,
): Promise<DeductCreditsResponse> => {
	try {
		// Validate the incoming data
		const validatedData = deductCreditsSchema.parse(data);

		const response = await apiClient.post(
			"/api/v1/managements/credits/deduct/",
			validatedData,
		);

		if (response.status !== 200) {
			// Handle specific error cases
			if (response.status === 402) {
				throw new Error(response.data?.error || "Insufficient credits");
			}
			throw new Error("The request to deduct credits was unsuccessful.");
		}

		// Validate the response data
		const validatedResponse = deductCreditsResponseSchema.parse(response.data);
		return validatedResponse;
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errorMessages = error.errors.map(error_ => ({
				field: error_.path.join("."),
				message: error_.message,
			}));
			throw new Error(`Validation failed: ${JSON.stringify(errorMessages)}`);
		}

		if (error instanceof Error) {
			throw new TypeError(`Failed to deduct credits: ${error.message}`);
		}

		throw new Error(
			"An unexpected error occurred while deducting credits. Please try again later.",
		);
	}
};
