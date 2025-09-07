import type { Metadata } from "next";

const baseUrl = "https://commit.jolexhive.com/";

export const metadata: Metadata = {
	metadataBase: new URL(baseUrl),
	title: {
		default: "Repositories | Push to Post",
		template: "%s | Push to Post",
	},
	description:
		"Manage your connected repository in Push to Post. Review generated posts, check activity logs, and configure repository settings such as branch selection, tone, and commit-to-post preferences.",
	openGraph: {
		type: "website",
		locale: "en_US",
		url: `${baseUrl}repositories`,
		title: "Repositories | Push to Post",
		description:
			"View and manage your repository in Push to Post. Access posts, logs, and settings to control commit-to-post automation.",
		siteName: "Push to Post",
		images: [
			{
				url: `${baseUrl}opengraph-image.jpg`,
				width: 1200,
				height: 630,
				alt: "Push to Post - Repository",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: " Repositories | Push to Post",
		description:
			"Manage your connected repository in Push to Post. Configure commit automation, review logs, and fine-tune settings like tone and branch rules.",
		images: [`${baseUrl}twitter-image.jpg`],
	},
	keywords: [
		"Push to Post repository",
		"GitHub commit automation",
		"AI commit posts",
		"repository settings",
		"branch management",
		"developer social media automation",
	],
	robots: {
		index: false,
		follow: false,
	},
};
