"use server";
import { getDecryptedCookie } from "@/lib/cookies/getcookies";

/**
 * Gets the base URL for API calls based on organization domain or environment variables
 *
 * Priority:
 * 1. Organization domain from cookie (with port 8000 in dev)
 * 2. BASE_URL_API_CALL environment variable
 * 3. Default http://localhost:8000
 *
 * @returns {Promise<string>} The base URL to use for API calls
 */
export async function getBaseUrl(): Promise<string> {
	try {
		// Get organization details from encrypted cookie
		const organization = await getDecryptedCookie("organization");

		// Extract domain from organization if it exists
		const domain = `https://${organization?.domian}`;

		// In development, append port 8000 to domain
		const domainWithPort =
			domain && process.env.NODE_ENV === "development"
				? `https://${domain}`
				: domain;
		// Add :8000 when done with testing
		// Return first available URL in priority order
		const baseUrl =
			(domainWithPort as string) ||
			process.env.BASE_URL_API_CALL ||
			"http://localhost:8000";

		return baseUrl;
	} catch {
		// If cookie access fails, fall back to environment variable or localhost
		const fallbackUrl =
			process.env.BASE_URL_API_CALL || "http://localhost:8000";
		return fallbackUrl;
	}
}
