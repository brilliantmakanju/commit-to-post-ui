"use server";

import dotenv from "dotenv";

import { apiClient } from "@/lib/utils/api-client";
import {
	activateAccountToken,
	resendActivationToken,
} from "@/resolvers/auth-resolvers";

dotenv.config();

// Function to register a user
export const activateAccount = async ({
	data,
}: {
	data: {
		uid: string;
		token: string;
	};
}): Promise<{
	success: boolean;
}> => {
	const parsedData = activateAccountToken.parse(data);
	try {
		// Make the API call using the apiClient
		const response = await apiClient.post(
			"/api/v1/auth/users/activation/",
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

export const resendActivationEmail = async ({
	data,
}: {
	data: {
		email: string;
	};
}): Promise<{
	success: boolean;
}> => {
	const parsedData = resendActivationToken.parse(data);
	try {
		// Make the API call using the apiClient
		const response = await apiClient.post(
			"/api/v1/auth/users/resend_activation/",
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

export const protectedEndPoint = async (): Promise<{
	success: boolean;
}> => {
	try {
		// Make the API call using the apiClient
		const response = await apiClient.get("/managements/protected/");
		return response;
	} catch {
		// Catch any errors from the API call and return them
		return {
			success: false,
		};
	}
};
