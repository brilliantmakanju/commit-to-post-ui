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
		await withTimeout(clearCookies());
		try {
			if (typeof document !== "undefined") {
				const cookieNames = [
					"__Host-authjs.csrf-token",
					"__Secure-authjs.callback-url",
					"__Secure-authjs.session-token",
					"authjs.csrf-token",
					"authjs.callback-url",
					"authjs.session-token",
				];
				for (const name of cookieNames) {
					// eslint-disable-next-line unicorn/no-document-cookie
					document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
				}
			}
		} catch {}
		await withTimeout(signOut({ redirect: false }));
	} finally {
		globalThis.location.href = "/";
	}
};
