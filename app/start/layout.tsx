/* eslint-disable import/no-unresolved */
import "@/app/globals.css";

import type { Metadata } from "next";
import { Suspense } from "react";

import { Toaster } from "@/components/ui/sonner";
import { commonMetadata } from "@/lib/metadata";

export const metadata: Metadata = commonMetadata.onboarding;

export default function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={"grid grid-cols-1 gap-[34px] bg-[#f4f4f4] antialiased"}>
				<Suspense>
					<main
						role="main"
						className="relative flex w-full flex-col items-start justify-start"
					>
						{children}
						<Toaster />
					</main>
				</Suspense>
			</body>
		</html>
	);
}
