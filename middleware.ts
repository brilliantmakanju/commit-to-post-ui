import { getDecryptedCookie } from "@/lib/cookies/getcookies";
import { PROTECTED_SUB_ROUTES, PUBLIC_ROUTES } from "@/lib/routes";

import { auth } from "./auth";

// @ts-ignore
export default auth(async request => {
	const isLoggedIn = !!request.auth;
	const { nextUrl } = request;

	// --- Cookies ---
	const cookieOrg = await getDecryptedCookie("organization");
	const hasOrgFromCookie = !!cookieOrg?.domain;

	const sessionData = await getDecryptedCookie("user_state");
	const isNewUser = sessionData?.new_user || false;

	// --- Session validation ---
	const hasValidSession =
		request.auth?.user?.email &&
		request.auth?.expires &&
		new Date(request.auth.expires) > new Date();

	// --- Route checks ---
	const isPublicRoute = PUBLIC_ROUTES.some(route =>
		nextUrl.pathname.startsWith(route),
	);
	const isProtectedRoute = PROTECTED_SUB_ROUTES.some(route =>
		nextUrl.pathname.startsWith(route),
	);

	const isWorkspaceRoute = nextUrl.pathname.startsWith("/workspace");

	// --- Expired/invalid session ---
	if (isLoggedIn && !hasValidSession) {
		return Response.redirect(
			new URL("/api/auth/signout?callbackUrl=/", request.url),
		);
	}

	// --- No organization: send to workspace (skip if already on workspace) ---
	if (isLoggedIn && hasValidSession && !hasOrgFromCookie && !isWorkspaceRoute) {
		return Response.redirect(new URL("/workspace", request.url));
	}

	// --- Block non-new users from onboarding ---
	if (
		isLoggedIn &&
		hasValidSession &&
		!isNewUser &&
		nextUrl.pathname.startsWith("/start")
	) {
		return Response.redirect(new URL("/dashboard", request.url));
	}

	// --- Public route redirect to dashboard ---
	if (
		isPublicRoute &&
		isLoggedIn &&
		hasValidSession &&
		!nextUrl.pathname.startsWith("/dashboard")
	) {
		return Response.redirect(new URL("/dashboard", nextUrl));
	}

	// --- Unauthenticated trying to access protected route ---
	if (!isLoggedIn && isProtectedRoute) {
		return Response.redirect(new URL("/", nextUrl));
		// return Response.redirect(new URL("/auth?view=login", nextUrl));
	}

	// --- Default: allow access ---
	return;
});

export const config = {
	matcher: [
		// eslint-disable-next-line unicorn/prefer-string-raw
		"/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
		"/(api|trpc)(.*)",
	],
};
