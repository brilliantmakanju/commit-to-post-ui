// import { z } from "zod";

// import { auth } from "@/auth";
// import { refreshToken } from "@/server-actions/auth/auth-actions";

// import {
// 	clearCookies,
// 	createEncryptedCookie,
// 	deleteCookie,
// 	updateCookie,
// } from "../cookies/create-cookies";
// import { getBaseUrl } from "./getbase-url";
// import { getAuthTokens } from "./gettokens";
// import { isTokenExpired } from "./tokens";
// import { validateEndpointAndMethod } from "./verify-endpoint";

// // Types
// export interface ApiClientConfig {
// 	readonly baseUrl: string;
// 	readonly defaultHeaders?: Readonly<Record<string, string>>;
// 	readonly timeout?: number;
// 	readonly maxConcurrentRequests?: number;
// 	readonly retryAttempts?: number;
// }

// export interface ApiResponse<T = unknown> {
// 	readonly status: number;
// 	readonly success: boolean;
// 	readonly data?: T;
// 	readonly error?: { readonly message: string };
// }

// interface QueuedRequest {
// 	readonly id: string;
// 	readonly endpoint: string;
// 	readonly method: HttpMethod;
// 	readonly body?: unknown;
// 	readonly headers?: Readonly<Record<string, string>>;
// 	readonly signal?: AbortSignal;
// 	readonly resolve: (value: ApiResponse) => void;
// 	readonly reject: (reason: Error) => void;
// 	readonly retryCount: number;
// 	readonly timestamp: number;
// }

// interface AuthTokens {
// 	readonly access_token?: string;
// 	readonly refresh_token?: string;
// }

// type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
// type AuthState = "valid" | "refreshing" | "invalid";

// // Enhanced metrics for monitoring
// interface Metrics {
// 	readonly totalRequests: number;
// 	readonly successfulRequests: number;
// 	readonly failedRequests: number;
// 	readonly averageResponseTime: number;
// 	readonly activeRequests: number;
// 	readonly queuedRequests: number;
// }

// export class ApiClient {
// 	private readonly baseUrl: string;
// 	private readonly timeout: number;
// 	private readonly defaultHeaders: Readonly<Record<string, string>>;
// 	private readonly maxConcurrentRequests: number;
// 	private readonly retryAttempts: number;

// 	// State management
// 	private refreshPromise?: Promise<boolean>;
// 	private readonly requestQueue: QueuedRequest[] = [];
// 	private readonly activeRequests = new Set<Promise<ApiResponse>>();
// 	private isProcessingQueue = false;
// 	private authState: AuthState = "valid";
// 	private requestIdCounter = 0;

// 	// Metrics
// 	private metrics = {
// 		totalRequests: 0,
// 		successfulRequests: 0,
// 		failedRequests: 0,
// 		averageResponseTime: 0,
// 	};

// 	constructor({
// 		baseUrl,
// 		defaultHeaders = {},
// 		timeout = 10000,
// 		maxConcurrentRequests = 12,
// 		retryAttempts = 2,
// 	}: ApiClientConfig) {
// 		this.baseUrl = baseUrl;
// 		this.defaultHeaders = Object.freeze({
// 			"Content-Type": "application/json",
// 			...defaultHeaders,
// 		});
// 		this.timeout = timeout;
// 		this.maxConcurrentRequests = maxConcurrentRequests;
// 		this.retryAttempts = retryAttempts;
// 	}

// 	// Token management
// 	private async getAuthTokens(): Promise<AuthTokens> {
// 		try {
// 			return await getAuthTokens();
// 		} catch {
// 			return {};
// 		}
// 	}

// 	private async getDynamicBaseUrl(): Promise<string> {
// 		try {
// 			const session = await auth();
// 			return session?.user ? getBaseUrl() : this.baseUrl;
// 		} catch {
// 			return this.baseUrl;
// 		}
// 	}

// 	private async getAuthHeaders(
// 		customHeaders: Readonly<Record<string, string>> = {},
// 	): Promise<Readonly<Record<string, string>>> {
// 		const tokens = await this.getAuthTokens();

// 		return Object.freeze({
// 			...this.defaultHeaders,
// 			...(tokens.access_token && {
// 				Authorization: `Bearer ${tokens.access_token}`,
// 			}),
// 			...(tokens.refresh_token && { "X-Refresh-Token": tokens.refresh_token }),
// 			...customHeaders,
// 		});
// 	}

// 	// Enhanced token validation and refresh
// 	private async ensureValidToken(): Promise<boolean> {
// 		const tokens = await this.getAuthTokens();

// 		if (!tokens.access_token) {
// 			this.authState = "invalid";
// 			return true; // Allow request without token
// 		}

// 		if (!isTokenExpired(tokens.access_token)) {
// 			this.authState = "valid";
// 			return true;
// 		}

// 		// Handle concurrent refresh attempts
// 		if (this.refreshPromise) {
// 			this.authState = "refreshing";
// 			return await this.refreshPromise;
// 		}

// 		return await this.performTokenRefresh();
// 	}

// 	private async performTokenRefresh(): Promise<boolean> {
// 		this.authState = "refreshing";

// 		try {
// 			this.refreshPromise = this.executeTokenRefresh();
// 			const result = await this.refreshPromise;

// 			this.authState = result ? "valid" : "invalid";
// 			this.refreshPromise = undefined;

// 			if (result && this.requestQueue.length > 0) {
// 				this.processQueue();
// 			}

// 			return result;
// 		} catch (error) {
// 			this.authState = "invalid";
// 			this.refreshPromise = undefined;
// 			this.rejectQueuedRequests(error as Error);
// 			throw error;
// 		}
// 	}

