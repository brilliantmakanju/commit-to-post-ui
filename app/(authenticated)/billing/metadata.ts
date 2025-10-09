import type { Metadata } from "next";

const baseUrl = "https://pushtodraft.app/";

export const metadata: Metadata = {
	metadataBase: new URL(baseUrl),
	title: {
		default: "Credits & Billing | Push to Draft",
		template: "%s | Push to Draft",
	},
	description:
		"Manage your Push to Draft credits, purchase more, and review your usage history easily and securely.",
	openGraph: {
		type: "website",
		locale: "en_US",
		url: `${baseUrl}billing`,
		title: "Credits & Billing | Push to Draft",
		description:
			"View and manage your Push to Draft credits, check usage, and top up your balance whenever you need.",
		siteName: "Push to Draft",
		images: [
			{
				url: `${baseUrl}opengraph-image.jpg`,
				width: 1200,
				height: 630,
				alt: "Push to Draft - Credits & Billing",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Credits & Billing | Push to Draft",
		description:
			"Manage your Push to Draft credits, track usage, and securely top up your balance anytime.",
		images: [`${baseUrl}twitter-image.jpg`],
	},
	keywords: [
		"Push to Draft credits",
		"buy credits",
		"credit management",
		"usage tracking",
		"account balance",
		"billing history",
		"Push to Draft",
	],
};
