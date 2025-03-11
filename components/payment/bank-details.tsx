"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export function BankDetails() {
	const [copied, setCopied] = useState<string | null>();

	const bankDetails = [
		{
			label: "Bank Name",
			value: process.env.NEXT_PUBLIC_BANK_NAME ?? "",
		},
		{
			label: "Bank Address",
			value: process.env.NEXT_PUBLIC_BANK_ADDRESS ?? "",
		},
		{
			label: "Account Holder's Name",
			value: process.env.NEXT_PUBLIC_ACCOUNT_HOLDER_NAME ?? "",
		},
		{
			label: "Account Number",
			value: process.env.NEXT_PUBLIC_ACCOUNT_NUMBER ?? "",
		},
		{
			label: "Routing Number (ABA)",
			value: process.env.NEXT_PUBLIC_ROUTING_NUMBER ?? "",
		},
		{
			label: "SWIFT Code",
			value: process.env.NEXT_PUBLIC_SWIFT_CODE ?? "",
		},
	];

	const copyToClipboard = (text: string, field: string) => {
		navigator.clipboard.writeText(text);
		setCopied(field);
		setTimeout(() => setCopied(undefined), 2000);
	};

	return (
		<Card className="border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
			<CardHeader>
				<CardTitle>Bank Transfer Details</CardTitle>
				<CardDescription>
					Please transfer the payment to the following bank account
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
					<p className="text-sm text-zinc-600 dark:text-zinc-400">
						Make your payment directly to our bank account. Your account will be
						upgraded once we verify your payment, typically within 24 hours.
					</p>
				</div>

				<div className="space-y-4">
					{bankDetails.map(detail => (
						<div
							key={detail.label}
							className="flex items-center justify-between"
						>
							<div>
								<p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
									{detail.label}
								</p>
								<p className="text-base font-medium text-zinc-900 dark:text-zinc-100">
									{detail.value}
								</p>
							</div>
							<Button
								variant="outline"
								size="sm"
								className="gap-2 border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
								onClick={() => copyToClipboard(detail.value, detail.label)}
							>
								{copied === detail.label ? (
									<>
										<Check className="h-4 w-4 text-emerald-500" />
										<span className="text-emerald-500">Copied</span>
									</>
								) : (
									<>
										<Copy className="h-4 w-4" />
										<span>Copy</span>
									</>
								)}
							</Button>
						</div>
					))}
				</div>

				<div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
					<p className="mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
						Important Note:
					</p>
					<p className="text-sm text-zinc-600 dark:text-zinc-400">
						Payments are processed manually by Brilliant Makanju, the creator of
						Push to Post. Due to current operational reasons, all payment
						processing and subscription management are handled manually. Your
						payment information is secure and will only be used to process your
						subscription. If you have any questions, please contact us at
						brilliant@jolexhive.com.
					</p>
				</div>

				<Button
					variant="outline"
					className="w-full gap-2 border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
					onClick={() => {
						const details = bankDetails
							.map(d => `${d.label}: ${d.value}`)
							.join("\n");
						copyToClipboard(details, "All Details");
					}}
				>
					{copied === "All Details" ? (
						<>
							<Check className="h-4 w-4 text-emerald-500" />
							<span className="text-emerald-500">All Details Copied</span>
						</>
					) : (
						<>
							<Copy className="h-4 w-4" />
							<span>Copy All Details</span>
						</>
					)}
				</Button>
			</CardContent>
		</Card>
	);
}
