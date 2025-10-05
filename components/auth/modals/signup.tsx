"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
// Professional email validation libraries
import MailChecker from "mailchecker";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { registerUser } from "@/server-actions/auth/signup";
import useAuthModalStore from "@/zustand/auth/use-auth-modal";

/**
 * Normalize email by removing dots and plus addressing from Gmail/Google Workspace
 * Gmail ignores dots and anything after + in the local part
 * Example: john.doe+spam@gmail.com -> johndoe@gmail.com
 */
const normalizeEmail = (email: string): string => {
	const [localPart, domain] = email.toLowerCase().trim().split("@");
	if (!domain) return email;

	const isGoogleDomain =
		domain === "gmail.com" ||
		domain === "googlemail.com" ||
		domain.endsWith(".google.com");

	if (isGoogleDomain) {
		// Remove dots and everything after +
		const normalizedLocal = localPart.replaceAll(".", "").split("+")[0];
		return `${normalizedLocal}@${domain}`;
	}

	// For other providers, just remove plus addressing
	const normalizedLocal = localPart.split("+")[0];
	return `${normalizedLocal}@${domain}`;
};

/**
 * Check for role-based email addresses
 */
const isRoleBasedEmail = (email: string): boolean => {
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
	return roleBasedPrefixes.includes(localPart);
};

/**
 * Detect suspicious patterns in email
 */
const hasSuspiciousPattern = (email: string): boolean => {
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

	return suspiciousPatterns.some(pattern => pattern.test(email));
};

/**
 * Check for common email typos
 */
const hasCommonTypo = (
	email: string,
): { hasTypo: boolean; suggestion?: string } => {
	const typoMap: Record<string, string> = {
		"gmial.com": "gmail.com",
		"gmai.com": "gmail.com",
		"gmil.com": "gmail.com",
		"gamil.com": "gmail.com",
		"gmailc.om": "gmail.com",
		"yahooo.com": "yahoo.com",
		"yaho.com": "yahoo.com",
		"yhoo.com": "yahoo.com",
		"hotmial.com": "hotmail.com",
		"hotmai.com": "hotmail.com",
		"outlok.com": "outlook.com",
		"outloo.com": "outlook.com",
		"outlookc.om": "outlook.com",
	};

	const domain = email.split("@")[1]?.toLowerCase();
	if (domain && typoMap[domain]) {
		return { hasTypo: true, suggestion: typoMap[domain] };
	}

	return { hasTypo: false };
};

