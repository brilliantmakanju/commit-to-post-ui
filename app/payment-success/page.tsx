/* eslint-disable import/no-unresolved */
"use client";

import { motion } from "framer-motion";
import { Check, Loader2, PartyPopper, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Confetti from "react-confetti";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	clearCookies,
	createEncryptedCookie,
} from "@/lib/cookies/create-cookies";
import { logout, signOut } from "@/server-actions/auth/signout";
import useLogoutStore from "@/zustand/logout-store";
import useOrganizationStore from "@/zustand/useorganization-store";
import useUserStore from "@/zustand/useuser-store";

interface PaymentStatus {
	status: "loading" | "success" | "error";
	message?: string;
}

export default function PaymentSuccessPage() {
	const userStore = useUserStore();
	const logoutStore = useLogoutStore();
	const organizationStore = useOrganizationStore();
	const { status } = useSession();
	const [isMounted, setIsMounted] = useState(false);
	const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({
		status: "success",
	});
	const [showConfetti, setShowConfetti] = useState(true);
	const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
	const router = useRouter();
	const [countdown, setCountdown] = useState(10);
	const [showCountdown, setShowCountdown] = useState(false);

	const logoutClient = async () => {
		try {
			const { success } = await logout();
			if (success) {
				setShowConfetti(true);
				logoutStore.setLogout(true);
				userStore.clearUser();
				organizationStore.clearOrganization();

				await clearCookies();
				await signOut();
				logoutStore.setLogout(false);

				// Start countdown after logout is successful
				setPaymentStatus({
					status: "success",
					message: "Payment successful! Please log in again to continue.",
				});
				setShowCountdown(true);
			} else {
				await createEncryptedCookie("payment_success", {
					paid: true,
				});
				logoutStore.setLogout(true);
				userStore.clearUser();
				organizationStore.clearOrganization();

				await clearCookies();
				await signOut();
				logoutStore.setLogout(false);
				setPaymentStatus({
					status: "error",
					message:
						"There was an issue processing your logout. Please try again.",
				});
			}
		} catch {
			setPaymentStatus({
				status: "error",
				message: "An unexpected error occurred. Please try again.",
			});
		}
	};

	useEffect(() => {
		setIsMounted(true);
		const updateWindowSize = () => {
			setWindowSize({ width: window.innerWidth, height: window.innerHeight });
		};
		updateWindowSize();
		window.addEventListener("resize", updateWindowSize);
		return () => window.removeEventListener("resize", updateWindowSize);
	}, []);

	useEffect(() => {
		if (status === "authenticated" && isMounted) {
			logoutClient();
		}
		if (status === "unauthenticated" && isMounted) {
			setShowCountdown(true);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [status, isMounted]); // Removed logoutClient from dependencies

	useEffect(() => {
		let timer: NodeJS.Timeout;
		if (showCountdown && countdown > 0) {
			timer = setTimeout(() => setCountdown(countdown - 1), 1000);
		} else if (countdown === 0) {
			router.refresh();
			router.push("/");
		}
		return () => clearTimeout(timer);
	}, [showCountdown, countdown, router]);

	const handleManualRedirect = () => {
		router.refresh();
		router.push("/");
	};

	return (
		<>
			{showConfetti && (
				<Confetti
					width={windowSize.width}
					height={windowSize.height}
					numberOfPieces={200}
					recycle={true}
				/>
			)}
			<div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-b from-white to-gray-50 p-4">
				<Card className="w-full max-w-md">
					<CardHeader className="text-center">
						<CardTitle className="text-2xl font-bold">
							{paymentStatus.status === "loading"
								? "Processing Payment..."
								: paymentStatus.status === "success"
									? "Welcome Aboard! 🎉"
									: "Oops! Something went wrong"}
						</CardTitle>
						<CardDescription>
							{paymentStatus.status === "loading"
								? "Please wait while we process your payment..."
								: paymentStatus.status === "success"
									? "Thank you for subscribing to our service!"
									: "We encountered an issue with your payment"}
						</CardDescription>
					</CardHeader>

					<CardContent className="flex flex-col items-center justify-center p-6">
						<motion.div
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							transition={{ type: "spring", stiffness: 260, damping: 20 }}
						>
							{paymentStatus.status === "loading" ? (
								<div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
									<Loader2 className="h-8 w-8 animate-spin text-blue-500" />
								</div>
							) : paymentStatus.status === "success" ? (
								<div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
									<PartyPopper className="h-8 w-8 text-green-500" />
								</div>
							) : (
								<div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
									<X className="h-8 w-8 text-red-500" />
								</div>
							)}
						</motion.div>

						<p className="mt-6 text-center text-sm text-gray-600">
							{paymentStatus.message}
						</p>

						{paymentStatus.status === "success" && (
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.5 }}
								className="mt-6 text-center"
							>
								{showCountdown && (
									<div className="mb-4">
										<p className="text-sm text-gray-600">
											Redirecting to login page in:
										</p>
										<p className="text-2xl font-bold text-blue-500">
											{countdown}
										</p>
									</div>
								)}
								<div className="flex justify-center gap-2">
									<Check className="h-5 w-5 text-green-500" />
									<span className="text-sm text-gray-600">
										Premium features unlocked
									</span>
								</div>
							</motion.div>
						)}

						{paymentStatus.status === "error" && (
							<div className="mt-6 space-y-4">
								<p className="text-center text-sm text-gray-600">
									Don&apos;t worry, your payment has not been processed. Please
									try again or contact support if the issue persists.
								</p>
								<div className="flex gap-4">
									<Button onClick={() => router.push("/pricing")}>
										Try Again
									</Button>
									<Button
										variant="outline"
										onClick={() => router.push("/support")}
									>
										Contact Support
									</Button>
								</div>
							</div>
						)}

						<Button
							onClick={handleManualRedirect}
							className="mt-4"
							variant="outline"
						>
							Go to Login Page
						</Button>
					</CardContent>
					<CardFooter className="flex justify-center border-t pt-6">
						<p className="text-xs text-gray-500">
							Need help? Contact our support team at brilliant@jolexhive.com
						</p>
					</CardFooter>
				</Card>
			</div>
		</>
	);
}

