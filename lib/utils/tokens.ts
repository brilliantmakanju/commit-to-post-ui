/**
 * Decodes a JWT token without any external libraries.
 * This function assumes that the JWT token follows the standard format (header.payload.signature)
 * and that the payload is Base64Url encoded.
 *
 * @param token - The JWT token string.
 * @returns The decoded payload as an object, or undefined if decoding fails.
 */
export const decodeJwt = (token: string): Record<string, any> | undefined => {
	try {
		const parts = token.split(".");
		if (parts.length !== 3) {
			return undefined;
		}
		let payload = parts[1];

		// Convert from Base64Url to Base64 by replacing URL-specific characters
		payload = payload.replaceAll("-", "+").replaceAll("_", "/");

		// Pad the string with '=' so its length is a multiple of 4
		while (payload.length % 4 !== 0) {
			payload += "=";
		}

		// atob decodes a Base64 encoded string (available in browsers)
		const decodedPayload = atob(payload);
		return JSON.parse(decodedPayload);
	} catch {
		return undefined;
	}
};

interface JwtPayload {
	exp?: number;
	[key: string]: any;
}

/**
 * Extracts the expiration time from a JWT token as a Date object.
 *
 * @param token - The JWT access token.
 * @returns The expiration time as a Date object, or undefined if not found or token is invalid.
 */
export const getTokenExpiration = (token: string): Date | undefined => {
	const decoded = decodeJwt(token) as JwtPayload | undefined;
	if (decoded && decoded.exp) {
		// The "exp" field is in seconds; convert it to milliseconds.
		return new Date(decoded.exp * 1000);
	}
	return undefined;
};

/**
 * Checks if the token is expired.
 * @param token The JWT access token.
 */
export const isTokenExpired = (token: string): boolean => {
	const expirationDate = getTokenExpiration(token);
	if (expirationDate === undefined) {
		return false;
	}

	if (!expirationDate) {
		return true; // If no expiration, consider it expired.
	}
	return expirationDate.getTime() < Date.now();
};
