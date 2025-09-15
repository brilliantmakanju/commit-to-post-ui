import "@/app/globals.css";

import { Metadata } from "next";
import { Suspense } from "react";

import { LogoutModal } from "@/components/auth/modals/logout-modal";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
	metadataBase: new URL("https://commit.jolexhive.com/"),
	title: "Push to Post - AI-Powered Playground",
	description: "Create social media posts in our interactive playground.",
	keywords: [
		"git commit messages",
		"AI content creation",
		"social media posts",
		"developer tools",
		"commit message generator",
		"AI writing assistant",
		"content playground",
	],
	openGraph: {
		title: "Push to Post - Content Playground",
		description:
			"Create engaging git commit messages, social media posts, images, and memes with AI assistance. Test and refine your content creation workflow in our interactive playground.",
		type: "website",
		url: "https://commit.jolexhive.com/playground",
		siteName: "Push to Post",
		locale: "en_US",
	},
	twitter: {
		card: "summary_large_image",
		title: "Push to Post - Content Playground",
		description:
			"Create engaging git commit messages, social media posts, images, and memes with AI assistance.",
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
		canonical: "https://commit.jolexhive.com/playground",
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
