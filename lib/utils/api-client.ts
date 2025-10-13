import { z } from "zod";

import { auth } from "@/auth";
import { refreshToken } from "@/server-actions/auth/auth-actions";

import {
	clearCookies,
	createEncryptedCookie,
	deleteCookie,
	updateCookie,
} from "../cookies/create-cookies";
import { getBaseUrl } from "./getbase-url";
import { getAuthTokens } from "./gettokens";
import { isTokenExpired } from "./tokens";
import { validateEndpointAndMethod } from "./verify-endpoint";

export interface ApiClientConfig {
	baseUrl: string;
	defaultHeaders?: Record<string, string>;
	timeout?: number;
	maxConcurrentRequests?: number;
	batchSize?: number;
	connectionPoolSize?: number;
}

export interface RequestQueueItem {
	id: string;
	endpoint: string;
	method: string;
	body?: any;
	headers?: Record<string, string>;
	signal?: AbortSignal;
	priority?: number;
	resolve: (value: any) => void;
	reject: (reason?: any) => void;
	timestamp: number;
	retryCount?: number;
}

export interface CacheEntry {
	data: any;
	timestamp: number;
	ttl: number;
}

export class ApiClient {
	private baseUrl: string;
	private timeout: number;
	private defaultHeaders: Record<string, string>;
	// eslint-disable-next-line unicorn/no-null
	private refreshPromise: Promise<boolean> | null = null;
	private requestQueue: RequestQueueItem[] = [];
	private activeRequests = new Map<string, Promise<any>>();
	private isProcessingQueue = false;
	private authState: "valid" | "refreshing" | "invalid" = "valid";
	private maxConcurrentRequests: number;
	private batchSize: number;
	private connectionPool: AbortController[] = [];
	private cache = new Map<string, CacheEntry>();
	private requestIdCounter = 0;

	// Performance monitoring
	private metrics = {
		cacheHits: 0,
		cacheMisses: 0,
		totalRequests: 0,
		failedRequests: 0,
		successfulRequests: 0,
		averageResponseTime: 0,
	};

	constructor({
		baseUrl,
		defaultHeaders = {},
		timeout = 10000,
		maxConcurrentRequests = 10,
		batchSize = 8,
		connectionPoolSize = 5,
	}: ApiClientConfig) {
		this.baseUrl = baseUrl;
		this.defaultHeaders = {
			"Content-Type": "application/json",
			...defaultHeaders,
		};
		this.timeout = timeout;
		this.maxConcurrentRequests = maxConcurrentRequests;
		this.batchSize = batchSize;

		// Pre-create connection pool
		this.initializeConnectionPool(connectionPoolSize);

		// Cleanup expired cache entries every 5 minutes
		setInterval(() => this.cleanupCache(), 5 * 60 * 1000);
	}

	private initializeConnectionPool(size: number) {
		for (let index = 0; index < size; index++) {
			this.connectionPool.push(new AbortController());
		}
	}

	private getAvailableController(): AbortController {
		let controller = this.connectionPool.find(c => !c.signal.aborted);
		if (!controller) {
			controller = new AbortController();
			this.connectionPool.push(controller);
		}
		return controller;
	}

	private generateCacheKey(
		endpoint: string,
		method: string,
		body?: any,
	): string {
		const bodyHash = body ? JSON.stringify(body) : "";
		return `${method}:${endpoint}:${bodyHash}`;
	}

	private getCachedResponse(key: string): any | null {
		const entry = this.cache.get(key);
		if (!entry) {
			this.metrics.cacheMisses++;
			// eslint-disable-next-line unicorn/no-null
			return null;
		}

		if (Date.now() - entry.timestamp > entry.ttl) {
			this.cache.delete(key);
			this.metrics.cacheMisses++;
			// eslint-disable-next-line unicorn/no-null
			return null;
		}

		this.metrics.cacheHits++;
		return entry.data;
	}

	private setCachedResponse(
		key: string,
		data: any,
		ttl: number = 5 * 60 * 1000,
	) {
		// this.cache.set(key, {
		// 	data,
		// 	timestamp: Date.now(),
		// 	ttl,
		// });
		return;
	}

	private cleanupCache() {
		const now = Date.now();
		for (const [key, entry] of this.cache.entries()) {
			if (now - entry.timestamp > entry.ttl) {
				this.cache.delete(key);
			}
		}
	}

	private async getSessionToken() {
		const { access_token } = await getAuthTokens();
		return access_token || "";
	}

	private async getSessionRefreshToken() {
		const { refresh_token } = await getAuthTokens();
		return refresh_token || "";
	}

	private async getDynamicBaseUrl(): Promise<string> {
		const session = await auth();
		if (session?.user) {
			return getBaseUrl();
		}
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
		const token = await this.getSessionToken();
		const refreshtoken = await this.getSessionRefreshToken();

		return this.mergeHeaders({
			Authorization: token ? `Bearer ${token}` : "",
			"X-Refresh-Token": refreshtoken || "",
			...headers,
		});
	}

