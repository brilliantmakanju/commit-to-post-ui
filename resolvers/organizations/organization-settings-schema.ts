import * as z from "zod";

export const organizationSettingsSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	description: z.preprocess(
		value =>
			value === null || (typeof value === "string" && value.trim() === "")
				? undefined
				: value,
		z.string().min(10, "Description must be at least 10 characters").optional(),
	),
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
