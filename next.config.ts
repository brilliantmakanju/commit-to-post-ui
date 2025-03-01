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
				source: "/:path*", // Catch all unmatched routes
				destination: "/not-found", // Your custom 404 page
				permanent: false,
				missing: [
					{
						type: "query",
						key: "path", // Providing the required 'key' property
					},
				],
			},
		];
	},
};

export default nextConfig;
