"use server";

import dotenv from "dotenv";
import { AuthError } from "next-auth";

import { signIn } from "@/auth";
import { apiClient } from "@/lib/utils/api-client";
import {
	magicLinkSchema,
	magicLinkSchemaToken,
} from "@/resolvers/auth-resolvers";

dotenv.config();

// Function to request a magic link
export const requestMagicLink = async (
	data: any,
): Promise<{
	success: boolean;
	message: string;
	errorDetails?: string;
	responseBody?: string;
}> => {
	// Validate the data using Zod schema
	const parsedData = magicLinkSchema.parse(data);

	try {
		// Make the API call using the apiClient
		const response = await apiClient.post(
			"/api/v1/managements/magic-link/send/",
			{
				email: parsedData.email,
			},
		);

		// Check if the request was successful (status 200 or 201)
		if (response.error) {
			throw new Error(response?.error.message || "Failed to send magic link.");
		}

		// Return success if the response indicates so
		return {
			success: true,
			message: "Magic link sent successfully.",
			responseBody: JSON.stringify(response.data),
		};
	} catch (error: any) {
		// Catch any errors from the API call and return them
		return {
			success: false,
			message: error.message || "An unexpected error occurred.",
			errorDetails: JSON.stringify(error.response?.data || error), // Include error details for debugging
		};
	}
};

// Function to verify a magic link
export const verifyAndLogin = async (data: any) => {
	const parsedData = magicLinkSchemaToken.parse(data);
	const { token } = parsedData;

	try {
		const response = await signIn("credentials", {
			token,
			email: "",
			password: "",
			redirect: false,
			magicLink: true,
		});

		// NextAuth returns an object like { ok: true, error: null } or { error: "CredentialsSignin" }
		if (response?.error) {
			if (response.error === "CredentialsSignin") {
				return { message: "Invalid credentials." };
			}
			return { message: "Something went wrong." };
		}

		// Explicitly return success
		return { message: "success" };
	} catch (error) {
		if (error instanceof AuthError) {
			switch (error.type) {
				case "CredentialsSignin": {
					return { message: "Invalid credentials." };
				}
				default: {
					return { message: "Something went wrong." };
				}
			}
		}
		throw error;
	}
};

// credentials
