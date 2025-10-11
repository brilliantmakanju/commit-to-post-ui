/* eslint-disable import/no-unresolved */
"use server";
import { apiClient } from "@/lib/utils/api-client";

/**
 * Check if user is eligible for spin bonus
 */
export const checkSpinEligibility = async (): Promise<{
	nonce?: string;
	success: boolean;
	message?: string;
	eligible?: boolean;
}> => {
	try {
		// Make the API call to check spin eligibility
		const response = await apiClient.get(
			"/api/v1/managements/spin-bonus/",
			{},
			10000,
		);

		// Check if the request was successful
		if (response.error) {
			return {
				success: false,
				message: response?.error?.detail || "Failed to check spin eligibility.",
			};
		}

		// Return success with eligibility data
		return {
			nonce: response.data.nonce,
			success: response.data.success,
			eligible: response.data.eligible,
		};
	} catch (error: any) {
		// Catch any errors and return them
		return {
			success: false,
			message: error?.detail || "An unexpected error occurred.",
		};
	}
};

/**
 * Claim spin bonus with nonce
 */
export const claimSpinBonus = async (
	nonce: string,
): Promise<{
	success: boolean;
	message?: string;
	credits_won?: number;
	new_balance?: number;
}> => {
	try {
		// Make the API call to claim spin bonus
		const response = await apiClient.post(
			"/api/v1/managements/spin-bonus/",
			{
				nonce: nonce,
			},
			{},
			10000,
		);

		// Check if the request was successful
		if (response.error) {
			return {
				success: false,
				message: response?.error?.detail || "Failed to claim spin bonus.",
			};
		}

		// Return success with credits data
		return {
			success: true,
			credits_won: response.data.credits_won,
			new_balance: response.data.new_balance,
			message: response.data.message,
		};
	} catch (error: any) {
		// Catch any errors and return them
		return {
			success: false,
			message: error?.detail || "An unexpected error occurred.",
		};
	}
};

/**
 * Skip spin bonus
 */
export const skipSpinBonus = async (): Promise<{
	success: boolean;
	message?: string;
}> => {
	try {
		// Make the API call to skip spin bonus
		const response = await apiClient.post(
			"/api/v1/managements/skip-spin-bonus/",
			{},
			{},
			10000,
		);
		// Check if the request was successful
		if (response.error) {
			return {
				success: false,
				message: response?.error?.detail || "Failed to skip spin bonus.",
			};
		}

		// Return success
		return {
			success: true,
			message: response.data.message || "Spin bonus skipped successfully.",
		};
	} catch (error: any) {
		// Catch any errors and return them
		return {
			success: false,
			message: error?.detail || "An unexpected error occurred.",
		};
	}
};
