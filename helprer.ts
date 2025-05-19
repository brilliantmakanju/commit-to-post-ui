/* eslint-disable unicorn/no-empty-file */

// import { getDecryptedCookie } from "@/lib/cookies/getcookies";
// import { PROTECTED_SUB_ROUTES, PUBLIC_ROUTES } from "@/lib/routes";

// import { auth } from "./auth";
// import { getBaseUrl } from "./lib/utils/getbase-url";

// /**
//  * Middleware to handle multi-tenant authentication and routing
//  */
// export default auth(async request => {
// 	const isLoggedIn = !!request.auth;
// 	const { nextUrl } = request;
// 	const hostname = nextUrl.hostname;
// 	// console.log(request.headers, "hostname");

// 	// Get the base URL for API calls
// 	const baseUrl = await getBaseUrl();
// 	console.log(baseUrl, "base url");

// 	// Check if the current route is public or protected
// 	const isPublicRoute = PUBLIC_ROUTES.some(route =>
// 		nextUrl.pathname.startsWith(route),
// 	);
// 	const isProtectedRoute = PROTECTED_SUB_ROUTES.some(route =>
// 		nextUrl.pathname.startsWith(route),
// 	);

// 	// Get user state and organization info from cookies
// 	const sessionData = await getDecryptedCookie("user_state");
// 	const organizationData = await getDecryptedCookie("organization");
// 	const isNewUser = sessionData?.new_user || false;

// 	// More precise domain checking
// 	// Only these exact hostnames are considered main domains
// 	const mainDomains = ["commit.jolexhive.com", "localhost", "localhost:3000"];
// 	const isMainDomain = mainDomains.includes(baseUrl);

// 	// Check if this is a subdomain (contains dots but is not a main domain)
// 	const hasDots = baseUrl.includes(".") && !baseUrl.endsWith(".localhost:3000");
// 	const isTenantDomain = hasDots && !isMainDomain;

// 	console.log(
// 		`Domain checks: isMainDomain=${isMainDomain}, isTenantDomain=${isTenantDomain}`,
// 	);

// 	// Handle tenant domain requests
// 	if (isTenantDomain) {
// 		// Extract tenant info from hostname
// 		const tenantDomain = hostname;
// 		console.log(`Tenant domain detected: ${tenantDomain}`);
// 		// Verify tenant exists by checking with backend
// 		try {
// 			// Extract access token safely using type assertion
// 			const authSession = request.auth as any;
// 			const accessToken = authSession?.accessToken || "";

// 			const tenantCheckResponse = await fetch(
// 				`${baseUrl}/api/tenants/verify?domain=${tenantDomain}`,
// 				{
// 					headers: {
// 						"Content-Type": "application/json",
// 						// Include auth token if user is logged in and token exists
// 						...(isLoggedIn && accessToken
// 							? { Authorization: `Bearer ${accessToken}` }
// 							: {}),
// 					},
// 					cache: "no-store",
// 				},
// 			);

// 			// If tenant doesn't exist or is invalid, redirect to main landing page
// 			if (!tenantCheckResponse.ok) {
// 				return Response.redirect(new URL("/", "https://commit.jolexhive.com"));
// 			}
// 		} catch {
// 			// On any error, redirect to main landing page
// 			return Response.redirect(new URL("/", "https://commit.jolexhive.com"));
// 		}
// 	}

// 	// Redirect logic for new logged-in users without an organization
// 	if (isLoggedIn && isNewUser && !nextUrl.pathname.startsWith("/setup")) {
// 		return Response.redirect(new URL("/setup", nextUrl));
// 	}

// 	// Redirect non-new users away from setup page
// 	if (isLoggedIn && !isNewUser && nextUrl.pathname.startsWith("/setup")) {
// 		return Response.redirect(new URL("/dashboard", nextUrl));
// 	}

// 	// Redirect logic for logged-in users accessing public routes
// 	if (isPublicRoute && isLoggedIn) {
// 		return Response.redirect(new URL("/dashboard", nextUrl));
// 	}

