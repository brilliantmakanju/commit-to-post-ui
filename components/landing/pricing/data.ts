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
				monthly: 9.99,
				annual: 89.52,
				// previous: {
				// 	monthly: 14.99,
				// 	annual: 11.99,
				// },
				productIds: {
					monthly: "pri_01jvd4rxjryqv6ey0hxhksgba3",
					annual: "pri_01jvd4rxjryqv6ey0hxhksgba3",
				},
			},
			features: [
				{ name: "Everything included in Starter", available: true },
				{ name: "Faster priority support", available: true },
				{ name: "Smart hashtag suggestions", available: true },
				{ name: "Post up to 100 times monthly", available: true },
				{ name: "Link up to 5 GitHub repositories", available: true },
				{ name: "Pick from multiple writing voices", available: true },
				{ name: "Connect LinkedIn Slack and Discord", available: true },
			],
			buttonText: "Unlock Full Power",
			// buttonVariant: "success",
			popular: true,
		},
		{
			name: "Studio",
			badge: "Built for Teams",
			price: {
				monthly: 24.99,
				annual: 233.52,
				// previous: {
				// 	monthly: 49.99,
				// 	annual: 139.99,
				// },
				productIds: {
					monthly: "studio_plan_monthly",
					annual: "studio_plan_annual",
				},
			},
			features: [
				{ name: "Everything included in Pro", available: true },
				{ name: "Generate unlimited content", available: true },
				{ name: "Team management (early access)", available: true },
				{ name: "Full access to every writing style", available: true },
				{ name: "Organize and manage multiple brands", available: true },
				{ name: "Connect unlimited GitHub repositories", available: true },
			],

			buttonText: "Apply for Studio Access",
			popular: false,
		},
	],
};
