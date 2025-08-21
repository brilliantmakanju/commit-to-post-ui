"use client";

import { clearCookies } from "@/lib/cookies/create-cookies";
import { signOut } from "@/server-actions/auth/signout";
import useFeatureFlagsStore from "@/zustand/feature-flags-store";
import useFeatureLimitsStore from "@/zustand/feature-limits-store";
import useLogoutStore from "@/zustand/logout-store";
import useOrganizationStore from "@/zustand/useorganization-store";
import useUserStore from "@/zustand/useuser-store";

export const logoutNow = async (): Promise<void> => {
	const { setLogout } = useLogoutStore.getState();
	const { clearUser } = useUserStore.getState();
	const { clearOrganization } = useOrganizationStore.getState();
	const { clearFlags } = useFeatureFlagsStore.getState();
	const { clearLimits } = useFeatureLimitsStore.getState();

	// 1. Set logout state FIRST to prevent UI flicker
	setLogout(true);

	// 2. Clear all stores immediately
	clearUser();
	clearFlags();
	clearLimits();
	clearOrganization();

	// 3. Clear persisted localStorage keys defensively
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

	// 4. Helper to race an operation with a timeout so we don't hang
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
		// 5. Execute logout sequence with proper order
		await withTimeout(clearCookies());
		await withTimeout(signOut({ redirect: false }));
		await withTimeout(clearCookies());

		// 6. Force redirect and refresh
		globalThis.location.href = "/";

		// 7. Force a complete page refresh to clear any cached state
		setTimeout(() => {
			if (typeof globalThis !== "undefined") {
				globalThis.location.reload();
			}
		}, 100);
	} catch {
		// Force redirect even if logout fails
		globalThis.location.href = "/";
	}
};