// 	private async executeTokenRefresh(): Promise<boolean> {
// 		try {
// 			const tokens = await this.getAuthTokens();

// 			if (!tokens.refresh_token) {
// 				await this.handleAuthFailure();
// 				return false;
// 			}

// 			const response = await refreshToken(tokens.refresh_token);

// 			if (response.success && response.data) {
// 				await updateCookie("cookie_state", {
// 					access_token: response.data.access_token,
// 					refresh_token: response.data.refresh_token,
// 				});
// 				return true;
// 			}

// 			await this.handleAuthFailure();
// 			return false;
// 		} catch {
// 			await this.handleAuthFailure();
// 			return false;
// 		}
// 	}

// 	private async handleAuthFailure(): Promise<void> {
// 		await clearCookies();
// 		this.authState = "invalid";

// 		if (typeof globalThis !== "undefined") {
// 			globalThis.dispatchEvent(
// 				new CustomEvent("auth:logout", {
// 					detail: { reason: "token_expired" },
// 				}),
// 			);
// 		}
// 	}

// 	// Queue management
// 	private async queueRequest(
// 		endpoint: string,
// 		method: HttpMethod,
// 		body?: unknown,
// 		headers?: Readonly<Record<string, string>>,
// 		signal?: AbortSignal,
// 	): Promise<ApiResponse> {
// 		return new Promise((resolve, reject) => {
// 			const request: QueuedRequest = {
// 				id: `${++this.requestIdCounter}`,
// 				endpoint,
// 				method,
// 				body,
// 				headers,
// 				signal,
// 				resolve,
// 				reject,
// 				retryCount: 0,
// 				timestamp: Date.now(),
// 			};

// 			this.requestQueue.push(request);

// 			if (!this.isProcessingQueue) {
// 				this.processQueue();
// 			}
// 		});
// 	}

// 	private async processQueue(): Promise<void> {
// 		if (this.isProcessingQueue || this.requestQueue.length === 0) {
// 			return;
// 		}

// 		this.isProcessingQueue = true;

// 		while (
// 			this.requestQueue.length > 0 &&
// 			this.activeRequests.size < this.maxConcurrentRequests
// 		) {
// 			const request = this.requestQueue.shift();
// 			if (!request) break;

// 			// Check if request was aborted
// 			if (request.signal?.aborted) {
// 				request.reject(new Error("Request aborted"));
// 				continue;
// 			}

// 			const requestPromise = this.executeRequestDirect(
// 				request.endpoint,
// 				request.method,
// 				request.body,
// 				request.headers,
// 				request.signal,
// 			).then(
// 				result => {
// 					this.activeRequests.delete(requestPromise);
// 					request.resolve(result);

// 					// Process next batch
// 					if (this.requestQueue.length > 0) {
// 						setImmediate(() => this.processQueue());
// 					}

// 					return result;
// 				},
// 				error => {
// 					this.activeRequests.delete(requestPromise);

// 					// Retry logic
// 					if (
// 						request.retryCount < this.retryAttempts &&
// 						this.shouldRetry(error)
// 					) {
// 						this.requestQueue.unshift({
// 							...request,
// 							retryCount: request.retryCount + 1,
// 						});
// 					} else {
// 						request.reject(error);
// 					}

// 					// Continue processing
// 					if (this.requestQueue.length > 0) {
// 						setImmediate(() => this.processQueue());
// 					}

// 					throw error;
// 				},
// 			);

// 			this.activeRequests.add(requestPromise);
// 		}

// 		this.isProcessingQueue = false;
// 	}

// 	private shouldRetry(error: unknown): boolean {
// 		if (error && typeof error === "object" && "status" in error) {
// 			const status = (error as { status: number }).status;
// 			return status >= 500 || status === 429; // Server errors or rate limiting
// 		}

// 		if (error instanceof Error) {
// 			const message = error.message.toLowerCase();
// 			return (
// 				message.includes("timeout") ||
// 				message.includes("network") ||
// 				message.includes("fetch")
// 			);
// 		}

// 		return false;
// 	}

// 	private rejectQueuedRequests(error: Error): void {
// 		while (this.requestQueue.length > 0) {
// 			const request = this.requestQueue.shift();
// 			if (request) {
// 				request.reject(error);
// 			}
// 		}
// 	}

// 	// Core request execution
// 	private async executeRequestDirect(
// 		endpoint: string,
// 		method: HttpMethod,
// 		body?: unknown,
// 		headers: Readonly<Record<string, string>> = {},
// 		signal?: AbortSignal,
// 	): Promise<ApiResponse> {
// 		const startTime = Date.now();
// 		this.metrics.totalRequests++;

// 		try {
// 			// Prepare request
// 			const dynamicBaseUrl = await this.getDynamicBaseUrl();
// 			const isValidEndpoint = await validateEndpointAndMethod(endpoint, method);
// 			const url = isValidEndpoint
// 				? `${this.baseUrl}${endpoint}`
// 				: `${dynamicBaseUrl}${endpoint}`;
// 			const requestHeaders = await this.getAuthHeaders(headers);

// 			await deleteCookie("throttled");

// 			// Create abort controller for timeout
// 			const controller = new AbortController();
// 			const timeoutId = setTimeout(() => controller.abort(), this.timeout);

// 			// Combine signals
// 			if (signal) {
// 				signal.addEventListener("abort", () => controller.abort());
// 			}

// 			// Execute request
// 			let response = await fetch(url, {
// 				method,
// 				headers: requestHeaders,
// 				body: body ? JSON.stringify(body) : undefined,
// 				signal: controller.signal,
// 				credentials: "include",
// 				cache: "no-store",
// 			});

// 			clearTimeout(timeoutId);

