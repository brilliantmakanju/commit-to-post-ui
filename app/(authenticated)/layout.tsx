import "@/app/globals.css";

import type { Metadata } from "next";

import { AuthenticatedLayout } from "@/components/wrappers/loaders/authenticated-layout";

export const metadata: Metadata = {
	metadataBase: new URL("https://devpulse.jolexhive.com/"),
	title: "Dashboard - Push to Post",
	description:
		"Push to Post Dashboard for authenticated pages. Manage your posts, settings, and account details effortlessly.",
	openGraph: {
		title: "Dashboard - Push to Post",
		description:
			"Push to Post Dashboard for authenticated pages. Manage your posts, settings, and account details effortlessly.",
		type: "website",
		url: "https://devpulse.jolexhive.com/dashboard",
		siteName: "Push to Post",
		locale: "en_US",
	},
};

export default async function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={"grid grid-cols-1 antialiased"}>
				<AuthenticatedLayout>{children}</AuthenticatedLayout>
			</body>
		</html>
	);
}
