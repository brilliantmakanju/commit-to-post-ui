import type { Metadata } from "next";

const baseUrl = "https://commit.jolexhive.com/";

export const metadata: Metadata = {
	metadataBase: new URL(baseUrl),
	title: {
		default: "Settings | Push to Post",
		template: "%s | Push to Post",
	},
	description:
		"Manage your Push to Post account and workspace settings. Update your profile, connect GitHub and social accounts, configure email preferences, and customize your organization details.",
	openGraph: {
		type: "website",
		locale: "en_US",
		url: `${baseUrl}settings`,
		title: "Settings | Push to Post",
		description:
			"Update your account details, workspace preferences, and connected services like GitHub and social platforms in Push to Post.",
		siteName: "Push to Post",
		images: [
			{
				url: `${baseUrl}opengraph-image.jpg`,
				width: 1200,
				height: 630,
				alt: "Push to Post - Settings",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Settings | Push to Post",
		description:
			"Manage your Push to Post account, update email preferences, and connect GitHub or social accounts.",
		images: [`${baseUrl}twitter-image.jpg`],
	},
	keywords: [
		"Push to Post settings",
		"account management",
		"workspace settings",
		"connect GitHub",
		"social media integration",
		"update email preferences",
	],
	robots: {
		index: false,
		follow: false,
	},
};
