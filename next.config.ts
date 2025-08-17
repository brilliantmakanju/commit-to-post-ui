import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	i18n: {
		locales: ["en-US", "fr", "de"],
		defaultLocale: "en-US",
	},
	reactStrictMode: true,
	images: {
		remotePatterns: [
			{ protocol: "https", hostname: "media.licdn.com" },
			{ protocol: "https", hostname: "pbs.twimg.com" },
		],
		unoptimized: true,
	},
};

export default nextConfig;
