"use server";

// eslint-disable-next-line import/no-unresolved
import { apiClient } from "@/lib/utils/api-client";
// eslint-disable-next-line import/no-unresolved
import {
	GenerationLimitsData,
	GenerationLimitsResponse,
} from "@/types/playground";

/**
 * Server action to get user's generation limits and usage information
 */
export const getGenerationLimits =
	async (): Promise<GenerationLimitsResponse> => {
		try {
			// Make the API call to fetch generation limits
			const response = await apiClient.get(
				"/api/v1/playground/generation-limits/", // Adjust endpoint as needed
				{},
				30000, // timeout
				1, // retries
			);

			if (response.error) {
				return {
					success: false,
					error: response.error.error || "server_error",
					message:
						response.error.message || "Failed to fetch generation limits.",
					data: {
						limits: {} as GenerationLimitsData["limits"],
						costs: {} as GenerationLimitsData["costs"],
						features_by_plan: {} as GenerationLimitsData["features_by_plan"],
					},
				};
			}

			// Return limits information
			return {
				success: true,
				message: "Fetched generation limits successfully.",
				data: {
					limits: response.data.limits,
					costs: response.data.costs,
					features_by_plan: response.data.features_by_plan,
				},
			};
		} catch (error: any) {
			return {
				success: false,
				error: "server_error",
				message:
					error?.message ||
					"An unexpected error occurred while fetching generation limits.",
				data: {
					limits: {} as GenerationLimitsData["limits"],
					costs: {} as GenerationLimitsData["costs"],
					features_by_plan: {} as GenerationLimitsData["features_by_plan"],
				},
			};
		}
	};
