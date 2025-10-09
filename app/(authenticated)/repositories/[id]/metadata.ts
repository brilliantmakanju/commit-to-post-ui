import type { Metadata } from "next";

const baseUrl = "https://commit.jolexhive.com/";

export const metadata: Metadata = {
	metadataBase: new URL(baseUrl),
	title: {
		default: "Repositories | Push to Draft",
		template: "%s | Push to Draft",
	},
	description:
		"Manage your connected repositories in Push to Draft and turn your Git commits into editable social media drafts.",
	openGraph: {
		type: "website",
		locale: "en_US",
		url: `${baseUrl}repositories`,
		title: "Repositories | Push to Draft",
		description:
			"Connect and manage your GitHub repositories with Push to Draft — where your commits become social media drafts ready to refine and post.",
		siteName: "Push to Draft",
		images: [
			{
				url: `${baseUrl}opengraph-image.jpg`,
				width: 1200,
				height: 630,
				alt: "Push to Draft - Repositories",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Repositories | Push to Draft",
		description:
			"Manage your GitHub repositories and convert your commits into editable social media drafts with Push to Draft.",
		images: [`${baseUrl}twitter-image.jpg`],
	},
	keywords: [
		"Push to Draft repositories",
		"GitHub integration",
		"commit to draft automation",
		"developer social media workflow",
		"AI post generation",
		"content automation for developers",
	],
	robots: {
		index: false,
		follow: false,
	},
};
