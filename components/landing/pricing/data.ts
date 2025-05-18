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
	productIds: {
		monthly: string;
		annual: string;
	};
}

export interface LifetimeDeal {
	price: number;
	previousPrice?: number;
	spotsLeft?: number;
	endsIn: number; // hours
	productId: string;
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
				productIds: {
					monthly: "free_plan",
					annual: "free_plan",
				},
			},
			features: [
				{ name: "Generate up to 5 posts/month", available: true },
				{ name: "Connect GitHub and LinkedIn", available: true },
				{ name: "Default post generation tone", available: true },
				{ name: "Post rescheduling", available: false },
				{ name: "Priority support", available: false },
			],
			buttonText: "Start for Free",
			buttonVariant: "outline",
		},
		{
			name: "Lifetime Deal",
			badge: "Limited Offer",
			price: {
				monthly: 0,
				annual: 0,
				productIds: {
					monthly: "",
					annual: "",
				},
			},
			lifetime: {
				price: 79,
				previousPrice: 199,
				spotsLeft: 200,
				endsIn: 79, // 72-hour countdown
				productId: "pri_01jvjv1c6y0zme3awz0zrndprk",
			},
			features: [
				{ name: "Everything in Pro", available: true },
				{ name: "Future feature upgrades", available: true },
			],
			buttonText: "Claim Lifetime Access",
			buttonVariant: "default",
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
				productIds: {
					monthly: "pri_01jvjty2hpznp9yag1reeax2my",
					annual: "pri_01jvjtzj91vpyndb4qc6xwk5mm",
				},
			},
			features: [
				{ name: "Unlimited post generation", available: true },
				{ name: "Post rescheduling", available: true },
				{ name: "Priority customer support", available: true },
				{ name: "Multiple tones & shuffle tone", available: true },
				{ name: "Team collaboration (Coming Soon)", available: true },
			],
			buttonText: "Go Pro",
			buttonVariant: "success",
			popular: true,
		},
	],
};
