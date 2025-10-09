import "../globals.css";

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { Toaster } from "sonner";

import TopNavigation from "@/components/navigation/top_navigation/top-navigation";

const baseUrl = "https://pushtodraft.app/";

export const metadata: Metadata = {
	metadataBase: new URL(baseUrl),
	title:
		"Push to Draft | Turn Git Commits into Authentic, AI-Generated Post Drafts",
	description:
		"Push to Draft helps developers, indie hackers, and open-source creators turn Git commits into authentic social media post drafts. Share real progress, stay visible, and build in public without burnout or creative blocks.",
	openGraph: {
		title:
			"Push to Draft | AI-Powered Drafts for Developers Building in Public",
		description:
			"Push to Draft turns your Git commits into human-like post drafts powered by AI. Perfect for developers who want to stay consistent and visible on LinkedIn, X (Twitter), and beyond — without overthinking what to write.",
		type: "website",
		url: baseUrl,
		siteName: "Push to Draft",
		locale: "en_US",
		images: [
			{
				url: `${baseUrl}opengraph-image.jpg`,
				width: 1200,
				height: 630,
				alt: "Push to Draft – AI-Powered Git Commit to Post Draft Generator for Developers",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Push to Draft | AI Tool for Developers Who Build in Public",
		description:
			"Push to Draft converts your Git commits into authentic, ready-to-edit post drafts. Built for developers and indie hackers who want to share progress without forcing creativity.",
		site: "@Jolex_Dev",
		creator: "@Jolex_Dev",
		images: [`${baseUrl}twitter-image.jpg`],
	},
	keywords: [
		"Push to Draft",
		"AI for developers",
		"Git commit to post draft",
		"build in public tool",
		"developer storytelling",
		"authentic content automation",
		"indie hacker visibility",
		"GitHub to LinkedIn posts",
		"developer branding tool",
		"maker productivity tools",
		"open source project visibility",
		"commit to content automation",
		"developer marketing",
		"AI post generator for developers",
	],
};

export default function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body>
				<Suspense>
					<main className="relative flex min-h-screen w-full flex-col items-center justify-start overflow-x-hidden bg-white">
						<div className="relative flex w-full flex-col items-center justify-start">
							<div className="relative flex min-h-screen w-full max-w-none flex-col items-start justify-start px-4 sm:px-6 md:px-8 lg:w-[1260px] lg:max-w-[1460px] lg:px-0">
								<div className="absolute left-4 top-0 z-0 h-full w-[1px] bg-gray-200 shadow-[1px_0px_0px_white] sm:left-6 md:left-8 lg:left-0"></div>
								<div className="absolute right-4 top-0 z-0 h-full w-[1px] bg-gray-200 shadow-[1px_0px_0px_white] sm:right-6 md:right-8 lg:right-0"></div>
								<TopNavigation />

								<div className="relative flex flex-col items-center justify-center gap-4 self-stretch overflow-hidden border-b border-gray-200 sm:gap-6">
									<div className="flex w-full flex-col items-center justify-start px-2 pb-8 pl-0 pr-0 sm:px-4 sm:pb-12 sm:pl-0 sm:pr-0 md:px-8 md:pb-16 lg:px-0">
										{children}
										<Link
											href="https://www.producthunt.com/posts/push-to-post?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-push&#0045;to&#0045;post"
											target="_blank"
											className="fixed bottom-4 right-4 z-50"
										>
											<Image
												src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=941497&theme=dark&t=1741847658944"
												alt="Push&#0032;to&#0032;Post - Push&#0032;Code&#0046;&#0032;Post&#0032;Updates&#0046;&#0032;Automate&#0032;Your&#0032;Dev&#0032;Journey&#0046; | Product Hunt"
												width={250}
												height={54}
												className="h-[54px] w-[250px]"
											/>
										</Link>
										<Toaster />
									</div>
								</div>
							</div>
						</div>
					</main>
				</Suspense>
			</body>
		</html>
	);
}
