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
			badge: "Starter Plan",
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
				{ name: "Up to 4 posts per month", available: true },
				{ name: "Fixed tone (Professional)", available: true },
				{ name: "Connect 1 GitHub Repository", available: true },
			],
			buttonText: "Start for Free",
			popular: false,
		},
		{
			name: "Pro",
			badge: "Best Value",
			price: {
				monthly: 11.99,
				annual: 8.99,
				previous: {
					monthly: 14.99,
					annual: 11.99,
				},
				productIds: {
					monthly: "pri_01jvjty2hpznp9yag1reeax2my",
					annual: "pri_01jvjtzj91vpyndb4qc6xwk5mm",
				},
			},
			features: [
				{ name: "Priority support", available: true },
				{ name: "Everything in Free plan", available: true },
				{ name: "Up to 100 posts per month", available: true },
				{ name: "Smart hashtag suggestions", available: true },
				{ name: "Connect LinkedIn, Slack & Discord", available: true },
				{ name: "Choose from multiple writing styles", available: true },
				{ name: "Connect up to 5 GitHub Repositories", available: true },
			],
			buttonText: "Upgrade to Pro",
			// buttonVariant: "success",
			popular: true,
		},
		{
			name: "Studio",
			badge: "Studio Plan",
			price: {
				monthly: 39.99,
				annual: 29.99,
				previous: {
					monthly: 49.99,
					annual: 139.99,
				},
				productIds: {
					monthly: "studio_plan_monthly",
					annual: "studio_plan_annual",
				},
			},
			features: [
				{ name: "Everything in Pro plan", available: true },
				{ name: "Unlimited post generation", available: true },
				{ name: "Access all writing styles", available: true },
				{ name: "Manage multiple organizations", available: true },
				{ name: "Team management (early access)", available: true },
				{ name: "Connect unlimited GitHub Repositories", available: true },
			],
			buttonText: "Request Studio Access",
			popular: false,
		},
	],
};
