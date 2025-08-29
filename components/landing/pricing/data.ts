export interface PricingFeature {
	name: string;
	available: boolean;
}

export interface PlanPrice {
	monthly: number;
	annual: number;
	productIds: {
		monthly: string;
		annual: string;
	};
}

interface Plan {
	name: string;
	badge: string;
	popular: boolean;
	buttonText: string;
	features: PricingFeature[];
	price: PlanPrice;
}

export interface PricingData {
	title: string;
	plans: Plan[];
}

export const pricingData: PricingData = {
	title: "Push to Post Pricing",
	plans: [
		{
			name: "Basic",
			badge: "Start Creating Today",
			price: {
				monthly: 0,
				annual: 0,
				productIds: {
					monthly: "pri_01k3spk8fx68c94dzr3fwm1qjb",
					annual: "pri_01k3spk8fx68c94dzr3fwm1qjb",
				},
			},
			features: [
				{ name: "Connect LinkedIn", available: true },
				{ name: "Connect 1 GitHub repository", available: true },
				{ name: "Generate up to 5 posts per month", available: true },
				{ name: "Fixed professional writing tone", available: true },
			],
			buttonText: "Start Free",
			popular: false,
		},
		{
			name: "Pro",
			badge: "Made for Builders",
			price: {
				monthly: 5.99,
				annual: 64.68,
				productIds: {
					monthly: "pri_01jvjty2hpznp9yag1reeax2my",
					annual: "pri_01jvjtzj91vpyndb4qc6xwk5mm",
				},
			},
			features: [
				{ name: "Priority support", available: true },
				{ name: "Smart hashtag suggestions", available: true },
				{ name: "Post up to 100 times per month", available: true },
				{ name: "Connect up to 5 GitHub repositories", available: true },
				{ name: "Multiple writing voices", available: true },
				{ name: "Connect LinkedIn, Twitter, and Discord", available: true },
				{ name: "Schedule posts across accounts", available: true },
			],
			buttonText: "Upgrade to Pro",
			popular: true,
		},
		{
			name: "Studio",
			badge: "Built for Teams",
			price: {
				monthly: 22.99,
				annual: 246.6,
				productIds: {
					monthly: "pri_01k3g4fz3xq6awekczekqkz4kp",
					annual: "pri_01k3g5xeyeq74vgdb6pgkd9e0k",
				},
			},
			features: [
				{ name: "Unlimited content generation", available: true },
				{ name: "Team management (early access)", available: true },
				{ name: "Organize and manage multiple workspaces", available: true },
				{ name: "Connect unlimited GitHub repositories", available: true },
				{ name: "All Pro features included", available: true },
			],
			buttonText: "Apply for Studio Access",
			popular: false,
		},
	],
};
