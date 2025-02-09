"use server";
import { z } from "zod";

import { updateCookie } from "@/lib/cookies/create-cookies";
import { apiClient } from "@/lib/utils/api-client";
import {
	setupFormSchema,
	type SetupFormValues,
} from "@/resolvers/auth-resolvers";

export const updateProfileSetup = async (data: SetupFormValues) => {
	try {
		const validatedData = setupFormSchema.parse(data);

		const response = await apiClient.put(
			"/api/v1/managements/profile/update/",
			{
				full_name: validatedData.fullName,
			},
		);

		if (response.status !== 200) {
			throw new Error("API request failed");
		}

		const newUserData = { new_user: false, ...response.data };
		await updateCookie("user_state", newUserData); // Update the cookie

		return response;
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errorMessages = error.errors.map(error_ => ({
				field: error_.path.join("."),
				message: error_.message,
			}));
			throw new Error(`Validation failed: ${JSON.stringify(errorMessages)}`);
		}

		if (error instanceof Error) {
			throw new TypeError(`Failed to update profile: ${error.message}`);
		}

		throw new Error("An unexpected error occurred while updating profile");
	}
};
