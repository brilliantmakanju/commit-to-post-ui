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
import { useCheckAccess } from "@/hooks/plans/use-billing";
import { cn } from "@/lib/utils";
import useAuthModalStore from "@/lib/zustand/auth/use-auth-modal";
import useUserStore from "@/lib/zustand/useuser-store";

interface PaddleCheckoutProps {
	locale: string;
	productId: string;
	successUrl?: string;
	theme: "dark" | "light";
	children: React.ReactNode;
	displayMode: "overlay" | "inline";
	environment: "sandbox" | "production";
}

export default function PaddleCheckout({
	theme,
	children,
	productId,
	environment,
	displayMode,
	locale = "en",
	successUrl = process.env.NEXT_PUBLIC_PADDLE_SUCCESS,
}: PaddleCheckoutProps) {
	const hasAccess = useCheckAccess();

	const userStore = useUserStore();
	const { status, data } = useSession();
	const [loading, setLoading] = useState(false);
	const [paddle, setPaddle] = useState<Paddle>();
	const { openModal } = useAuthModalStore();

	useEffect(() => {
		initializePaddle({
			environment: environment,
			token: process.env.NEXT_PUBLIC_PADDLE_TOKEN || "",
		}).then(setPaddle);
	}, [environment]);

	const handleCheckout = async () => {
		if (paddle) {
			if (status === "unauthenticated") {
				openModal("login");
			} else if (status === "authenticated") {
				if (hasAccess) {
					toast.info("You already have an active subscription.");
					return;
				} else {
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
								email: userStore.email || data.user.email || "",
							},
							settings: {
								theme: theme,
								locale: locale,
								allowLogout: true,
								showAddTaxId: false,
								variant: "one-page",
								showAddDiscounts: false,
								allowedPaymentMethods: ["card", "paypal"],
								successUrl: successUrl,
								displayMode: displayMode,
							},
							// settings: {
							// 	variant: "one-page",
							// 	displayMode: "inline",
							// 	theme: "light",
							// 	frameTarget: "paddle-checkout-frame",
							// 	frameInitialHeight: 450,
							// 	frameStyle:
							// 		"width: 100%; background-color: transparent; border: none",
							// 	successUrl: successUrl,
							// },
						});
					} catch {
					} finally {
						setLoading(false);
					}
				}
			}
		} else {
			toast.info("Paddle not initialized");

			return;
		}
	};

	return (
		<TooltipProvider>
			<Tooltip delayDuration={300} open={hasAccess ? undefined : false}>
				<TooltipTrigger asChild>
					<div
						onClick={handleCheckout}
						className={cn(
							"relative transition-all duration-200",
							!paddle || loading || hasAccess
								? "cursor-not-allowed opacity-35"
								: "cursor-pointer opacity-100 hover:opacity-90 active:scale-95",
						)}
					>
						{loading && (
							<div className="absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-[1px]">
								<Loader2 className="h-5 w-5 animate-spin text-black" />
							</div>
						)}
						{children}
					</div>
				</TooltipTrigger>
				<TooltipContent side="bottom" className="bg-black text-white">
					<p>You already have an active subscription.</p>
				</TooltipContent>
			</Tooltip>
			{/* <div className={"paddle-checkout-frame"} /> */}
		</TooltipProvider>
	);
}
