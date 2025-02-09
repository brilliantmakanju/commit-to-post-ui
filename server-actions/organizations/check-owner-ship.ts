"use server";

import { apiClient } from "@/lib/utils/api-client";

interface OwnershipResponse {
	success: boolean;
	is_owner?: boolean;
	message?: string;
	error?: any;
}

export async function checkOrganizationOwnership(): Promise<OwnershipResponse> {
	try {
		const response = await apiClient.get("/api/v1/organizations/is-owner/");

		if (!response.success) {
			return {
				success: false,
				message: response.error?.message || "Failed to check ownership",
				error: response.error,
			};
		}
		return {
			success: true,
			is_owner: response.data.is_owner,
		};
	} catch (error) {
		console.error("Error checking organization ownership:", error);
		return {
			success: false,
			message: "An error occurred while checking organization ownership",
			error,
		};
	}
}
