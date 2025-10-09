import "@/app/globals.css";

import type { Metadata } from "next";
import { Suspense } from "react";

import { LogoutModal } from "@/components/auth/modals/logout-modal";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
	metadataBase: new URL("https://pushtodraft.app/"),
	title: "Push to Draft - AI-Powered Playground for Developers",
	description:
		"Turn your Git commits into authentic post drafts. Experiment, refine, and create content that reflects your real progress — not marketing fluff.",
	keywords: [
		"Push to Draft",
		"build in public",
		"developer tools",
		"AI for developers",
		"developer storytelling",
		"commit message to post",
		"indie hacker visibility",
		"Git commit to post draft",
		"authentic content automation",
		"AI writing assistant for developers",
		"social media content for developers",
	],
	openGraph: {
		title: "Push to Draft - AI-Powered Playground for Developers",
		description:
			"Transform your Git commits into authentic, human-like post drafts. Explore, edit, and refine your content in our interactive AI playground built for developers and indie hackers.",
		type: "website",
		url: "https://pushtodraft.app/playground",
		siteName: "Push to Draft",
		locale: "en_US",
		images: [
			{
				width: 1200,
				height: 630,
				url: "https://pushtodraft.app/opengraph-image.jpg",
				alt: "Push to Draft - Turn Git Commits into Authentic AI-Generated Post Drafts",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Push to Draft - AI Playground for Developers",
		description:
			"Convert Git commits into post drafts with AI. Test, refine, and share your authentic developer journey — straight from the playground.",
		images: ["https://pushtodraft.app/twitter-image.jpg"],
		creator: "@Jolex_Dev",
	},
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
		canonical: "https://pushtodraft.app/playground",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className="bg-[#f4f4f4] antialiased">
				<Suspense fallback={<LogoutModal />}>
					<main
						role="main"
						className="relative flex w-full flex-col items-start justify-start"
					>
						{children}
					</main>
				</Suspense>
				<Toaster />
			</body>
		</html>
	);
}
