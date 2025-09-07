import type { Metadata } from "next";

const baseUrl = "https://commit.jolexhive.com/";

export const metadata: Metadata = {
	metadataBase: new URL(baseUrl),
	title: {
		default: "Billing & Subscription | Push to Post",
		template: "%s | Push to Post",
	},
	description:
		"Manage your Push to Post billing details, update subscription plans, and review payment history with ease.",
	openGraph: {
		type: "website",
		locale: "en_US",
		url: `${baseUrl}billing`,
		title: "Billing & Subscription | Push to Post",
		description:
			"Update your Push to Post subscription, manage billing details, and review past invoices securely.",
		siteName: "Push to Post",
		images: [
			{
				url: `${baseUrl}opengraph-image.jpg`,
				width: 1200,
				height: 630,
				alt: "Push to Post - Billing & Subscription",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Billing & Subscription | Push to Post",
		description:
			"Securely manage your Push to Post billing information and subscription preferences.",
		images: [`${baseUrl}twitter-image.jpg`],
	},
	keywords: [
		"Push to Post billing",
		"subscription management",
		"update payment details",
		"manage invoices",
		"account subscription settings",
	],
};
