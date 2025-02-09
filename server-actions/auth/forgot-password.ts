"use server";

import dotenv from "dotenv";

import { apiClient } from "@/lib/utils/api-client";
import { forgotPasswordSchema } from "@/resolvers/auth-resolvers";

dotenv.config();

export const forgotPasswordAction = async ({
	data,
}: {
	data: {
		email: string;
	};
}): Promise<{
	success: boolean;
}> => {
	const parsedData = forgotPasswordSchema.parse(data);
	try {
		// Make the API call using the apiClient
		const response = await apiClient.post(
			"/api/v1/auth/users/reset_password/",
			parsedData,
		);
		return response;
	} catch {
		// Catch any errors from the API call and return them
		return {
			success: false,
		};
	}
};
