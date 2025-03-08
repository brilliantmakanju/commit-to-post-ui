import "@/app/globals.css";

import { Metadata } from "next";
import { Suspense } from "react";

import { LogoutModal } from "@/components/auth/modals/logout-modal";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
	metadataBase: new URL("https://commit.jolexhive.com/"),
	title: "Push to Post - Seamless Access",
	description:
		"Access Push to Post securely and effortlessly. Log in, sign up, reset your password, or generate a magic link to get started with your AI-powered content assistant.",
	openGraph: {
		title: "Push to Post - Seamless Access",
		description:
			"Access Push to Post securely and effortlessly. Log in, sign up, reset your password, or generate a magic link to get started with your AI-powered content assistant.",
		type: "website",
		url: "https://commit.jolexhive.com",
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
				<Suspense fallback={<LogoutModal showByDefault />}>
					<main className={"flex-1"}>{children}</main>
				</Suspense>
				<Toaster />
			</body>
		</html>
	);
}
