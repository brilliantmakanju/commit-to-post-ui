import { getDecryptedCookie } from "@/lib/cookies/getcookies";
import { PROTECTED_SUB_ROUTES, PUBLIC_ROUTES } from "@/lib/routes";

import { auth } from "./auth";

// @ts-ignore
export default auth(async request => {
	const isLoggedIn = !!request.auth;
	const { nextUrl } = request;

	// Check if the current route is public or protected
	const isPublicRoute = PUBLIC_ROUTES.some(route =>
		nextUrl.pathname.startsWith(route),
	);
	const isProtectedRoute = PROTECTED_SUB_ROUTES.some(route =>
		nextUrl.pathname.startsWith(route),
	);

	// Check the new_user status from the cookie
	const sessionData = await getDecryptedCookie("user_state");
	const isNewUser = sessionData?.new_user || false; // Default to false if not found

	// Redirect logic for new logged-in users without an organization
	if (isLoggedIn && isNewUser && !request.url.includes("/setup")) {
		return Response.redirect(new URL("/setup", request.url));
	}

	// Redirect non-new users away from setup page
	if (isLoggedIn && !isNewUser && request.url.includes("/setup")) {
		return Response.redirect(new URL("/dashboard", request.url));
	}

	// Redirect logic for logged-in users accessing public routes
	if (isPublicRoute && isLoggedIn) {
		return Response.redirect(new URL("/dashboard", nextUrl));
	}

	// Redirect logic for unauthenticated users trying to access protected routes
	if (!isLoggedIn && isProtectedRoute) {
		return Response.redirect(new URL("/", nextUrl));
		// return Response.redirect(new URL("/auth?view=login", nextUrl));
	}

	// Allow access for other cases
	return;
});

export const config = {
	matcher: [
		// eslint-disable-next-line unicorn/prefer-string-raw
		"/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
		"/(api|trpc)(.*)",
	],
};
