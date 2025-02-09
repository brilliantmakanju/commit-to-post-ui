import * as z from "zod";

export const organizationSettingsSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	description: z.string().min(10, "Description must be at least 10 characters"),
});

export const deleteOrganizationSchema = z.object({
	organizationName: z.string(),
});

export type OrganizationSettingsFormValues = z.infer<
	typeof organizationSettingsSchema
>;
export type DeleteOrganizationFormValues = z.infer<
	typeof deleteOrganizationSchema
>;
