import "../globals.css";

import type { Metadata } from "next";
import { Toaster } from "sonner";

import Footer from "@/components/navigation/footer/footer";
import TopNavigation from "@/components/navigation/top_navigation/top-navigation";

export const metadata: Metadata = {
	metadataBase: new URL("https://commit.jolexhive.com/"),
	title: "Push to Post | AI-Powered Social Media Posts from Git Commits",
	description:
		"Turn your Git commits into shareable, engaging social media posts with AI. Automate content creation and showcase your work effortlessly on LinkedIn and beyond.",
	openGraph: {
		title: "Push to Post | AI-Powered Social Media Posts from Git Commits",
		description:
			"Automate your social media updates with AI-generated posts from your latest Git commits. Easily share project updates and boost your developer presence.",
		type: "website",
		url: "https://commit.jolexhive.com/",
		siteName: "Push to Post",
		locale: "en_US",
		images: [
			{
				url: "https://commit.jolexhive.com/opengraph-image.jpg",
				width: 1200,
				height: 630,
				alt: "Push to Post - AI Git Commit to Social Media",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Push to Post | AI-Powered Social Media Posts from Git Commits",
		description:
			"Push to Post converts your Git commits into polished social media posts using AI. Effortlessly share your project updates on LinkedIn, Twitter, and more.",
		site: "@Jolex_Dev", // Replace with your actual Twitter handle
		creator: "@Jolex_Dev",
		images: ["https://commit.jolexhive.com/twitter-image.jpg"],
	},
	keywords: [
		"Git commits to social media",
		"AI post generator",
		"automated content creation",
		"developer social media tool",
		"push to post AI",
		"GitHub LinkedIn automation",
		"AI-powered marketing for developers",
	],
};

export default function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={"container mx-auto grid grid-cols-1 antialiased"}>
				<TopNavigation />
				<main
					role="main"
					className="flex w-full flex-col items-start justify-start xl:container xl:mx-auto"
				>
					{children}
				</main>
				<Toaster />
				<Footer />
			</body>
		</html>
	);
}
