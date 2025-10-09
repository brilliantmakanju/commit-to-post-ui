/* eslint-disable import/no-unresolved */
import "@/app/globals.css";

import { Metadata } from "next";
import { Suspense } from "react";

import { LogoutModal } from "@/components/auth/modals/logout-modal";
import AuthTopNavigation from "@/components/navigation/top_navigation/auth-top-navigation";
import { Toaster } from "@/components/ui/sonner";
export const metadata: Metadata = {
	metadataBase: new URL("https://commit.jolexhive.com/"),
	title: "Push to Post - Verify Your Email",
	description:
		"Complete your Push to Post setup by verifying your email. Secure your account and unlock seamless access to your AI-powered content assistant.",
	openGraph: {
		title: "Push to Post - Verify Your Email",
		description:
			"Complete your Push to Post setup by verifying your email. Secure your account and unlock seamless access to your AI-powered content assistant.",
		type: "website",
		url: "https://commit.jolexhive.com/verify-email",
		siteName: "Push to Post",
		locale: "en_US",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={"relative antialiased xl:container xl:mx-auto"}>
				<AuthTopNavigation />
				<Suspense fallback={<LogoutModal />}>
					<main className={"flex-1"}>{children}</main>
				</Suspense>
				<Toaster />
			</body>
		</html>
	);
}
