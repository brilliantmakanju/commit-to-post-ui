// eslint-disable-next-line import/no-unresolved
import { refundPolicyData } from "@/components/data/refund-policy";

export const metadata = {
	title: "Refund Policy - Push to Post",
	description:
		"Refund policy for Push to Post, the AI-powered GitHub commit to LinkedIn post generator.",
};

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
			</div>
		</div>
	);
}
