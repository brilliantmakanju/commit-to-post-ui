/* eslint-disable import/no-unresolved */
"use server";

import { z } from "zod";

import { apiClient } from "@/lib/utils/api-client";
import { OrganizationStatsResponseSchema } from "@/types/organization-stats";

export const fetchOrganizationStats = async () => {
	try {
		const response = await apiClient.get("/api/v1/stats/organizations/");

		if (response.status !== 200) {
			throw new Error("Failed to retrieve organization statistics.");
		}
		// Validate response with Zod
		const parsed = OrganizationStatsResponseSchema.parse(response.data);

		return {
			data: parsed,
			success: true,
			message: "Organization statistics retrieved successfully",
		};
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errorMessages = error.errors.map(error_ => ({
				field: error_.path.join("."),
				message: error_.message,
			}));

			throw new Error(
				`Organization stats validation failed: ${JSON.stringify(errorMessages)}`,
			);
		}

		if (error instanceof Error) {
			throw new TypeError(
				`Failed to fetch organization stats: ${error.message}`,
			);
		}

		throw new Error(
			"An unexpected error occurred while fetching organization statistics. Please try again later.",
		);
	}
};
