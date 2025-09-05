// eslint-disable-next-line import/no-unresolved
import type { Metadata } from "next";

import { termsData } from "@/components/data/terms-conditions";
import { commonMetadata } from "@/lib/metadata";

export const metadata: Metadata = commonMetadata.terms;

export default function TermsPage() {
	return (
		<div className="container mx-auto max-w-4xl px-4 py-12">
			<div className="mb-8 text-center">
				<h1 className="mb-2 text-3xl font-medium tracking-tight text-zinc-900 dark:text-zinc-100">
					{termsData.title}
				</h1>
				<p className="text-sm text-zinc-500 dark:text-zinc-400">
					Last updated: {termsData.lastUpdated}
				</p>
			</div>

			<div className="prose prose-zinc dark:prose-invert max-w-none">
				<p className="lead text-zinc-600 dark:text-zinc-400">
					{termsData.introduction}
				</p>

				{termsData.sections.map((section, index) => (
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

				{/* <div className="mt-12 rounded-lg border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900">
					<h3 className="mb-4 text-lg font-medium text-zinc-900 dark:text-zinc-100">
						Questions about our Terms?
					</h3>
					<p className="mb-4 text-zinc-600 dark:text-zinc-400">
						If you have any questions or concerns about these Terms and
						Conditions, please contact our legal team.
					</p>
					<Link
						href="/contact"
						className="inline-flex items-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
					>
						Contact Us
					</Link>
				</div> */}
			</div>
		</div>
	);
}
