import type { Metadata } from "next";

const baseUrl = "https://commit.jolexhive.com/";

export const metadata: Metadata = {
	metadataBase: new URL(baseUrl),
	title: {
		default: "Notifications | Push to Post",
		template: "%s | Push to Post",
	},
	description:
		"View your Push to Post notifications, including generated post updates, publishing activity, and important account alerts.",
	openGraph: {
		type: "website",
		locale: "en_US",
		url: `${baseUrl}notifications`,
		title: "Notifications | Push to Post",
		description:
			"Stay updated with your latest generated posts, publishing status, and account notifications.",
		siteName: "Push to Post",
		images: [
			{
				url: `${baseUrl}opengraph-image.jpg`,
				width: 1200,
				height: 630,
				alt: "Push to Post Notifications",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Notifications | Push to Post",
		description:
			"Check your latest Push to Post activity: AI post generation, publishing status, and account updates.",
		images: [`${baseUrl}twitter-image.jpg`],
	},
	keywords: [
		"Push to Post notifications",
		"AI post updates",
		"social media publishing status",
		"developer automation alerts",
		"commit to post updates",
	],
	// Recommended: hide from Google since it’s private/authenticated
	robots: {
		index: false,
		follow: false,
	},
};