// 			// Handle 401 with retry
// 			if (response.status === 401) {
// 				response = await this.handleUnauthorizedRetry(
// 					endpoint,
// 					method,
// 					body,
// 					headers,
// 					controller.signal,
// 				);
// 			}

// 			// Parse response
// 			const responseData = await this.parseResponse(response);

// 			// Handle throttling
// 			if (this.isThrottleResponse(responseData)) {
// 				await this.handleThrottling(responseData);
// 			}

// 			// Handle auth failure
// 			if (this.isAuthFailureResponse(responseData)) {
// 				await this.handleAuthFailure();
// 			}

// 			const result: ApiResponse = response.ok
// 				? {
// 						status: response.status,
// 						success: true,
// 						data: responseData,
// 					}
// 				: {
// 						status: response.status,
// 						success: false,
// 						error: { message: this.extractErrorMessage(responseData) },
// 					};

// 			// Update metrics
// 			this.updateMetrics(response.ok, Date.now() - startTime);

// 			return result;
// 		} catch (error) {
// 			this.metrics.failedRequests++;

// 			const errorMessage =
// 				error instanceof Error
// 					? error.name === "AbortError"
// 						? "Request timeout or cancelled"
// 						: error.message
// 					: "Unknown error occurred";

// 			return {
// 				status: 0,
// 				success: false,
// 				error: { message: errorMessage },
// 			};
// 		}
// 	}

// 	private async parseResponse(response: Response): Promise<unknown> {
// 		try {
// 			return await response.json();
// 		} catch {
// 			return {};
// 		}
// 	}

// 	private isThrottleResponse(data: unknown): boolean {
// 		return Boolean(
// 			data &&
// 				typeof data === "object" &&
// 				"detail" in data &&
// 				typeof (data as { detail: unknown }).detail === "string" &&
// 				(data as { detail: string }).detail.includes("Request was throttled"),
// 		);
// 	}

// 	private isAuthFailureResponse(data: unknown): boolean {
// 		return Boolean(
// 			data &&
// 				typeof data === "object" &&
// 				"detail" in data &&
// 				(data as { detail: unknown }).detail ===
// 					"Authentication credentials were not provided.",
// 		);
// 	}

// 	private async handleThrottling(data: unknown): Promise<void> {
// 		if (this.isThrottleResponse(data)) {
// 			const detail = (data as { detail: string }).detail;
// 			const match = /in (\d+) seconds/.exec(detail);
// 			const waitTime = match?.[1];
// 			const errorMessage = waitTime
// 				? `Too many requests. Please try again in ${waitTime} seconds.`
// 				: "Too many requests. Please try again later.";

// 			await createEncryptedCookie("throttled", {
// 				waitTime,
// 				errorMessage,
// 			});
// 		}
// 	}

// 	private extractErrorMessage(data: unknown): string {
// 		if (data && typeof data === "object") {
// 			if (
// 				"message" in data &&
// 				typeof (data as { message: unknown }).message === "string"
// 			) {
// 				return (data as { message: string }).message;
// 			}
// 			if (
// 				"detail" in data &&
// 				typeof (data as { detail: unknown }).detail === "string"
// 			) {
// 				return (data as { detail: string }).detail;
// 			}
// 		}
// 		return "An error occurred";
// 	}

// 	private async handleUnauthorizedRetry(
// 		endpoint: string,
// 		method: HttpMethod,
// 		body?: unknown,
// 		headers?: Readonly<Record<string, string>>,
// 		signal?: AbortSignal,
// 	): Promise<Response> {
// 		try {
// 			const tokens = await this.getAuthTokens();
// 			const response = await refreshToken(tokens.refresh_token ?? "");

// 			if (response.success && response.data) {
// 				await updateCookie("cookie_state", {
// 					access_token: response.data.access_token,
// 					refresh_token: response.data.refresh_token,
// 				});

// 				const retryHeaders = await this.getAuthHeaders(headers);
// 				const dynamicBaseUrl = await this.getDynamicBaseUrl();

// 				return await fetch(`${dynamicBaseUrl}${endpoint}`, {
// 					method,
// 					headers: retryHeaders,
// 					body: body ? JSON.stringify(body) : undefined,
// 					signal,
// 					credentials: "include",
// 					cache: "no-store",
// 				});
// 			}

// 			throw new Error("Token refresh failed");
// 		} catch {
// 			await this.handleAuthFailure();
// 			throw new Error("Authentication failed");
// 		}
// 	}

// 	private updateMetrics(success: boolean, responseTime: number): void {
// 		if (success) {
// 			this.metrics.successfulRequests++;
// 		} else {
// 			this.metrics.failedRequests++;
// 		}

// 		// Calculate rolling average
// 		const totalResponses =
// 			this.metrics.successfulRequests + this.metrics.failedRequests;
// 		this.metrics.averageResponseTime =
// 			(this.metrics.averageResponseTime * (totalResponses - 1) + responseTime) /
// 			totalResponses;
// 	}

// 	// Main request orchestrator
// 	private async executeRequest(
// 		endpoint: string,
// 		method: HttpMethod,
// 		body?: unknown,
// 		headers?: Readonly<Record<string, string>>,
// 		signal?: AbortSignal,
// 	): Promise<ApiResponse> {
// 		// Queue requests during token refresh
// 		if (this.authState === "refreshing") {
// 			return this.queueRequest(endpoint, method, body, headers, signal);
// 		}

// 		try {
// 			await this.ensureValidToken();
// 		} catch (error) {
// 			return {
// 				status: 0,
// 				success: false,
// 				error: {
// 					message:
// 						error instanceof Error ? error.message : "Token validation failed",
// 				},
// 			};
// 		}

