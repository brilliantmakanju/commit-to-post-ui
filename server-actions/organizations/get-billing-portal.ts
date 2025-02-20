"use server";

import dotenv from "dotenv";

import { apiClient } from "@/lib/utils/api-client";

dotenv.config();

// Function to register a user
export const billingPortal = async (): Promise<{
	success: boolean;
	message: string;
	data?: {
		portal_url: string;
	};
	errorDetails?: string;
}> => {
	// Validate the data using Zod schema
	// const parsedData = signupSchema.parse(data);

	try {
		// Make the API call using the apiClient
		const response = await apiClient.get(
			"/api/v1/managements/subscriptions/create/",
		);
		// Check if the registration was successful (status 200 or 201)
		if (response.error) {
			throw new Error(response?.error.email || "Failed to register user.");
		}
		return {
			success: true,
			data: response.data,
			message: "Billing Plan Portal",
		};
	} catch (error: any) {
		// Catch any errors from the API call and return them
		return {
			success: false,
			message: error.message || "An unexpected error occurred.",
			errorDetails: error, // Optional: Include error details for debugging
		};
	}
};
