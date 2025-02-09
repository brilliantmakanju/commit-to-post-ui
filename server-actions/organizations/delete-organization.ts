"use server";

import { apiClient } from "@/lib/utils/api-client";

export const deleteOrganization = async (): Promise<{
	success: boolean;
	message?: string;
	data?: any;
}> => {
	try {
		// Make the API call to delete organization
		const response = await apiClient.delete("/api/v1/organizations/");

		// Check if the request was successful
		if (response.error) {
			throw new Error(
				response?.error.message || "Failed to delete organization.",
			);
		}

		// Return success response
		return {
			success: response.success,
			data: response.data,
			message: "Organization deleted successfully",
		};
	} catch (error: any) {
		// Catch any errors and return them
		return {
			success: false,
			message:
				error.message ||
				"An unexpected error occurred while deleting the organization.",
		};
	}
};
