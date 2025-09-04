import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
	title: "Unsubscribe | Push to Post",
	description:
		"Unsubscribe from Push to Post email notifications. Manage your email preferences easily.",
	robots: {
		index: false,
		follow: false,
	},
	openGraph: {
		title: "Unsubscribe | Push to Post",
		description: "Unsubscribe from Push to Post email notifications.",
		type: "website",
		siteName: "Push to Post",
	},
	twitter: {
		card: "summary",
		title: "Unsubscribe | Push to Post",
		description: "Unsubscribe from Push to Post email notifications.",
	},
};

export default function UnsubscribeLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={"bg-[#f4f4f4] antialiased"}>
				<main
					role="main"
					className="relative flex w-full flex-col items-center justify-center"
				>
					<Suspense fallback={<UnsubscribeLoading />}>{children}</Suspense>
				</main>
			</body>
		</html>
	);
}

function UnsubscribeLoading() {
	return (
		<div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
			<div className="animate-pulse">
				<div className="mx-auto h-4 w-3/4 rounded bg-gray-200"></div>
				<div className="mx-auto mt-4 h-4 w-1/2 rounded bg-gray-200"></div>
				<div className="mx-auto mt-8 h-10 w-32 rounded bg-gray-200"></div>
			</div>
		</div>
	);
}
