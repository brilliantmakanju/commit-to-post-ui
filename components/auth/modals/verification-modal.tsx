/* eslint-disable import/no-unresolved */
"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { syncUserData } from "@/components/wrappers/loaders/authenticated-layout";
import { verifyAndLogin } from "@/server-actions/auth/magic-link";
import useAuthModalStore from "@/zustand/auth/use-auth-modal";
import useUserStore from "@/zustand/useuser-store";

import { VerificationAnimation } from "./verification-sub-modal";

export default function MagicVerifyModal() {
	const hasSyncedRef = useRef(false);
	const hasSubmittedRef = useRef(false);
	const searchParams = useSearchParams();
	const { data: session, status } = useSession();
	const { setUser, hasHydratedUser } = useUserStore();

	const [verificationState, setVerificationState] = useState<
		"verifying" | "success" | "error"
	>("verifying");
	const [errorMessage, setErrorMessage] = useState<string>(
		"The magic link is invalid or has expired",
	);
	const { closeModal, openModal, setProcessing } = useAuthModalStore();

	// Memoized sync function to prevent recreations
	const syncUserStoreData = useCallback(
		(userData: any) => {
			if (hasSyncedRef.current) return;

			try {
				const syncedData = syncUserData(userData);
				setUser(syncedData);
				hasSyncedRef.current = true;
			} catch (error) {
				console.error("Failed to sync user data:", error);
			}
		},
		[setUser],
	);

	useEffect(() => {
		const getToken = searchParams.get("token");

		// Return early if no token is found
		if (!getToken) {
			closeModal();
			return;
		}

		const verifyToken = async (token: string) => {
			setProcessing(true);

			try {
				const apiRequest = await verifyAndLogin({ token });

				if (apiRequest?.message === "success") {
					setVerificationState("success");

					// Sync user data if authenticated
					if (
						status === "authenticated" &&
						session?.user &&
						!hasHydratedUser &&
						!hasSyncedRef.current
					) {
						syncUserStoreData(session.user);
					}

					setTimeout(() => {
						globalThis.location.replace("/workspace");
					}, 2000);
				} else if (apiRequest?.message === "Invalid credentials.") {
					setErrorMessage("Invalid credentials, please try again");
					setVerificationState("error");
				} else {
					setErrorMessage("Something went wrong. Please try again later.");
					setVerificationState("error");
				}
			} catch (error) {
				setErrorMessage(
					error instanceof Error
						? error.message
						: "An unexpected error occurred",
				);
				setVerificationState("error");
			} finally {
				setProcessing(false);
			}
		};

		// Only submit the magic link verification once
		if (!hasSubmittedRef.current) {
			hasSubmittedRef.current = true;
			verifyToken(getToken);
		}
	}, [
		status,
		closeModal,
		searchParams,
		session?.user,
		hasHydratedUser,
		syncUserStoreData,
		setProcessing,
	]);

	const handleRetry = () => {
		closeModal();
		openModal("login");
	};

	return (
		<div className="flex min-h-screen flex-col items-center justify-center p-4">
			<Card className="w-full max-w-md border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
				<CardHeader className="text-center">
					<CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-50">
						{verificationState === "verifying"
							? "Verifying Magic Link"
							: verificationState === "success"
								? "Verification Successful"
								: "Verification Failed"}
					</CardTitle>
					<CardDescription className="text-gray-500 dark:text-gray-400">
						{verificationState === "verifying"
							? "Please wait while we verify your login"
							: verificationState === "success"
								? "You'll be redirected to your dashboard"
								: "There was a problem with your magic link"}
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col items-center justify-center py-10">
					{verificationState === "verifying" && <VerificationAnimation />}

					{verificationState === "success" && (
						<div className="flex flex-col items-center space-y-4 text-center">
							<div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
								<CheckCircle2 className="h-10 w-10 text-gray-900 dark:text-gray-50" />
							</div>
							<div>
								<h3 className="text-xl font-semibold text-gray-900 dark:text-gray-50">
									Login Successful
								</h3>
								<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
									You&apos;ll be redirected to your dashboard in a moment
								</p>
							</div>
						</div>
					)}

					{verificationState === "error" && (
						<div className="flex flex-col items-center space-y-4 text-center">
							<div className="rounded-full bg-red-100 p-3 dark:bg-red-900/20">
								<XCircle className="h-10 w-10 text-red-600 dark:text-red-500" />
							</div>
							<div>
								<h3 className="text-xl font-semibold text-gray-900 dark:text-gray-50">
									Verification Failed
								</h3>
								<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
									{errorMessage}
								</p>
							</div>
							<Button onClick={handleRetry} variant="outline" className="mt-4">
								Back to Login
							</Button>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
