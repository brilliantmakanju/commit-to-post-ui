/* eslint-disable import/no-unresolved */
"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import { hasLifetimeAccess } from "@/lib/utils/check-plan";
import useUserStore from "@/zustand/useuser-store";

export function useLifetimeAccess() {
	const [lifetimeAccess, setLifetimeAccess] = useState(false);
	const { data: userDetails, status } = useSession();
	const userStore = useUserStore();

	useEffect(() => {
		const checkLifetimeAccess = async () => {
			if (status === "authenticated") {
				const hasAccess = await hasLifetimeAccess(
					userStore.plan,
					userDetails?.user.plan,
				);
				setLifetimeAccess(hasAccess);
			}
		};

		checkLifetimeAccess();
	}, [userDetails, userStore.plan, status]);

	return lifetimeAccess;
}
