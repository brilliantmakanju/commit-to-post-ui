export interface RefundPolicySection {
	title: string;
	content: string[];
}

export const refundPolicyData = {
	title: "Refund Policy",
	lastUpdated: "March 4, 2025",
	introduction:
		"At Push to Post, we strive to ensure our customers are satisfied with our services. If you are not entirely happy with your purchase, we are here to help.",
	sections: [
		{
			title: "1. Subscription Plans",
			content: [
				"Push to Post offers a range of subscription plans, including a Pro Plan with both monthly and annual billing options, as well as a Lifetime Deal.",
				"We aim to provide a clear and flexible refund policy for each of these plans.",
			],
		},
		{
			title: "2. Refund Policy for Monthly and Annual Plans",
			content: [
				"Monthly Plans: Refunds are not provided for partial months of service. However, you can cancel your subscription at any time, and you will not be billed for the next cycle.",
				"Annual Plans: We offer a 14-day money-back guarantee. If you are not satisfied with our service, please contact us within 14 days of purchase for a full refund.",
			],
		},
		{
			title: "3. Refund Policy for Lifetime Deal",
			content: [
				"For the Lifetime Deal, we offer refunds within 14 days of purchase if the platform does not meet your expectations.",
				"Please reach out to our support team with your purchase details to initiate the refund process.",
			],
		},
		{
			title: "4. Requesting a Refund",
			content: [
				"To request a refund, please contact us at brilliant@jolexhive.com with your purchase details and the reason for your request.",
				"Our support team will review your request and get back to you promptly.",
			],
		},
		{
			title: "5. Refund Processing",
			content: [
				"Once your refund request is approved, the refund will be processed within 7-10 business days.",
				"The refund will be issued to the original payment method used during the purchase.",
			],
		},
		{
			title: "6. Exceptions to Refund Policy",
			content: [
				"Refunds will not be provided if there is evidence of violation of our Terms & Conditions or misuse of our platform.",
				"We reserve the right to review and deny refund requests on a case-by-case basis.",
			],
		},
		{
			title: "7. Changes to This Refund Policy",
			content: [
				"We may update our Refund Policy from time to time.",
				"Changes will be communicated via updates to this page, and the 'Last Updated' date will be modified accordingly.",
				"You are encouraged to review this policy periodically for any changes.",
			],
		},
		{
			title: "8. Contact Us",
			content: [
				"If you have any questions about this Refund Policy or need assistance with your purchase, please contact us at brilliant@jolexhive.com.",
				"Our team is here to help and will respond as quickly as possible.",
			],
		},
	],
};
