"use server";

import { z } from "zod";

import { apiClient } from "../../lib/utils/api-client";
import { passwordFormSchema } from "../../resolvers/auth-resolvers";

export const changePassword = async ({
	oldPassword,
	newPassword,
	confirmPassword,
}: {
	oldPassword: string;
	newPassword: string;
	confirmPassword: string;
}) => {
	try {
		const validatedData = passwordFormSchema.parse({
			oldPassword,
			newPassword,
			confirmPassword,
		});

		const response = await apiClient.post("/api/v1/auth/users/set_password/", {
			new_password: validatedData.newPassword,
			re_new_password: validatedData.confirmPassword,
			current_password: validatedData.oldPassword,
		});
		console.log(response, "Responsed");

		if (response.status !== 204) {
			throw new Error(
				`Failed to change password. Server responded with status ${response.status}`,
			);
		}

		return { success: true, data: response.data };
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errorMessages = error.errors.map(error_ => ({
				field: error_.path.join("."),
				message: error_.message,
			}));
			console.error("Validation failed:", errorMessages);
			return {
				success: false,
				error: "Validation failed",
				details: errorMessages,
			};
		}

		if (error instanceof Error) {
			console.error("Failed to update tones:", error.message);
			return { success: false, error: "Failed to change password" };
		}

		console.error("An unexpected error occurred while changing password");
		return { success: false, error: "An unexpected error occurred" };
	}
};
