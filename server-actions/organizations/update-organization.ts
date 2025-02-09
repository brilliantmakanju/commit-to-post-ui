"use server";

import { auth } from "@/auth";
import { apiClient } from "@/lib/utils/api-client";
import { OrganizationSettingsFormValues } from "@/resolvers/organizations/organization-settings-schema";

export async function updateOrganization(
	data: Partial<OrganizationSettingsFormValues>,
) {
	try {
		const session = await auth();
		if (!session?.user) {
			return {
				success: false,
				message: "Not authenticated",
			};
		}

		const response = await apiClient.put("/api/v1/organizations/", data);

		if (!response.success) {
			return {
				success: false,
				message: response.error?.message || "Failed to update organization",
				error: response.error,
			};
		}

		return {
			success: true,
			data: response.data,
			message: "Organization updated successfully",
		};
	} catch (error) {
		return {
			success: false,
			message: "An error occurred while updating the organization",
			error,
		};
	}
}