// 		// Execute directly if under concurrent limit, otherwise queue
// 		if (this.activeRequests.size >= this.maxConcurrentRequests) {
// 			return this.queueRequest(endpoint, method, body, headers, signal);
// 		}

// 		return this.executeRequestDirect(endpoint, method, body, headers, signal);
// 	}

// 	// Public API methods
// 	async get(
// 		endpoint: string,
// 		headers?: Readonly<Record<string, string>>,
// 		timeout?: number,
// 	): Promise<ApiResponse> {
// 		const controller = new AbortController();
// 		if (timeout) {
// 			setTimeout(() => controller.abort(), timeout);
// 		}

// 		return this.executeRequest(
// 			endpoint,
// 			"GET",
// 			undefined,
// 			headers,
// 			controller.signal,
// 		);
// 	}

// 	async post(
// 		endpoint: string,
// 		body: unknown,
// 		headers?: Readonly<Record<string, string>>,
// 		timeout?: number,
// 	): Promise<ApiResponse> {
// 		const controller = new AbortController();
// 		if (timeout) {
// 			setTimeout(() => controller.abort(), timeout);
// 		}

// 		return this.executeRequest(
// 			endpoint,
// 			"POST",
// 			body,
// 			headers,
// 			controller.signal,
// 		);
// 	}

// 	async put(
// 		endpoint: string,
// 		body: unknown,
// 		headers?: Readonly<Record<string, string>>,
// 		timeout?: number,
// 	): Promise<ApiResponse> {
// 		const controller = new AbortController();
// 		if (timeout) {
// 			setTimeout(() => controller.abort(), timeout);
// 		}

// 		return this.executeRequest(
// 			endpoint,
// 			"PUT",
// 			body,
// 			headers,
// 			controller.signal,
// 		);
// 	}

// 	async delete(
// 		endpoint: string,
// 		headers?: Readonly<Record<string, string>>,
// 		timeout?: number,
// 	): Promise<ApiResponse> {
// 		const controller = new AbortController();
// 		if (timeout) {
// 			setTimeout(() => controller.abort(), timeout);
// 		}

// 		return this.executeRequest(
// 			endpoint,
// 			"DELETE",
// 			undefined,
// 			headers,
// 			controller.signal,
// 		);
// 	}

// 	// Type-safe response validation
// 	async validateResponse<T>(
// 		endpoint: string,
// 		schema: z.ZodSchema<T>,
// 		method: HttpMethod,
// 		body?: unknown,
// 		headers?: Readonly<Record<string, string>>,
// 		timeout?: number,
// 	): Promise<T> {
// 		const methodMap = {
// 			GET: () => this.get(endpoint, headers, timeout),
// 			POST: () => this.post(endpoint, body, headers, timeout),
// 			PUT: () => this.put(endpoint, body, headers, timeout),
// 			DELETE: () => this.delete(endpoint, headers, timeout),
// 		};

// 		const response = await methodMap[method]();

// 		if (!response.success) {
// 			throw new Error(response.error?.message ?? "Request failed");
// 		}

// 		return schema.parse(response.data);
// 	}

// 	// Batch requests with optimal concurrency
// 	async batch(
// 		requests: ReadonlyArray<{
// 			readonly endpoint: string;
// 			readonly method: HttpMethod;
// 			readonly body?: unknown;
// 			readonly headers?: Readonly<Record<string, string>>;
// 			readonly timeout?: number;
// 		}>,
// 	): Promise<PromiseSettledResult<ApiResponse>[]> {
// 		const promises = requests.map(request => {
// 			const methodMap = {
// 				GET: () => this.get(request.endpoint, request.headers, request.timeout),
// 				POST: () =>
// 					this.post(
// 						request.endpoint,
// 						request.body,
// 						request.headers,
// 						request.timeout,
// 					),
// 				PUT: () =>
// 					this.put(
// 						request.endpoint,
// 						request.body,
// 						request.headers,
// 						request.timeout,
// 					),
// 				DELETE: () =>
// 					this.delete(request.endpoint, request.headers, request.timeout),
// 			};

// 			return methodMap[request.method]();
// 		});

// 		return Promise.allSettled(promises);
// 	}

// 	// High-priority bypass for critical requests
// 	async express(
// 		endpoint: string,
// 		method: HttpMethod,
// 		body?: unknown,
// 		headers?: Readonly<Record<string, string>>,
// 		timeout?: number,
// 	): Promise<ApiResponse> {
// 		await this.ensureValidToken();

// 		const controller = new AbortController();
// 		if (timeout) {
// 			setTimeout(() => controller.abort(), timeout);
// 		}

// 		return this.executeRequestDirect(
// 			endpoint,
// 			method,
// 			body,
// 			headers,
// 			controller.signal,
// 		);
// 	}

// 	// Utility methods
// 	getMetrics(): Metrics {
// 		const successRate =
// 			this.metrics.totalRequests > 0
// 				? (this.metrics.successfulRequests / this.metrics.totalRequests) * 100
// 				: 0;

// 		return {
// 			...this.metrics,
// 			activeRequests: this.activeRequests.size,
// 			queuedRequests: this.requestQueue.length,
// 			// successRate,
// 		} as const;
// 	}

// 	getAuthState(): AuthState {
// 		return this.authState;
// 	}

// 	clearQueue(): void {
// 		this.rejectQueuedRequests(new Error("Queue cleared by request"));
// 	}

// 	// Connection warmup
// 	async warmUp(
// 		endpoints: ReadonlyArray<string> = ["/health", "/ping"],
// 	): Promise<void> {
// 		const results = await Promise.allSettled(
// 			endpoints.map(endpoint => this.get(endpoint).catch(() => ({}))),
// 		);
// 		// Ignore results - warmup is fire-and-forget
// 	}
// }

