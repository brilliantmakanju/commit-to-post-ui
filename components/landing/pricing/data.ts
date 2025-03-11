export interface PricingFeature {
	name: string;
	available: boolean;
}

export interface PlanPrice {
	monthly: number;
	annual: number;
	previous?: {
		monthly?: number;
		annual?: number;
	};
}

export interface LifetimeDeal {
	price: number;
	previousPrice?: number;
	spotsLeft?: number;
	endsIn: number; // hours
}

export interface Plan {
	name: "Free" | "Pro" | "Lifetime Deal" | "Custom";
	badge: string;
	price: PlanPrice;
	features: (string | PricingFeature)[];
	buttonText: string;
	buttonVariant: "outline" | "default" | "success";
	popular?: boolean;
	lifetime?: LifetimeDeal;
}

export interface PricingData {
	title: string;
	plans: Plan[];
}

export const pricingData: PricingData = {
	title: "AI Commit-to-Post Pricing",
	plans: [
		{
			name: "Free",
			badge: "Free Plan",
			price: {
				monthly: 0,
				annual: 0,
			},
			features: [
				{ name: "Generate up to 5 posts/month", available: true },
				{ name: "Connect GitHub and LinkedIn", available: true },
				{ name: "Single project integration", available: true },
				{ name: "Default post generation tone", available: true },
				{ name: "Post rescheduling", available: false },
				{ name: "Priority support", available: false },
			],
			buttonText: "Start for Free",
			buttonVariant: "outline",
		},
		{
			name: "Pro",
			badge: "Premium",
			price: {
				monthly: 5,
				annual: 50,
				previous: {
					monthly: 12,
					annual: 120,
				},
			},
			features: [
				{ name: "Unlimited post generation", available: true },
				{ name: "Multi-project integration", available: true },
				{ name: "Post rescheduling", available: true },
				{ name: "Priority customer support", available: true },
				{ name: "Multiple tones & shuffle tone", available: true },
				{ name: "Team collaboration (Coming Soon)", available: true },
			],
			buttonText: "Go Pro",
			buttonVariant: "success",
			popular: true,
		},
		{
			name: "Lifetime Deal",
			badge: "Limited Offer",
			price: {
				monthly: 0,
				annual: 0,
			},
			lifetime: {
				price: 79,
				previousPrice: 199,
				spotsLeft: 200, // Increased to 200 users
				endsIn: 72, // 72-hour countdown
			},
			features: [
				{ name: "Everything in Pro", available: true },
				{ name: "Future feature upgrades", available: true },
			],
			buttonText: "Claim Lifetime Access",
			buttonVariant: "default",
		},
	],
};
