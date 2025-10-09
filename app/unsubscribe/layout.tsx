import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
	metadataBase: new URL("https://pushtodraft.app/"),
	title: "Unsubscribe from Emails | Push to Draft",
	description:
		"Securely unsubscribe from Push to Draft emails or adjust your notification preferences. You're always in control of how we communicate with you.",
	openGraph: {
		title: "Unsubscribe from Emails | Push to Draft",
		description:
			"Manage your email preferences or unsubscribe from Push to Draft notifications. Take full control over your communication settings.",
		type: "website",
		url: "https://pushtodraft.app/unsubscribe",
		siteName: "Push to Draft",
		locale: "en_US",
		images: [
			{
				url: "https://pushtodraft.app/opengraph-image.jpg",
				width: 1200,
				height: 630,
				alt: "Push to Draft - Email Preferences",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Unsubscribe from Emails | Push to Draft",
		description:
			"Easily manage your email preferences or unsubscribe from Push to Draft notifications. No spam. No friction. Full control.",
		site: "@Jolex_Dev",
		creator: "@Jolex_Dev",
		images: ["https://pushtodraft.app/twitter-image.jpg"],
	},
	keywords: [
		"unsubscribe from Push to Draft",
		"email preferences",
		"notification settings",
		"unsubscribe page",
		"privacy control",
		"user communication preferences",
		"developer notifications",
		"email management",
	],
	robots: {
		index: false,
		follow: false,
	},
	alternates: {
		canonical: "https://pushtodraft.app/unsubscribe",
	},
};

export default function UnsubscribeLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={"bg-[#f4f4f4] antialiased"}>
				<main
					role="main"
					className="relative flex w-full flex-col items-center justify-center"
				>
					<Suspense fallback={<UnsubscribeLoading />}>{children}</Suspense>
				</main>
			</body>
		</html>
	);
}

function UnsubscribeLoading() {
	return (
		<div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
			<div className="animate-pulse">
				<div className="mx-auto h-4 w-3/4 rounded bg-gray-200"></div>
				<div className="mx-auto mt-4 h-4 w-1/2 rounded bg-gray-200"></div>
				<div className="mx-auto mt-8 h-10 w-32 rounded bg-gray-200"></div>
			</div>
		</div>
	);
}
