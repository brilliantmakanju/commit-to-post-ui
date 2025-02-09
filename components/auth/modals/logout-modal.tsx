"use client";

import LoadingScreen from "@/components/wrappers/loaders/logo-loading";
import useLogoutStore from "@/lib/zustand/logout-store";

export function LogoutModal() {
	const { logout } = useLogoutStore();

	if (!logout) {
		return;
	}

	return (
		<LoadingScreen
			backgroundColor="#0A0E17"
			iconColor="#4FD1C5"
			splashColor="rgba(79, 209, 197, 0.3)"
			bubbleColor="rgba(79, 209, 197, 0.2)"
			iconSize={80}
			bounceHeight={40}
			bounceDuration={1.8}
			splashDuration={1}
		/>
	);
}