	// Enhanced token management with better concurrency
	private async ensureValidToken(): Promise<boolean> {
		const accessToken = await this.getSessionToken();

		if (!accessToken) {
			this.authState = "invalid";
			return true;
		}

		if (!isTokenExpired(accessToken)) {
			this.authState = "valid";
			return true;
		}

		// If already refreshing, wait for it
		if (this.refreshPromise) {
			this.authState = "refreshing";
			return await this.refreshPromise;
		}

		// Start refresh process
		this.authState = "refreshing";
		this.refreshPromise = this.performTokenRefresh();

		try {
			const result = await this.refreshPromise;
			// eslint-disable-next-line unicorn/no-null
			this.refreshPromise = null;
			this.authState = result ? "valid" : "invalid";

			if (result && this.requestQueue.length > 0) {
				this.processQueue();
			}

			return result;
		} catch (error) {
			// eslint-disable-next-line unicorn/no-null
			this.refreshPromise = null;
			this.authState = "invalid";
			this.rejectQueuedRequests(error);
			throw error;
		}
	}

	private async performTokenRefresh(): Promise<boolean> {
		try {
			const refreshtoken = await this.getSessionRefreshToken();

			if (!refreshtoken) {
				await this.handleAuthFailure();
				throw new Error("No refresh token available");
			}

			const response = await refreshToken(refreshtoken);

			if (response.success && response.data) {
				await updateCookie("cookie_state", {
					access_token: response.data.access_token,
					refresh_token: response.data.refresh_token,
				});
				return true;
			} else {
				await this.handleAuthFailure();
				throw new Error("Token refresh failed");
			}
		} catch {
			await this.handleAuthFailure();
			throw new Error("Authentication failed. Please login again.");
		}
	}

	private async handleAuthFailure() {
		await clearCookies();
		this.authState = "invalid";
		this.cache.clear(); // Clear cache on auth failure

		if (typeof globalThis !== "undefined") {
			globalThis.dispatchEvent(
				new CustomEvent("auth:logout", {
					detail: { reason: "token_expired" },
				}),
			);
		}
	}

	// Optimized queue management with priority and deduplication
	private async queueRequest(
		endpoint: string,
		method: string,
		body?: any,
		headers?: Record<string, string>,
		signal?: AbortSignal,
		priority: number = 0,
	): Promise<any> {
		const requestId = `${++this.requestIdCounter}`;
		const dedupeKey = `${method}:${endpoint}:${JSON.stringify(body)}`;

		// Check for duplicate active request
		if (this.activeRequests.has(dedupeKey)) {
			return this.activeRequests.get(dedupeKey);
		}

		return new Promise((resolve, reject) => {
			this.requestQueue.push({
				id: requestId,
				endpoint,
				method,
				body,
				headers,
				signal,
				priority,
				resolve,
				reject,
				timestamp: Date.now(),
				retryCount: 0,
			});

			// Sort queue by priority (higher priority first)
			this.requestQueue.sort((a, b) => (b.priority || 0) - (a.priority || 0));

			if (!this.isProcessingQueue) {
				this.processQueue();
			}
		});
	}

	// Highly optimized queue processing with dynamic batching
	private async processQueue() {
		if (this.isProcessingQueue || this.requestQueue.length === 0) {
			return;
		}

		this.isProcessingQueue = true;

		while (this.requestQueue.length > 0) {
			const currentLoad = this.activeRequests.size;
			const availableSlots = Math.max(
				0,
				this.maxConcurrentRequests - currentLoad,
			);

			if (availableSlots === 0) {
				// Wait for some requests to complete
				await Promise.race(this.activeRequests.values());
				continue;
			}

			const batchSize = Math.min(
				availableSlots,
				this.batchSize,
				this.requestQueue.length,
			);
			const batch = this.requestQueue.splice(0, batchSize);

			// Execute batch with maximum parallelism
			const batchPromises = batch.map(async item => {
				const dedupeKey = `${item.method}:${item.endpoint}:${JSON.stringify(item.body)}`;

				try {
					const requestPromise = this.executeRequestDirect(
						item.endpoint,
						item.method,
						item.body,
						item.headers,
						item.signal,
					);

					this.activeRequests.set(dedupeKey, requestPromise);
					const result = await requestPromise;

					this.activeRequests.delete(dedupeKey);
					item.resolve(result);
				} catch (error) {
					this.activeRequests.delete(dedupeKey);

					// Retry logic for failed requests
					if (item.retryCount! < 3 && this.shouldRetry(error)) {
						item.retryCount = (item.retryCount || 0) + 1;
						this.requestQueue.unshift(item); // Add back to front for retry
					} else {
						item.reject(error);
					}
				}
			});

			// Don't wait for all to complete, continue processing
			Promise.allSettled(batchPromises);

			// Small delay to prevent overwhelming
			if (this.requestQueue.length > 0) {
				await new Promise(resolve => setTimeout(resolve, 10));
			}
		}

		this.isProcessingQueue = false;
	}

