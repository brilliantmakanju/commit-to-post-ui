"use server";

import dotenv from "dotenv";

import { apiClient } from "@/lib/utils/api-client";

dotenv.config();

// Function to register a user
export const subscriptionsCreation = async (): Promise<{
	success: boolean;
	message: string;
	data?: {
		checkout_url: string;
	};
	errorDetails?: string;
}> => {
	// Validate the data using Zod schema
	// const parsedData = signupSchema.parse(data);

	try {
		// Make the API call using the apiClient
		const response = await apiClient.post(
			"/api/v1/managements/subscriptions/create/",
			{
				price_id: process.env.NEXT_PULSE_PRO_PLAN,
				plan_id: "plan_id",
			},
		);
		console.log(response, "Response");
		// Check if the registration was successful (status 200 or 201)
		if (response.error) {
			throw new Error(response?.error.email || "Failed to register user.");
		}
		return {
			success: true,
			data: response.data,
			message: "Checkout url",
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
