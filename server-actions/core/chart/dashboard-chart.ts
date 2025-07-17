"use server";

import { z } from "zod";

// eslint-disable-next-line import/no-unresolved
import { apiClient } from "@/lib/utils/api-client";

export const getHeatMapMetrics = async () => {
	try {
		const response = await apiClient.get("/api/v1/dashboard/posts-heatmap/");
		if (response.status !== 200) {
			throw new Error("The request to retrieve metrics was unsuccessful.");
		}
		// Return the metrics data
		return { success: true, data: response.data };
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errorMessages = error.errors.map(event_ => ({
				field: event_.path.join("."),
				message: event_.message,
			}));
			throw new Error(`Validation failed: ${JSON.stringify(errorMessages)}`);
		}
		if (error instanceof Error) {
			throw new TypeError(`Failed to fetch metrics: ${error.message}`);
		}
		throw new Error(
			"An unexpected error occurred while fetching metrics. Please try again later.",
		);
	}
};

export const getChannelMetrics = async () => {
	try {
		const response = await apiClient.get(
			"/api/v1/dashboard/channel-distribution/",
		);
		if (response.status !== 200) {
			throw new Error("The request to retrieve metrics was unsuccessful.");
		}
		// Return the metrics data
		return { success: true, data: response.data };
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errorMessages = error.errors.map(event_ => ({
				field: event_.path.join("."),
				message: event_.message,
			}));
			throw new Error(`Validation failed: ${JSON.stringify(errorMessages)}`);
		}
		if (error instanceof Error) {
			throw new TypeError(`Failed to fetch metrics: ${error.message}`);
		}
		throw new Error(
			"An unexpected error occurred while fetching metrics. Please try again later.",
		);
	}
};