// // Optimized singleton instance
// export const apiClient = new ApiClient({
// 	baseUrl: process.env.BASE_URL_API_CALL ?? "http://localhost:8000",
// 	maxConcurrentRequests: 12,
// 	retryAttempts: 2,
// 	timeout: 8000,
// });

// import { access } from "node:fs";

// import { z } from "zod";

// import { auth } from "@/auth";
// import { refreshToken } from "@/server-actions/auth/auth-actions";

// import {
// 	clearCookies,
// 	createEncryptedCookie,
// 	deleteCookie,
// 	updateCookie,
// } from "../cookies/create-cookies";
// import { getBaseUrl } from "./getbase-url";
// import { getAuthTokens } from "./gettokens";
// import { isTokenExpired } from "./tokens";
// import { validateEndpointAndMethod } from "./verify-endpoint";

// export interface ApiClientConfig {
// 	baseUrl: string;
// 	defaultHeaders?: Record<string, string>;
// 	timeout?: number;
// 	maxConcurrentRequests?: number;
// 	batchSize?: number;
// 	connectionPoolSize?: number;
// }

// export interface RequestQueueItem {
// 	id: string;
// 	endpoint: string;
// 	method: string;
// 	body?: any;
// 	headers?: Record<string, string>;
// 	signal?: AbortSignal;
// 	priority?: number;
// 	resolve: (value: any) => void;
// 	reject: (reason?: any) => void;
// 	timestamp: number;
// 	retryCount?: number;
// }

// export interface CacheEntry {
// 	data: any;
// 	timestamp: number;
// 	ttl: number;
// }

// export class ApiClient {
// 	private baseUrl: string;
// 	private timeout: number;
// 	private defaultHeaders: Record<string, string>;
// 	// eslint-disable-next-line unicorn/no-null
// 	private refreshPromise: Promise<boolean> | null = null;
// 	private requestQueue: RequestQueueItem[] = [];
// 	private activeRequests = new Map<string, Promise<any>>();
// 	private isProcessingQueue = false;
// 	private authState: "valid" | "refreshing" | "invalid" = "valid";
// 	private maxConcurrentRequests: number;
// 	private batchSize: number;
// 	private connectionPool: AbortController[] = [];
// 	private cache = new Map<string, CacheEntry>();
// 	private requestIdCounter = 0;

// 	// Performance monitoring
// 	private metrics = {
// 		totalRequests: 0,
// 		successfulRequests: 0,
// 		failedRequests: 0,
// 		averageResponseTime: 0,
// 		cacheHits: 0,
// 		cacheMisses: 0,
// 	};

// 	constructor({
// 		baseUrl,
// 		defaultHeaders = {},
// 		timeout = 10000,
// 		maxConcurrentRequests = 10,
// 		batchSize = 8,
// 		connectionPoolSize = 5,
// 	}: ApiClientConfig) {
// 		this.baseUrl = baseUrl;
// 		this.defaultHeaders = {
// 			"Content-Type": "application/json",
// 			...defaultHeaders,
// 		};
// 		this.timeout = timeout;
// 		this.maxConcurrentRequests = maxConcurrentRequests;
// 		this.batchSize = batchSize;

// 		// Pre-create connection pool
// 		this.initializeConnectionPool(connectionPoolSize);

// 		// Cleanup expired cache entries every 5 minutes
// 		setInterval(() => this.cleanupCache(), 5 * 60 * 1000);
// 	}

// 	private initializeConnectionPool(size: number) {
// 		for (let index = 0; index < size; index++) {
// 			this.connectionPool.push(new AbortController());
// 		}
// 	}

// 	private getAvailableController(): AbortController {
// 		let controller = this.connectionPool.find(c => !c.signal.aborted);
// 		if (!controller) {
// 			controller = new AbortController();
// 			this.connectionPool.push(controller);
// 		}
// 		return controller;
// 	}

// 	private generateCacheKey(
// 		endpoint: string,
// 		method: string,
// 		body?: any,
// 	): string {
// 		const bodyHash = body ? JSON.stringify(body) : "";
// 		return `${method}:${endpoint}:${bodyHash}`;
// 	}

// 	private getCachedResponse(key: string): any | null {
// 		// Always return null to disable caching
// 		this.metrics.cacheMisses++;
// 		return;
// 	}

// 	private setCachedResponse(
// 		key: string,
// 		data: any,
// 		ttl: number = 5 * 60 * 1000,
// 	) {
// 		// Do nothing to disable caching
// 		return;
// 	}

// 	private cleanupCache() {
// 		const now = Date.now();
// 		for (const [key, entry] of this.cache.entries()) {
// 			if (now - entry.timestamp > entry.ttl) {
// 				this.cache.delete(key);
// 			}
// 		}
// 	}

// 	private async getSessionToken() {
// 		const { access_token } = await getAuthTokens();
// 		return access_token || "";
// 	}

// 	private async getSessionRefreshToken() {
// 		const { refresh_token } = await getAuthTokens();
// 		return refresh_token || "";
// 	}

// 	private async getDynamicBaseUrl(): Promise<string> {
// 		const session = await auth();
// 		if (session?.user) {
// 			return getBaseUrl();
// 		}
// 		return this.baseUrl;
// 	}

// 	private mergeHeaders(customHeaders: Record<string, string> = {}) {
// 		return { ...this.defaultHeaders, ...customHeaders };
// 	}

// 	private createTimeoutSignal(timeout: number): AbortController {
// 		const controller = new AbortController();
// 		setTimeout(() => controller.abort(), timeout);
// 		return controller;
// 	}

