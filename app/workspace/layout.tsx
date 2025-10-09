/* eslint-disable import/no-unresolved */
import "@/app/globals.css";

import type { Metadata } from "next";
import { Suspense } from "react";

import { Toaster } from "@/components/ui/sonner";
import WorkspaceTopNav from "@/components/workspace/nav";

export const metadata: Metadata = {
	metadataBase: new URL("https://pushtodraft.app/"),
	title:
		"Select Workspace - Push to Draft | AI-Powered Git Commit to Post Drafts",
	description:
		"Choose your workspace to log in and start turning your Git commits into authentic post drafts. Push to Draft helps developers share real progress and build in public with ease.",
	openGraph: {
		title: "Select Workspace - Push to Draft",
		description:
			"Select your workspace to access Push to Draft — the AI tool that transforms your Git commits into genuine, human-like post drafts ready for LinkedIn, Twitter, or your next blog post.",
		type: "website",
		url: "https://pushtodraft.app/workspace",
		siteName: "Push to Draft",
		locale: "en_US",
		images: [
			{
				url: "https://pushtodraft.app/opengraph-image.jpg",
				width: 1200,
				height: 630,
				alt: "Push to Draft - Select Workspace",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Select Workspace - Push to Draft | AI Commit to Post Drafts",
		description:
			"Pick your workspace to start generating AI-assisted post drafts from your Git commits. Push to Draft helps developers share their journey authentically — not performatively.",
		site: "@Jolex_Dev",
		creator: "@Jolex_Dev",
		images: ["https://pushtodraft.app/twitter-image.jpg"],
	},
	keywords: [
		"Push to Draft",
		"Git commit to post draft",
		"AI tools for developers",
		"build in public automation",
		"select workspace login",
		"GitHub progress sharing",
		"indie hacker storytelling",
		"developer visibility tools",
		"authentic content creation",
		"developer marketing automation",
	],
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
	alternates: {
		canonical: "https://pushtodraft.app/workspace",
	},
};

export default function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body>
				<Suspense>
					<main className="relative flex min-h-screen w-full flex-col items-center justify-start overflow-x-hidden border-none bg-white">
						<div className="relative flex w-full flex-col items-center justify-start border-none">
							<div className="relative flex min-h-screen w-full max-w-none flex-col items-start justify-start px-4 sm:px-6 md:px-8 lg:w-[1260px] lg:max-w-[1460px] lg:px-0">
								<div className="absolute left-4 top-0 z-0 h-full w-[1px] bg-gray-200 shadow-[1px_0px_0px_white] sm:left-6 md:left-8 lg:left-0"></div>
								<div className="absolute right-4 top-0 z-0 h-full w-[1px] bg-gray-200 shadow-[1px_0px_0px_white] sm:right-6 md:right-8 lg:right-0"></div>
								<WorkspaceTopNav />

								<div className="relative flex flex-col items-center justify-center gap-4 self-stretch overflow-hidden border-none sm:gap-6">
									<div className="flex w-full flex-col items-center justify-start border-none px-2 pb-8 pl-0 pr-0 sm:px-4 sm:pb-12 sm:pl-0 sm:pr-0 md:px-8 md:pb-16 lg:px-0">
										{children}
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
