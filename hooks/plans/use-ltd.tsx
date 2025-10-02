/* eslint-disable import/no-unresolved */
"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import useUserStore from "@/zustand/useuser-store";

// NEW: Credit-based lifetime access check
export function useLifetimeAccess() {
	const [lifetimeAccess, setLifetimeAccess] = useState(false);
	const { status } = useSession();
	const userStore = useUserStore();

	useEffect(() => {
		const checkLifetimeAccess = async () => {
			if (status === "authenticated") {
				// NEW: Check lifetime access based on plan and credits
				const isLtdPlan = userStore.plan === "ltd";
				const hasCredits = (userStore.credits ?? 0) > 0;
				setLifetimeAccess(isLtdPlan && hasCredits);
			}
		};

		checkLifetimeAccess();
	}, [userStore.plan, userStore.credits, status]);

	return lifetimeAccess;
}
