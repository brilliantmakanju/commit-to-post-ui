"use client";
import { useEffect } from "react";
import { toast } from "sonner";

// eslint-disable-next-line import/no-unresolved
import { getDecryptedCookie } from "@/lib/cookies/getcookies";

export const RequestInterceptor = () => {
	useEffect(() => {
		const checkThrottledCookie = async () => {
			try {
				const throttled = await getDecryptedCookie("throttled");
				if (throttled?.errorMessage) {
					toast.info(`${throttled.errorMessage}`);
					// Optionally clear the cookie after showing the toast
					// await clearCookie("throttled");
				}
			} catch {
				return;
			}
		};

		// Run the check once on mount and then every 10 seconds
		checkThrottledCookie();
		const intervalId = setInterval(() => {
			checkThrottledCookie();
		}, 10000); // Poll every 10 seconds

		return () => {
			clearInterval(intervalId);
		};
	}, []);

	return <></>;
};
