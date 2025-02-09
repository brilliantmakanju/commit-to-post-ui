"use server";

/**
 * Verifies if the provided endpoint and HTTP method are valid.
 * The function first checks the allowed endpoints and methods configured in the environment variable.
 * If the endpoint and method match, it returns `true`, otherwise `false`.
 *
 * The function follows these priority checks:
 * 1. Verify the endpoint and method against a configured list from environment variables.
 * 2. Fallback to default behavior if not found.
 *
 * @param {string} endpoint - The endpoint of the API to validate.
 * @param {string} method - The HTTP method (e.g., GET, POST, PUT) to validate for the endpoint.
 * @returns {Promise<boolean>} - Returns `true` if the endpoint and method are valid, otherwise `false`.
 */
export async function validateEndpointAndMethod(
	endpoint: string,
	method: string,
): Promise<boolean> {
	try {
		// Retrieve the configured endpoint-methods map from environment variables
		const endpointMethods = process.env.NEXT_PUBLIC_ENDPOINTS_JSON
			? JSON.parse(process.env.NEXT_PUBLIC_ENDPOINTS_JSON)
			: {};

		// Log a message if no configuration is found
		if (Object.keys(endpointMethods).length === 0) {
			console.warn(
				"No endpoint-methods configuration found in environment variables.",
			);
		}

		// Check if the provided endpoint exists in the endpointMethods configuration
		const endpointConfig = endpointMethods[endpoint];
		if (!endpointConfig) {
			return false; // Endpoint not found
		}

		// Check if the provided method matches the allowed method for this endpoint
		if (endpointConfig.method !== method) {
			return false; // Method mismatch
		}

		// If both endpoint and method match, return true
		return true;
	} catch {
		// Handle any unexpected errors
		return false; // Return false if there was an error in processing
	}
}