// Enhanced signup schema with professional validation
const signupSchema = z.object({
	first_name: z
		.string()
		.min(1, "First name is required")
		.min(2, "First name must be at least 2 characters")
		.max(50, "First name must not exceed 50 characters")
		.regex(
			/^[a-zA-Z\s'-]+$/,
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
		.string()
		.min(1, "Last name is required")
		.min(2, "Last name must be at least 2 characters")
		.max(50, "Last name must not exceed 50 characters")
		.regex(
			/^[a-zA-Z\s'-]+$/,
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
		.string()
		.min(1, "Email is required")
		.email("Please enter a valid email address")
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
				// MailChecker.isValid returns true for valid emails, false for disposable
				return MailChecker.isValid(email);
			},
			{ message: "Please use a permanent email address, not a disposable one" },
		)
		.refine(
			email => {
				// Check for role-based emails
				return !isRoleBasedEmail(email);
			},
			{ message: "Please use a personal email address, not a role-based one" },
		)
		.refine(
			email => {
				// Check for suspicious patterns
				return !hasSuspiciousPattern(email);
			},
			{ message: "Please use a valid email address" },
		)
		.refine(
			email => {
				// Check for common typos
				const { hasTypo } = hasCommonTypo(email);
				return !hasTypo;
			},
			{
				message: "Please check your email address for typos",
			},
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
				if (!tld || tld.length < 2) return false;

				return true;
			},
			{ message: "Please enter a valid email address" },
		),
	acceptTerms: z.boolean().refine(value => value === true, {
		message: "You must accept the terms and conditions to create an account",
	}),
});

interface SignupFormProps {
	setView: (view: "login" | "signup" | "forgot") => void;
}

export default function SignupForm({ setView }: SignupFormProps) {
	const { openModal, setProcessing, isProcessing } = useAuthModalStore();

	const form = useForm<z.infer<typeof signupSchema>>({
		resolver: zodResolver(signupSchema),
		mode: "onChange", // Validate on every change for real-time feedback
		defaultValues: {
			first_name: "",
			last_name: "",
			email: "",
			acceptTerms: false,
		},
	});

	const onSubmit = async (values: z.infer<typeof signupSchema>) => {
		// Final validation before submission
		if (
			!values.first_name ||
			!values.last_name ||
			!values.email ||
			!values.acceptTerms
		) {
			toast.error("Please fill in all required fields and accept the terms");
			return;
		}

		const emailLower = values.email.trim().toLowerCase();

		// Check for typos one more time and suggest correction
		const { hasTypo, suggestion } = hasCommonTypo(emailLower);
		if (hasTypo && suggestion) {
			const correctedEmail = emailLower.replace(
				emailLower.split("@")[1],
				suggestion,
			);
			toast.error(`Did you mean ${correctedEmail}?`);
			return;
		}

		// Normalize email to detect duplicates (removes dots for Gmail, plus addressing, etc.)
		const normalizedEmail = normalizeEmail(emailLower);

		setProcessing(true);
		try {
			const apiRequest = await registerUser({
				first_name: values.first_name.trim(),
				last_name: values.last_name.trim(),
				email: emailLower, // Send original email
				normalized_email: normalizedEmail, // Send normalized for duplicate detection
			});

			if (apiRequest.success === true) {
				form.reset();
				openModal("check-email");
			} else {
				toast.error(apiRequest.message || "Failed to create account");
			}
		} catch (error) {
			console.error("Signup error:", error);
			toast.error("Something went wrong. Please try again later.");
		} finally {
			setProcessing(false);
		}
	};

	// Watch all form fields for validation
	const firstName = form.watch("first_name");
	const lastName = form.watch("last_name");
	const email = form.watch("email");
	const acceptTerms = form.watch("acceptTerms");

	const isSubmitting = form.formState.isSubmitting || isProcessing;

	// Check if all fields are filled and valid
	const isFormValid =
		firstName?.trim().length >= 2 &&
		lastName?.trim().length >= 2 &&
		email?.trim().length > 0 &&
		email?.includes("@") &&
		email?.includes(".") &&
		acceptTerms === true &&
		Object.keys(form.formState.errors).length === 0;

	// Determine if button should be disabled
	const isButtonDisabled = isSubmitting || !isFormValid;

	return (
		<div className="grid w-[400px] gap-6 px-4">
			<div className="flex flex-col space-y-2 text-center">
				<h1 className="text-2xl font-semibold tracking-tight">
					Create an account
				</h1>
				<p className="text-sm text-muted-foreground">
					Enter your details below to create your account
				</p>
			</div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					<div className="grid gap-4 sm:grid-cols-2">
						<FormField
							control={form.control}
							name="first_name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										First name <span className="text-destructive">*</span>
									</FormLabel>
									<FormControl>
										<Input
											placeholder="John"
											disabled={isSubmitting}
											autoComplete="given-name"
											maxLength={50}
											{...field}
											onChange={event_ => {
												// Trim leading spaces and update
												const value = event_.target.value.replace(/^\s+/, "");
												field.onChange(value);
											}}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="last_name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										Last name <span className="text-destructive">*</span>
									</FormLabel>
									<FormControl>
										<Input
											placeholder="Doe"
											disabled={isSubmitting}
											autoComplete="family-name"
											maxLength={50}
											{...field}
											onChange={event_ => {
												// Trim leading spaces and update
												const value = event_.target.value.replace(/^\s+/, "");
												field.onChange(value);
											}}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									Email <span className="text-destructive">*</span>
								</FormLabel>
								<FormControl>
									<Input
										placeholder="name@example.com"
										type="email"
										disabled={isSubmitting}
										autoComplete="email"
										maxLength={100}
										{...field}
										onChange={event_ => {
											// Remove spaces and update
											const value = event_.target.value.replaceAll(/\s/g, "");
											field.onChange(value);
										}}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="acceptTerms"
						render={({ field }) => (
							<FormItem className="flex flex-row items-start space-x-3 space-y-0">
								<FormControl>
									<Checkbox
										checked={field.value}
										onCheckedChange={field.onChange}
										disabled={isSubmitting}
										aria-required="true"
									/>
								</FormControl>
								<div className="space-y-1 leading-none">
									<FormLabel className="text-sm font-normal text-muted-foreground">
										I agree to the{" "}
										<Link
											href="/terms"
											target="_blank"
											rel="noopener noreferrer"
											className="font-medium text-primary underline underline-offset-4 transition-colors hover:text-primary/80"
											onClick={event_ => event_.stopPropagation()}
										>
											Terms of Service
										</Link>{" "}
										and{" "}
										<Link
											href="/privacy"
											target="_blank"
											rel="noopener noreferrer"
											className="font-medium text-primary underline underline-offset-4 transition-colors hover:text-primary/80"
											onClick={event_ => event_.stopPropagation()}
										>
											Privacy Policy
										</Link>
										<span className="text-destructive"> *</span>
									</FormLabel>
									<FormMessage />
								</div>
							</FormItem>
						)}
					/>

					<Button
						disabled={isButtonDisabled}
						type="submit"
						className="flex w-full items-center justify-center gap-2 transition-opacity"
						aria-disabled={isButtonDisabled}
					>
						{isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
						{isSubmitting ? "Creating account..." : "Create account"}
					</Button>

					{!isFormValid && !isSubmitting && (
						<p className="text-center text-xs text-muted-foreground">
							Please fill in all required fields and accept the terms to
							continue
						</p>
					)}
				</form>
			</Form>

			<div className="text-center text-sm text-muted-foreground">
				Already have an account?{" "}
				<button
					onClick={() => !isSubmitting && setView("login")}
					disabled={isSubmitting}
					type="button"
					className="font-medium text-primary underline underline-offset-4 transition-colors hover:text-primary/80 disabled:cursor-not-allowed disabled:opacity-50"
				>
					Sign in
				</button>
			</div>
		</div>
	);
}
