"use client";

import LoadingScreen from "@/components/wrappers/loaders/logo-loading";
import useLogoutStore from "@/zustand/logout-store";

interface LogoutModalProps {
	showByDefault?: boolean; // Optional prop to control showing the modal by default
}

export function LogoutModal({ showByDefault = false }: LogoutModalProps) {
	const { logout } = useLogoutStore();

	// If the `showByDefault` prop is true or `logout` is true, display the modal
	if (!logout && !showByDefault) {
		return;
	}

	return (
		<div className="absolute left-0 top-0 z-[130] h-full w-full">
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
		</div>
	);
}
