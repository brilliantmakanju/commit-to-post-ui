import { z } from "zod";

export const signupSchema = z
	.object({
		first_name: z
			.string({ required_error: "First Name is required." })
			.min(1, "First Name is required."),
		last_name: z
			.string({ required_error: "Last Name is required." })
			.min(1, "Last Name is required."),
		email: z
			.string({ required_error: "Email is required." })
			.min(1, "Email is required.")
			.email("Invalid email format."),
		password: z
			.string({ required_error: "Password is required." })
			.min(8, "Password must be more than 8 characters.")
			.max(32, "Password must be less than 32 characters."),
		re_password: z.string({ required_error: "Confirm Password is required." }),
	})
	.superRefine((data, context) => {
		if (data.password !== data.re_password) {
			context.addIssue({
				code: "custom", // Specify the type of issue
				path: ["re_password"], // Specify the field causing the issue
				message: "Passwords must match.",
			});
		}
	});

export const loginSchema = z.object({
	email: z
		.string({ required_error: "Email is required." })
		.min(1, "Email is required.")
		.email("Invalid email format."),
	password: z
		.string({ required_error: "Password is required." })
		.min(8, "Password must be more than 8 characters.")
		.max(32, "Password must be less than 32 characters."),
});

export const resendActivationToken = z.object({
	email: z
		.string({ required_error: "Email is required." })
		.min(1, "Email is required.")
		.email("Invalid email format."),
});

export const activateAccountToken = z.object({
	token: z.string({ required_error: "Token is required" }),
	uid: z.string({ required_error: "UID is required" }),
});
