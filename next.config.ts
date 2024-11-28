import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	i18n: {
		locales: ['en-US', 'fr', 'de'], // Supported locales
		defaultLocale: 'en-US', // Default locale
	},
	reactStrictMode: true,
};

export default nextConfig;
