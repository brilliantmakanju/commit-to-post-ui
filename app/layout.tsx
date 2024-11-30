import "@/app/globals.css";

import { SessionProvider } from "next-auth/react";

import { ReactQueryClientProvider } from "@/components/wrappers/reactQuery/react-query-provider";

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<SessionProvider>
			<ReactQueryClientProvider>{children}</ReactQueryClientProvider>
		</SessionProvider>
	);
}
