import type { Metadata } from "next";

const baseUrl = "https://commit.jolexhive.com/";

export const metadata: Metadata = {
	metadataBase: new URL(baseUrl),
	title: {
		default: "Settings | Push to Draft",
		template: "%s | Push to Draft",
	},
	description:
		"Manage your Push to Draft account and preferences. Update your profile, connect GitHub, adjust email notifications.",
	openGraph: {
		type: "website",
		locale: "en_US",
		url: `${baseUrl}settings`,
		title: "Settings | Push to Draft",
		description:
			"Control your Push to Draft account settings — connect GitHub and Socials, manage credits, update your profile, and fine-tune your workspace preferences.",
		siteName: "Push to Draft",
		images: [
			{
				url: `${baseUrl}opengraph-image.jpg`,
				width: 1200,
				height: 630,
				alt: "Push to Draft - Settings",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Settings | Push to Draft",
		description:
			"Manage your Push to Draft account: connect GitHub and Socials, manage credits, adjust email alerts, and customize workspace preferences.",
		images: [`${baseUrl}twitter-image.jpg`],
	},
	keywords: [
		"Push to Draft settings",
		"account preferences",
		"workspace customization",
		"GitHub integration",
		"credit management",
		"AI post drafts",
		"developer automation tools",
	],
	robots: {
		index: false,
		follow: false,
	},
};
