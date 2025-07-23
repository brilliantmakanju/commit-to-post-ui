export interface PrivacySection {
	title: string;
	content: string[];
}

export const privacyData = {
	title: "Privacy Policy",
	lastUpdated: "July 23, 2025",
	introduction:
		"At Push to Post, accessible at commit.jolexhive.com, we are committed to safeguarding your personal information. This Privacy Policy explains how we collect, use, and protect your data when you use our service. While we use Paddle for payment processing, Push to Post operates as an independent service with its own systems and data practices.",
	sections: [
		{
			title: "1. Information We Collect",
			content: [
				"We collect the information you provide when you create an account, connect platforms like GitHub or LinkedIn, and use our services.",
				"This includes your name, email address, LinkedIn information, and any content or settings you configure.",
				"We also gather details about how you use our service, including generated content, preferences, and activity.",
				"When connecting GitHub, we require read and write access to your repositories. This is necessary due to GitHub's permission structure and allows us to set up webhook integrations on your behalf.",
				"We do not use your repository data to train any models or for unrelated purposes.",
			],
		},
		{
			title: "2. Types of Personal Data",
			content: [
				"Name and preferred name",
				"Email address and LinkedIn information",
				"Repository access and posting behavior",
				"Account settings and preferences",
				"Payment information managed securely by Paddle",
			],
		},
		{
			title: "3. Legal Basis for Processing",
			content: [
				"We process your information based on the following:",
				"To fulfill our agreement with you and deliver the service",
				"To pursue legitimate business interests like improving the platform",
				"To comply with legal obligations",
				"With your consent when required by law",
			],
		},
		{
			title: "4. GitHub and LinkedIn Connections",
			content: [
				"To provide services, we ask for access to your LinkedIn and GitHub accounts.",
				"For GitHub, our system connects directly and sets up required webhooks. This is done through your authorization and is needed to generate posts from your development activity.",
				"We only use this access to perform the tasks necessary for content generation and do not use your data for other purposes.",
			],
		},
		{
			title: "5. How Your Information Is Used",
			content: [
				"We use your information to operate and improve our services.",
				"This includes generating posts based on your GitHub activity, managing your account, and sending service notifications.",
				"We store only the output content generated for you and do not retain raw commit data.",
			],
		},
		{
			title: "6. Automated Processing",
			content: [
				"Our system analyzes your commit data to generate content automatically, without storing the original commits.",
				"The generated content is stored in your account to allow you to edit, manage, and schedule it.",
			],
		},
		{
			title: "7. Data Retention",
			content: [
				"We keep your data as long as your account is active or required to provide services.",
				"You can request removal of your data by contacting us at brilliant@jolexhive.com.",
			],
		},
		{
			title: "8. Data Security",
			content: [
				"We take steps to secure your personal data through encryption, access control, and regular reviews.",
				"While we work hard to protect your information, we cannot guarantee complete security given the nature of the internet.",
			],
		},
		{
			title: "9. Sharing Information",
			content: [
				"We do not sell your data.",
				"We may share your information with service providers that help us run our platform (e.g., payment processors, hosting services).",
				"These providers are only allowed to use your information to perform specific services on our behalf.",
			],
		},
		{
			title: "10. International Transfers",
			content: [
				"Your data may be transferred to and stored in the United States.",
				"We use safeguards to protect your data if it's transferred from regions with specific data protection laws.",
			],
		},
		{
			title: "11. Your Rights",
			content: [
				"Depending on where you live, you may have the right to access, correct, delete, or restrict your data.",
				"You can contact us at brilliant@jolexhive.com to request changes or removal.",
			],
		},
		{
			title: "12. Cookies and Tracking",
			content: [
				"We use cookies to track usage and improve your experience.",
				"You can manage cookies through your browser settings. Some features may not work without them.",
			],
		},
		{
			title: "13. Children's Privacy",
			content: [
				"Our service is not intended for users under 13. We do not knowingly collect data from children.",
			],
		},
		{
			title: "14. California Users",
			content: [
				"If you are a California resident, you have rights under state law regarding your personal data.",
				"We do not sell your data. You can request details or deletion of your data by contacting us.",
			],
		},
		{
			title: "15. Updates to This Policy",
			content: [
				"We may update this Privacy Policy as needed.",
				"We will post changes here and update the 'Last Updated' date. Please check this page periodically.",
			],
		},
		{
			title: "16. Ownership and Independence",
			content: [
				"Push to Post remains a standalone service with its own technology, systems, and policies.",
				"Our use of third-party tools like Paddle does not grant them any rights to our platform or data beyond necessary functions.",
			],
		},
		{
			title: "17. Contact Us",
			content: [
				"If you have questions about this Privacy Policy, please reach out to us at brilliant@jolexhive.com.",
				"Data Controller: JolexHive, brilliant@jolexhive.com",
			],
		},
	],
};
