"use server";
import { apiClient } from "@/lib/utils/api-client";
import {
	OrganizationFormValues,
	organizationSchema,
} from "@/resolvers/organizations/organization-schema";

export const createOrganization = async (data: OrganizationFormValues) => {
	try {
		const validatedData = organizationSchema.parse(data);

		const response = await apiClient.post("/api/v1/organizations/", {
			name: validatedData.name,
			description: validatedData.description,
		});

		return response; // Return the created organization data
	} catch (error: unknown) {
		if (error instanceof Error) {
			throw new TypeError(`Failed to create organization: ${error.message}`);
		}
		throw new Error("Failed to create organization: Unknown error");
	}
};
