import type { Metadata } from "next";

const baseUrl = "https://commit.jolexhive.com/";

export const metadata: Metadata = {
	metadataBase: new URL(baseUrl),
	title: {
		default: "Billing | Push to Post",
		template: "%s | Push to Post",
	},
	description: "Manage your subscription",
	openGraph: {
		type: "website",
		locale: "en_US",
		url: baseUrl,
		title: "Billing | Push to Post",
		description: "Manage your subscription",
		siteName: "Push to Post",
	},
	twitter: {
		card: "summary_large_image",
		title: "Billing | Push to Post",
		description: "Manage your subscription",
	},
};
