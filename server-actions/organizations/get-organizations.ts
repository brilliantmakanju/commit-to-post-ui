"use server";

import { apiClient } from "@/lib/utils/api-client";
import { Organization } from "@/zustand/useorganization-store";

export const getOrganizations = async ({
	org_id,
}: {
	org_id?: string;
} = {}): Promise<{
	success: boolean;
	organizations?: Organization[];
	message?: string;
}> => {
	try {
		// Build URL conditionally
		const url = org_id
			? `/api/v1/organizations/?id=${encodeURIComponent(org_id)}`
			: "/api/v1/organizations/";

		const response = await apiClient.get(url);

		if (response.error) {
			throw new Error(
				response.error?.message || "Failed to fetch organizations.",
			);
		}

		// Map response data to ensure consistency with OrganizationData type
		const organizations: Organization[] =
			response.data.organizations?.map((org: any) => ({
				id: org.id,
				name: org.name,
				owner_id: org.owner_id,
				domains: org.domains ?? [],
				socials: org.socials ?? [],
				is_owner: org.is_owner ?? false,
				...org, // include any other fields from serializer
			})) ?? [];

		return {
			success: true,
			organizations,
		};
	} catch (error: any) {
		return {
			success: false,
			message: error.message || "An unexpected error occurred.",
		};
	}
};
