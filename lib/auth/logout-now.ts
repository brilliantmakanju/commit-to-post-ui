"use client";

import { clearCookies } from "@/lib/cookies/create-cookies";
import { signOut } from "@/server-actions/auth/signout";
import useLogoutStore from "@/zustand/logout-store";
import useOrganizationStore from "@/zustand/useorganization-store";
import useUserStore from "@/zustand/useuser-store";

export const logoutNow = async (): Promise<void> => {
	const { setLogout } = useLogoutStore.getState();
	const { clearUser } = useUserStore.getState();
	const { clearOrganization } = useOrganizationStore.getState();

	setLogout(true);
	clearUser();
	clearOrganization();

	try {
		if (typeof localStorage !== "undefined") {
			localStorage.removeItem("logout-storage");
			localStorage.removeItem("user-storage");
			localStorage.removeItem("organization-storage");
			localStorage.removeItem("feature-flags-storage");
			localStorage.removeItem("feature-limits-storage");
			// Clear any other potential persisted stores
			localStorage.removeItem("notification-storage");
			localStorage.removeItem("use-notification-store");
			// Clear all keys that might contain auth data
			const keysToRemove = [];
			for (let index = 0; index < localStorage.length; index++) {
				const key = localStorage.key(index);
				if (
					key &&
					(key.includes("auth") ||
						key.includes("user") ||
						key.includes("session") ||
						key.includes("token"))
				) {
					keysToRemove.push(key);
				}
			}
			keysToRemove.forEach(key => localStorage.removeItem(key));
		}
	} catch {}

	const withTimeout = async <T>(
		promise: Promise<T>,
		ms = 1500,
	): Promise<void> => {
		await Promise.race([
			promise.then(() => {}).catch(() => {}),
			new Promise<void>(resolve => setTimeout(resolve, ms)),
		]);
	};

	try {
		// 1. First, sign out from NextAuth to clear session
		await withTimeout(signOut({ redirect: false }));

		// 2. Then clear all cookies
		await withTimeout(clearCookies());

		// 3. Proactively delete known Auth.js cookies
		try {
			if (typeof document !== "undefined") {
				const cookieNames = [
					"__Host-authjs.csrf-token",
					"__Secure-authjs.callback-url",
					"__Secure-authjs.session-token",
					"authjs.csrf-token",
					"authjs.callback-url",
					"authjs.session-token",
					"next-auth.csrf-token",
					"next-auth.callback-url",
					"next-auth.session-token",
				];
				for (const name of cookieNames) {
					globalThis.window.document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
					globalThis.window.document.cookie = `${name}=; Path=/; Max-Age=0; Domain=${globalThis.location.hostname}; SameSite=Lax`;
					globalThis.window.document.cookie = `${name}=; Path=/; Max-Age=0; Domain=.${globalThis.location.hostname}; SameSite=Lax`;
				}
			}
		} catch {}
	} finally {
		globalThis.location.href = "/";

		// Force a complete page refresh to clear any cached state
		setTimeout(() => {
			if (typeof globalThis !== "undefined") {
				globalThis.location.reload();
			}
		}, 100);
	}
};
