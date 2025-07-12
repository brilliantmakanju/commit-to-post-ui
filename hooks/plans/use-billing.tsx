/* eslint-disable import/no-unresolved */
"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import hasAccess from "@/lib/utils/check-plan";
import useUserStore from "@/zustand/useuser-store";

export function useCheckAccess() {
	const [billingPlan, setBillingPlan] = useState(false);
	const { data: userDetails, status } = useSession();
	const userStore = useUserStore();

	useEffect(() => {
		const checkAccess = async () => {
			if (status === "authenticated") {
				const newBillingPlan = await hasAccess({
					plan: userStore.plan || userDetails?.user.plan,
					subscription_status:
						userStore.subscription_status ||
						userDetails?.user.subscription_status,
					subscription_end_date:
						userStore.subscription_end_date ||
						userDetails?.user.subscription_end_date,
				});
				setBillingPlan(newBillingPlan);
			}
		};

		checkAccess();
	}, [userDetails, userStore, status]);
	return billingPlan;
}
