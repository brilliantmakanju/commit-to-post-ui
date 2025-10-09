import type { Metadata } from "next";

const baseUrl = "https://pushtodraft.app/";

export const metadata: Metadata = {
	metadataBase: new URL(baseUrl),
	title: {
		default: "Dashboard | Push to Draft",
		template: "%s | Push to Draft",
	},
	description:
		"Your central workspace for turning Git commits into AI-generated social media drafts. Track credits, refine posts, and manage your build-in-public workflow effortlessly.",
	openGraph: {
		type: "website",
		locale: "en_US",
		url: `${baseUrl}dashboard`,
		title: "Dashboard | Push to Draft",
		description:
			"Push to Draft transforms your Git commits into clean, ready-to-edit social media drafts. Manage your AI credits, refine your tone, and share your progress with control and consistency.",
		siteName: "Push to Draft",
		images: [
			{
				url: `${baseUrl}opengraph-image.jpg`,
				width: 1200,
				height: 630,
				alt: "Push to Draft — Developer Dashboard",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Dashboard | Push to Draft",
		description:
			"Manage your Push to Draft workspace — review AI-generated drafts, monitor credit balance, and streamline your build-in-public updates with precision.",
		images: [`${baseUrl}twitter-image.jpg`],
	},
	keywords: [
		"Push to Draft dashboard",
		"AI content drafting",
		"Git commit automation",
		"developer visibility",
		"credit management",
		"build in public",
		"social media workflow",
		"AI copilot for developers",
	],
	robots: {
		index: false,
		follow: false,
	},
};
