"use client";
import { Loader2, ShieldCheck, Sparkles } from "lucide-react";
import React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useCheckAccess } from "@/hooks/plans/use-billing";
import { getDecryptedCookie } from "@/lib/cookies/getcookies";
import { subscriptionsCreation } from "@/server-actions/auth/subscribe";

const Page = () => {
	const hasAccess = useCheckAccess();
	const [isLoading, setIsLoading] = React.useState(false);

	async function subscribePlan() {
		try {
			const planData = await getDecryptedCookie("subscribing");

			if (hasAccess) {
				toast.info("You already have access to the Pro plan.");
				return;
			}

			setIsLoading(true);
			const toastId = toast.loading("Preparing your checkout...");

			if (planData?.plan === "Pro") {
				const response = await subscriptionsCreation();

				if (response?.success && response?.data?.checkout_url) {
					toast.dismiss(toastId);
					toast.success("Redirecting to checkout...");
					window.open(response.data.checkout_url, "_blank");
				} else {
					toast.error("Something went wrong. Please try again.");
				}
			}
		} catch (error) {
			console.error("Error in subscribePlan:", error);
			toast.error("An error occurred. Please try again.");
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<section className="flex h-full w-full flex-col px-3">
			<h1>Dashboard Pages Updated</h1>

			{hasAccess ? (
				<Button
					className="w-full bg-green-500/10 text-green-400 hover:bg-green-500/20"
					variant="outline"
					disabled
				>
					<ShieldCheck className="mr-2 h-4 w-4" />
					Active Subscription
				</Button>
			) : (
				<Button
					variant={"outline"}
					className="bg-subscription-accent-primary text-white"
					onClick={subscribePlan}
					disabled={isLoading || hasAccess === null}
				>
					{isLoading ? (
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					) : (
						<Sparkles className="mr-2 h-4 w-4" />
					)}
					{hasAccess === null
						? "Checking subscription..."
						: isLoading
							? "Preparing checkout..."
							: "Upgrade to Pro"}
				</Button>
			)}
		</section>
	);
};

export default Page;
