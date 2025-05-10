/* eslint-disable import/no-unresolved */
import type { Metadata } from "next";

import PricingSection from "@/components/landing/pricing/v3/payment-section";
import { PaymentSteps } from "@/components/landing/pricing/v3/payment-steps";

export const metadata: Metadata = {
	title: "Pricing - Push to Post",
	description:
		"Choose the right plan for your needs and upgrade your social media presence",
};

export default function PricingPage() {
	return (
		<div className="min-h-screen w-full items-center justify-center">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				{/* <div className="mb-12 text-center">
					<h1 className="text-4xl font-medium tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
						Simple, transparent pricing
					</h1>
					<p className="mx-auto mt-4 max-w-2xl text-zinc-600 dark:text-zinc-400">
						Choose the plan that&apos;s right for you and start turning your
						commits into engaging LinkedIn posts.
					</p>
				</div> */}

				<PricingSection />

				{/* <div className="mt-24">
					<h2 className="mb-12 text-center text-2xl font-medium tracking-tight text-zinc-900 dark:text-zinc-50">
						How to complete your payment
					</h2>
					<PaymentSteps />
				</div> */}
			</div>
		</div>
	);
}
