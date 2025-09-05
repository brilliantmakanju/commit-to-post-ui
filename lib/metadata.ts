import type { Metadata } from "next";

const baseUrl = "https://commit.jolexhive.com";
const siteName = "Push to Post";
const defaultDescription =
	"Turn your Git commits into shareable, engaging social media posts with AI. Automate content creation and showcase your work effortlessly on LinkedIn and beyond.";

interface MetadataConfig {
	title: string;
	description?: string;
	keywords?: string[];
	canonical?: string;
	noIndex?: boolean;
	ogImage?: string;
	twitterImage?: string;
}

export function generateMetadata({
	title,
	description = defaultDescription,
	keywords = [],
	canonical,
	noIndex = false,
	ogImage = "/opengraph-image.jpg",
	twitterImage = "/twitter-image.jpg",
}: MetadataConfig): Metadata {
	const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
	const canonicalUrl = canonical ? `${baseUrl}${canonical}` : undefined;

	const metadata: Metadata = {
		metadataBase: new URL(baseUrl),
		title: fullTitle,
		description,
		keywords: [
			"Git commits to social media",
			"AI post generator",
			"automated content creation",
			"developer social media tool",
			"push to post AI",
			"GitHub LinkedIn automation",
			"AI-powered marketing for developers",
			...keywords,
		],
		openGraph: {
			title: fullTitle,
			description,
			type: "website",
			url: canonicalUrl || baseUrl,
			siteName,
			locale: "en_US",
			images: [
				{
					url: ogImage.startsWith("http") ? ogImage : `${baseUrl}${ogImage}`,
					width: 1200,
					height: 630,
					alt: `${fullTitle} - AI Git Commit to Social Media`,
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title: fullTitle,
			description,
			site: "@Jolex_Dev",
			creator: "@Jolex_Dev",
			images: [
				twitterImage.startsWith("http")
					? twitterImage
					: `${baseUrl}${twitterImage}`,
			],
		},
		robots: {
			index: !noIndex,
			follow: !noIndex,
		},
	};

	if (canonicalUrl) {
		metadata.alternates = {
			canonical: canonicalUrl,
		};
	}

	return metadata;
}

// Predefined metadata for common pages
export const commonMetadata = {
	home: generateMetadata({
		title: "AI-Powered Social Media Posts from Git Commits",
		description:
			"Turn your Git commits into shareable, engaging social media posts with AI. Automate content creation and showcase your work effortlessly on LinkedIn and beyond.",
		keywords: [
			"GitHub automation",
			"social media automation",
			"developer tools",
		],
	}),

	onboarding: generateMetadata({
		title: "Get Started - Setup Your Account",
		description:
			"Complete your account setup to start automating your social media posts from Git commits. Connect GitHub, social accounts, and repositories.",
		keywords: ["account setup", "onboarding", "GitHub integration"],
		noIndex: true,
	}),

	dashboard: generateMetadata({
		title: "Dashboard",
		description:
			"Manage your automated social media posts, view analytics, and monitor your Git commit to social media workflow.",
		keywords: ["dashboard", "analytics", "post management"],
		noIndex: true,
	}),

	repositories: generateMetadata({
		title: "Repositories",
		description:
			"Manage your connected repositories and configure which commits should be shared on social media.",
		keywords: ["repository management", "GitHub repos", "commit settings"],
		noIndex: true,
	}),

	posts: generateMetadata({
		title: "Posts",
		description:
			"View and manage all your automated social media posts generated from Git commits.",
		keywords: ["post management", "social media posts", "content management"],
		noIndex: true,
	}),

	settings: generateMetadata({
		title: "Settings",
		description:
			"Configure your account settings, social media connections, and automation preferences.",
		keywords: ["account settings", "preferences", "social connections"],
		noIndex: true,
	}),

	billing: generateMetadata({
		title: "Billing & Subscription",
		description:
			"Manage your subscription, view billing history, and upgrade your Push to Post plan.",
		keywords: ["billing", "subscription", "pricing", "upgrade"],
		noIndex: true,
	}),

	pricing: generateMetadata({
		title: "Pricing Plans",
		description:
			"Choose the perfect plan for your social media automation needs. Free tier available with premium features for power users.",
		keywords: ["pricing", "plans", "subscription", "free trial"],
	}),

	privacy: generateMetadata({
		title: "Privacy Policy",
		description:
			"Learn how Push to Post protects your data and respects your privacy when automating your social media posts.",
		keywords: ["privacy policy", "data protection", "GDPR"],
	}),

	terms: generateMetadata({
		title: "Terms of Service",
		description:
			"Read our terms of service and understand the rules and guidelines for using Push to Post.",
		keywords: ["terms of service", "legal", "user agreement"],
	}),

	refund: generateMetadata({
		title: "Refund Policy",
		description:
			"Learn about our refund policy and how to request a refund for your Push to Post subscription.",
		keywords: ["refund policy", "money back", "cancellation"],
	}),

	notFound: generateMetadata({
		title: "Page Not Found",
		description:
			"The page you're looking for doesn't exist. Return to the homepage to continue using Push to Post.",
		keywords: ["404", "not found", "error"],
		noIndex: true,
	}),
};
