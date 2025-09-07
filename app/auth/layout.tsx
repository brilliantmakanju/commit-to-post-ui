/* eslint-disable import/no-unresolved */
import "@/app/globals.css";

import type { Metadata } from "next";
import { Suspense } from "react";

import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
	title: "OAuth Callback | Push to Post",
	description:
		"Processing your authentication request. Please wait while we complete the connection.",
	robots: {
		index: false,
		follow: false,
	},
};

export default function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className="w-full bg-[#f4f4f4] antialiased">
				<Suspense>
					<main
						role="main"
						className="relative flex min-h-screen w-full flex-col items-center justify-center"
					>
						{children}
						<Toaster />
					</main>
				</Suspense>
			</body>
		</html>
	);
}
