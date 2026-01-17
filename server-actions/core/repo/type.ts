import { z } from "zod";

export const ToneSchema = z.object({
	value: z.string(),
	label: z.string(),
});

export const TonesResponseSchema = z.object({
	success: z.boolean(),
	message: z.string(),
	data: z.array(ToneSchema),
});

export const TemplateSchema = z.object({
	value: z.string(),
	label: z.string(),
	description: z.string(),
	examples: z.array(z.string()),
});

export const TemplatesResponseSchema = z.object({
	message: z.string(),
	success: z.boolean(),
	data: z.array(TemplateSchema),
});