// 	private async getAuthorizationHeader(headers: Record<string, string> = {}) {
// 		const token = await this.getSessionToken();
// 		const refreshtoken = await this.getSessionRefreshToken();

// 		return this.mergeHeaders({
// 			Authorization: token ? `Bearer ${token}` : "",
// 			"X-Refresh-Token": refreshtoken || "",
// 			...headers,
// 		});
// 	}

// 	// Enhanced token management with better concurrency
// 	private async ensureValidToken(): Promise<boolean> {
// 		const accessToken = await this.getSessionToken();

// 		if (!accessToken) {
// 			this.authState = "invalid";
// 			return true;
// 		}

// 		if (!isTokenExpired(accessToken)) {
// 			this.authState = "valid";
// 			return true;
// 		}

// 		// If already refreshing, wait for it
// 		if (this.refreshPromise) {
// 			this.authState = "refreshing";
// 			return await this.refreshPromise;
// 		}

// 		// Start refresh process
// 		this.authState = "refreshing";
// 		this.refreshPromise = this.performTokenRefresh();

// 		try {
// 			const result = await this.refreshPromise;
// 			// eslint-disable-next-line unicorn/no-null
// 			this.refreshPromise = null;
// 			this.authState = result ? "valid" : "invalid";

// 			if (result && this.requestQueue.length > 0) {
// 				this.processQueue();
// 			}

// 			return result;
// 		} catch (error) {
// 			// eslint-disable-next-line unicorn/no-null
// 			this.refreshPromise = null;
// 			this.authState = "invalid";
// 			this.rejectQueuedRequests(error);
// 			throw error;
// 		}
// 	}

// 	private async performTokenRefresh(): Promise<boolean> {
// 		try {
// 			const refreshtoken = await this.getSessionRefreshToken();

// 			if (!refreshtoken) {
// 				await this.handleAuthFailure();
// 				throw new Error("No refresh token available");
// 			}

// 			const response = await refreshToken(refreshtoken);

// 			if (response.success && response.data) {
// 				await updateCookie("cookie_state", {
// 					access_token: response.data.access_token,
// 					refresh_token: response.data.refresh_token,
// 				});
// 				return true;
// 			} else {
// 				await this.handleAuthFailure();
// 				throw new Error("Token refresh failed");
// 			}
// 		} catch {
// 			await this.handleAuthFailure();
// 			throw new Error("Authentication failed. Please login again.");
// 		}
// 	}

// 	private async handleAuthFailure() {
// 		await clearCookies();
// 		this.authState = "invalid";
// 		this.cache.clear(); // Clear cache on auth failure

// 		if (typeof globalThis !== "undefined") {
// 			globalThis.dispatchEvent(
// 				new CustomEvent("auth:logout", {
// 					detail: { reason: "token_expired" },
// 				}),
// 			);
// 		}
// 	}

// 	// Optimized queue management with priority and deduplication
// 	private async queueRequest(
// 		endpoint: string,
// 		method: string,
// 		body?: any,
// 		headers?: Record<string, string>,
// 		signal?: AbortSignal,
// 		priority: number = 0,
// 	): Promise<any> {
// 		const requestId = `${++this.requestIdCounter}`;
// 		// Remove deduplication to ensure fresh requests
// 		const dedupeKey = `${method}:${endpoint}:${JSON.stringify(body)}:${requestId}`;

// 		return new Promise((resolve, reject) => {
// 			this.requestQueue.push({
// 				id: requestId,
// 				endpoint,
// 				method,
// 				body,
// 				headers,
// 				signal,
// 				priority,
// 				resolve,
// 				reject,
// 				timestamp: Date.now(),
// 				retryCount: 0,
// 			});

// 			// Sort queue by priority (higher priority first)
// 			this.requestQueue.sort((a, b) => (b.priority || 0) - (a.priority || 0));

// 			if (!this.isProcessingQueue) {
// 				this.processQueue();
// 			}
// 		});
// 	}

// 	// Highly optimized queue processing with dynamic batching
// 	private async processQueue() {
// 		if (this.isProcessingQueue || this.requestQueue.length === 0) {
// 			return;
// 		}

// 		this.isProcessingQueue = true;

// 		while (this.requestQueue.length > 0) {
// 			const currentLoad = this.activeRequests.size;
// 			const availableSlots = Math.max(
// 				0,
// 				this.maxConcurrentRequests - currentLoad,
// 			);

// 			if (availableSlots === 0) {
// 				// Wait for some requests to complete
// 				await Promise.race(this.activeRequests.values());
// 				continue;
// 			}

// 			const batchSize = Math.min(
// 				availableSlots,
// 				this.batchSize,
// 				this.requestQueue.length,
// 			);
// 			const batch = this.requestQueue.splice(0, batchSize);

// 			// Execute batch with maximum parallelism
// 			const batchPromises = batch.map(async item => {
// 				// Remove deduplication to ensure fresh requests
// 				const dedupeKey = `${item.method}:${item.endpoint}:${JSON.stringify(item.body)}:${item.id}`;

// 				try {
// 					const requestPromise = this.executeRequestDirect(
// 						item.endpoint,
// 						item.method,
// 						item.body,
// 						item.headers,
// 						item.signal,
// 					);

// 					this.activeRequests.set(dedupeKey, requestPromise);
// 					const result = await requestPromise;

// 					this.activeRequests.delete(dedupeKey);
// 					item.resolve(result);
// 				} catch (error) {
// 					this.activeRequests.delete(dedupeKey);

// 					// Retry logic for failed requests
// 					if (item.retryCount! < 3 && this.shouldRetry(error)) {
// 						item.retryCount = (item.retryCount || 0) + 1;
// 						this.requestQueue.unshift(item); // Add back to front for retry
// 					} else {
// 						item.reject(error);
// 					}
// 				}
// 			});

