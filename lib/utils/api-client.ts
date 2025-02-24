import { access } from "node:fs";

import { z } from "zod";

import { auth } from "@/auth";
import { refreshToken } from "@/server-actions/auth/auth-actions";

import {
	clearCookies,
	deleteCookie,
	updateCookie,
} from "../cookies/create-cookies";
import { getBaseUrl } from "./getbase-url";
import { getAuthTokens } from "./gettokens";
import { isTokenExpired } from "./tokens";
import { validateEndpointAndMethod } from "./verify-endpoint";

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

	// Method to retrieve the session token dynamically
	private async getSessionToken() {
		const { access_token } = await getAuthTokens();
		return access_token || ""; // Return the token or an empty string if not available
	}

	private async getSessionRefreshToken() {
		const { refresh_token } = await getAuthTokens();
		return refresh_token || ""; // Return the token or an empty string if not available
	}

	// Add new method to get the appropriate base URL
	private async getDynamicBaseUrl(): Promise<string> {
		const session = await auth();
		if (session?.user) {
			// User is logged in, use dynamic base URL
			return getBaseUrl();
		}
		// User is not logged in, use default base URL
		return this.baseUrl;
	}

	private mergeHeaders(customHeaders: Record<string, string> = {}) {
		return { ...this.defaultHeaders, ...customHeaders };
	}

	private createTimeoutSignal(timeout: number): AbortController {
		const controller = new AbortController();
		setTimeout(() => controller.abort(), timeout);
		return controller;
	}

	private async getAuthorizationHeader(headers: Record<string, string> = {}) {
		// Get session token if available
		const token = await this.getSessionToken(); // Dynamically get the session token
		const refreshtoken = await this.getSessionRefreshToken(); // Dynamically get the session token

		// Return the merged headers with the Authorization header added if token exists
		return this.mergeHeaders({
			Authorization: token ? `Bearer ${token}` : "", // Add token if available
			"X-Refresh-Token": refreshtoken || "",
			...headers, // Merge any custom headers passed in
		});
	}

	private async handleUnauthorizedError(
		endpoint: string,
		method: string,
		body?: any,
		headers?: Record<string, string>,
		signal?: AbortSignal,
	) {
		try {
			// Get refresh token and attempt to refresh
			const refreshtoken = await this.getSessionRefreshToken();
			const response = await refreshToken(refreshtoken);

			if (response.success && response.data) {
				// Update cookies with new tokens
				await updateCookie("cookie_state", {
					access_token: response.data.access_token,
					refresh_token: response.data.refresh_token,
				});

				// Retry the original request with new token
				const retryHeaders = await this.getAuthorizationHeader(headers);
				return await fetch(`${await this.getDynamicBaseUrl()}${endpoint}`, {
					method,
					headers: retryHeaders,
					body: body ? JSON.stringify(body) : undefined,
					signal,
					credentials: "include",
				});
			} else {
				await clearCookies();
				throw new Error("Token refresh failed");
			}
		} catch {
			// Force sign out on refresh failure
			await clearCookies();
			throw new Error("Authentication failed. Please login again.");
		}
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
		const dynamicBaseUrl = await this.getDynamicBaseUrl();
		const endpointRegulation = await validateEndpointAndMethod(
			endpoint,
			method,
		);
		const url = endpointRegulation
			? `${this.baseUrl}${endpoint}`
			: `${dynamicBaseUrl}${endpoint}`;
		const mergedHeader = await this.getAuthorizationHeader(headers);
		const accessToken = (await this.getSessionToken()) || "";

		const isExpired = isTokenExpired(accessToken);
		try {
			let response = await fetch(url, {
				method,
				headers: mergedHeader,
				body: body ? JSON.stringify(body) : undefined,
				signal,
				credentials: "include",
			});

			if (isExpired) {
				response = await this.handleUnauthorizedError(
					endpoint,
					method,
					body,
					headers,
					signal,
				);
			}

			const responseBody = await response.json().catch(() => {});

			if (
				responseBody?.detail === "Authentication credentials were not provided."
			) {
				await clearCookies();
				await deleteCookie("cookie_state");
				await deleteCookie("__Host-authjs.csrf-token");
				await deleteCookie("__Secure-authjs.callback-url");
				await deleteCookie("__Secure-authjs.session-token");
			}

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

// Exporting a single instance of ApiClient
export const apiClient = new ApiClient({
	baseUrl: process.env.BASE_URL_API_CALL || "http://localhost:8000",
});
