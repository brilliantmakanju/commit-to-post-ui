// eslint-disable-next-line import/named
import { Infinity, LucideIcon, Sparkles, Zap } from "lucide-react";
// ============================================
// TYPES

// ============================================
export type PricingView = "one-time" | "subscription" | "refill";

export type ButtonVariant = "outline" | "default" | "secondary";

export type ThemeMode = "light" | "dark";

export interface Feature {
	text: string;
	tooltip: string;
}

export interface PlanData {
	id: string;
	name: string;
	description: string;
	price: number;
	credits: number;
	priceLabel: string;
	features: Feature[];
	buttonText: string;
	buttonVariant: ButtonVariant;
	borderStyle: string;
	theme: ThemeMode;
	productId: string;
}

export interface RefillPack {
	id: string;
	name: string;
	description: string;
	price: number;
	credits: number;
	badge: string;
	productId: string;
}

export interface CreditExplanation {
	icon: LucideIcon;
	title: string;
	subtitle: string;
}

export interface TableFeature {
	name: string;
	key: string;
}

export interface PlanCardProps {
	plan: PlanData;
	isActive: boolean;
	userPlan: string;
	billingType: string;
	hasActiveSubscription: boolean;
	isSubscriptionView: boolean;
	isAuthenticated: boolean;
}

export interface RefillPackCardProps {
	pack: RefillPack;
}

export interface ComparisonTableProps {
	view: PricingView;
}

export interface PricingSectionProps {
	tables?: boolean;
}