// "use client";

// import { motion } from "framer-motion";
// import { AlertCircle, ArrowLeft, MessageSquare } from "lucide-react";
// import { useRouter } from "next/navigation";

// // eslint-disable-next-line import/no-unresolved
// import { Button } from "@/components/ui/button";
// import {
// 	Card,
// 	CardContent,
// 	CardDescription,
// 	CardFooter,
// 	CardHeader,
// 	CardTitle,
// 	// eslint-disable-next-line import/no-unresolved
// } from "@/components/ui/card";

// export default function PaymentErrorPage() {
// 	const router = useRouter();

// 	return (
// 		<div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white to-gray-50 p-4">
// 			<Card className="w-full max-w-md">
// 				<CardHeader className="text-center">
// 					<motion.div
// 						initial={{ scale: 0.5, opacity: 0 }}
// 						animate={{ scale: 1, opacity: 1 }}
// 						transition={{ duration: 0.5 }}
// 						className="mb-6 flex justify-center"
// 					>
// 						<div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
// 							<AlertCircle className="h-8 w-8 text-red-500" />
// 						</div>
// 					</motion.div>
// 					<CardTitle className="text-2xl font-bold">Payment Failed</CardTitle>
// 					<CardDescription>
// 						We were unable to process your payment
// 					</CardDescription>
// 				</CardHeader>

// 				<CardContent className="space-y-4">
// 					<div className="rounded-lg bg-red-50 p-4">
// 						<h3 className="mb-2 font-medium text-red-800">Possible reasons:</h3>
// 						<ul className="list-inside list-disc space-y-1 text-sm text-red-700">
// 							<li>Insufficient funds</li>
// 							<li>Card declined by issuer</li>
// 							<li>Incorrect card information</li>
// 							<li>Network or connection issues</li>
// 						</ul>
// 					</div>

// 					<div className="flex flex-col gap-3">
// 						<Button onClick={() => router.push("/pricing")} className="w-full">
// 							Try Again
// 						</Button>
// 						<Button
// 							variant="outline"
// 							onClick={() => router.push("/support")}
// 							className="w-full"
// 						>
// 							<MessageSquare className="mr-2 h-4 w-4" />
// 							Contact Support
// 						</Button>
// 						<Button
// 							variant="ghost"
// 							onClick={() => router.back()}
// 							className="w-full"
// 						>
// 							<ArrowLeft className="mr-2 h-4 w-4" />
// 							Go Back
// 						</Button>
// 					</div>
// 				</CardContent>

// 				<CardFooter className="flex justify-center border-t pt-6">
// 					<p className="text-center text-xs text-gray-500">
// 						Your card has not been charged. If you continue to experience
// 						issues, please contact our support team at brilliant@jolexhive.com
// 					</p>
// 				</CardFooter>
// 			</Card>
// 		</div>
// 	);
// }
