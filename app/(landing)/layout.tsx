import "../globals.css";

import type { Metadata } from "next";
import { Toaster } from "sonner";

import Footer from "@/components/navigation/footer/footer";
import TopNavigation from "@/components/navigation/top_navigation/top-navigation";

export const metadata: Metadata = {
	metadataBase: new URL("https://devpulse.jolexhive.com/"),
	title: "DevPulse - AI Post Generator from Git Commits",
	description:
		"DevPulse is an AI-powered tool that transforms your latest Git commits into engaging and polished social media posts, making it easy for developers to share project updates and showcase their work effortlessly.",
	openGraph: {
		title: "DevPulse - AI Post Generator from Git Commits",
		description:
			"DevPulse is an AI-powered tool that transforms your latest Git commits into engaging and polished social media posts, making it easy for developers to share project updates and showcase their work effortlessly.",
		type: "website",
		url: "https://devpulse.jolexhive.com/",
		siteName: "DevPulse",
		locale: "en_US",
	},
};

export default function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={"container mx-auto grid grid-cols-1 antialiased"}>
				<TopNavigation />
				<main
					role="main"
					className="flex w-full flex-col items-start justify-start xl:container xl:mx-auto"
				>
					{children}
				</main>
				<Toaster />
				<Footer />
			</body>
		</html>
	);
}
