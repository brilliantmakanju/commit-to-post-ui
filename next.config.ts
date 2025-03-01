import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	i18n: {
		locales: ["en-US", "fr", "de"],
		defaultLocale: "en-US",
	},
	reactStrictMode: true,
	async redirects() {
		return [
			{
				source: "/((?!not-found).*)", // Exclude the not-found page from the redirect
				destination: "/not-found",
				permanent: false,
			},
		];
	},
};

export default nextConfig;
