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
	endsIn: number; // hours
	productId: string;
	spotsLeft?: number;
	previousPrice?: number;
}

interface PlanFeature {
	name: string;
	available: boolean;
}

interface Plan {
	name: string;
	badge: string;
	popular: boolean;
	buttonText: string;
	features: (string | PlanFeature)[];
	price: {
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
	};
	lifetime?: {
		endsIn: number;
		productId: string;
	};
}

export interface PricingData {
	title: string;
	plans: Plan[];
}

export const pricingData: PricingData = {
	title: "Push to Post Pricing",
	plans: [
		{
			name: "Free",
			badge: "Start Creating Today",
			price: {
				monthly: 0,
				annual: 0,
				productIds: {
					monthly: "starter_plan_monthly",
					annual: "starter_plan_annual",
				},
			},
			features: [
				{ name: "Connect LinkedIn only", available: true },
				{ name: "Link 1 GitHub repository", available: true },
				{ name: "Generate up to 5 posts each month", available: true },
				{ name: "Fixed tone with professional voice", available: true },
			],
			buttonText: "Start for Free",
			popular: false,
		},
		{
			name: "Pro",
			badge: "Made for Builders",
			price: {
				monthly: 5.99, // reduced by $2
				annual: 64.68, // 10% discount for yearly billing
				productIds: {
					monthly: "pri_01jvjty2hpznp9yag1reeax2my",
					annual: "pri_01jvjtzj91vpyndb4qc6xwk5mm",
				},
			},
			features: [
				{ name: "Everything included in Starter", available: true },
				{ name: "Faster priority support", available: true },
				{ name: "Smart hashtag suggestions", available: true },
				{ name: "Post up to 100 times monthly", available: true },
				{ name: "Link up to 5 GitHub repositories", available: true },
				{ name: "Pick from multiple writing voices", available: true },
				{ name: "Connect LinkedIn, Twitter, and Discord", available: true },
				{ name: "Schedule posts across connected accounts", available: true },
			],
			buttonText: "Unlock Full Power",
			popular: true,
		},
		{
			name: "Studio",
			badge: "Built for Teams",
			price: {
				monthly: 22.99, // reduced by $2
				annual: 246.6, // 10% discount for yearly billing
				productIds: {
					monthly: "pri_01k3g4fz3xq6awekczekqkz4kp",
					annual: "pri_01k3g5xeyeq74vgdb6pgkd9e0k",
				},
			},
			features: [
				{ name: "Everything included in Pro", available: true },
				{ name: "Generate unlimited content", available: true },
				{ name: "Team management (early access)", available: true },
				{ name: "Full access to every writing style", available: true },
				{
					name: "Organize and manage multiple workspaces",
					available: true,
				},
				{ name: "Connect unlimited GitHub repositories", available: true },
			],
			buttonText: "Apply for Studio Access",
			popular: false,
		},
	],
};
