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
				console.log("Throttled cookie:", throttled);
				if (throttled?.errorMessage) {
					console.log("Throttle cookie found:", throttled);
					toast.info(`${throttled.errorMessage}`);
					// Optionally clear the cookie after showing the toast
					// await clearCookie("throttled");
				}
			} catch (error) {
				console.error("Error reading throttled cookie:", error);
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