// 			// Don't wait for all to complete, continue processing
// 			Promise.allSettled(batchPromises);

// 			// Small delay to prevent overwhelming
// 			if (this.requestQueue.length > 0) {
// 				await new Promise(resolve => setTimeout(resolve, 10));
// 			}
// 		}

// 		this.isProcessingQueue = false;
// 	}

// 	private shouldRetry(error: any): boolean {
// 		if (error?.status >= 500) return true; // Server errors
// 		if (error?.message?.includes("timeout")) return true;
// 		if (error?.message?.includes("network")) return true;
// 		return false;
// 	}

// 	private rejectQueuedRequests(error: any) {
// 		while (this.requestQueue.length > 0) {
// 			const item = this.requestQueue.shift()!;
// 			item.reject(error);
// 		}
// 		this.activeRequests.clear();
// 	}

// 	private async executeRequestDirect(
// 		endpoint: string,
// 		method: string,
// 		body?: any,
// 		headers: Record<string, string> = {},
// 		signal?: AbortSignal,
// 	): Promise<any> {
// 		const startTime = Date.now();
// 		this.metrics.totalRequests++;

// 		// Skip cache check completely - always make fresh requests
// 		this.metrics.cacheMisses++;

// 		const dynamicBaseUrl = await this.getDynamicBaseUrl();
// 		const endpointRegulation = await validateEndpointAndMethod(
// 			endpoint,
// 			method,
// 		);
// 		const url = endpointRegulation
// 			? `${this.baseUrl}${endpoint}`
// 			: `${dynamicBaseUrl}${endpoint}`;
// 		const mergedHeader = await this.getAuthorizationHeader(headers);

// 		await deleteCookie("throttled");

// 		try {
// 			// Use connection pooling for better performance
// 			const controller = signal
// 				? new AbortController()
// 				: this.getAvailableController();
// 			if (signal) {
// 				signal.addEventListener("abort", () => controller.abort());
// 			}

// 			let response = await fetch(url, {
// 				method,
// 				headers: mergedHeader,
// 				body: body ? JSON.stringify(body) : undefined,
// 				signal: controller.signal,
// 				credentials: "include",
// 				// Disable all caching
// 				cache: "no-store",
// 			});

// 			if (response.status === 401) {
// 				response = await this.handleUnauthorizedError(
// 					endpoint,
// 					method,
// 					body,
// 					headers,
// 					controller.signal,
// 				);
// 			}

// 			const responseBody = await response.json().catch(() => ({}));

// 			// Handle throttling
// 			if (responseBody?.detail?.includes("Request was throttled")) {
// 				const regex = /in (\d+) seconds/;
// 				const match = regex.exec(responseBody.detail);
// 				const waitTime = match ? match[1] : undefined;
// 				const errorMessage = waitTime
// 					? `Too many requests. Please try again in ${waitTime} seconds.`
// 					: "Too many requests. Please try again later.";
// 				await createEncryptedCookie("throttled", {
// 					waitTime: waitTime,
// 					errorMessage: errorMessage,
// 				});
// 			}

// 			if (
// 				responseBody?.detail === "Authentication credentials were not provided."
// 			) {
// 				await this.handleAuthFailure();
// 			}

// 			const result = response.ok
// 				? {
// 						status: response.status,
// 						success: true,
// 						data: responseBody,
// 					}
// 				: {
// 						status: response.status,
// 						success: false,
// 						error: responseBody || { message: response.statusText },
// 					};

// 			// Skip caching completely - don't cache any responses

// 			// Update metrics
// 			const responseTime = Date.now() - startTime;
// 			this.metrics.averageResponseTime =
// 				(this.metrics.averageResponseTime + responseTime) / 2;

// 			if (response.ok) {
// 				this.metrics.successfulRequests++;
// 			} else {
// 				this.metrics.failedRequests++;
// 			}

// 			return result;
// 		} catch (error: any) {
// 			this.metrics.failedRequests++;

// 			return {
// 				success: false,
// 				error: {
// 					message:
// 						error.name === "AbortError"
// 							? "Request aborted due to timeout or cancellation."
// 							: error.message || "An unexpected error occurred.",
// 				},
// 			};
// 		}
// 	}

// 	private async executeRequest(
// 		endpoint: string,
// 		method: string,
// 		body?: any,
// 		headers: Record<string, string> = {},
// 		signal?: AbortSignal,
// 		priority?: number,
// 	): Promise<any> {
// 		// If token is being refreshed, queue the request
// 		if (this.authState === "refreshing") {
// 			return this.queueRequest(
// 				endpoint,
// 				method,
// 				body,
// 				headers,
// 				signal,
// 				priority,
// 			);
// 		}

// 		try {
// 			await this.ensureValidToken();
// 		} catch (error: any) {
// 			return {
// 				success: false,
// 				error: {
// 					message: error.message || "Token refresh failed",
// 				},
// 			};
// 		}

// 		return this.executeRequestDirect(endpoint, method, body, headers, signal);
// 	}

// 	private async handleUnauthorizedError(
// 		endpoint: string,
// 		method: string,
// 		body?: any,
// 		headers?: Record<string, string>,
// 		signal?: AbortSignal,
// 	) {
// 		try {
// 			const refreshtoken = await this.getSessionRefreshToken();
// 			const response = await refreshToken(refreshtoken);

// 			if (response.success && response.data) {
// 				await updateCookie("cookie_state", {
// 					access_token: response.data.access_token,
// 					refresh_token: response.data.refresh_token,
// 				});

