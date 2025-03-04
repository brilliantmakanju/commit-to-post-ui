// eslint-disable-next-line import/no-unresolved
import { privacyData } from "@/components/data/privacy-policy";

export const metadata = {
	title: "Privacy Policy - Push to Post",
	description:
		"Privacy policy for Push to Post, the AI-powered GitHub commit to LinkedIn post generator.",
};

export default function PrivacyPage() {
	return (
		<div className="container mx-auto max-w-4xl px-4 py-12">
			<div className="mb-8 text-center">
				<h1 className="mb-2 text-3xl font-medium tracking-tight text-zinc-900 dark:text-zinc-100">
					{privacyData.title}
				</h1>
				<p className="text-sm text-zinc-500 dark:text-zinc-400">
					Last updated: {privacyData.lastUpdated}
				</p>
			</div>

			<div className="prose prose-zinc dark:prose-invert max-w-none">
				<p className="lead text-zinc-600 dark:text-zinc-400">
					{privacyData.introduction}
				</p>

				{privacyData.sections.map((section, index) => (
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
						Data Protection Concerns?
					</h3>
					<p className="mb-4 text-zinc-600 dark:text-zinc-400">
						If you have any questions or concerns about our privacy practices,
						please don&apos;t hesitate to reach out to our privacy team.
					</p>
					<div className="flex flex-wrap gap-4">
						<Link
							href="/contact"
							className="inline-flex items-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
						>
							Contact Us
						</Link>
						<Link
							href="/account/privacy"
							className="inline-flex items-center rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
						>
							Privacy Settings
						</Link>
					</div>
				</div> */}
			</div>
		</div>
	);
}
