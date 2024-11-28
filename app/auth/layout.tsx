import '../globals.css';

import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Suspense } from 'react';

import AuthTopNavigation from '@/components/navigation/top_navigation/auth-top-navigation';

const geistSans = localFont({
	src: '../fonts/GeistVF.woff',
	variable: '--font-geist-sans',
	weight: '100 900',
});
const geistMono = localFont({
	src: '../fonts/GeistMonoVF.woff',
	variable: '--font-geist-mono',
	weight: '100 900',
});

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`${geistSans.variable} ${geistMono.variable} relative antialiased xl:container xl:mx-auto`}
			>
				<AuthTopNavigation />
				<Suspense fallback={<div>Loading.....</div>}>
					<main className={'flex-1'}>{children}</main>
				</Suspense>
			</body>
		</html>
	);
}
