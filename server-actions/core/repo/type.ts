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
