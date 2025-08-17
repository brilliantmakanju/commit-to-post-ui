import "@/app/globals.css";

import { SessionProvider } from "next-auth/react";

import { FeatureFlagsProvider } from "@/components/providers/feature-flags-provider";
import { ReactQueryClientProvider } from "@/components/wrappers/reactQuery/react-query-provider";
import SessionSync from "@/components/wrappers/session-sync";

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<SessionProvider>
			<ReactQueryClientProvider>
				<FeatureFlagsProvider>
					<SessionSync />
					{children}
				</FeatureFlagsProvider>
			</ReactQueryClientProvider>
		</SessionProvider>
	);
}
