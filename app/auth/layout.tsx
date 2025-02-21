import "@/app/globals.css";

import { Suspense } from "react";

import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={"relative antialiased xl:container xl:mx-auto"}>
				<Suspense fallback={<div>Loading.....</div>}>
					<main className={"flex-1"}>{children}</main>
				</Suspense>
				<Toaster />
			</body>
		</html>
	);
}
