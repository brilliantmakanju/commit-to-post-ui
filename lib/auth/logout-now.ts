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
		await withTimeout(signOut({ redirect: false }));
	} finally {
		globalThis.location.href = "/";
	}
};
