export interface RefundPolicySection {
	title: string;
	content: string[];
}

export const refundPolicyData = {
	title: "Refund Policy",
	lastUpdated: "July 23, 2025",
	introduction:
		"At Push to Post, we aim to provide a reliable and valuable service. If things don't work out, this page explains how cancellations and refunds are handled for paid subscriptions.",
	sections: [
		{
			title: "1. Available Plans",
			content: [
				"Push to Post currently offers the following plans:",
				"- Starter Plan: Free with limited features. No payment required.",
				"- Pro Plan: A paid plan with access to more tools and flexibility.",
				"- Studio Plan: A paid plan for teams that need advanced features and collaboration tools.",
				"This refund policy only applies to paid plans (Pro and Studio).",
			],
		},
		{
			title: "2. Monthly and Annual Subscriptions",
			content: [
				"Monthly plans can be canceled anytime. Once canceled, no further payments will be taken. We do not provide refunds for any unused time after a payment is made.",
				"Annual plans include a 14-day refund window. If you cancel within 14 days of your first payment, you can request a full refund.",
				"We do not offer refunds for renewals of annual plans.",
			],
		},
		{
			title: "3. Refund Eligibility",
			content: [
				"Refunds are available under these conditions:",
				"- You are a new customer on a paid annual plan.",
				"- You contact us within 14 days of your first payment.",
				"- Your account does not show unusual or abusive usage.",
				"Refunds are not available for monthly plans, renewals, or accounts with significant usage after purchase.",
			],
		},
		{
			title: "4. How to Request a Refund",
			content: [
				"To ask for a refund, contact brilliant@jolexhive.com.",
				"Please include the following:",
				"- The email address tied to your Push to Post account",
				"- The date you made the purchase and your plan type",
				"- A short explanation of why you're requesting the refund",
				"We will review your request and respond within a few business days.",
			],
		},
		{
			title: "5. Refund Processing",
			content: [
				"If your request is approved:",
				"- We will issue the refund to your original payment method.",
				"- Refunds are usually processed within 7 to 10 business days, depending on your bank or payment provider.",
			],
		},
		{
			title: "6. When Refunds Are Not Provided",
			content: [
				"Refunds will not be granted in the following situations:",
				"- You are using the free Starter Plan",
				"- Your annual plan renewal has already been charged",
				"- There is evidence of policy violations or abuse of the refund process",
				"- The refund request is based on preference changes after active use of the platform",
			],
		},
		{
			title: "7. Changes to This Policy",
			content: [
				"We may update this refund policy from time to time.",
				"The latest version will always be available on our website, along with the date it was last updated.",
				"We recommend reviewing it occasionally for any updates.",
			],
		},
		{
			title: "8. Contact",
			content: [
				"If you have any questions about this policy or need help with your subscription, please email brilliant@jolexhive.com.",
				"We're here to help.",
			],
		},
	],
};
