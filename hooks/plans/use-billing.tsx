/* eslint-disable import/no-unresolved */
"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import hasAccess from "@/lib/utils/check-plan";
import useUserStore from "@/zustand/useuser-store";

export function useCheckAccess() {
	const { status } = useSession();
	const userStore = useUserStore();
	const [billingPlan, setBillingPlan] = useState(false);

	useEffect(() => {
		const checkAccess = async () => {
			if (status === "authenticated") {
				const newBillingPlan = await hasAccess({
					plan: userStore.plan,
					subscription_status: userStore.subscription_status,
					subscription_end_date: userStore.subscription_end_date,
				});
				setBillingPlan(newBillingPlan);
			}
		};

		checkAccess();
	}, [userStore, status]);
	return billingPlan;
}
