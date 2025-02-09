import { getDecryptedCookie } from "@/lib/cookies/getcookies";

/**
 * Retrieves authentication tokens from the `cookie_state` cookie.
 *
 * This function extracts:
 * - `access_token`
 * - `refresh_token`
 *
 * If the cookie is missing or tokens are not available, it returns `undefined` values.
 *
 * @returns {Promise<{ access_token?: string; refresh_token?: string }>}
 *          An object containing `access_token` and `refresh_token`.
 */
export async function getAuthTokens(): Promise<{
	access_token?: string;
	refresh_token?: string;
}> {
	try {
		// Retrieve encrypted cookie containing authentication details
		const cookieState = await getDecryptedCookie("cookie_state");

		// Extract tokens from cookie state
		const access_token = cookieState?.access_token as string;
		const refresh_token = cookieState?.refresh_token as string;

		return { access_token: access_token, refresh_token: refresh_token };
	} catch {
		// Handle errors gracefully
		return { access_token: "", refresh_token: "" };
	}
}
