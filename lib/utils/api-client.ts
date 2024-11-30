import { z } from "zod";

export interface ApiClientConfig {
	baseUrl: string; // The base URL for API requests
	defaultHeaders?: Record<string, string>; // Custom headers for all requests
	timeout?: number; // Default timeout for requests (in ms)
}

export class ApiClient {
	private baseUrl: string;
	private defaultHeaders: Record<string, string>;
	private timeout: number;

	constructor({
		baseUrl,
		defaultHeaders = {},
		timeout = 10000,
	}: ApiClientConfig) {
		this.baseUrl = baseUrl;
		this.defaultHeaders = {
			"Content-Type": "application/json",
			...defaultHeaders,
		};
		this.timeout = timeout;
	}

	private mergeHeaders(customHeaders: Record<string, string> = {}) {
		return { ...this.defaultHeaders, ...customHeaders };
	}

	private createTimeoutSignal(timeout: number): AbortController {
		const controller = new AbortController();
		setTimeout(() => controller.abort(), timeout);
		return controller;
	}

	private async executeRequest(
		endpoint: string,
		method: string,
		body?: any,
		headers: Record<string, string> = {},
		signal?: AbortSignal,
	): Promise<
		| { data?: any; success: boolean; status?: number }
		| { success: boolean; error: any; status: number }
	> {
		const url = `${this.baseUrl}${endpoint}`;
		try {
			const response = await fetch(url, {
				method,
				headers: this.mergeHeaders(headers),
				body: body ? JSON.stringify(body) : undefined,
				signal,
				credentials: "include", // Secure cookie handling
			});

			const responseBody = await response.json().catch(() => {});

			return response.ok
				? {
						status: response.status,
						success: true,
						data: responseBody,
					}
				: {
						status: response.status,
						success: false,
						error: responseBody || { message: response.statusText },
					};

			// if (response.ok) {
			// 	return {
			// 		status: response.status,
			// 		success: true,
			// 		data: responseBody,
			// 	};
			// } else {
			// 	// Return error details in a structured format
			// 	return {
			// 		status: response.status,
			// 		success: false,
			// 		error: responseBody || { message: response.statusText },
			// 	};
			// }
		} catch (error: any) {
			return {
				success: false,
				error: {
					message:
						error.name === "AbortError"
							? "Request aborted due to timeout or cancellation."
							: error.message || "An unexpected error occurred.",
				},
			};
		}
	}

	async get(
		endpoint: string,
		headers?: Record<string, string>,
		timeout?: number,
	): Promise<any> {
		const controller = this.createTimeoutSignal(timeout || this.timeout);
		return this.executeRequest(
			endpoint,
			"GET",
			undefined,
			headers,
			controller.signal,
		);
	}

	async post(
		endpoint: string,
		body: any,
		headers?: Record<string, string>,
		timeout?: number,
	): Promise<any> {
		const controller = this.createTimeoutSignal(timeout || this.timeout);
		return this.executeRequest(
			endpoint,
			"POST",
			body,
			headers,
			controller.signal,
		);
	}

	async put(
		endpoint: string,
		body: any,
		headers?: Record<string, string>,
		timeout?: number,
	): Promise<any> {
		const controller = this.createTimeoutSignal(timeout || this.timeout);
		return this.executeRequest(
			endpoint,
			"PUT",
			body,
			headers,
			controller.signal,
		);
	}

	async delete(
		endpoint: string,
		headers?: Record<string, string>,
		timeout?: number,
	): Promise<any> {
		const controller = this.createTimeoutSignal(timeout || this.timeout);
		return this.executeRequest(
			endpoint,
			"DELETE",
			undefined,
			headers,
			controller.signal,
		);
	}

	async validateResponse<T>(
		endpoint: string,
		schema: z.ZodSchema<T>,
		method: "GET" | "POST" | "PUT" | "DELETE",
		body?: any,
		headers?: Record<string, string>,
		timeout?: number,
	): Promise<T> {
		// @ts-ignore
		const data = await this[method.toLowerCase()](
			endpoint,
			body,
			headers,
			timeout,
		);
		return schema.parse(data); // Validate response data
	}
}

// Exporting a single instance of ApiClient with your BASE_URL_API_CALL
export const apiClient = new ApiClient({
	baseUrl: process.env.BASE_URL_API_CALL || "http://127.0.0.1:8000", // Default to localhost if env var not available
});
