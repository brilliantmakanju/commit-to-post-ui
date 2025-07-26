"use client";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect } from "react";

export default function SessionSync() {
	const { data: session, status } = useSession();
	const router = useRouter();

	useEffect(() => {
		// Check if session is expired or invalid
		if (status === "authenticated" && session) {
			const isExpired =
				session.expires && new Date(session.expires) < new Date();

			if (isExpired) {
				// Sign out and redirect to home
				signOut({ callbackUrl: "/" });
			}
		}
	}, [session, status]);

	useEffect(() => {
		// Handle unauthenticated state
		if (status === "unauthenticated") {
			router.push("/");
		}
	}, [status, router]);

	return <></>; // This component doesn't render anything
}
