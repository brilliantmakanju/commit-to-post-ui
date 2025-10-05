"use server";

import dotenv from "dotenv";
import MailChecker from "mailchecker";

import { apiClient } from "@/lib/utils/api-client";
import { signupSchema } from "@/resolvers/auth-resolvers";

dotenv.config();

/**
 * Normalize email by removing dots and plus addressing from Gmail/Google Workspace
 * This helps detect duplicate accounts using email tricks
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
 * Additional server-side email validation
 */
const validateEmailServerSide = (
	email: string,
): { isValid: boolean; error?: string } => {
	const emailLower = email.toLowerCase().trim();

	// Check for plus addressing
	if (emailLower.includes("+")) {
		return {
			isValid: false,
			error: "Email addresses with '+' symbols are not allowed",
		};
	}

	// Use MailChecker to detect disposable emails
	if (!MailChecker.isValid(emailLower)) {
		return {
			isValid: false,
			error: "Please use a permanent email address, not a disposable one",
		};
	}

	// Check for role-based emails
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
	const localPart = emailLower.split("@")[0];
	if (roleBasedPrefixes.includes(localPart)) {
		return {
			isValid: false,
			error: "Please use a personal email address, not a role-based one",
		};
	}

	// Check for suspicious patterns
	const suspiciousPatterns = [
		/test/i,
		/fake/i,
		/spam/i,
		/dummy/i,
		/example/i,
		/sample/i,
		/temp/i,
		/trash/i,
	];
	if (suspiciousPatterns.some(pattern => pattern.test(emailLower))) {
		return {
			isValid: false,
			error: "Please use a valid email address",
		};
	}

	// Check email structure
	const [local, domain] = emailLower.split("@");
	if (!local || !domain) {
		return { isValid: false, error: "Invalid email format" };
	}

	// Check for excessive dots or hyphens
	const dotCount = (local.match(/\./g) || []).length;
	const hyphenCount = (local.match(/-/g) || []).length;
	if (dotCount > 3 || hyphenCount > 2) {
		return {
			isValid: false,
			error: "Email contains too many special characters",
		};
	}

	// Check domain has valid TLD
	const domainParts = domain.split(".");
	const tld = domainParts.at(-1);
	if (domainParts.length < 2 || !tld || tld.length < 2) {
		return { isValid: false, error: "Invalid email domain" };
	}

	return { isValid: true };
};

/**
 * Validate name fields
 */
