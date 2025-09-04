"use server";

import { z } from "zod";

import { apiClient } from "../../lib/utils/api-client";

// Schema for unsubscribe request validation
const unsubscribeSchema = z.object({
	token: z.string().min(1, "Token is required"),
	user_id: z.string().min(1, "User ID is required"),
});

/**
 * Unsubscribes a user from email notifications using token validation
 * Expected request format:
 * {
 *   "token": string, // Unsubscribe token
 *   "user_id": string, // User ID
 * }
 * Expected response format:
 * {
 *   "success": boolean,
 *   "message": string
 * }
 */
export const unsubscribeUser = async (formData: FormData) => {
	try {
		const rawData = {
			token: formData.get("token") as string,
			user_id: formData.get("user_id") as string,
		};

		// Validate the input data
		const validatedData = unsubscribeSchema.parse(rawData);

		const response = await apiClient.post(
			"/api/v1/emails/unsubscribe/",
			validatedData,
		);

		if (response.status !== 200) {
			throw new Error("The request to unsubscribe was unsuccessful.");
		}

		// Return success response
		return {
			success: true,
			message:
				"You have been successfully unsubscribed from email notifications.",
			data: response.data,
		};
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errorMessages = error.errors.map(event => ({
				field: event.path.join("."),
				message: event.message,
			}));
			throw new Error(`Validation failed: ${JSON.stringify(errorMessages)}`);
		}

		if (error instanceof Error) {
			throw new TypeError(`Failed to unsubscribe: ${error.message}`);
		}

		throw new Error(
			"An unexpected error occurred while processing your unsubscribe request. Please try again later.",
		);
	}
};

/**
 * Validates unsubscribe token without processing unsubscribe
 * Used to check if token is valid before showing unsubscribe form
 */
export const validateUnsubscribeToken = async (
	token: string,
	userId: string,
) => {
	try {
		const validatedData = unsubscribeSchema.parse({
			token,
			user_id: userId,
		});

		const response = await apiClient.post(
			"/api/v1/emails/validate-unsubscribe-token/",
			validatedData,
		);

		if (response.status !== 200) {
			throw new Error("Invalid unsubscribe token.");
		}

		return {
			success: true,
			data: response.data,
		};
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errorMessages = error.errors.map(event => ({
				field: event.path.join("."),
				message: event.message,
			}));
			throw new Error(`Validation failed: ${JSON.stringify(errorMessages)}`);
		}

		if (error instanceof Error) {
			throw new TypeError(`Token validation failed: ${error.message}`);
		}

		throw new Error(
			"An unexpected error occurred while validating your unsubscribe token.",
		);
	}
};
