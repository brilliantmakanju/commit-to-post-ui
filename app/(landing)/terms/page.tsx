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

			{/* Company Information */}
			<div className="mb-8 rounded-lg border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900">
				<h2 className="mb-3 text-lg font-medium text-zinc-900 dark:text-zinc-100">
					Agreement to Our Legal Terms
				</h2>
				<div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
					<p>
						<strong className="text-zinc-900 dark:text-zinc-100">
							{termsData.companyInfo.name}
						</strong>
						, doing business as{" "}
						<strong className="text-zinc-900 dark:text-zinc-100">
							{termsData.companyInfo.dba}
						</strong>
					</p>
					<p>{termsData.companyInfo.location}</p>
					<p>
						Contact:{" "}
						<a
							href={`mailto:${termsData.companyInfo.email}`}
							className="text-zinc-900 underline hover:text-zinc-700 dark:text-zinc-100 dark:hover:text-zinc-300"
						>
							{termsData.companyInfo.email}
						</a>
					</p>
				</div>
			</div>

			<div className="prose prose-zinc dark:prose-invert max-w-none">
				<p className="lead text-zinc-600 dark:text-zinc-400">
					{termsData.introduction}
				</p>

				<div className="my-6 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
					<p className="text-sm font-medium text-amber-900 dark:text-amber-200">
						<strong>IMPORTANT:</strong> IF YOU DO NOT AGREE WITH ALL OF THESE
						LEGAL TERMS, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE
						SERVICES AND YOU MUST DISCONTINUE USE IMMEDIATELY.
					</p>
				</div>

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

				<div className="mt-12 rounded-lg border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900">
					<h3 className="mb-4 text-lg font-medium text-zinc-900 dark:text-zinc-100">
						Questions About These Terms?
					</h3>
					<p className="mb-4 text-zinc-600 dark:text-zinc-400">
						In order to resolve a complaint regarding the Services or to receive
						further information regarding use of the Services, please contact us
						at:
					</p>
					<div className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
						<p className="font-medium text-zinc-900 dark:text-zinc-100">
							{termsData.companyInfo.name}
						</p>
						<p>{termsData.companyInfo.location}</p>
						<p>{termsData.companyInfo.country}</p>
						<p>
							<a
								href={`mailto:${termsData.companyInfo.email}`}
								className="text-zinc-900 underline hover:text-zinc-700 dark:text-zinc-100 dark:hover:text-zinc-300"
							>
								{termsData.companyInfo.email}
							</a>
						</p>
					</div>
				</div>

				<div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-950/20">
					<p className="text-xs text-blue-900 dark:text-blue-200">
						<strong>Note:</strong> We recommend that you print a copy of these
						Legal Terms for your records.
					</p>
				</div>
			</div>
		</div>
	);
}
