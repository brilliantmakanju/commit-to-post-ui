import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	reactStrictMode: true,
	images: {
		remotePatterns: [
			{ protocol: "https", hostname: "pbs.twimg.com" },
			{ protocol: "https", hostname: "media.licdn.com" },
			{ protocol: "https", hostname: "res.cloudinary.com" },
		],
		unoptimized: true,
	},
	experimental: {
		serverActions: {
			bodySizeLimit: "4mb",
		},
	},
};

export default nextConfig;
