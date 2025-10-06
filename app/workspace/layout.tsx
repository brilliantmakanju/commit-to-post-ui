/* eslint-disable import/no-unresolved */
import "@/app/globals.css";

import type { Metadata } from "next";
import { Suspense } from "react";

import { Toaster } from "@/components/ui/sonner";
import WorkspaceTopNav from "@/components/workspace/nav";

export const metadata: Metadata = {
	metadataBase: new URL("https://commit.jolexhive.com/"),
	title:
		"Select Workspace - Push to Post | AI-Powered Git Commit to Social Media",
	description:
		"Choose your workspace to log in and start turning Git commits into shareable social media posts with AI. Push to Post makes it effortless to showcase your projects on LinkedIn, Twitter, and beyond.",
	openGraph: {
		title: "Select Workspace - Push to Post",
		description:
			"Log in by selecting your workspace. Push to Post transforms your Git commits into AI-generated social media content for LinkedIn, Twitter, and more.",
		type: "website",
		url: "https://commit.jolexhive.com/workspace",
		siteName: "Push to Post",
		locale: "en_US",
		images: [
			{
				url: "https://commit.jolexhive.com/opengraph-image.jpg",
				width: 1200,
				height: 630,
				alt: "Push to Post - Select Workspace",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Select Workspace - Push to Post | AI Git Commit to Social Media",
		description:
			"Pick your workspace and log in to start generating AI-powered social media posts from your Git commits. Share your progress effortlessly.",
		site: "@Jolex_Dev",
		creator: "@Jolex_Dev",
		images: ["https://commit.jolexhive.com/twitter-image.jpg"],
	},
	keywords: [
		"select workspace login",
		"Git commits to social media",
		"AI post generator",
		"developer social media automation",
		"push to post AI",
		"GitHub commit content generator",
		"AI-powered LinkedIn posts",
		"workspace login for developers",
	],
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
