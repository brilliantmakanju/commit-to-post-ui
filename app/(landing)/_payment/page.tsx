/* eslint-disable import/no-unresolved */
"use client";
import { useSearchParams } from "next/navigation";

import { BankDetails } from "@/components/payment/bank-details";
import { PaymentForm } from "@/components/payment/payment-form";

export default function PaymentPage() {
	// Await the searchParams to properly handle it as a dynamic API
	const searchParams = useSearchParams();

	const plan = searchParams.get("plan") || "pro";
	const cycle = searchParams.get("cycle") || "monthly";

	return (
		<div className="min-h-screen w-full items-center justify-center">
			<div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
				<div className="mb-12 text-center">
					<h1 className="text-3xl font-medium tracking-tight text-zinc-900 dark:text-zinc-50">
						Complete your payment
					</h1>
					<p className="mx-auto mt-4 max-w-2xl text-zinc-600 dark:text-zinc-400">
						Follow the steps below to complete your payment and upgrade your
						account
					</p>
				</div>

				<div className="grid gap-12 md:grid-cols-2">
					<BankDetails />
					<PaymentForm
						selectedPlan={plan as "basic" | "pro" | "lifetime"}
						billingCycle={cycle as "monthly" | "annual"}
					/>
				</div>
			</div>
		</div>
	);
}
