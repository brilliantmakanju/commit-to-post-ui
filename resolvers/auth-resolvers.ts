import MailChecker from "mailchecker";
import { z } from "zod";

/**
 * Enhanced signup schema with comprehensive validation
 * This schema is used for both client-side and server-side validation
 */
export const signupSchema = z.object({
	first_name: z
		.string({ required_error: "First name is required" })
		.min(1, "First name is required")
		.min(2, "First name must be at least 2 characters")
		.max(50, "First name must not exceed 50 characters")
		.regex(
			/^[a-zA-ZÀ-ÿ\s'-]+$/,
			"First name can only contain letters, spaces, hyphens and apostrophes",
		)
		.trim()
		.refine(
			name => {
				// Block numeric patterns
				if (/\d/.test(name)) return false;
				// Block excessive special characters
				if ((name.match(/[-']/g) || []).length > 2) return false;
				// Block common test/fake names
				const lowerName = name.toLowerCase().trim();
				const fakePrefixes = [
					"test",
					"fake",
					"dummy",
					"asdf",
					"qwerty",
					"admin",
					"user",
					"guest",
					"anonymous",
					"null",
					"undefined",
					"name",
					"firstname",
				];
				if (
					fakePrefixes.some(
						prefix => lowerName === prefix || lowerName.startsWith(prefix),
					)
				)
					return false;
				return true;
			},
			{ message: "Please enter a valid first name" },
		),
	last_name: z
		.string({ required_error: "Last name is required" })
		.min(1, "Last name is required")
		.min(2, "Last name must be at least 2 characters")
		.max(50, "Last name must not exceed 50 characters")
		.regex(
			/^[a-zA-ZÀ-ÿ\s'-]+$/,
			"Last name can only contain letters, spaces, hyphens and apostrophes",
		)
		.trim()
		.refine(
			name => {
				// Block numeric patterns
				if (/\d/.test(name)) return false;
				// Block excessive special characters
				if ((name.match(/[-']/g) || []).length > 2) return false;
				// Block common test/fake names
				const lowerName = name.toLowerCase().trim();
				const fakePrefixes = [
					"test",
					"fake",
					"dummy",
					"asdf",
					"qwerty",
					"admin",
					"user",
					"guest",
					"anonymous",
					"null",
					"undefined",
					"name",
					"lastname",
				];
				if (
					fakePrefixes.some(
						prefix => lowerName === prefix || lowerName.startsWith(prefix),
					)
				)
					return false;
				return true;
			},
			{ message: "Please enter a valid last name" },
		),
	email: z
		.string({ required_error: "Email is required" })
		.min(1, "Email is required")
		.email("Invalid email format")
		.max(100, "Email must not exceed 100 characters")
		.toLowerCase()
		.trim()
		.refine(
			email => {
				// Block plus addressing
				if (email.includes("+")) {
					return false;
				}
				return true;
			},
			{ message: "Email addresses with '+' symbols are not allowed" },
		)
		.refine(
			email => {
				// Use MailChecker to detect disposable/temporary emails
				return MailChecker.isValid(email);
			},
			{ message: "Please use a permanent email address, not a disposable one" },
		)
		.refine(
			email => {
				// Block role-based emails
				const roleBasedPrefixes = [
					"admin",
					"administrator",
					"webmaster",
					"hostmaster",
					"postmaster",
					"noreply",
					"no-reply",
					"support",
					"info",
					"sales",
					"marketing",
					"contact",
					"help",
					"abuse",
					"security",
				];
				const localPart = email.split("@")[0].toLowerCase();
				return !roleBasedPrefixes.includes(localPart);
			},
			{ message: "Please use a personal email address, not a role-based one" },
		)
		.refine(
			email => {
				// Block suspicious patterns
				const suspiciousPatterns = [
					/test/i,
					/fake/i,
					/spam/i,
					/dummy/i,
					/example/i,
					/sample/i,
					/temp/i,
					/trash/i,
					/junk/i,
					/throwaway/i,
				];
				return !suspiciousPatterns.some(pattern => pattern.test(email));
			},
			{ message: "Please use a valid email address" },
		)
		.refine(
			email => {
				// Check for common typos
				const typoMap: Record<string, string> = {
					"gmial.com": "gmail.com",
					"gmai.com": "gmail.com",
					"gmil.com": "gmail.com",
					"gamil.com": "gmail.com",
					"yahooo.com": "yahoo.com",
					"yaho.com": "yahoo.com",
					"hotmial.com": "hotmail.com",
					"hotmai.com": "hotmail.com",
					"outlok.com": "outlook.com",
					"outloo.com": "outlook.com",
				};
				const domain = email.split("@")[1]?.toLowerCase();
				return !domain || !typoMap[domain];
			},
			{ message: "Please check your email address for typos" },
		)
		.refine(
			email => {
				// Ensure proper email structure
				const parts = email.split("@");
				if (parts.length !== 2) return false;

				const [localPart, domain] = parts;

				// Local part validation
				if (!localPart || localPart.length === 0 || localPart.length > 64)
					return false;
				if (localPart.startsWith(".") || localPart.endsWith(".")) return false;
				if (localPart.includes("..")) return false;

				// Check for excessive dots or hyphens
				const dotCount = (localPart.match(/\./g) || []).length;
				const hyphenCount = (localPart.match(/-/g) || []).length;
				if (dotCount > 3 || hyphenCount > 2) return false;

				// Domain validation
				if (!domain || domain.length === 0 || domain.length > 255) return false;
				if (
					domain.startsWith(".") ||
					domain.endsWith(".") ||
					domain.startsWith("-") ||
					domain.endsWith("-")
				)
					return false;
				if (!domain.includes(".")) return false;

				const domainParts = domain.split(".");
				if (domainParts.some(part => part.length === 0 || part.length > 63))
					return false;

				// Check for valid TLD
				const tld = domainParts.at(-1);
				if (tld && tld.length < 2) return false;

				return true;
			},
			{ message: "Please enter a valid email address" },
		),
	normalized_email: z.string().email().optional(),
});

/**
 * Login schema for magic link - Enhanced with same email validations
 */
export const loginSchema = z.object({
	email: z
		.string({ required_error: "Email is required" })
		.min(1, "Email is required")
		.email("Invalid email format")
		.toLowerCase()
		.trim()
		.refine(
			email => {
				// Use MailChecker for login too
				return MailChecker.isValid(email);
			},
			{ message: "Please use a valid email address" },
		),
	password: z
		.string({ required_error: "Password is required" })
		.min(8, "Password must be more than 8 characters")
		.max(32, "Password must be less than 32 characters")
		.optional(),
});

/**
 * Magic link schema for sending link
 */
export const magicLinkSchema = z.object({
	email: z
		.string({ required_error: "Email is required" })
		.min(1, "Email is required")
		.email("Invalid email format")
		.toLowerCase()
		.trim()
		.refine(
			email => {
				return MailChecker.isValid(email);
			},
			{ message: "Please use a valid email address" },
		),
});

/**
 * Magic link token verification schema
 */
export const magicLinkSchemaToken = z.object({
	token: z
		.string({ required_error: "Token is required" })
		.min(16, "Token must be at least 16 characters long")
		.max(256, "Token must be less than 256 characters long"),
});

/**
 * Combined magic link verification schema
 */
export const magicLinkVerificationSchema = z.object({
	token: z
		.string({ required_error: "Token is required" })
		.min(16, "Token must be at least 16 characters long")
		.max(256, "Token must be less than 256 characters long"),
	email: z
		.string({ required_error: "Email is required" })
		.email("Invalid email address")
		.toLowerCase()
		.trim(),
});

/**
 * Resend activation token schema
 */
export const resendActivationToken = z.object({
	email: z
		.string({ required_error: "Email is required" })
		.min(1, "Email is required")
		.email("Invalid email format")
		.toLowerCase()
		.trim(),
});

/**
 * Forgot password schema
 */
export const forgotPasswordSchema = z.object({
	email: z
		.string({ required_error: "Email is required" })
		.min(1, "Email is required")
		.email("Invalid email format")
		.toLowerCase()
		.trim()
		.refine(
			email => {
				return MailChecker.isValid(email);
			},
			{ message: "Please use a valid email address" },
		),
});

/**
 * Activate account token schema
 */
export const activateAccountToken = z.object({
	token: z.string({ required_error: "Token is required" }),
	uid: z.string({ required_error: "UID is required" }),
});

/**
 * Common weak passwords to block
 */
const commonPasswords = new Set([
	"password",
	"password123",
	"123456",
	"123456789",
	"12345678",
	"qwerty",
	"qwerty123",
	"admin",
	"admin123",
	"letmein",
	"welcome",
	"welcome123",
	"passw0rd",
	"abc123",
	"iloveyou",
	"monkey",
	"dragon",
	"master",
	"sunshine",
	"princess",
	"football",
	"starwars",
]);

/**
 * Reset password schema with strong validation
 */
export const resetPasswordSchema = z
	.object({
		new_password: z
			.string({ required_error: "Password is required" })
			.min(8, "Password must be at least 8 characters")
			.max(32, "Password must be less than 32 characters")
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
						"Password must include at least one uppercase letter, one lowercase letter, one number, and one special character",
				},
			)
			.refine(password => !commonPasswords.has(password.toLowerCase()), {
				message:
					"This password is too common. Please choose a stronger password",
			})
			.refine(
				password => {
					// Check for sequential characters
					const hasSequential = /abc|bcd|cde|123|234|345|456|567|678|789/i.test(
						password,
					);
					return !hasSequential;
				},
				{
					message: "Password cannot contain sequential characters",
				},
			),
		re_password: z.string({ required_error: "Confirm Password is required" }),
	})
	.superRefine((data, context) => {
		if (data.new_password !== data.re_password) {
			context.addIssue({
				code: "custom",
				path: ["re_password"],
				message: "Passwords must match",
			});
		}
	});

/**
 * Setup form schema with enhanced name validation
 */
export const setupFormSchema = z.object({
	fullName: z
		.string({ required_error: "Full name is required" })
		.min(2, "Name must be at least 2 characters")
		.max(50, "Name must be less than 50 characters")
		.regex(
			/^[a-zA-ZÀ-ÿ]+ [a-zA-ZÀ-ÿ]+.*$/,
			"Please enter your full name with at least first and last name",
		)
		.refine(
			name => {
				// Block numbers
				if (/\d/.test(name)) return false;
				// Block fake names
				const lowerName = name.toLowerCase().trim();
				const fakePatterns = ["test", "fake", "dummy", "asdf"];
				if (fakePatterns.some(pattern => lowerName.includes(pattern)))
					return false;
				return true;
			},
			{ message: "Please enter a valid full name" },
		),
});

/**
 * Profile form schema with enhanced validation
 */
export const profileFormSchema = z.object({
	firstName: z
		.string({ required_error: "First name is required" })
		.min(1, "First name is required")
		.min(2, "First name must be at least 2 characters")
		.max(50, "First name must not exceed 50 characters")
		.regex(
			/^[a-zA-ZÀ-ÿ\s'-]+$/,
			"First name can only contain letters, spaces, hyphens and apostrophes",
		)
		.refine(
			name => {
				if (/\d/.test(name)) return false;
				return true;
			},
			{ message: "First name cannot contain numbers" },
		),
	lastName: z
		.string({ required_error: "Last name is required" })
		.min(1, "Last name is required")
		.min(2, "Last name must be at least 2 characters")
		.max(50, "Last name must not exceed 50 characters")
		.regex(
			/^[a-zA-ZÀ-ÿ\s'-]+$/,
			"Last name can only contain letters, spaces, hyphens and apostrophes",
		)
		.refine(
			name => {
				if (/\d/.test(name)) return false;
				return true;
			},
			{ message: "Last name cannot contain numbers" },
		),
});

/**
 * Password form schema with strong validation
 */
export const passwordFormSchema = z
	.object({
		oldPassword: z
			.string({ required_error: "Current password is required" })
			.min(6, "Password must be at least 6 characters"),
		newPassword: z
			.string({ required_error: "New password is required" })
			.min(8, "Password must be at least 8 characters")
			.max(32, "Password must be less than 32 characters")
			.refine(
				password => {
					const hasUppercase = /[A-Z]/.test(password);
					const hasLowercase = /[a-z]/.test(password);
					const hasNumber = /\d/.test(password);
					const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
					return hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
				},
				{
					message:
						"Password must include uppercase, lowercase, number, and special character",
				},
			)
			.refine(password => !commonPasswords.has(password.toLowerCase()), {
				message:
					"This password is too common. Please choose a stronger password",
			}),
		confirmPassword: z.string({
			required_error: "Please confirm your password",
		}),
	})
	.superRefine((data, context) => {
		if (data.newPassword === data.oldPassword) {
			context.addIssue({
				code: "custom",
				path: ["newPassword"],
				message: "New password must be different from current password",
			});
		}
		if (data.newPassword !== data.confirmPassword) {
			context.addIssue({
				code: "custom",
				path: ["confirmPassword"],
				message: "Passwords don't match",
			});
		}
	});

/**
 * Subscription schema validation
 */
export const subscriptionSchema = z.object({
	plan: z
		.string({ required_error: "Plan is required" })
		.min(1, "Plan is required"),
	period: z
		.string({ required_error: "Period is required" })
		.min(1, "Period is required"),
	trancantRef: z
		.string({ required_error: "Transaction reference is required" })
		.min(1, "Transaction reference is required")
		.max(100, "Transaction reference is too long"),
	paymentProof: z
		.string()
		.url("Invalid image URL")
		.optional()
		.or(z.literal("")),
	additionalNote: z
		.string()
		.max(500, "Note must be less than 500 characters")
		.optional(),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type SignupData = z.infer<typeof signupSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type MagicLinkData = z.infer<typeof magicLinkSchema>;
export type MagicLinkTokenData = z.infer<typeof magicLinkSchemaToken>;
export type MagicLinkVerificationData = z.infer<
	typeof magicLinkVerificationSchema
>;
export type ResendActivationData = z.infer<typeof resendActivationToken>;
export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;
export type ActivateAccountData = z.infer<typeof activateAccountToken>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;
export type SetupFormValues = z.infer<typeof setupFormSchema>;
export type ProfileFormValues = z.infer<typeof profileFormSchema>;
export type PasswordFormValues = z.infer<typeof passwordFormSchema>;
export type SubscriptionData = z.infer<typeof subscriptionSchema>;