// ============================================
// DATA
// ============================================
export const PRICING_DATA: {
	unlockPacks: PlanData[];
	refillPacks: RefillPack[];
	subscriptionPlans: PlanData[];
} = {
	unlockPacks: [
		{
			price: 0,
			id: "basic",
			credits: 10,
			name: "Starter",
			description: "Test drive the platform and see the magic in action",
			priceLabel: "10 credits (one-time grant)",
			features: [
				{
					text: "GitHub commit tracking",
					tooltip: "Automatically track your GitHub commits",
				},
				{
					text: "Post to LinkedIn, Twitter & Discord",
					tooltip: "Publish to all platforms",
				},
				{
					text: "AI-powered draft generation",
					tooltip: "Get AI assistance for posts",
				},
			],
			buttonText: "Start Free",
			buttonVariant: "outline",
			borderStyle: "border-gray-200",
			theme: "light",
			productId: process.env.NEXT_PUBLIC_PADDLE_STARTER_UNLOCK_ID || "",
		},
		{
			id: "pro",
			name: "Pro",
			description: "Unlock premium features for consistent content creation",
			price: 19,
			credits: 500,
			priceLabel: "$19 One-time payment (Best Value)",
			features: [
				{
					text: "500 credits included",
					tooltip: "Generate 500 posts - never expires",
				},
				{
					text: "Image uploads for LinkedIn & Discord",
					tooltip: "Add custom images to posts",
				},
				{ text: "Scheduling", tooltip: "Schedule posts in advance" },
				{
					text: "Multiple tone styles",
					tooltip: "Choose various writing tones",
				},
			],
			// buttonText: "Unlock Pro",
			buttonText:
				"Paid features are temporarily unavailable while our payment processor completes verification. You can still use your free trial.",

			buttonVariant: "default",
			borderStyle: "border-gray-300",
			theme: "dark",
			productId: process.env.NEXT_PUBLIC_PADDLE_PRO_UNLOCK_ID || "",
		},
		{
			id: "studio",
			name: "Studio",
			description: "Everything in Pro + advanced features for power users",
			price: 49,
			credits: 1500,
			priceLabel: "$49 One-time payment (Maximum Value)",
			features: [
				{ text: "1,500 credits included", tooltip: "Massive credit bundle" },
				{ text: "All Pro features", tooltip: "Access to all Pro features" },
				{ text: "Priority support", tooltip: "Faster response times" },
				{
					text: "Team workspaces (coming soon)",
					tooltip: "Collaborate with team",
				},
			],
			// buttonText: "Unlock Studio",
			buttonText:
				"Paid features are temporarily unavailable while our payment processor completes verification. You can still use your free trial.",

			buttonVariant: "secondary",
			borderStyle: "border-gray-800",
			theme: "light",
			productId: process.env.NEXT_PUBLIC_PADDLE_STUDIO_UNLOCK_ID || "",
		},
	],
	subscriptionPlans: [
		{
			id: "basic",
			name: "Starter",
			description: "Test drive the platform and see the magic in action",
			price: 0,
			credits: 10,
			priceLabel: "10 credits (one-time grant)",
			features: [
				{ text: "GitHub commit tracking", tooltip: "Track GitHub commits" },
				{
					text: "Post to LinkedIn, Twitter & Discord",
					tooltip: "Publish to platforms",
				},
				{ text: "AI-powered draft generation", tooltip: "AI assistance" },
			],
			buttonText: "Start Free",
			buttonVariant: "outline",
			borderStyle: "border-gray-200",
			theme: "light",
			productId: process.env.NEXT_PUBLIC_PADDLE_STARTER_SUBSCRIPTION_ID || "",
		},
		{
			id: "pro",
			name: "Pro",
			description: "Perfect for consistent content creators",
			price: 15,
			credits: 150,
			priceLabel: "$15/month • 150 credits monthly",
			features: [
				{ text: "150 credits per month", tooltip: "Monthly credit refresh" },
				{ text: "Image uploads", tooltip: "Add images to posts" },
				{ text: "Advanced scheduling", tooltip: "Schedule posts" },
				{ text: "Multiple tone styles", tooltip: "Various tones" },
			],
			// buttonText: "Subscribe to Pro",
			buttonText:
				"Paid features are temporarily unavailable while our payment processor completes verification. You can still use your free trial.",

			buttonVariant: "default",
			borderStyle: "border-gray-300",
			theme: "dark",
			productId: process.env.NEXT_PUBLIC_PADDLE_PRO_SUBSCRIPTION_ID || "",
		},
		{
			id: "studio",
			name: "Studio",
			description: "For power users and teams who need more",
			price: 39,
			credits: 500,
			priceLabel: "$39/month • 500 credits monthly",
			features: [
				{ text: "500 credits per month", tooltip: "High volume allocation" },
				{ text: "All Pro features", tooltip: "All Pro features" },
				{ text: "Priority support", tooltip: "Faster support" },
				{
					text: "Team workspaces (coming soon)",
					tooltip: "Team collaboration",
				},
			],
			// buttonText: "Subscribe to Studio",
			buttonText:
				"Paid features are temporarily unavailable while our payment processor completes verification. You can still use your free trial.",

			buttonVariant: "secondary",
			borderStyle: "border-gray-800",
			theme: "light",
			productId: process.env.NEXT_PUBLIC_PADDLE_STUDIO_SUBSCRIPTION_ID || "",
		},
	],
	refillPacks: [
		{
			price: 9,
			credits: 150,
			id: "starter",
			name: "Starter Refill",
			description: "Perfect for testing or light usage",
			productId: process.env.NEXT_PUBLIC_PADDLE_REFILL_STARTER_ID || "",
			badge: "",
		},
		{
			price: 29,
			id: "growth",
			credits: 600,
			badge: "POPULAR",
			name: "Growth Refill",
			description: "Best value for regular content creators",
			productId: process.env.NEXT_PUBLIC_PADDLE_REFILL_GROWTH_ID || "",
		},
		{
			price: 79,
			id: "scale",
			credits: 2000,
			name: "Scale Refill",
			badge: "BEST VALUE",
			description: "Maximum savings for power users and teams",
			productId: process.env.NEXT_PUBLIC_PADDLE_REFILL_SCALE_ID || "",
		},
	],
};

export const CREDIT_EXPLANATIONS: CreditExplanation[] = [
	{
		icon: Zap,
		title: "1 Credit = 1 Post Draft",
		subtitle: "AI-powered from your commits",
	},
	{
		icon: Sparkles,
		title: "1 Credit = 1 Distribution",
		subtitle: "LinkedIn, Twitter, or Discord",
	},
	{
		icon: Infinity,
		title: "Credits Never Expire",
		subtitle: "Use at your own pace",
	},
];
