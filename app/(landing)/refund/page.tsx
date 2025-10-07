/* eslint-disable import/no-unresolved */
// eslint-disable-next-line import/no-unresolved
import type { Metadata } from "next";

import { refundPolicyData } from "@/components/data/refund-policy";
import { commonMetadata } from "@/lib/metadata";

export const metadata: Metadata = commonMetadata.refund;

export default function RefundPolicyPage() {
	return (
		<div className="container mx-auto max-w-4xl px-4 py-12">
			<div className="mb-8 text-center">
				<h1 className="mb-2 text-3xl font-medium tracking-tight text-zinc-900 dark:text-zinc-100">
					{refundPolicyData.title}
				</h1>
				<p className="text-sm text-zinc-500 dark:text-zinc-400">
					Last updated: {refundPolicyData.lastUpdated}
				</p>
			</div>

			{/* 7-Day Refund Window Notice */}
			<div className="mb-8 rounded-lg border border-green-200 bg-green-50 p-6 dark:border-green-900/50 dark:bg-green-950/20">
				<h2 className="mb-3 text-lg font-semibold text-green-900 dark:text-green-200">
					7-Day Refund Window
				</h2>
				<p className="text-sm text-green-800 dark:text-green-300">
					<strong>Unlock Pack buyers:</strong> You can request a full refund if
					you contact us within 7 days of your purchase, provided your account
					doesn&rsquo;t show excessive credit usage (less than 50% of included
					credits used). Refill Packs are not eligible for refunds.
				</p>
			</div>

			<div className="prose prose-zinc dark:prose-invert max-w-none">
				<p className="lead text-zinc-600 dark:text-zinc-400">
					{refundPolicyData.introduction}
				</p>

				{refundPolicyData.sections.map((section, index) => (
					<section key={index} className="mb-8">
						<h2 className="text-xl font-medium text-zinc-900 dark:text-zinc-100">
							{section.title}
						</h2>
						{section.content.map((paragraph, pIndex) => (
							<p key={pIndex} className="mt-2 text-zinc-600 dark:text-zinc-400">
								{paragraph}
							</p>
						))}
					</section>
				))}

				<div className="mt-12 rounded-lg border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900">
					<h3 className="mb-4 text-lg font-medium text-zinc-900 dark:text-zinc-100">
						Questions About Refunds?
					</h3>
					<p className="mb-4 text-zinc-600 dark:text-zinc-400">
						If you have questions about this refund policy or need assistance
						with your purchase, please don&apos;t hesitate to reach out.
					</p>
					<div className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
						<p className="font-medium text-zinc-900 dark:text-zinc-100">
							{refundPolicyData.companyInfo.name} (
							{refundPolicyData.companyInfo.dba})
						</p>
						<p>
							<a
								href={`mailto:${refundPolicyData.companyInfo.email}`}
								className="text-zinc-900 underline hover:text-zinc-700 dark:text-zinc-100 dark:hover:text-zinc-300"
							>
								{refundPolicyData.companyInfo.email}
							</a>
						</p>
					</div>
				</div>

				<div className="mt-6 space-y-4">
					<div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-950/20">
						<p className="text-xs text-blue-900 dark:text-blue-200">
							<strong>Remember:</strong> Push to Draft uses a one-time payment
							model, not subscriptions. You only pay once to unlock features,
							and credits never expire. Use them at your own pace!
						</p>
					</div>

					<div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
						<p className="text-xs text-amber-900 dark:text-amber-200">
							<strong>Important:</strong> Refill Packs (credit top-ups) are
							final sale and not eligible for refunds. Only Unlock Packs (Pro
							and Studio) qualify for the 7-day refund window.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