	private shouldRetry(error: any): boolean {
		if (error?.status >= 500) return true; // Server errors
		if (error?.message?.includes("timeout")) return true;
		if (error?.message?.includes("network")) return true;
		return false;
	}

	private rejectQueuedRequests(error: any) {
		while (this.requestQueue.length > 0) {
			const item = this.requestQueue.shift()!;
			item.reject(error);
		}
		this.activeRequests.clear();
	}

	private async executeRequestDirect(
		endpoint: string,
		method: string,
		body?: any,
		headers: Record<string, string> = {},
		signal?: AbortSignal,
	): Promise<any> {
		const startTime = Date.now();
		this.metrics.totalRequests++;

		// Check cache for GET requests
		if (method === "GET") {
			const cacheKey = this.generateCacheKey(endpoint, method, body);
			const cached = this.getCachedResponse(cacheKey);
			if (cached) {
				return cached;
			}
		}

		const dynamicBaseUrl = await this.getDynamicBaseUrl();
		const endpointRegulation = await validateEndpointAndMethod(
			endpoint,
			method,
		);
		const url = endpointRegulation
			? `${this.baseUrl}${endpoint}`
			: `${dynamicBaseUrl}${endpoint}`;
		const mergedHeader = await this.getAuthorizationHeader(headers);

		await deleteCookie("throttled");

		try {
			// Use connection pooling for better performance
			const controller = signal
				? new AbortController()
				: this.getAvailableController();
			if (signal) {
				signal.addEventListener("abort", () => controller.abort());
			}

			let response = await fetch(url, {
				method,
				headers: mergedHeader,
				body: body ? JSON.stringify(body) : undefined,
				signal: controller.signal,
				credentials: "include",
				// Performance optimizations
				keepalive: method !== "GET",
				cache: method === "GET" ? "default" : "no-cache",
			});

			if (response.status === 401) {
				response = await this.handleUnauthorizedError(
					endpoint,
					method,
					body,
					headers,
					controller.signal,
				);
			}

			const responseBody = await response.json().catch(() => ({}));

			// Handle throttling
			if (responseBody?.detail?.includes("Request was throttled")) {
				const regex = /in (\d+) seconds/;
				const match = regex.exec(responseBody.detail);
				const waitTime = match ? match[1] : undefined;
				const errorMessage = waitTime
					? `Too many requests. Please try again in ${waitTime} seconds.`
					: "Too many requests. Please try again later.";
				await createEncryptedCookie("throttled", {
					waitTime: waitTime,
					errorMessage: errorMessage,
				});
			}

			if (
				responseBody?.detail === "Authentication credentials were not provided."
			) {
				await this.handleAuthFailure();
			}

			const result = response.ok
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

			// Cache successful GET requests
			if (response.ok && method === "GET") {
				const cacheKey = this.generateCacheKey(endpoint, method, body);
				this.setCachedResponse(cacheKey, result);
			}

			// Update metrics
			const responseTime = Date.now() - startTime;
			this.metrics.averageResponseTime =
				(this.metrics.averageResponseTime + responseTime) / 2;

			if (response.ok) {
				this.metrics.successfulRequests++;
			} else {
				this.metrics.failedRequests++;
			}

			return result;
		} catch (error: any) {
			this.metrics.failedRequests++;

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

	private async executeRequest(
		endpoint: string,
		method: string,
		body?: any,
		headers: Record<string, string> = {},
		signal?: AbortSignal,
		priority?: number,
	): Promise<any> {
		// If token is being refreshed, queue the request
		if (this.authState === "refreshing") {
			return this.queueRequest(
				endpoint,
				method,
				body,
				headers,
				signal,
				priority,
			);
		}

		try {
			await this.ensureValidToken();
		} catch (error: any) {
			return {
				success: false,
				error: {
					message: error.message || "Token refresh failed",
				},
			};
		}

		return this.executeRequestDirect(endpoint, method, body, headers, signal);
	}

	private async handleUnauthorizedError(
		endpoint: string,
		method: string,
		body?: any,
		headers?: Record<string, string>,
		signal?: AbortSignal,
	) {
		try {
			const refreshtoken = await this.getSessionRefreshToken();
			const response = await refreshToken(refreshtoken);

			if (response.success && response.data) {
				await updateCookie("cookie_state", {
					access_token: response.data.access_token,
					refresh_token: response.data.refresh_token,
				});

				const retryHeaders = await this.getAuthorizationHeader(headers);
				return await fetch(`${await this.getDynamicBaseUrl()}${endpoint}`, {
					method,
					headers: retryHeaders,
					body: body ? JSON.stringify(body) : undefined,
					signal,
					credentials: "include",
				});
			} else {
				await this.handleAuthFailure();
				throw new Error("Token refresh failed");
			}
		} catch {
			await this.handleAuthFailure();
			throw new Error("Authentication failed. Please login again.");
		}
	}

	// Enhanced public methods with priority support
	async get(
		endpoint: string,
		headers?: Record<string, string>,
		timeout?: number,
		priority?: number,
	): Promise<any> {
		const controller = this.createTimeoutSignal(timeout || this.timeout);
		return this.executeRequest(
			endpoint,
			"GET",
			undefined,
			headers,
			controller.signal,
			priority,
		);
	}

	async post(
		endpoint: string,
		body: any,
		headers?: Record<string, string>,
		timeout?: number,
		priority?: number,
	): Promise<any> {
		const controller = this.createTimeoutSignal(timeout || this.timeout);
		return this.executeRequest(
			endpoint,
			"POST",
			body,
			headers,
			controller.signal,
			priority,
		);
	}

	async put(
		endpoint: string,
		body: any,
		headers?: Record<string, string>,
		timeout?: number,
		priority?: number,
	): Promise<any> {
		const controller = this.createTimeoutSignal(timeout || this.timeout);
		return this.executeRequest(
			endpoint,
			"PUT",
			body,
			headers,
			controller.signal,
			priority,
		);
	}

	async delete(
		endpoint: string,
		headers?: Record<string, string>,
		timeout?: number,
		priority?: number,
	): Promise<any> {
		const controller = this.createTimeoutSignal(timeout || this.timeout);
		return this.executeRequest(
			endpoint,
			"DELETE",
			undefined,
			headers,
			controller.signal,
			priority,
		);
	}

	async validateResponse<T>(
		endpoint: string,
		schema: z.ZodSchema<T>,
		method: "GET" | "POST" | "PUT" | "DELETE",
		body?: any,
		headers?: Record<string, string>,
		timeout?: number,
		priority?: number,
	): Promise<T> {
		// @ts-ignore
		const data = await this[method.toLowerCase()](
			endpoint,
			body,
			headers,
			timeout,
			priority,
		);
		return schema.parse(data);
	}

	// Enhanced batch method with better parallelism and error handling
	async batch(
		requests: Array<{
			endpoint: string;
			method: "GET" | "POST" | "PUT" | "DELETE";
			body?: any;
			headers?: Record<string, string>;
			timeout?: number;
			priority?: number;
		}>,
	): Promise<any[]> {
		// Process in optimal batch sizes
		const results: any[] = [];
		const batchSize = Math.min(this.maxConcurrentRequests, requests.length);

		for (let index = 0; index < requests.length; index += batchSize) {
			const batch = requests.slice(index, index + batchSize);
			const promises = batch.map(request => {
				// @ts-ignore
				return this[request.method.toLowerCase()](
					request.endpoint,
					request.body,
					request.headers,
					request.timeout,
					request.priority,
				);
			});

			const batchResults = await Promise.allSettled(promises);
			results.push(...batchResults);
		}

		return results;
	}

	// New method for high-priority requests (bypass queue)
	async express(
		endpoint: string,
		method: "GET" | "POST" | "PUT" | "DELETE",
		body?: any,
		headers?: Record<string, string>,
		timeout?: number,
	): Promise<any> {
		await this.ensureValidToken();
		return this.executeRequestDirect(endpoint, method, body, headers);
	}

	// Performance and monitoring methods
	getMetrics() {
		return {
			...this.metrics,
			activeRequests: this.activeRequests.size,
			queuedRequests: this.requestQueue.length,
			cacheSize: this.cache.size,
			successRate:
				this.metrics.totalRequests > 0
					? (this.metrics.successfulRequests / this.metrics.totalRequests) * 100
					: 0,
		};
	}

	clearCache() {
		this.cache.clear();
	}

	getAuthState(): "valid" | "refreshing" | "invalid" {
		return this.authState;
	}

	clearQueue() {
		this.rejectQueuedRequests(new Error("Queue cleared"));
	}

	// Warm up connections
	async warmUp(endpoints: string[] = ["/health", "/ping"]) {
		const promises = endpoints.map(
			endpoint => this.get(endpoint).catch(() => {}), // Ignore failures
		);
		await Promise.allSettled(promises);
	}
}

// Optimized singleton with better configuration
export const apiClient = new ApiClient({
	baseUrl: process.env.BASE_URL_API_CALL || "http://localhost:8000",
	maxConcurrentRequests: 20,
	batchSize: 20,
	connectionPoolSize: 10,
	timeout: 30000,
});
