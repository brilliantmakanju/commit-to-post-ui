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
			// {},
			// 5000000000000000,
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

export const onboardingComplete = async () => {
	try {
		const payload = { is_onboarded: true };

		const response = await apiClient.put(
			"/api/v1/managements/profile/onboarding/complete/",
			payload,
			{},
			10000,
		);

		if (response.status !== 200) {
			throw new Error(
				`Onboarding completion failed with status ${response.status}`,
			);
		}

		// Merge server response into existing cookie state
		const newUserData = { new_user: false, ...response.data };
		await updateCookie("user_state", newUserData);

		return response.data; // Return clean data instead of full response
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errorMessages = error.errors.map(event_ => ({
				field: event_.path.join("."),
				message: event_.message,
			}));
			throw new Error(`Validation failed: ${JSON.stringify(errorMessages)}`);
		}

		if (error instanceof Error) {
			throw new TypeError(`Failed to complete onboarding: ${error.message}`);
		}

		throw new Error("Unexpected error occurred during onboarding completion");
	}
};
