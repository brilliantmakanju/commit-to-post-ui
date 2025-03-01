import "@/app/globals.css";

import { Suspense } from "react";

import { LogoutModal } from "@/components/auth/modals/logout-modal";
import AuthTopNavigation from "@/components/navigation/top_navigation/auth-top-navigation";
import { Toaster } from "@/components/ui/sonner";

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
