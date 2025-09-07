import type { Metadata } from "next";

const baseUrl = "https://commit.jolexhive.com/";

export const metadata: Metadata = {
	metadataBase: new URL(baseUrl),
	title: {
		default: "Repositories | Push to Post",
		template: "%s | Push to Post",
	},
	description: "Manage your connected repositories in Push to Post.",
	openGraph: {
		type: "website",
		locale: "en_US",
		url: `${baseUrl}repositories`,
		title: "Repositories | Push to Post",
		description:
			"Connect and manage your GitHub repositories with Push to Post.",
		siteName: "Push to Post",
		images: [
			{
				url: `${baseUrl}opengraph-image.jpg`,
				width: 1200,
				height: 630,
				alt: "Push to Post - Repositories",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Repositories | Push to Post",
		description: "Manage your connected GitHub repositories in Push to Post.",
		images: [`${baseUrl}twitter-image.jpg`],
	},
	keywords: [
		"Push to Post repositories",
		"GitHub integration",
		"repository management",
		"commit to post automation",
		"developer social media tool",
	],
	robots: {
		index: false,
		follow: false,
	},
};
