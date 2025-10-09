import type { Metadata } from "next";

const baseUrl = "https://pushtodraft.app/";

export const metadata: Metadata = {
	metadataBase: new URL(baseUrl),
	title: {
		default: "Notifications | Push to Draft",
		template: "%s | Push to Draft",
	},
	description:
		"Stay informed with Push to Draft notifications — track AI draft generations, credit usage, and important updates about your workspace.",
	openGraph: {
		type: "website",
		locale: "en_US",
		url: `${baseUrl}notifications`,
		title: "Notifications | Push to Draft",
		description:
			"View your latest activity across Push to Draft — AI-generated drafts, credit updates, and important workspace alerts in one place.",
		siteName: "Push to Draft",
		images: [
			{
				url: `${baseUrl}opengraph-image.jpg`,
				width: 1200,
				height: 630,
				alt: "Push to Draft Notifications",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Notifications | Push to Draft",
		description:
			"Check your latest Push to Draft activity — from AI draft generations to credit usage and account updates.",
		images: [`${baseUrl}twitter-image.jpg`],
	},
	keywords: [
		"Push to Draft notifications",
		"AI draft updates",
		"credit usage alerts",
		"developer workflow updates",
		"build in public automation",
		"Git commit to social draft",
	],
	robots: {
		index: false,
		follow: false,
	},
};
