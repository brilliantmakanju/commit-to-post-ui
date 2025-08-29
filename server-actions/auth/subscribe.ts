"use server";

import dotenv from "dotenv";

import { apiClient } from "@/lib/utils/api-client";
import { getPriceId } from "@/lib/utils/stripe-planning";
import {
	SubscriptionData,
	subscriptionSchema,
} from "@/resolvers/auth-resolvers";

dotenv.config();

export const PaymentCreation = async (
	data: SubscriptionData,
): Promise<{
	success: boolean;
	message: string;
}> => {
	try {
		// Validate the data using Zod schema
		const parsedData = subscriptionSchema.parse(data);

		// Make the API call using the apiClient
		const response = await apiClient.post(
			"/api/v1/managements/payment/create/",
			{
				plan: parsedData.plan,
				period: parsedData.period,
				transaction_ref: parsedData.trancantRef,
				proof_of_payment: parsedData.paymentProof,
				additional_note: parsedData.additionalNote,
			},
		);

		if (response.error) {
			throw new Error(
				response?.error.email || "Failed to create subscription.",
			);
		}

		return {
			success: true,
			message: response.message,
		};
	} catch (error: any) {
		return {
			success: false,
			message: error.message || "An unexpected error occurred.",
		};
	}
};

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

export const authSubscribe = async ({
	plans,
	billingCycle,
}: {
	plans: "Basic" | "Pro" | "Lifetime Deal" | "Custom";
	billingCycle?: "monthly" | "annual"; // Optional for Pro, ignored for LTD
}): Promise<{
	success: boolean;
	message: string;
	data?: { checkout_url: string };
	errorDetails?: string;
}> => {
	try {
		let priceId = "";
		let planId = "";

		switch (plans) {
			case "Pro":
			case "Lifetime Deal": {
				priceId = getPriceId({ planType: plans, billingCycle });
				planId = plans === "Pro" ? "pro_plan_id" : "ltd_plan_id";

				if (!priceId) {
					throw new Error("Invalid price ID for the selected plan.");
				}

				break;
			}
			case "Basic": {
				planId = "free_plan_id";

				break;
			}
			case "Custom": {
				planId = "custom_plan_id";

				break;
			}
			default: {
				throw new Error("Invalid plan type selected.");
			}
		}

		const response = await apiClient.post(
			"/api/v1/managements/subscriptions/create/",
			{
				price_id: priceId,
				plan_id: planId,
			},
		);

		if (response.error) {
			throw new Error(
				response?.error.email || "Failed to create subscription.",
			);
		}

		return {
			success: true,
			data: response.data,
			message: "Checkout URL generated successfully.",
		};
	} catch (error: any) {
		return {
			success: false,
			message: error.message || "An unexpected error occurred.",
			errorDetails: error,
		};
	}
};
