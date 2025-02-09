import * as z from "zod";

export const organizationSchema = z.object({
	name: z.string().min(2, {
		message: "Organization name must be at least 2 characters.",
	}),
	description: z.string().optional(), // Optional description
});

export const regenerateWebhookSchema = z.object({
	organizationName: z.string().min(1, "Organization name is required"),
});

export const connectAccountSchema = z.object({
	code: z.string(),
});

export type OrganizationFormValues = z.infer<typeof organizationSchema>;