// 	// Redirect logic for unauthenticated users trying to access protected routes
// 	if (!isLoggedIn && isProtectedRoute) {
// 		// Redirect to landing page instead of auth page
// 		return Response.redirect(new URL("/", nextUrl));
// 	}

// 	// Match user's organization with current domain for multi-tenant access control
// 	if (isLoggedIn && organizationData?.domain && !isMainDomain) {
// 		const currentDomain = hostname;
// 		// Ensure domain is treated as a string
// 		const userOrgDomain = String(organizationData.domain || "");

// 		// Only proceed with domain check if we have a valid domain string
// 		if (
// 			userOrgDomain &&
// 			userOrgDomain.length > 0 && // If user is trying to access a different organization's domain
// 			currentDomain !== userOrgDomain &&
// 			!currentDomain.includes(userOrgDomain)
// 		) {
// 			// Either redirect to their organization or to the main landing page
// 			return Response.redirect(new URL("/", `https://${userOrgDomain}`));
// 		}
// 	}

// 	// Allow access for other cases
// 	return;
// });

// export const config = {
// 	matcher: [
// 		// eslint-disable-next-line unicorn/prefer-string-raw
// 		"/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
// 		"/(api|trpc)(.*)",
// 	],
// };

"use server";
// import { headers } from "next/headers";

// import { getDecryptedCookie } from "@/lib/cookies/getcookies";

// /**
//  * Gets the base URL for API calls based on tenant domain, organization domain or environment variables
//  *
//  * Priority:
//  * 1. Current request hostname (for multi-tenant access)
//  * 2. Organization domain from cookie (with port 8000 in dev)
//  * 3. BASE_URL_API_CALL environment variable
//  * 4. Default http://localhost:8000
//  *
//  * @returns {Promise<string>} The base URL to use for API calls
//  */
// export async function getBaseUrl(): Promise<string> {
// 	try {
// 		// First try to get the current hostname from the request
// 		const headersList = await headers();
// 		const host = headersList.get("host");
// 		const referer = headersList.get("referer");

// 		// Extract hostname from host header or referer
// 		let currentHostname: string | undefined = undefined;
// 		if (host) {
// 			currentHostname = host.split(":")[0]; // Remove port if present
// 		} else if (referer) {
// 			try {
// 				const url = new URL(referer);
// 				currentHostname = url.hostname;
// 			} catch {
// 				// Invalid URL in referer, ignore
// 			}
// 		}
// 		// If currentHostname is not localhost or commit.jolexhive.com, it might be a tenant domain
// 		if (
// 			currentHostname &&
// 			currentHostname !== "localhost" &&
// 			!currentHostname.includes("localhost:") &&
// 			currentHostname !== "commit.jolexhive.com"
// 		) {
// 			// This could be a tenant domain, use it for API calls
// 			const baseUrlForTenant =
// 				process.env.NODE_ENV === "development"
// 					? `http://${currentHostname}:8000`
// 					: `https://${currentHostname}`;
// 			return baseUrlForTenant;
// 		}

// 		// Get organization details from encrypted cookie as fallback
// 		const organization = await getDecryptedCookie("organization");

// 		// Extract domain from organization
// 		const orgDomain = organization?.domain;

// 		// If an organization domain exists, construct the URL
// 		let domainWithPort: string | undefined;
// 		if (orgDomain) {
// 			domainWithPort =
// 				process.env.NODE_ENV === "development"
// 					? `http://${orgDomain}:8000`
// 					: `https://${orgDomain}`;
// 		}

// 		// Return the first available URL: the constructed domain, an environment variable, or localhost
// 		const baseUrl =
// 			domainWithPort ||
// 			process.env.BASE_URL_API_CALL ||
// 			"http://localhost:8000";

// 		return baseUrl;
// 	} catch {
// 		// If any error occurs, fallback to the environment variable or localhost
// 		return process.env.BASE_URL_API_CALL || "http://localhost:8000";
// 	}
// }

