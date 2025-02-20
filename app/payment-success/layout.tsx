"use client";
import "../globals.css";

import { Toaster } from "sonner";

export default function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={"grid grid-cols-1 antialiased"}>
				<main
					role="main"
					className="flex w-full flex-col items-start justify-start xl:container xl:mx-auto"
				>
					{children}
					<Toaster />
				</main>
			</body>
		</html>
	);
}
