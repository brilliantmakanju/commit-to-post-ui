import { getDecryptedCookie } from "@/lib/cookies/getcookies";
import { PROTECTED_SUB_ROUTES, PUBLIC_ROUTES } from "@/lib/routes";

import { auth } from "./auth";

// Route constants for better maintainability
const ROUTES = {
	HOME: "/",
	START: "/start",
	DASHBOARD: "/dashboard",
	SIGNOUT: "/api/auth/signout?callbackUrl=/",
} as const;

/**
 * Middleware to handle authentication, session validation, and route protection
 */
// @ts-ignore
export default auth(async request => {
	const { nextUrl } = request;
	const pathname = nextUrl.pathname;

	// Early exit for API routes - let them handle their own logic
	if (pathname.startsWith("/api/")) {
		return;
	}

	// Early exit for static assets (covered by matcher, but extra safety)
	if (pathname.startsWith("/_next/") || pathname.includes(".")) {
		return;
	}

	const isLoggedIn = !!request.auth;

	// --- Session validation ---
	const hasValidSession = Boolean(
		request.auth?.user?.email &&
			request.auth?.expires &&
			new Date(request.auth.expires) > new Date(),
	);

	// --- Route classification ---
	const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));
	const isProtectedRoute = PROTECTED_SUB_ROUTES.some(route =>
		pathname.startsWith(route),
	);
	const isStartRoute = pathname.startsWith(ROUTES.START);
	const isDashboard = pathname.startsWith(ROUTES.DASHBOARD);

	// --- 1. Handle expired/invalid sessions ---
	if (isLoggedIn && !hasValidSession) {
		return Response.redirect(new URL(ROUTES.SIGNOUT, request.url));
	}

	// --- 2. Handle authenticated users ---
	if (isLoggedIn && hasValidSession) {
		// Get user state for onboarding check
		const sessionData = await getDecryptedCookie("user_state");
		const isNewUser = sessionData?.new_user || false;

		// Block completed users from accessing onboarding
		if (!isNewUser && isStartRoute) {
			return Response.redirect(new URL(ROUTES.DASHBOARD, request.url));
		}

		// Redirect authenticated users from public routes to dashboard
		if (isPublicRoute && !isDashboard) {
			return Response.redirect(new URL(ROUTES.DASHBOARD, request.url));
		}
	}

	// --- 3. Handle unauthenticated users ---
	if (!isLoggedIn && isProtectedRoute) {
		// Store the attempted URL to redirect back after login
		const loginUrl = new URL(ROUTES.HOME, request.url);
		loginUrl.searchParams.set("callbackUrl", pathname);
		return Response.redirect(loginUrl);
	}

	// --- Allow access ---
	return;
});

export const config = {
	matcher: [
		/*
		 * Match all request paths except for:
		 * - _next/static (static files)
		 * - _next/image (image optimization)
		 * - favicon.ico, sitemap.xml, robots.txt (metadata files)
		 * - files with extensions (e.g., .png, .jpg, .css, .js)
		 */
		// eslint-disable-next-line unicorn/prefer-string-raw
		"/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*$).*)",
	],
};