// if (isFetching) {
// 	return (
// 		<Sidebar variant="inset" {...props}>
// 			<SidebarHeader>
// 				<TeamSwitcher teams={[]} isLoading={isFetching} />
// 			</SidebarHeader>
// 			<SidebarContent>
// 				<NavMain items={[]} isLoading={isFetching} />
// 			</SidebarContent>
// 		</Sidebar>
// 	);
// }

// const domain = await getDecryptedCookie("organization");
// // If there's no stored organization, set the first available one
// if (domain?.domain === undefined) {
// 	useorganizationStore.setOrganization(result.organizations[0]);

// 	// Store the organization in cookies
// 	await createEncryptedCookie("organization", {
// 		domain: result.organizations[0].domains[0],
// 	});
// 	// Fetch and Invalidate Core Data
// 	queryClient.fetchQuery({ queryKey: ["organization-ownership"] });
// 	queryClient.invalidateQueries({
// 		queryKey: ["organization-ownership"],
// 	});

// 	queryClient.fetchQuery({ queryKey: ["retrieving_webhooks"] });
// 	queryClient.invalidateQueries({ queryKey: ["retrieving_webhooks"] });

// 	queryClient.fetchQuery({ queryKey: ["retrieving_social_status"] });
// 	queryClient.invalidateQueries({
// 		queryKey: ["retrieving_social_status"],
// 	});

// 	// Fetch and Invalidate Metrics
// 	queryClient.fetchQuery({ queryKey: ["dashboard_metrics"] });
// 	queryClient.invalidateQueries({ queryKey: ["dashboard_metrics"] });

// 	queryClient.fetchQuery({ queryKey: ["upcoming_posts_metrics"] });
// 	queryClient.invalidateQueries({
// 		queryKey: ["upcoming_posts_metrics"],
// 	});

// 	// Fetch and Invalidate Posts
// 	queryClient.fetchQuery({ queryKey: ["posts"] });
// 	queryClient.invalidateQueries({ queryKey: ["posts"] });

// 	// Fetch and Invalidate Notifications
// 	queryClient.fetchQuery({ queryKey: ["notifications"] });
// 	queryClient.invalidateQueries({ queryKey: ["notifications"] });

// 	queryClient.fetchQuery({ queryKey: ["recent_notifications"] });
// 	queryClient.invalidateQueries({ queryKey: ["recent_notifications"] });

// 	return result.organizations;
// } else {
// 	return result.organizations;
// }

// const data = {
// 	navMain: [
// 		{
// 			title: "Dashboard",
// 			url: "/dashboard",
// 			icon: SquareTerminal,
// 			isActive: true,
// 			items: [],
// 		},
// 		{
// 			title: "Post",
// 			url: "/posts",
// 			icon: Bot,
// 			items: [],
// 		},
// 		{
// 			title: "Notifications",
// 			url: "/notifications",
// 			icon: BellDotIcon,
// 			items: [],
// 		},
// 		// {
// 		// 	title: "Billing",
// 		// 	url: "#",
// 		// 	icon: WalletMinimal,
// 		// 	items: [],
// 		// },
// 		// {
// 		// 	title: "Resources",
// 		// 	url: "#",
// 		// 	icon: BookOpen,
// 		// 	items: [
// 		// 		{
// 		// 			title: "FAQs",
// 		// 			url: "#",
// 		// 		},
// 		// 		{
// 		// 			title: "How-To Guides",
// 		// 			url: "#",
// 		// 		},
// 		// 	],
// 		// },
// 		{
// 			title: "Settings",
// 			url: "/settings",
// 			icon: Settings2,
// 			items: [
// 				// {
// 				// 	title: "General",
// 				// 	url: "settings?tab=general",
// 				// },
// 				// {
// 				// 	title: "Billing",
// 				// 	url: "settings?tab=billing",
// 				// },
// 				// {
// 				// 	title: "Profile",
// 				// 	url: "settings?tab=profile",
// 				// },
// 			],
// 		},
// 	],
// };
