import type { Metadata } from "next";

const baseUrl = "https://commit.jolexhive.com/";

export const metadata: Metadata = {
	metadataBase: new URL(baseUrl),
	title: {
		default: "Dashboard | Push to Post",
		template: "%s | Push to Post",
	},
	description:
		"Access your Push to Post dashboard. Manage your generated social media posts, and customize your workspace settings with ease.",
	openGraph: {
		type: "website",
		locale: "en_US",
		url: `${baseUrl}dashboard`,
		title: "Dashboard | Push to Post",
		description:
			"Push to Post Dashboard — manage your posts, settings, and account details effortlessly with AI-powered automation.",
		siteName: "Push to Post",
		images: [
			{
				url: `${baseUrl}opengraph-image.jpg`,
				width: 1200,
				height: 630,
				alt: "Push to Post Dashboard",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Dashboard | Push to Post",
		description:
			"Access your Push to Post dashboard to manage AI-generated posts, project updates, and account settings.",
		images: [`${baseUrl}twitter-image.jpg`],
	},
	keywords: [
		"Push to Post dashboard",
		"AI social media automation",
		"Git commit posts",
		"manage projects",
		"developer visibility tool",
		"account settings",
	],
	// Optional: uncomment if you want to hide this page from Google (since it’s behind login)
	robots: {
		index: false,
		follow: false,
	},
};
