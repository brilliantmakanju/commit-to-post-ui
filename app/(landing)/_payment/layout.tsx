// eslint-disable-next-line import/no-unresolved
import "@/app/globals.css";

import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
	title: "Complete Payment - Push to Post",
	description:
		"Complete your payment to upgrade your Push to Post subscription",
};
export default function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <Suspense>{children}</Suspense>;
}
