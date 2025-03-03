import type { Metadata } from "next";

export const metadata: Metadata = {
	metadataBase: new URL("https://devpulse.jolexhive.com/"),
	title: {
		default: "Settings | Push to Post",
		template: "%s | Push to Post",
	},
	description: "Manage your account and organization settings",
	openGraph: {
		type: "website",
		locale: "en_US",
		url: "https://devpulse.jolexhive.com/",
		title: "Settings | Push to Post",
		description: "Manage your account and organization settings",
		siteName: "Push to Post",
	},
	twitter: {
		card: "summary_large_image",
		title: "Settings | Push to Post",
		description: "Manage your account and organization settings",
	},
};
