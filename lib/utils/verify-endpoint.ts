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
		// Retrieve and parse the endpoint-methods map from the environment variable

		const endpointMethods = process.env.NEXT_PUBLIC_ENDPOINTS_JSON
			? JSON.parse(
					process.env.NEXT_PUBLIC_ENDPOINTS_JSON.replaceAll(/^'|'$/g, ""),
				)
			: {};

		// Check if the endpoint exists in the configuration
		const methodsConfig = endpointMethods[endpoint];
		if (!methodsConfig || !Array.isArray(methodsConfig)) {
			console.warn(`No configuration found for endpoint: ${endpoint}`);
			return false;
		}

		// Check if the method exists in the allowed methods for the endpoint
		const isMethodAllowed = methodsConfig.some(
			(config: { method: string }) => config.method === method,
		);

		// Log the result of method matching

		return isMethodAllowed;
	} catch (error) {
		console.error("Error validating endpoint and method:", error);
		return false;
	}
}
