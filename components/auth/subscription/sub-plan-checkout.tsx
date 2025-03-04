"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useCheckAccess } from "@/hooks/plans/use-billing";
import { deleteCookie } from "@/lib/cookies/create-cookies";
import { getDecryptedCookie } from "@/lib/cookies/getcookies";
import { authSubscribe } from "@/server-actions/auth/subscribe";

const SubPlanCheckout = () => {
	const hasAccess = useCheckAccess();
	const [showModal, setShowModal] = useState(false);
	const [countdown, setCountdown] = useState(10);
	const [checkoutUrl, setCheckoutUrl] = useState<string | null>();
	const [isRedirecting, setIsRedirecting] = useState(false);
	const [showFinalConfirm, setShowFinalConfirm] = useState(false);
	const hasAttempted = useRef(false);

	const handleRedirect = useCallback(() => {
		if (checkoutUrl) {
			setIsRedirecting(true);
			// Try window.open first
			const newWindow = window.open(checkoutUrl, "_blank");

			// If popup was blocked, update UI to show final confirmation
			if (newWindow) {
				setShowModal(false);
			} else {
				setShowFinalConfirm(true);
				toast.info("Please click 'Proceed' to continue to checkout");
			}
		}
	}, [checkoutUrl]);

	const handleFinalRedirect = useCallback(() => {
		if (checkoutUrl) {
			// Use location.href as fallback
			globalThis.location.href = checkoutUrl;
		}
	}, [checkoutUrl]);

	const handleClose = useCallback(async () => {
		await deleteCookie("subscribing");
		// Clear all toasts
		toast.dismiss();
		// Delete cookie
		// Close modal
		setShowModal(false);
		// Reset states
		setShowFinalConfirm(false);
		setIsRedirecting(false);
	}, []);

	const subscribePlan = useCallback(async () => {
		if (hasAttempted.current) return;
		hasAttempted.current = true;

		toast.dismiss(); // Clear any existing toasts

		try {
			const planData = await getDecryptedCookie("subscribing");

			if (planData === undefined) {
				return;
			}

			if (hasAccess) {
				await deleteCookie("subscribing");
				toast.info("You already have an ACTIVELY paid plan.");
				return;
			}

			const toastId = toast.loading("Preparing your checkout...");

			if (planData?.plan === "Pro") {
				const response = await authSubscribe({
					plans: "Pro",
					billingCycle: planData.type as "monthly" | "annual",
				});

				if (response?.success && response?.data?.checkout_url) {
					await deleteCookie("subscribing");
					toast.dismiss(toastId);
					toast.success("Checkout ready!");
					setCheckoutUrl(response.data.checkout_url);
					setShowModal(true);
				} else {
					await deleteCookie("subscribing");
					toast.error("Something went wrong. Please try again.");
				}
			} else if (planData?.plan === "Lifetime Deal") {
				const response = await authSubscribe({ plans: "Lifetime Deal" });

				if (response?.success && response?.data?.checkout_url) {
					await deleteCookie("subscribing");
					toast.dismiss(toastId);
					toast.success("Checkout ready!");
					setCheckoutUrl(response.data.checkout_url);
					setShowModal(true);
				} else {
					await deleteCookie("subscribing");
					toast.error("Something went wrong. Please try again.");
				}
			}
		} catch {
			await deleteCookie("subscribing");
			toast.error("An error occurred. Please try again.");
		}
	}, [hasAccess]);

	useEffect(() => {
		subscribePlan();
		return () => {
			toast.dismiss(); // Cleanup toasts on unmount
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [subscribePlan]);

	// Handle countdown timer
	useEffect(() => {
		let timer: NodeJS.Timeout;

		if (showModal && countdown > 0 && !isRedirecting && !showFinalConfirm) {
			timer = setInterval(() => {
				setCountdown(previous => previous - 1);
			}, 1000);
		} else if (
			countdown === 0 &&
			showModal &&
			!isRedirecting &&
			!showFinalConfirm
		) {
			handleRedirect();
		}

		return () => {
			if (timer) clearInterval(timer);
		};
	}, [showModal, countdown, isRedirecting, handleRedirect, showFinalConfirm]);

	// Reset countdown when modal is opened
	useEffect(() => {
		if (showModal) {
			setCountdown(10);
			setIsRedirecting(false);
			setShowFinalConfirm(false);
		}
	}, [showModal]);

	return (
		<Dialog
			open={showModal}
			onOpenChange={async open => {
				if (!open) {
					await handleClose();
				}
			}}
		>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>
						{showFinalConfirm
							? "Continue to Checkout"
							: "Redirecting to Checkout"}
					</DialogTitle>
					<DialogDescription>
						{showFinalConfirm
							? "Your browser blocked the automatic redirect. Click 'Proceed' to continue to the checkout page."
							: `You will be redirected to the secure checkout page in ${countdown} seconds.`}
					</DialogDescription>
				</DialogHeader>
				{!showFinalConfirm && (
					<div className="flex h-20 items-center justify-center">
						<div className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">
							{countdown}
						</div>
					</div>
				)}
				<DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row">
					<Button
						variant="outline"
						onClick={handleClose}
						className="w-full sm:w-auto"
					>
						Cancel
					</Button>
					<Button
						onClick={showFinalConfirm ? handleFinalRedirect : handleRedirect}
						className="w-full sm:w-auto"
					>
						{showFinalConfirm ? "Continue to Checkout" : "Proceed to Checkout"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default SubPlanCheckout;
