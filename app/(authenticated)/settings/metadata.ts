import type { Metadata } from "next";

export const metadata: Metadata = {
	metadataBase: new URL("https://devpulse.jolexhive.com/"),
	title: {
		default: "Settings | DevPulse",
		template: "%s | DevPulse",
	},
	description: "Manage your account and organization settings",
	openGraph: {
		type: "website",
		locale: "en_US",
		url: "https://devpulse.jolexhive.com/",
		title: "Settings | DevPulse",
		description: "Manage your account and organization settings",
		siteName: "DevPulse",
	},
	twitter: {
		card: "summary_large_image",
		title: "Settings | DevPulse",
		description: "Manage your account and organization settings",
	},
};
