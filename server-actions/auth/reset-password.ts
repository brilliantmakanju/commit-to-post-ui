"use server";

import dotenv from "dotenv";

import { apiClient } from "@/lib/utils/api-client";
import { resetPasswordSchema } from "@/resolvers/auth-resolvers";

dotenv.config();

export const resetPasswordAction = async ({
	data,
}: {
	data: {
		uid: string;
		token: string;
		new_password: string;
		re_password: string;
	};
}): Promise<{
	success: boolean;
}> => {
	const parsedData = resetPasswordSchema.parse(data);
	const details = {
		uid: data.uid,
		token: data.token,
		...parsedData,
	};
	try {
		// Make the API call using the apiClient
		const response = await apiClient.post(
			"/api/v1/auth/users/reset_password_confirm/",
			details,
		);
		return response;
	} catch {
		// Catch any errors from the API call and return them
		return {
			success: false,
		};
	}
};