// 				const retryHeaders = await this.getAuthorizationHeader(headers);
// 				return await fetch(`${await this.getDynamicBaseUrl()}${endpoint}`, {
// 					method,
// 					headers: retryHeaders,
// 					body: body ? JSON.stringify(body) : undefined,
// 					signal,
// 					credentials: "include",
// 				});
// 			} else {
// 				await this.handleAuthFailure();
// 				throw new Error("Token refresh failed");
// 			}
// 		} catch {
// 			await this.handleAuthFailure();
// 			throw new Error("Authentication failed. Please login again.");
// 		}
// 	}

// 	// Enhanced public methods with priority support
// 	async get(
// 		endpoint: string,
// 		headers?: Record<string, string>,
// 		timeout?: number,
// 		priority?: number,
// 	): Promise<any> {
// 		const controller = this.createTimeoutSignal(timeout || this.timeout);
// 		return this.executeRequest(
// 			endpoint,
// 			"GET",
// 			undefined,
// 			headers,
// 			controller.signal,
// 			priority,
// 		);
// 	}

// 	async post(
// 		endpoint: string,
// 		body: any,
// 		headers?: Record<string, string>,
// 		timeout?: number,
// 		priority?: number,
// 	): Promise<any> {
// 		const controller = this.createTimeoutSignal(timeout || this.timeout);
// 		return this.executeRequest(
// 			endpoint,
// 			"POST",
// 			body,
// 			headers,
// 			controller.signal,
// 			priority,
// 		);
// 	}

// 	async put(
// 		endpoint: string,
// 		body: any,
// 		headers?: Record<string, string>,
// 		timeout?: number,
// 		priority?: number,
// 	): Promise<any> {
// 		const controller = this.createTimeoutSignal(timeout || this.timeout);
// 		return this.executeRequest(
// 			endpoint,
// 			"PUT",
// 			body,
// 			headers,
// 			controller.signal,
// 			priority,
// 		);
// 	}

// 	async delete(
// 		endpoint: string,
// 		headers?: Record<string, string>,
// 		timeout?: number,
// 		priority?: number,
// 	): Promise<any> {
// 		const controller = this.createTimeoutSignal(timeout || this.timeout);
// 		return this.executeRequest(
// 			endpoint,
// 			"DELETE",
// 			undefined,
// 			headers,
// 			controller.signal,
// 			priority,
// 		);
// 	}

// 	async validateResponse<T>(
// 		endpoint: string,
// 		schema: z.ZodSchema<T>,
// 		method: "GET" | "POST" | "PUT" | "DELETE",
// 		body?: any,
// 		headers?: Record<string, string>,
// 		timeout?: number,
// 		priority?: number,
// 	): Promise<T> {
// 		// @ts-ignore
// 		const data = await this[method.toLowerCase()](
// 			endpoint,
// 			body,
// 			headers,
// 			timeout,
// 			priority,
// 		);
// 		return schema.parse(data);
// 	}

// 	// Enhanced batch method with better parallelism and error handling
// 	async batch(
// 		requests: Array<{
// 			endpoint: string;
// 			method: "GET" | "POST" | "PUT" | "DELETE";
// 			body?: any;
// 			headers?: Record<string, string>;
// 			timeout?: number;
// 			priority?: number;
// 		}>,
// 	): Promise<any[]> {
// 		// Process in optimal batch sizes
// 		const results: any[] = [];
// 		const batchSize = Math.min(this.maxConcurrentRequests, requests.length);

// 		for (let index = 0; index < requests.length; index += batchSize) {
// 			const batch = requests.slice(index, index + batchSize);
// 			const promises = batch.map(request => {
// 				// @ts-ignore
// 				return this[request.method.toLowerCase()](
// 					request.endpoint,
// 					request.body,
// 					request.headers,
// 					request.timeout,
// 					request.priority,
// 				);
// 			});

// 			const batchResults = await Promise.allSettled(promises);
// 			results.push(...batchResults);
// 		}

// 		return results;
// 	}

// 	// New method for high-priority requests (bypass queue)
// 	async express(
// 		endpoint: string,
// 		method: "GET" | "POST" | "PUT" | "DELETE",
// 		body?: any,
// 		headers?: Record<string, string>,
// 		timeout?: number,
// 	): Promise<any> {
// 		await this.ensureValidToken();
// 		return this.executeRequestDirect(endpoint, method, body, headers);
// 	}

// 	// Performance and monitoring methods
// 	getMetrics() {
// 		return {
// 			...this.metrics,
// 			activeRequests: this.activeRequests.size,
// 			queuedRequests: this.requestQueue.length,
// 			cacheSize: this.cache.size,
// 			successRate:
// 				this.metrics.totalRequests > 0
// 					? (this.metrics.successfulRequests / this.metrics.totalRequests) * 100
// 					: 0,
// 		};
// 	}

// 	clearCache() {
// 		this.cache.clear();
// 	}

// 	getAuthState(): "valid" | "refreshing" | "invalid" {
// 		return this.authState;
// 	}

// 	clearQueue() {
// 		this.rejectQueuedRequests(new Error("Queue cleared"));
// 	}

// 	// Warm up connections
// 	async warmUp(endpoints: string[] = ["/health", "/ping"]) {
// 		const promises = endpoints.map(
// 			endpoint => this.get(endpoint).catch(() => {}), // Ignore failures
// 		);
// 		await Promise.allSettled(promises);
// 	}
// }

// // Optimized singleton with better configuration
// export const apiClient = new ApiClient({
// 	baseUrl: process.env.BASE_URL_API_CALL || "http://localhost:8000",
// 	maxConcurrentRequests: 15,
// 	batchSize: 10,
// 	connectionPoolSize: 8,
// 	timeout: 8000,
// });

//Mutiple parrelt with cache

import { access } from "node:fs";

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
