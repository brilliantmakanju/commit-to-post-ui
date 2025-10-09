import type { Metadata } from "next";

const baseUrl = "https://pushtodraft.app";
const siteName = "Push to Draft";
const defaultDescription =
	"Push to Draft helps developers and creators transform their work into publish-ready content using AI. Turn your commits, ideas, and updates into polished posts effortlessly.";

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
			"AI content automation",
			"developer writing assistant",
			"AI-powered publishing",
			"push to draft",
			"commit to content",
			"AI productivity tool",
			"automated writing workflow",
			"developer content creation",
			"indie hacker tools",
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
					alt: `${fullTitle} - AI-Powered Publishing Workflow`,
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

// 🔥 Predefined metadata for key routes
export const commonMetadata = {
	home: generateMetadata({
		title: "AI-Powered Publishing for Developers",
		description:
			"Push to Draft turns your commits, ideas, and updates into clean, publish-ready content using AI. Simplify your workflow and grow your visibility as a builder.",
		keywords: [
			"AI writing tool for developers",
			"content automation",
			"commit to post AI",
			"developer marketing",
		],
	}),

	onboarding: generateMetadata({
		title: "Get Started - Setup Your Workspace",
		description:
			"Set up your Push to Draft workspace and start creating AI-powered drafts from your commits, updates, and content ideas.",
		keywords: ["workspace setup", "onboarding", "AI writing assistant"],
		noIndex: true,
	}),

	dashboard: generateMetadata({
		title: "Dashboard",
		description:
			"Track your drafts, manage credits, and review your AI-generated posts. Stay organized and focused on what matters most — creating.",
		keywords: ["dashboard", "AI drafts", "content overview", "credit balance"],
		noIndex: true,
	}),

	repositories: generateMetadata({
		title: "Repositories",
		description:
			"Connect your GitHub repositories and turn commit activity into structured content ideas and publish-ready drafts.",
		keywords: [
			"GitHub integration",
			"repository management",
			"commit tracking",
		],
		noIndex: true,
	}),

	drafts: generateMetadata({
		title: "Drafts",
		description:
			"Manage, refine, and publish your AI-generated drafts. Transform your project activity into content that inspires and informs.",
		keywords: ["draft management", "AI content", "publishing workflow"],
		noIndex: true,
	}),

	settings: generateMetadata({
		title: "Settings",
		description:
			"Adjust your account preferences, manage integrations, and configure how Push to Draft works for your creative workflow.",
		keywords: ["settings", "preferences", "integrations", "account management"],
		noIndex: true,
	}),

	billing: generateMetadata({
		title: "Credits & Billing",
		description:
			"Manage your credits, view billing history, and upgrade your plan to unlock more AI-powered content generation.",
		keywords: ["credits", "billing", "subscription", "payment history"],
		noIndex: true,
	}),

	pricing: generateMetadata({
		title: "Pricing Plans",
		description:
			"Flexible credit-based pricing for creators, developers, and teams. Start free or scale your publishing workflow with Push to Draft Pro.",
		keywords: ["pricing", "plans", "credits", "AI subscription"],
	}),

	privacy: generateMetadata({
		title: "Privacy Policy",
		description:
			"Your privacy matters. Learn how Push to Draft collects, uses, and protects your data responsibly.",
		keywords: ["privacy policy", "data security", "user protection"],
	}),

	terms: generateMetadata({
		title: "Terms of Service",
		description:
			"Review Push to Draft’s Terms of Service to understand your rights, responsibilities, and usage guidelines.",
		keywords: ["terms of service", "user agreement", "legal terms"],
	}),

	refund: generateMetadata({
		title: "Refund Policy",
		description:
			"Learn how refunds and cancellations are handled under Push to Draft’s fair usage policy.",
		keywords: ["refund policy", "cancellation", "payment refund"],
	}),

	notFound: generateMetadata({
		title: "Page Not Found",
		description:
			"The page you’re looking for doesn’t exist or has been moved. Return to the homepage to continue exploring Push to Draft.",
		keywords: ["404 error", "not found", "broken link"],
		noIndex: true,
	}),
};
