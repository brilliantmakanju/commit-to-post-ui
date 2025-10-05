"use client";
import { initializePaddle, type Paddle } from "@paddle/paddle-js";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import useAuthModalStore from "@/zustand/auth/use-auth-modal";
import useUserStore from "@/zustand/useuser-store";

interface PaddleCheckoutProps {
	locale: string;
	productId: string;
	successUrl?: string;
	theme: "dark" | "light";
	children: React.ReactNode;
	displayMode: "overlay" | "inline";
	environment: "sandbox" | "production";
	tooltipMessage?: string;
	forceDisabled?: boolean;
	disabledReason?:
		| "current-plan"
		| "has-access"
		| "not-initialized"
		| "loading";
}

export default function PaddleCheckout({
	theme,
	children,
	productId,
	environment,
	displayMode,
	locale = "en",
	successUrl = process.env.NEXT_PUBLIC_PADDLE_SUCCESS,
	tooltipMessage,
	forceDisabled = false,
	disabledReason,
}: PaddleCheckoutProps) {
	const { status } = useSession();
	const useStore = useUserStore();
	const [loading, setLoading] = useState(false);
	const [paddle, setPaddle] = useState<Paddle | undefined>();
	const { openModal } = useAuthModalStore();

	useEffect(() => {
		initializePaddle({
			environment: environment,
			token: process.env.NEXT_PUBLIC_PADDLE_TOKEN || "",
		}).then(setPaddle);
	}, [environment]);

	const handleCheckout = async (): Promise<void> => {
		if (paddle) {
			if (status === "unauthenticated") {
				openModal("login");
			} else if (status === "authenticated") {
				// Don't show toast for current plan - let the tooltip handle it
				if (disabledReason === "current-plan") {
					return;
				}
				setLoading(true);

				try {
					paddle.Checkout.open({
						items: [
							{
								priceId: productId,
								quantity: 1,
							},
						],
						customer: {
							email: useStore.email || "",
						},
						settings: {
							theme: theme,
							locale: locale,
							allowLogout: false,
							showAddTaxId: true,
							variant: "one-page",
							showAddDiscounts: false,
							successUrl: successUrl,
							displayMode: displayMode,
							allowedPaymentMethods: ["card", "paypal"],
						},
					});

					setLoading(false);
				} catch {
					toast.error("Failed to open checkout. Please try again.");
					setLoading(false);
				}
			}
		} else {
			toast.info("Payment system is initializing. Please wait...");
			return;
		}
	};

	// Fix the disabled logic - this was the main issue
	const isDisabled =
		!paddle ||
		loading ||
		forceDisabled ||
		disabledReason === "current-plan" ||
		disabledReason === "has-access" ||
		disabledReason === "not-initialized";

	// Determine tooltip content and visibility
	const getTooltipContent = (): string => {
		// Use custom tooltip message if provided
		if (tooltipMessage) {
			return tooltipMessage;
		}

		// Fallback to default messages based on state
		switch (disabledReason) {
			case "current-plan": {
				return "This is your current plan.";
			}
			case "has-access": {
				return "You already have an active subscription.";
			}
			case "not-initialized": {
				return "Payment system is initializing...";
			}
			case "loading": {
				return "Processing...";
			}
			default: {
				if (!paddle) {
					return "Payment system is initializing...";
				}
				if (loading) {
					return "Processing...";
				}
				return "";
			}
		}
	};

	const shouldShowTooltip = isDisabled || Boolean(tooltipMessage);
	const tooltipContent = getTooltipContent();

	return (
		<TooltipProvider>
			<Tooltip
				delayDuration={300}
				open={shouldShowTooltip && tooltipContent ? undefined : false}
			>
				<TooltipTrigger
					asChild
					className="relative mx-4 flex w-full items-center justify-center"
				>
					<div
						onClick={() => {
							if (!isDisabled) {
								handleCheckout();
							}
						}}
						className={cn(
							"relative w-full transition-all duration-200",
							isDisabled
								? "cursor-not-allowed opacity-60"
								: "cursor-pointer opacity-100 hover:opacity-90 active:scale-95",
						)}
					>
						{loading && (
							<div className="rounded-inherit absolute inset-0 z-10 flex cursor-progress items-center justify-center bg-black/5 backdrop-blur-[1px]">
								<Loader2 className="h-5 w-5 animate-spin text-black dark:text-white" />
							</div>
						)}
						<div className={cn(loading && "opacity-50", "-ml-7 w-full")}>
							{children}
						</div>
					</div>
				</TooltipTrigger>
				{tooltipContent && (
					<TooltipContent
						side="top"
						align="center"
						className="max-w-xs border border-gray-200 bg-black text-center text-white dark:border-gray-700 dark:bg-white dark:text-black"
					>
						<p className="text-xs">{tooltipContent}</p>
					</TooltipContent>
				)}
			</Tooltip>
		</TooltipProvider>
	);
}