const validateName = (
	name: string,
	fieldName: string,
): { isValid: boolean; error?: string } => {
	const trimmedName = name.trim();

	// Check minimum length
	if (trimmedName.length < 2) {
		return {
			isValid: false,
			error: `${fieldName} must be at least 2 characters`,
		};
	}

	// Check for numbers
	if (/\d/.test(trimmedName)) {
		return {
			isValid: false,
			error: `${fieldName} cannot contain numbers`,
		};
	}

	// Check for fake/test names
	const lowerName = trimmedName.toLowerCase();
	const fakePrefixes = [
		"test",
		"fake",
		"dummy",
		"asdf",
		"qwerty",
		"admin",
		"user",
		"guest",
	];
	if (
		fakePrefixes.some(
			prefix => lowerName === prefix || lowerName.startsWith(prefix),
		)
	) {
		return {
			isValid: false,
			error: `Please enter a valid ${fieldName.toLowerCase()}`,
		};
	}

	// Check for excessive special characters
	const specialCharCount = (trimmedName.match(/[-']/g) || []).length;
	if (specialCharCount > 2) {
		return {
			isValid: false,
			error: `${fieldName} contains too many special characters`,
		};
	}

	return { isValid: true };
};

/**
 * Type for registration response
 */
interface RegisterResponse {
	success: boolean;
	message: string;
	errorDetails?: string;
	statusCode?: number;
	data?: any;
}

/**
 * Type for registration data
 */
interface RegisterData {
	first_name: string;
	last_name: string;
	email: string;
	normalized_email?: string;
}

/**
 * Function to register a user with comprehensive validation
 */
export const registerUser = async (
	data: RegisterData,
): Promise<RegisterResponse> => {
	try {
		// Validate input data exists
		if (!data || typeof data !== "object") {
			return {
				success: false,
				message: "Invalid request data",
				statusCode: 400,
			};
		}

		// Sanitize input data
		const sanitizedData = {
			first_name: data.first_name?.trim() || "",
			last_name: data.last_name?.trim() || "",
			email: data.email?.trim().toLowerCase() || "",
			normalized_email: data.normalized_email?.trim().toLowerCase() || "",
		};

		// Check all required fields are present
		if (
			!sanitizedData.first_name ||
			!sanitizedData.last_name ||
			!sanitizedData.email
		) {
			return {
				success: false,
				message: "All fields are required",
				statusCode: 400,
			};
		}

		// Validate first name
		const firstNameValidation = validateName(
			sanitizedData.first_name,
			"First name",
		);
		if (!firstNameValidation.isValid) {
			return {
				success: false,
				message: firstNameValidation.error || "Invalid first name",
				statusCode: 400,
			};
		}

		// Validate last name
		const lastNameValidation = validateName(
			sanitizedData.last_name,
			"Last name",
		);
		if (!lastNameValidation.isValid) {
			return {
				success: false,
				message: lastNameValidation.error || "Invalid last name",
				statusCode: 400,
			};
		}

		// Server-side email validation
		const emailValidation = validateEmailServerSide(sanitizedData.email);
		if (!emailValidation.isValid) {
			return {
				success: false,
				message: emailValidation.error || "Invalid email address",
				statusCode: 400,
			};
		}

		// Validate the data using Zod schema
		let parsedData;
		try {
			parsedData = signupSchema.parse(sanitizedData);
		} catch (zodError: any) {
			// Extract Zod validation errors
			const errorMessage = zodError.errors?.[0]?.message || "Validation failed";
			return {
				success: false,
				message: errorMessage,
				errorDetails: JSON.stringify(zodError.errors),
				statusCode: 400,
			};
		}

		// Generate normalized email if not provided
		if (!parsedData.normalized_email) {
			parsedData.normalized_email = normalizeEmail(parsedData.email);
		}

		// Make the API call using the apiClient
		const response = await apiClient.post(
			"/api/v1/managements/magic-link/send/",
			{
				first_name: parsedData.first_name,
				last_name: parsedData.last_name,
				email: parsedData.email,
				normalized_email: parsedData.normalized_email,
			},
			{
				"Content-Type": "application/json",
			},
			15000, // 15 second timeout
		);

		// Handle API errors
		if (response.error) {
			// Check for specific error types
			if (response.error.email) {
				return {
					success: false,
					message: Array.isArray(response.error.email)
						? response.error.email[0]
						: response.error.email,
					statusCode: response.statusCode || 400,
				};
			}

			if (response.error.detail) {
				return {
					success: false,
					message: response.error.detail,
					statusCode: response.statusCode || 400,
				};
			}

			// Generic error from API
			return {
				success: false,
				message: response.error.message || "Failed to register user",
				statusCode: response.statusCode || 500,
			};
		}

		// Successful registration
		return {
			success: true,
			message: "Account created successfully! Please check your email.",
			statusCode: response.statusCode || 200,
			data: response.data,
		};
	} catch (error: any) {
		// Log error for debugging (server-side only)
		console.error("Registration error:", {
			message: error.message,
			stack: error.stack,
			data: data,
		});

		// Handle network errors
		if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
			return {
				success: false,
				message: "Unable to connect to the server. Please try again later.",
				errorDetails: error.message,
				statusCode: 503,
			};
		}

		// Handle timeout errors
		if (error.code === "ETIMEDOUT" || error.message?.includes("timeout")) {
			return {
				success: false,
				message: "Request timed out. Please try again.",
				errorDetails: error.message,
				statusCode: 408,
			};
		}

		// Handle rate limiting
		if (error.statusCode === 429 || error.message?.includes("rate limit")) {
			return {
				success: false,
				message: "Too many requests. Please wait a moment and try again.",
				errorDetails: error.message,
				statusCode: 429,
			};
		}

		// Generic error handler
		return {
			success: false,
			message:
				error.message ||
				"An unexpected error occurred. Please try again later.",
			errorDetails: error.toString(),
			statusCode: error.statusCode || 500,
		};
	}
};
