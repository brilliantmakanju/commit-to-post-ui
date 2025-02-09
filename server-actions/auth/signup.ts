"use server";

import dotenv from "dotenv";

import { apiClient } from "@/lib/utils/api-client";
import { signupSchema } from "@/resolvers/auth-resolvers";

dotenv.config();

// Function to register a user
export const registerUser = async (
	data: any,
): Promise<{
	success: boolean;
	message: string;
	errorDetails?: string;
	responseBody?: string;
}> => {
	// Validate the data using Zod schema
	const parsedData = signupSchema.parse(data);

	try {
		// Make the API call using the apiClient
		const response = await apiClient.post("/api/v1/auth/users/", parsedData);
		// Check if the registration was successful (status 200 or 201)
		if (response.error) {
			throw new Error(response?.error.email || "Failed to register user.");
		}
		return response;
	} catch (error: any) {
		// Catch any errors from the API call and return them
		return {
			success: false,
			message: error.message || "An unexpected error occurred.",
			errorDetails: error, // Optional: Include error details for debugging
		};
	}
};
