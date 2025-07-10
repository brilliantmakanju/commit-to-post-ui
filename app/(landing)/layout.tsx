import "../globals.css";

import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { Toaster } from "sonner";

import { MaintenanceBanner } from "@/components/general/micro/maintenance/maintenance-banner";
import { MaintenanceCornerBanner } from "@/components/general/micro/maintenance/maintenance-corner-banner";
import { MaintenanceModal } from "@/components/general/micro/maintenance/maintenance-modal";
import Footer from "@/components/navigation/footer/footer";
import TopNavigation from "@/components/navigation/top_navigation/top-navigation";

export const metadata: Metadata = {
	metadataBase: new URL("https://commit.jolexhive.com/"),
	title: "Push to Post | AI-Powered Social Media Posts from Git Commits",
	description:
		"Turn your Git commits into shareable, engaging social media posts with AI. Automate content creation and showcase your work effortlessly on LinkedIn and beyond.",
	openGraph: {
		title: "Push to Post | AI-Powered Social Media Posts from Git Commits",
		description:
			"Automate your social media updates with AI-generated posts from your latest Git commits. Easily share project updates and boost your developer presence.",
		type: "website",
		url: "https://commit.jolexhive.com/",
		siteName: "Push to Post",
		locale: "en_US",
		images: [
			{
				url: "https://commit.jolexhive.com/opengraph-image.jpg",
				width: 1200,
				height: 630,
				alt: "Push to Post - AI Git Commit to Social Media",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Push to Post | AI-Powered Social Media Posts from Git Commits",
		description:
			"Push to Post converts your Git commits into polished social media posts using AI. Effortlessly share your project updates on LinkedIn, Twitter, and more.",
		site: "@Jolex_Dev", // Replace with your actual Twitter handle
		creator: "@Jolex_Dev",
		images: ["https://commit.jolexhive.com/twitter-image.jpg"],
	},
	keywords: [
		"Git commits to social media",
		"AI post generator",
		"automated content creation",
		"developer social media tool",
		"push to post AI",
		"GitHub LinkedIn automation",
		"AI-powered marketing for developers",
	],
};

export default function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={
					"container mx-auto grid grid-cols-1 bg-[#f4f4f4] antialiased"
				}
			>
				<Suspense>
					<TopNavigation />
					<main
						role="main"
						className="relative flex w-full flex-col items-start justify-start xl:container xl:mx-auto"
					>
						{children}
						<Link
							href="https://www.producthunt.com/posts/push-to-post?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-push&#0045;to&#0045;post"
							target="_blank"
							className="fixed bottom-4 right-4 z-50"
						>
							<Image
								src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=941497&theme=dark&t=1741847658944"
								alt="Push&#0032;to&#0032;Post - Push&#0032;Code&#0046;&#0032;Post&#0032;Updates&#0046;&#0032;Automate&#0032;Your&#0032;Dev&#0032;Journey&#0046; | Product Hunt"
								width={250}
								height={54}
								className="h-[54px] w-[250px]"
							/>
						</Link>
					</main>
					<Toaster />
					<Footer />
					<MaintenanceBanner />
					<MaintenanceModal />
					<MaintenanceCornerBanner />
					<Analytics />
				</Suspense>
			</body>
		</html>
	);
}
