"use client";

import { ArrowRight, CreditCard, FileCheck, Upload } from "lucide-react";
import type React from "react";

// eslint-disable-next-line import/no-unresolved
import { Card, CardContent } from "@/components/ui/card";

export function PaymentSteps() {
	return (
		<div className="grid gap-8 md:grid-cols-4">
			<StepCard
				step={1}
				title="Select a Plan"
				description="Choose the plan that best fits your needs from our pricing options."
				icon={
					<CreditCard className="h-6 w-6 text-zinc-700 dark:text-zinc-300" />
				}
			/>

			<StepCard
				step={2}
				title="Make Payment"
				description="Transfer the payment to our account using your preferred banking method."
				icon={
					<ArrowRight className="h-6 w-6 text-zinc-700 dark:text-zinc-300" />
				}
			/>

			<StepCard
				step={3}
				title="Upload Proof"
				description="Upload a screenshot or receipt of your payment transaction."
				icon={<Upload className="h-6 w-6 text-zinc-700 dark:text-zinc-300" />}
			/>

			<StepCard
				step={4}
				title="Get Upgraded"
				description="We'll verify your payment and upgrade your account within 24 hours."
				icon={
					<FileCheck className="h-6 w-6 text-zinc-700 dark:text-zinc-300" />
				}
			/>
		</div>
	);
}

function StepCard({
	step,
	title,
	description,
	icon,
}: {
	step: number;
	title: string;
	description: string;
	icon: React.ReactNode;
}) {
	return (
		<Card className="border-zinc-200 bg-white transition-all hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
			<CardContent className="flex flex-col items-center p-6 text-center">
				<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
					{icon}
				</div>
				<div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
					{step}
				</div>
				<h3 className="mb-2 mt-2 text-lg font-medium text-zinc-900 dark:text-zinc-100">
					{title}
				</h3>
				<p className="text-sm text-zinc-600 dark:text-zinc-400">
					{description}
				</p>
			</CardContent>
		</Card>
	);
}
