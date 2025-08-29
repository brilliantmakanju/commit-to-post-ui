"use server";
// eslint-disable-next-line import/no-unresolved
import { apiClient } from "@/lib/utils/api-client";

// The request payload your Django view expects
export interface PlanChangeRequest {
	new_price_id: string;
	change_type?: "upgrade" | "downgrade";
}

// Management URLs that Paddle might return
export interface ManagementUrls {
	update_payment_method?: string;
	cancel?: string;
}

// The response structure based on your Django view
export interface PlanChangeResponse {
	error?: string;
	success: boolean;
	message?: string;
	new_plan?: string;
	can_cancel?: boolean;
	current_plan?: string;
	effective_date?: string;
	billing_change?: string;
	change_type?: "upgrade" | "downgrade" | "cancel" | "plan change";

	// New fields for handling Paddle management URLs
	management_urls?: ManagementUrls;
	requires_payment_update?: boolean;
	redirect_url?: string;
}

export const changeSubscriptionPlan = async (
	data: PlanChangeRequest,
): Promise<PlanChangeResponse> => {
	try {
		const response = await apiClient.post(
			"/api/v1/managements/subscriptions/plan/change/",
			{
				new_price_id: data.new_price_id,
				...(data.change_type ? { change_type: data.change_type } : {}),
			},
			{},
			10000,
		);

		// Unwrap the `data` key returned by Django
		if (response?.success && response.data) {
			const responseData = response.data as PlanChangeResponse;

			// Ensure we have the success flag
			responseData.success = true;

			return responseData;
		}

		// Normalize error if backend didn't return expected format
		return {
			success: false,
			error: response?.error || "Unexpected response format",
		};
	} catch (error: unknown) {
		if (error instanceof Error) {
			throw new TypeError(
				`Failed to change subscription plan: ${error.message}`,
			);
		}
		throw new Error("Failed to change subscription plan: Unknown error");
	}
};
