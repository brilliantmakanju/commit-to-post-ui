"use server";
import { getDecryptedCookie } from "@/lib/cookies/getcookies";

/**
 * Gets the base URL for API calls based on organization domain or environment variables
 *
 * Priority:
 * 1. Organization domain from cookie (with port 8000 in dev)
 * 2. BASE_URL_API_CALL environment variabl e
 * 3. Default http://localhost:8000
 *
 * @returns {Promise<string>} The base URL to use for API calls
 */
export async function getBaseUrl(): Promise<string> {
	try {
		// Get organization details from encrypted cookie
		const organization = await getDecryptedCookie("organization");
		// Extract domain from organization using the correct property name.
		const orgDomain = organization?.domain;

		// If an organization domain exists, construct the URL.
		let domainWithPort: string | undefined;
		if (orgDomain) {
			domainWithPort =
				process.env.NODE_ENV === "development"
					? `http://${orgDomain}:8000`
					: `https://${orgDomain}`;
		}

		// Return the first available URL: the constructed domain, an environment variable, or localhost.
		const baseUrl =
			domainWithPort ||
			process.env.BASE_URL_API_CALL ||
			"http://localhost:8000";

		return baseUrl;
	} catch {
		// If any error occurs, fallback to the environment variable or localhost.
		return process.env.BASE_URL_API_CALL || "http://localhost:8000";
	}
}
