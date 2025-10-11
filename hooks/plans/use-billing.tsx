/* eslint-disable import/no-unresolved */
"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import useUserStore from "@/zustand/useuser-store";

// NEW: Credit-based access check
export function useCheckAccess() {
	const { status } = useSession();
	const userStore = useUserStore();
	const [billingPlan, setBillingPlan] = useState(false);

	useEffect(() => {
		const checkAccess = async () => {
			if (status === "authenticated") {
				// NEW: Check access based on credits instead of subscription status
				const hasCredits = (userStore.credits_balance ?? 0) > 0;
				setBillingPlan(hasCredits);
			}
		};

		checkAccess();
	}, [userStore, status]);
	return billingPlan;
}
