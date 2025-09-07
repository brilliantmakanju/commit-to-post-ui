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
			<body className={"bg-[#f4f4f4] antialiased"}>
				<Suspense>
					<WorkspaceTopNav />
					<main
						role="main"
						className="relative flex w-full flex-col items-start justify-start xl:container xl:mx-auto"
					>
						{children}
						<Toaster />
					</main>
				</Suspense>
			</body>
		</html>
	);
}
