export interface RefundPolicySection {
	title: string;
	content: string[];
}

export const refundPolicyData = {
	title: "Refund Policy",
	lastUpdated: "October 06, 2025",
	companyInfo: {
		name: "Jolex Hive",
		dba: "Push to Draft",
		email: "brilliant@jolexhive.com",
	},
	introduction:
		"At Push to Draft, we aim to provide a reliable and valuable service. This page explains how refunds are handled for one-time purchases of Unlock Packs and Refill Packs.",
	sections: [
		{
			title: "1. Pricing Model",
			content: [
				"Push to Draft operates on a credit-based system with one-time purchases:",
				"• Starter (Free): 10 free credits with basic features. No payment required.",
				"• Pro Unlock Pack: $19 one-time payment — unlocks premium features and includes 500 credits.",
				"• Studio Unlock Pack: $49 one-time payment — includes all Pro features, priority support, team workspaces (coming soon), and 1,500 credits.",
				"• Refill Packs: Additional credits can be purchased separately (Starter Refill: $9 for 150 credits, Growth Refill: $29 for 600 credits, Scale Refill: $79 for 2,000 credits).",
				"There are no monthly or annual subscriptions. All purchases are one-time payments.",
			],
		},
		{
			title: "2. How Credits Work",
			content: [
				"Credits are consumed when you use the service:",
				"• Content Creation: 1 credit per unique post generated (e.g., generating content in multiple tones or for multiple platforms).",
				"• Content Distribution: 1 credit per platform when you publish or schedule a post to LinkedIn, Twitter/X, or Discord.",
				"• Free Actions: Connecting repositories, connecting social accounts, editing drafts, uploading images, and deleting posts do not consume credits.",
				"Credits do not expire and can be used at your own pace.",
			],
		},
		{
			title: "3. Refund Eligibility",
			content: [
				"We offer a 14-day refund window for Unlock Packs (Pro and Studio) under these conditions:",
				"• You are a new customer making your first Unlock Pack purchase.",
				"• You contact us within 7 days of your purchase date.",
				"• Your account does not show excessive or abusive usage of credits.",
				"Refunds are not available for Refill Pack purchases, as these are considered consumable add-ons to an existing unlocked account.",
			],
		},
		{
			title: "4. What Is Not Refundable",
			content: [
				"Refunds will not be granted in the following situations:",
				"• Refill Pack purchases (Starter, Growth, and Scale Refills are final sale).",
				"• Unlock Pack purchases made more than 7 days ago.",
				"• Accounts showing significant credit usage (more than 50% of included credits consumed).",
				"• Evidence of policy violations, abuse of the refund process, or fraudulent activity.",
				"• Requests based on preference changes after actively using the platform and generating content.",
			],
		},
		{
			title: "5. How to Request a Refund",
			content: [
				"To request a refund for an eligible Unlock Pack purchase, contact brilliant@jolexhive.com and include:",
				"• The email address associated with your Push to Draft account.",
				"• Your purchase date and the pack you purchased (Pro or Studio).",
				"• A brief explanation of why you're requesting a refund.",
				"We will review your request and respond within 2-3 business days.",
			],
		},
		{
			title: "6. Refund Processing",
			content: [
				"If your refund request is approved:",
				"• The refund will be issued to your original payment method.",
				"• Processing typically takes 7-10 business days, depending on your bank or payment provider.",
				"• Your account will be downgraded to the Starter (Free) tier, and any remaining credits from the refunded pack will be removed.",
			],
		},
		{
			title: "7. Starter Tier Limitations",
			content: [
				"The Starter tier is free and intentionally limited. It does not support refunds as no payment is required.",
				"Starter tier users receive 10 credits as a one-time grant to test the platform.",
				"To access premium features like image uploads, advanced scheduling, multiple tone styles, and priority support, you must upgrade to Pro or Studio.",
			],
		},
		{
			title: "8. Changes to This Policy",
			content: [
				"We reserve the right to update this refund policy at any time.",
				"The latest version will always be available on our website with the updated date clearly displayed.",
				"Continued use of Push to Draft after changes are posted constitutes acceptance of the updated policy.",
				"We recommend reviewing this policy periodically.",
			],
		},
		{
			title: "9. Contact Us",
			content: [
				"If you have any questions about this refund policy or need assistance with your purchase, please contact us at:",
				"Jolex Hive (Push to Draft)",
				"Email: brilliant@jolexhive.com",
				"We're here to help and will respond to all inquiries as promptly as possible.",
			],
		},
	],
};
