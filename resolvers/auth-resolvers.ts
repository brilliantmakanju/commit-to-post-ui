import { z } from "zod";

export const signupSchema = z.object({
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
	// password: z
	// 	.string({ required_error: "Password is required." })
	// 	.min(8, "Password must be more than 8 characters.")
	// 	.max(32, "Password must be less than 32 characters."),
	// re_password: z.string({ required_error: "Confirm Password is required." }),
});
// .superRefine((data, context) => {
// 	if (data.password !== data.re_password) {
// 		context.addIssue({
// 			code: "custom", // Specify the type of issue
// 			path: ["re_password"], // Specify the field causing the issue
// 			message: "Passwords must match.",
// 		});
// 	}
// });

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

export const magicLinkSchemaToken = z.object({
	token: z
		.string({ required_error: "Token is required." })
		.min(16, "Token must be at least 16 characters long.") // Token length typically longer than 8 chars
		.max(256, "Token must be less than 256 characters long."), // Accommodate JWT or similar tokens
});

export const magicLinkSchema = z.object({
	email: z
		.string({ required_error: "Email is required." })
		.min(1, "Email is required.")
		.email("Invalid email format."),
});

export const resendActivationToken = z.object({
	email: z
		.string({ required_error: "Email is required." })
		.min(1, "Email is required.")
		.email("Invalid email format."),
});

export const forgotPasswordSchema = z.object({
	email: z
		.string({ required_error: "Email is required." })
		.min(1, "Email is required.")
		.email("Invalid email format."),
});

export const activateAccountToken = z.object({
	token: z.string({ required_error: "Token is required" }),
	uid: z.string({ required_error: "UID is required" }),
});

const commonPasswords = new Set([
	"password",
	"123456",
	"qwerty",
	"admin",
	"letmein",
	"welcome",
	"123456789",
	"12345678",
]);

export const resetPasswordSchema = z
	.object({
		new_password: z
			.string({ required_error: "Password is required." })
			.min(8, "Password must be at least 8 characters.")
			.max(32, "Password must be less than 32 characters.")
			.refine(
				password => {
					// Check for at least one uppercase letter
					const hasUppercase = /[A-Z]/.test(password);
					// Check for at least one lowercase letter
					const hasLowercase = /[a-z]/.test(password);
					// Check for at least one number
					const hasNumber = /\d/.test(password);
					// Check for at least one special character
					const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

					return hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
				},
				{
					message:
						"Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.",
				},
			)
			.refine(password => !commonPasswords.has(password.toLowerCase()), {
				message:
					"This password is too common. Please choose a stronger password.",
			}),
		re_password: z.string({ required_error: "Confirm Password is required." }),
	})
	.superRefine((data, context) => {
		if (data.new_password !== data.re_password) {
			context.addIssue({
				code: "custom",
				path: ["re_password"],
				message: "Passwords must match.",
			});
		}
	});

export const setupFormSchema = z.object({
	fullName: z
		.string()
		.min(2, "Name must be at least 2 characters")
		.max(50, "Name must be less than 50 characters")
		.regex(
			/^[a-zA-Z]+ [a-zA-Z]+.*$/,
			"Please enter your full name with at least first and last name",
		),
	// bio: z.string()
	// 	.min(10, "Bio must be at least 10 characters")
	// 	.max(500, "Bio must be less than 500 characters"),
	// profileImage: z
	// 	.custom<File>()
	// 	.refine((file) => file !== undefined, "Profile image is required")
});

export type SetupFormValues = z.infer<typeof setupFormSchema>;

export const profileFormSchema = z.object({
	firstName: z.string().min(1, "First name is required"),
	lastName: z.string().min(1, "Last name is required"),
});

export const passwordFormSchema = z
	.object({
		oldPassword: z.string().min(6, "Password must be at least 6 characters"),
		newPassword: z.string().min(6, "Password must be at least 6 characters"),
		confirmPassword: z.string(),
	})
	.refine(data => data.newPassword === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

// Zod schema for validating subscription creation data
export const subscriptionSchema = z.object({
	plan: z.string().min(1, "Plan is required"),
	period: z.string().min(1, "Period is required"),
	trancantRef: z.string().min(1, "Transaction reference is required"),
	paymentProof: z.string().url("Invalid image URL").optional(),
	additionalNote: z.string().optional(),
});

// Define TypeScript types from Zod schema
export type SubscriptionData = z.infer<typeof subscriptionSchema>;
export type ProfileFormValues = z.infer<typeof profileFormSchema>;
export type PasswordFormValues = z.infer<typeof passwordFormSchema>;
